const mongoose          = require('mongoose')
const Schema            = mongoose.Schema
const bcrypt            = require('bcrypt')
const SALT_WORK_FACTOR  = 10

const userSchema = Schema({
  username: { type: String, required: true, index: { unique: true } },
  name: String,
  pass: { type: String, required: true },
  image: String,
  userSince: Date
})

userSchema.pre('save', function(next) {
  var user = this
  if (!user.isModified('pass')) return next()
  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return next(err)
    bcrypt.hash(user.pass, salt, (err, hash) => {
      if (err) return next(err)
      user.pass = hash
      next()
    })
  })
})

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.pass, (err, isMatch) => {
    if (err) return cb(err)
    cb(null, isMatch)
  })
}

module.exports = mongoose.model('User', userSchema)
