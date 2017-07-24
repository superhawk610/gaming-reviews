const express     = require('express')
const app         = express()
const session     = require('express-session')
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

const port        = 80
const views       = path.join(__dirname, 'views')
const public      = path.resolve(__dirname, '../public')
const Article     = require('./models/article')
const User        = require('./models/user')
const Category    = require('./models/category')
const Game        = require('./models/game')
const Genre       = require('./models/genre')

const cfg_path    = path.resolve(__dirname, '../site.config')
const cfg         = JSON.parse(fs.readFileSync(cfg_path, 'utf8'))
const cfg_db      = cfg.db
const cfg_host    = cfg.db_host
const cfg_user    = cfg.db_user
const cfg_pass    = cfg.db_pass
const apiKey      = cfg.api_key
app.locals.deployment = cfg.deployment

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

app.use(express.static(public))
app.use(bodyParser.json())           // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({      // to support URL-encoded bodies
  extended: true
}))

app.use(session({
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
  res.redirect('/home')
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
  if (!req.body.user || !req.body.pass) res.redirect('/login?error=true')
  else {
    User.findOne({username: req.body.user}, (err, user) => {
      if (err) return res.send(err)
      if (!user) return res.redirect('/login?error=true')
      user.comparePassword(req.body.pass, (err, isMatch) => {
        if (isMatch) {
          req.session._user = user
          res.redirect(req.body.ref || '/')
        } else {
          res.redirect('/login?error=true')
        }
      })
    })
  }
})

app.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect(req.query.ref ? req.query.ref : '/')
})

app.get('/account', (req, res) => {
  if (!req.session._user) return res.redirect('/login?ref=/account')
  res.render('account')
})

app.get('/article', (req, res) => {
  res.render('article', { article: {
    title: 'Article Title',
    subtitle: 'Here\'s a cool subtitle',
    authors: [
      { name: 'First Last' }
    ],
    content: `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
    eros nibh, ultrices et eleifend at, iaculis id tellus. Ut neque ligula,
    bibendum non varius pellentesque, sagittis a arcu. Donec turpis massa,
    fringilla vitae mauris a, consequat imperdiet purus. Suspendisse nec
    condimentum justo. Aenean eros elit, porta ac nunc eu, pulvinar iaculis
    justo. Aliquam tristique, odio eget vehicula mollis, ipsum libero malesuada
    mauris, sed ornare nisi elit sit amet leo. Aenean consequat ante ac mattis
    elementum. Donec venenatis est eu magna efficitur ullamcorper. Pellentesque
    sed nisi a nisi mattis convallis non id tellus.<p>Curabitur gravida diam in
    dui scelerisque euismod. Mauris bibendum semper lacinia. Integer sodales
    pharetra interdum. Maecenas hendrerit urna id tempor iaculis. Integer tempor
    porttitor leo, vitae tincidunt lorem aliquam a. Suspendisse vestibulum nunc
    lorem, eu cursus elit malesuada ut. Curabitur interdum lacus ut massa luctus
    lectus facilisis. Suspendisse quis libero nec enim pulvinar egestas vitae
    quis dui. Nunc quis ipsum sit amet arcu sodales varius id id lacus.
    <p>Aenean lacinia, felis non pretium tristique, ante massa bibendum elit,
    eget lacinia dui tortor eu magna. Aliquam mattis sapien ac molestie mattis.
    Ut dapibus, quam non suscipit varius, est nisi iaculis nulla, vel
    pellentesque quam nisi a erat. Duis suscipit finibus neque, vel luctus risus
    tempus id. Donec et nunc non ligula molestie efficitur id at sapien.
    Mauris pharetra magna vitae bibendum scelerisque. Ut ac luctus eros, ac dictum
    libero. Quisque id tempor tortor. Nulla vestibulum magna eu dui consectetur
    scelerisque. Integer tempor sed nibh sit amet convallis.
    <p>Quisque facilisis lectus eros, id varius libero fermentum at. Aliquam quis
    libero quis metus bibendum vulputate nec nec est. Integer porta est ac euismod
    egestas. Ut quis sapien orci. Interdum et malesuada fames ac ante ipsum primis
    in faucibus. Suspendisse potenti. Nunc placerat massa id ex consequat elementum.
    Sed quis est massa. Proin lobortis lorem tristique, tempus ante ut, sollicitudin
    magna. Nam rutrum purus ante, eu congue lorem elementum a. Aenean at dui id sem
    blandit faucibus a in orci.<p>Phasellus aliquet fringilla vulputate. Nunc sit
    amet malesuada dolor. Morbi iaculis blandit dui, vel rhoncus ex condimentum
    vitae. Phasellus ultricies auctor eros, sit amet molestie tellus dapibus ut.
    Mauris vulputate mollis lectus, eget viverra mauris porta sed. Sed porttitor
    posuere laoreet. Etiam ultrices massa et orci hendrerit accumsan. Phasellus
    eget vulputate massa, sit amet placerat magna. Vivamus egestas congue diam.
    Nam sit amet malesuada lacus, et luctus metus. Nam consequat vel turpis et
    faucibus. Vivamus porttitor dolor magna, in malesuada nisi dignissim ut.
    Nulla sed nibh congue, maximus nisi quis, sollicitudin ligula.`
  }})
})

app.get('/article/:article_id', (req, res) => {
  Article.findOne({_id: req.params.article_id}).exec((err, article) => {
    res.render('article', { article: article })
  })
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
  cb(null, [ 'image/jpg', 'image/jpeg', 'image/png', 'image/gif' ].indexOf(req.body.mime) > -1)
}
const upload      = multer({ storage: storage,
                             fileFilter: filter,
                             limits: { fileSize: 20000000 } }) // 20MB
app.post('/upload', upload.single('image'), (req, res) => {
  res.json({ status: 200, location: req.body.location })
})

const router      = express.Router()
router.use((req, res, next) => {
  if (!req.session._user) {
    console.log(req.body.api_key, apiKey)
    if (req.body.api_key && req.body.api_key == apiKey) {
      console.log('API Bypass')
      next()
    } else res.redirect('/login?ref=/manage')
  } else next()
})

router.get('/', (req, res) => {
  Article.find().exec((err, articles) => {
    res.render('create', { render: 'menu', articles: articles })
  })
})

router.get('/games', (req, res) => {
  res.render('create', { render: 'games' })
})

router.post('/games/create', (req, res) => {
  var game = new Game(req.body)
  game.save((err) => {
    if (err) res.send(err)
    else res.sendStatus(200)
  })
})

router.route('/users')
  .get((req, res) => {
    res.render('create', { render: 'users' })
  })
  .put((req, res) => {
    var u = new User(req.body)
    u.save((err, user) => {
      if (err) return res.json({ status: 500, message: err })
      res.json({ status: 200, user: user })
    })
  })

router.route('/articles')
  .get((req, res) => {
    res.render('create', { render: 'articles' })
  })
  .put((req, res) => {
    var a = new Article(req.body)
    a.authors = [ { _id: req.session._user._id, name: req.session._user.name }]
    a.save((err, article) => {
      if (err) res.json({ status: 500, message: err })
      res.json({ status: 200, _id: article._id })
    })
  })

router.route('/articles/:article_id')
  .get((req, res) => {
    Article.findOne({_id: req.params.article_id}).exec((err, article) => {
      if (err) res.send(err)
      res.render('create', { render: 'articles', article: article })
    })
  })
  .post((req, res) => {
    Article.findOneAndUpdate({_id: req.body._id}, req.body, {upsert: false}, (err, article) => {
      if (err) res.json({ status: 500, message: err })
      res.json({ status: 200 })
    })
  })
  .delete((req, res) => {
    Article.findByIdAndRemove(req.params.article_id, err => {
      if (err) res.json({ status: 500, message: err })
      res.json({ status: 200 })
    })
  })

app.use('/manage', router)

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
