const mongoose      = require('mongoose')
const Schema        = mongoose.Schema

const categorySchema = Schema({
  name: {
    type: String,
    enum: [ 'Review', 'Update', 'Release', 'Console', 'Introspective' ]
  }
})

module.exports = mongoose.model('Category', categorySchema)
