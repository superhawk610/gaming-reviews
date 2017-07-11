const mongoose      = require('mongoose')
const Schema        = mongoose.Schema

const gameSchema = Schema({
  name: String,
  image: String,  // http://thecoverproject.net for HQ cover images
                  //
                  // Extensions (quality-based)
                  // (no ext.)    1/2 size, front and back, moderate load
                  // -full        full size, front and back, slow load
                  // -small       1/4 size, front and back, fast load
                  // -front       add before above extension to crop to front only
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
