const express     = require('express')
const app         = express()
const path        = require('path')
const mongoose    = require('mongoose')

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

app.get('/', (req, res) => {
  res.redirect('/home')
})

app.get('/home', (req, res) => {
  res.render('')
})

app.listen(port, () => {
  console.log('listening on port ' + port)
})
