let ctx = {
  // get url () {
  //   return this.req.url
  // }
}
function defineGetter (property, key) {
  // 取值时相当于去 property上面取值
  ctx.__defineGetter__(key, function () {
    return this[property][key]
  })
}

// vue vm.$data = vm
function defineSetter (property, key) {
  ctx.__defineSetter__(key, function (value) {
    this[property][key] = value
  })
}
// ctx.url == ctx.request.url
defineGetter('request', 'url')
defineSetter('response', 'body')
defineGetter('response', 'body')

module.exports = ctx
