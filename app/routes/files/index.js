const express       = require('express')
const router        = express.Router()
const path          = require('path')
const fs            = require('fs')

router.get('/img/:dir', (req, res) => {
  var root = path.resolve(__dirname, '../../../public')
  var dir = path.resolve(root, 'img', req.params.dir)
  fs.access(dir, fs.constants.R_OK, (err) => {
    if (err) return res.json({ status: 500, message: 'Directory not found' })
    fs.readdir(dir, (err, files) => {
      res.render('files', { directory: path.relative(root, dir), files: files, select: req.query.select == 1 })
    })
  })
})

module.exports      = router
