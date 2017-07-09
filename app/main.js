const express     = require('express')
const app         = express()
const path        = require('path')
const mongoose    = require('mongoose')
const bodyParser  = require('body-parser')

const port        = 80
const Article     = require('./models/article.js')
const Author      = require('./models/author.js')
const Category    = require('./models/category.js')
const Game        = require('./models/game.js')
const Genre       = require('./models/genre.js')

mongoose.Promise  = require('bluebird')
mongoose.connect('mongodb://52.14.239.101:27017/reviews', {
  useMongoClient: true
})

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.resolve(__dirname, '../public')))
app.use( bodyParser.json() )         // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({      // to support URL-encoded bodies
  extended: true
}))

app.get('/', (req, res) => {
  res.redirect('/home')
})

app.get('/home', (req, res) => {
  res.render('index')
})

app.get('/article', (req, res) => {
  res.render('article')
})

const router      = express.Router()
router.use((req, res, next) => {
  console.log(req.params)
  next()
})

router.get('/', (req, res) => {
  res.render('create', { render: 'menu' })
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

router.get('/articles', (req, res) => {
  res.render('create', { render: 'articles' })
})

app.use('/manage', router)

app.listen(port, () => {
  console.log('listening on port ' + port)
})
