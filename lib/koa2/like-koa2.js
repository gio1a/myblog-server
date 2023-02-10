const http = require('http')

// 用于 组合中间件
const compose = middlewareList => {
    return ctx => {
        // 中间件调用,next机制
        function dispatch(i) {
            const fn = middlewareList[i]
            try {
                return Promise.resolve(
                    // bind 创建一个新函数，并不执行
                    // dispatch(i+1) 则为执行函数
                    fn(ctx, dispatch.bind(null, i+1))
                )
            } catch (err) {
                return Promise.reject(err)
            }
        }

        return dispatch(0)
    }
}

class LikeKoa2 {
    constructor() {
        this.middlewareList = []
    }

    use(fn) {
        // use注册中间件，把中间件函数push到中间件列表中
        this.middlewareList.push(fn)
        // 可以链式调用 可有可无，尽量独立，不要链式调用
        return this
    }

    createContext(req, res) {
        const ctx = { req, res }
        ctx.query = req.query
        return ctx
    }

    handlerRequest(ctx, fn) {
        return fn(ctx)
    }

    callback() {
        const fn = compose(this.middlewareList)
        return (req, res) => {
            const ctx = this.createContext(req, res)
            return this.handlerRequest(ctx, fn)
        }
    }

    listen(...args) {
        const server = http.createServer(this.callback())
        server.listen(...args)
    }
}

module.exports = new LikeKoa2()