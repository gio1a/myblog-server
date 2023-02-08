const Koa = require('koa')
const app = new Koa()
// const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const session = require('koa-generic-session')
const redisStore = require('koa-redis')
const path = require('path')
const fs = require('fs')
const morgan = require('koa-morgan')

const blog = require('./routes/blog')
const user = require('./routes/user')

const { REDIS_CONF } = require('./conf/db')

// error handler
onerror(app)

// middlewares

// 处理postData
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())

app.use(logger())

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  // 当前服务耗时
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// 生成access日志
const ENV = process.env.NODE_ENV
if (ENV !== "production") {
    // 开发/测试环境 用dev
    app.use(morgan("dev"))
} else {
    // 线上环境 用combined
    const logFileName = path.join(__dirname, "logs", "access.log")
    const writeStream = fs.createWriteStream(logFileName, {
        flags: "a"
    })
    app.use(
        morgan("combined", {
            stream: writeStream
        })
    )
}

// session配置
app.keys = ['Asdf_0207#']
app.use(session({
    // 配置cookie
    cookie: {
        path: '/',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    },

    // 配置redis
    store: redisStore({
        all: `${REDIS_CONF.host}:${REDIS_CONF.port}`
    })
}))

// routes
// 规定只能使用路由里的请求方式，否则会报405或501
app.use(blog.routes(), blog.allowedMethods())
app.use(user.routes(), user.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
