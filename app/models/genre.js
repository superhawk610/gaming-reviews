const mongoose      = require('mongoose')
const Schema        = mongoose.Schema

const genreSchema = Schema({
  name: {
    type: String,
    enum: [ 'Action', 'Adventure', 'RPG', 'Shooter', 'Simulation', 'Strategy', 'Sports', 'Indie', 'MMORPG', 'Survival', 'Horror' ]
  }
})

module.exports = mongoose.model('Genre', genreSchema)
