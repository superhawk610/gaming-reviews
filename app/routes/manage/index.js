const express     = require('express')
const router      = express.Router()

const Article     = require('../../models/article')
const Game        = require('../../models/game')
const User        = require('../../models/user')

var apiKey, proxy

router.use((req, res, next) => {
  if (!req.session._user) {
    if (req.body.api_key && req.body.api_key == apiKey) {
      console.log('API Bypass')
      next()
    } else res.redirect(proxy + '/login?ref=/manage')
  } else next()
})

router.get('/', (req, res) => {
  var render = { render: 'menu' }
  Article.find().exec((err, articles) => {
    render.articles = articles
  }).then(() => {
    User.find().exec((err, users) => {
      render.users = users
    }).then(() => {
      Game.find().exec((err, games) => {
        render.games = games
        render.render = 'menu'
        res.render('create', render)
      })
    })
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

router.route(['/articles/:article_id', '/article/:article_id'])
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

router.config = (opts) => {
  apiKey = opts.apiKey
  proxy = opts.proxy
}

module.exports = router
