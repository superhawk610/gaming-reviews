const mongoose      = require('mongoose')
const Schema        = mongoose.Schema

const articleSchema = Schema({
  title: String,
  subtitle: String,
  content: String,
  publishedOn: Date,
  accentImage: String,
  ups: [String],
  downs: [String],
  rating: Number,
  summary: String,
  status: { type: Number, min: 0, max: 2 },
  category: {
    type: String,
    enum: [ 'Review', 'Update', 'Release', 'Console', 'Introspective' ]
  },
  games: [
    { _id: Schema.ObjectId, name: String, image: String }
  ],
  authors: [
    { _id: Schema.ObjectId, name: String }
  ]
})

module.exports = mongoose.model('Article', articleSchema)
