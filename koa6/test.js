const Koa = require('./application')

let app = new Koa()
app.use(async (ctx, next) => {
  ctx.body = 'hello'
  await next()
})

app.use(async (ctx, next) => {
  await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, 1000)
  })
  ctx.body = 'world'
})

app.listen(3000, function () {
  console.log('server start 3000')
})
