const mongoose      = require('mongoose')
const Schema        = mongoose.Schema

const authorSchema = Schema({
  firstName: String,
  lastName: String,
  image: String,
  authorSince: Date
})

module.exports = mongoose.model('Author', authorSchema)
