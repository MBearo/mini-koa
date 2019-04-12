const http = require('http')
const request = require('./request')
const response = require('./response')
const context = require('./context')
const Stream = require('stream')

class Koa {
  constructor () {
    this.middlewares = []
    this.context = Object.create(context)
    this.request = Object.create(request)
    this.response = Object.create(response)
  }
  use (fn) {
    this.middlewares.push(fn)
  }
  createContext (req, res) {
    let ctx = this.context
    ctx.request = this.request
    ctx.response = this.response
    ctx.request.req = ctx.req = req
    ctx.response.res = ctx.res = res
    return ctx
  }
  compose (ctx, middles) {
    let i = -1
    let dispatch = index => {
      if (index <= i) return Promise.reject(new Error('multi called next()'))
      i = index // i = 0;
      if (index === middles.length) return Promise.resolve()
      const fn = middles[index]
      return Promise.resolve(fn(ctx, () => dispatch(index + 1)))
    }
    return dispatch(0) // 默认执行一次
  }
  handleRequest (req, res) {
    res.statusCode = 404
    let ctx = this.createContext(req, res)
    let p = this.compose(ctx, this.middlewares)
    p.then(() => {
      let body = ctx.body
      if (body instanceof Stream) {
        res.setHeader('Content-Type', 'application/octet-stream')
        // 下载文件 文件的名字是xxx
        res.setHeader('Content-Disposition', `attachment; filename=${body.path}`)
        body.pipe(res)
      } else if (typeof body === 'object') {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(body))
      } else if (body) {
        res.end(body)
      } else {
        res.end(`Not Found`)
      }
    }).catch((err) => {
      this.emit('error', err)
    })
    // this.middlewares.forEach(fn => {
    //   fn(ctx)
    // })
    // res.end(ctx.body)
  }
  listen (...args) {
    const server = http.createServer(this.handleRequest.bind(this))
    server.listen(...args)
  }
}

module.exports = Koa
