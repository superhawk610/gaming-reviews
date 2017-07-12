const express     = require('express')
const app         = express()
const path        = require('path')
const mongoose    = require('mongoose')
const bodyParser  = require('body-parser')
const reload      = require('reload')
const watch       = require('watch')
const http        = require('http')

const port        = 80
const views       = path.join(__dirname, 'views')
const public      = path.resolve(__dirname, '../public')
const Article     = require('./models/article.js')
const Author      = require('./models/author.js')
const Category    = require('./models/category.js')
const Game        = require('./models/game.js')
const Genre       = require('./models/genre.js')

mongoose.Promise  = require('bluebird')
mongoose.connect('mongodb://52.14.239.101:27017/reviews', {
  useMongoClient: true
})
var connection = mongoose.connection
connection.once('open', () => {
  Category.find((err, _categories) => {
    if (err) console.log(err)
    app.locals.categories = _categories
  })
  Genre.find((err, _genres) => {
    if (err) console.log(err)
    app.locals.genres = _genres
  })
})

app.set('view engine', 'pug')
app.set('views', views)

app.use(express.static(public))
app.use(bodyParser.json())           // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({      // to support URL-encoded bodies
  extended: true
}))

app.locals.moment  = require('moment')

app.get('/', (req, res) => {
  res.redirect('/home')
})

app.get('/home', (req, res) => {
  Article.find().exec((err, articles) => {
    res.render('index', { articles: articles })
  })
})

app.get('/article', (req, res) => {
  res.render('article', { article: {
    title: 'Article Title',
    subtitle: 'Here\'s a cool subtitle',
    authors: [
      { name: 'First Last' }
    ],
    content: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc eros nibh, ultrices et eleifend at, iaculis id tellus. Ut neque ligula, bibendum non varius pellentesque, sagittis a arcu. Donec turpis massa, fringilla vitae mauris a, consequat imperdiet purus. Suspendisse nec condimentum justo. Aenean eros elit, porta ac nunc eu, pulvinar iaculis justo. Aliquam tristique, odio eget vehicula mollis, ipsum libero malesuada mauris, sed ornare nisi elit sit amet leo. Aenean consequat ante ac mattis elementum. Donec venenatis est eu magna efficitur ullamcorper. Pellentesque sed nisi a nisi mattis convallis non id tellus.<p>Curabitur gravida diam in dui scelerisque euismod. Mauris bibendum semper lacinia. Integer sodales pharetra interdum. Maecenas hendrerit urna id tempor iaculis. Integer tempor porttitor leo, vitae tincidunt lorem aliquam a. Suspendisse vestibulum nunc lorem, eu cursus elit malesuada ut. Curabitur interdum lacus ut massa luctus lectus facilisis. Suspendisse quis libero nec enim pulvinar egestas vitae quis dui. Nunc quis ipsum sit amet arcu sodales varius id id lacus.<p>Aenean lacinia, felis non pretium tristique, ante massa bibendum elit, eget lacinia dui tortor eu magna. Aliquam mattis sapien ac molestie mattis. Ut dapibus, quam non suscipit varius, est nisi iaculis nulla, vel pellentesque quam nisi a erat. Duis suscipit finibus neque, vel luctus risus tempus id. Donec et nunc non ligula molestie efficitur id at sapien. Mauris pharetra magna vitae bibendum scelerisque. Ut ac luctus eros, ac dictum libero. Quisque id tempor tortor. Nulla vestibulum magna eu dui consectetur scelerisque. Integer tempor sed nibh sit amet convallis.<p>Quisque facilisis lectus eros, id varius libero fermentum at. Aliquam quis libero quis metus bibendum vulputate nec nec est. Integer porta est ac euismod egestas. Ut quis sapien orci. Interdum et malesuada fames ac ante ipsum primis in faucibus. Suspendisse potenti. Nunc placerat massa id ex consequat elementum. Sed quis est massa. Proin lobortis lorem tristique, tempus ante ut, sollicitudin magna. Nam rutrum purus ante, eu congue lorem elementum a. Aenean at dui id sem blandit faucibus a in orci.<p>Phasellus aliquet fringilla vulputate. Nunc sit amet malesuada dolor. Morbi iaculis blandit dui, vel rhoncus ex condimentum vitae. Phasellus ultricies auctor eros, sit amet molestie tellus dapibus ut. Mauris vulputate mollis lectus, eget viverra mauris porta sed. Sed porttitor posuere laoreet. Etiam ultrices massa et orci hendrerit accumsan. Phasellus eget vulputate massa, sit amet placerat magna. Vivamus egestas congue diam. Nam sit amet malesuada lacus, et luctus metus. Nam consequat vel turpis et faucibus. Vivamus porttitor dolor magna, in malesuada nisi dignissim ut. Nulla sed nibh congue, maximus nisi quis, sollicitudin ligula.'
  }})
})

app.get('/article/:article_id', (req, res) => {
  Article.findOne({_id: req.params.article_id}).exec((err, article) => {
    res.render('article', { article: article })
  })
})

const router      = express.Router()
router.use((req, res, next) => {
  console.log(req.params)
  next()
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

router.get('/authors', (req, res) => {
  res.render('create', { render: 'authors' })
})

router.route('/articles')
  .get((req, res) => {
    res.render('create', { render: 'articles' })
  })
  .post((req, res) => {
    var a = new Article(req.body)
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

watch.watchTree(public, (f, curr, prev) => {
  reloadServer.reload()
})

server.listen(port, () => {
  console.log('listening on port ' + port)
})
