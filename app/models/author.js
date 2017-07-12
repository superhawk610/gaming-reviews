const mongoose      = require('mongoose')
const Schema        = mongoose.Schema

const authorSchema = Schema({
  name: String,
  image: String,
  authorSince: Date
})

module.exports = mongoose.model('Author', authorSchema)
