var queue     = []
var emptying  = false

var push      = (fn, context, params) => {
  console.log('queueing response')
  queue.push(() => fn.apply(context, params))
}

var empty     = (callback) => {
  emptying = true
  while (queue.length > 0) {
    //console.log('emptying queue')
    (queue.shift())()
  }
  emptying = false
  if (callback) callback()
}

module.exports.emptying = emptying
module.exports.push   = push
module.exports.empty  = empty
