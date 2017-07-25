const express     = require('express')
const app         = express()
const session     = require('express-session')
const redis       = require('connect-redis')(session)
const multer      = require('multer')
const path        = require('path')
const mongoose    = require('mongoose')
const bodyParser  = require('body-parser')
const reload      = require('reload')
const watch       = require('watch')
const http        = require('http')
const queue       = require('./queue')
const uuid        = require('uuid/v4')
const fs          = require('fs')
const request     = require('request')

const views       = path.join(__dirname, 'views')
const public      = path.resolve(__dirname, '../public')
const Article     = require('./models/article')
const User        = require('./models/user')
const Category    = require('./models/category')
const Game        = require('./models/game')
const Genre       = require('./models/genre')

const cfg_path    = path.resolve(__dirname, '../site.config')
const cfg         = JSON.parse(fs.readFileSync(cfg_path, 'utf8'))
const port        = cfg.port
const proxy       = cfg.proxy
const cfg_db      = cfg.db
const cfg_host    = cfg.db_host
const cfg_user    = cfg.db_user
const cfg_pass    = cfg.db_pass
const apiKey      = cfg.api_key
const deployment  = cfg.deployment
app.locals.deployment = deployment
app.locals.proxy      = proxy

console.log('Deployment mode:',cfg.deployment)

mongoose.Promise  = require('bluebird')
mongoose.connect(
  `mongodb://${cfg_user}:${cfg_pass}@${cfg_host}:27017/${cfg_db}?authSource=admin`, {
  useMongoClient: true
})
var connection = mongoose.connection
connection.once('open', () => {
  Category.find((err, _categories) => {
    if (err) console.log(err)
    app.locals.categories = _categories
    if (app.locals.genres) queue.empty()
  })
  Genre.find((err, _genres) => {
    if (err) console.log(err)
    app.locals.genres = _genres
    if (app.locals.categories) queue.empty()
  })
})

app.set('view engine', 'pug')
app.set('views', views)

app.use(bodyParser.json())           // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({      // to support URL-encoded bodies
  extended: true
}))

app.use(session({
  store: new redis({
    port: 6379
  }),
  secret: apiKey,
  resave: false,                     // look into this
  saveUninitialized: true,
  cookie: { secure: false }
}))

app.locals.moment  = require('moment')

// wait for initialization
app.use((req, res, next) => {
  if (app.locals.genres && app.locals.categories) {
    res.locals.url = req.path
    next()
  } else {
    console.log('queueing response')
    queue.push(resumeResponse, this, [req, res, next])
  }
})

var resumeResponse = (req, res, next) => {
  res.locals.url = req.path
  next()
}

// authentication
app.use((req, res, next) => {
  if (req.session._user) {
    var s = req.session
    res.locals._user = s._user
  }
  next()
})

app.get('/', (req, res) => {
  res.redirect(proxy + '/home')
})

app.get('/home', (req, res) => {
  Article.find().exec((err, articles) => {
    res.render('index', { articles: articles })
  })
})

app.get('/login', (req, res) => {
  res.render('login', { ref: req.query.ref ? req.query.ref : '/' })
})

app.post('/login', (req, res) => {
  if (!req.body.user || !req.body.pass) res.redirect(proxy + '/login?error=true')
  else {
    User.findOne({username: req.body.user}, (err, user) => {
      if (err) return res.send(err)
      if (!user) return res.redirect(proxy + '/login?error=true')
      user.comparePassword(req.body.pass, (err, isMatch) => {
        if (isMatch) {
          var _user = user.toObject()
          _user.extras = user.extras()
          req.session._user = _user
          res.redirect(proxy + (req.body.ref || '/'))
        } else {
          res.redirect(proxy + '/login?error=true')
        }
      })
    })
  }
})

app.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect(proxy + (req.query.ref ? req.query.ref : '/'))
})

app.get('/account', (req, res) => {
  if (!req.session._user) return res.redirect(proxy + '/login?ref=/account')
  res.render('account')
})

app.get('/article', (req, res) => {
  var s_path = path.resolve(__dirname, '../sample.json')
  var sample = JSON.parse(fs.readFileSync(s_path, 'utf8'))
  res.render('article', sample)
})

app.get('/article/:article_id', (req, res) => {
  Article.findOne({_id: req.params.article_id}).exec((err, article) => {
    res.render('article', { article: article })
  })
})

app.get('/img/:dir/:file', (req, res) => {
  var file = path.resolve(__dirname, '../public/img', req.params.dir, req.params.file)
  if (deployment) res.sendFile(file)
  else {
    // prefer local copy, if available
    fs.access(file, fs.constants.R_OK, (err) => {
      if (err) {
        request('http://' + path.join(cfg_host, 'img',
                 req.params.dir, req.params.file)).pipe(res)
      } else res.sendFile(file)
    })
  }
})

const storage     = multer.diskStorage({
  destination: (req, file, cb) => {
    var dest = ''
    switch (req.body.type) {
      case 'upload':
      default:
        dest = 'upload'
    }
    var dir = path.resolve(__dirname, '../public/img', dest)
    req.body.location = path.relative(path.resolve(__dirname, '../public'), dir)
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    var exts = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif'
    }
    var name = uuid() + exts[req.body.mime || 'image/png']
    req.body.location = path.join(req.body.location, name).replace(/\\/g, '/')
    cb(null, name)
  }
})
const filter      = (req, file, cb) => {
  cb(null, ([ 'image/jpg', 'image/jpeg', 'image/png', 'image/gif' ].indexOf(req.body.mime) > -1
            && req.session._user))
}
const upload      = multer({ storage: storage,
                             fileFilter: filter,
                             limits: { fileSize: 20000000 } }) // 20MB
app.post('/upload', upload.single('image'), (req, res) => {
  res.json({ status: 200, location: req.body.location })
})

const manageRoute = require('./routes/manage')
manageRoute.config({
  apiKey: apiKey,
   proxy: proxy
 })
app.use('/manage', manageRoute)
app.use('/files', require('./routes/files'))
app.use(express.static(public))

var server = http.createServer(app)
var reloadServer = reload(app)

watch.watchTree(views, (f, curr, prev) => {
  reloadServer.reload()
})

watch.watchTree(path.join(public, 'css'), (f, curr, prev) => {
  reloadServer.reload()
})

watch.watchTree(path.join(public, 'js'), (f, curr, prev) => {
  reloadServer.reload()
})

server.listen(port, () => {
  console.log('listening on port ' + port)
})
