const mongoose      = require('mongoose')
const Schema        = mongoose.Schema

const gameSchema = Schema({
  name: String,
  image: String,
  releaseDate: Date,
  genre: {
    type: String,
    enum: [ 'Action', 'Adventure', 'RPG', 'Shooter', 'Simulation', 'Strategy', 'Sports', 'Indie', 'MMORPG', 'Survival', 'Horror' ]
  },
  rating: {
    type: String,
    enum: [ 'RP', 'EC', 'E', 'E10+', 'T', 'M', 'AO' ]
  }
})

module.exports = mongoose.model('Game', gameSchema)
