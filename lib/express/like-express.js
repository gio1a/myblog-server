// 模拟 express 中间件实现
const http = require("http");
const slice = Array.prototype.slice;

class LikeExpress {
    constructor() {
        // 存放中间件的列表
        this.routes = {
            all: [], //存放 app.use(...) 的中间件
            get: [], //app.get(...)
            post: [], //app.post(...)
            // ...
        };
    }

    register(path) {
        const info = {};
        if (typeof path === "string") {
            info.path = path;

            // 从第2个参数开始，转换为数组，存入stack
            // stack中则为其他中间件
            info.stack = slice.call(arguments, 1);
        } else {
            // 第一个参数不是string时，则默认为根路径
            info.path = "/";

            // 从第1个参数开始，转换为数组，存入stack
            info.stack = slice.call(arguments, 0);
        }
        return info;
    }

    use() {
        // 把当前函数中所有参数传入register中，返回info
        const info = this.register.apply(this, arguments);
        this.routes.all.push(info);
    }

    get() {
        const info = this.register.apply(this, arguments);
        this.routes.get.push(info);
    }

    post() {
        const info = this.register.apply(this, arguments);
        this.routes.post.push(info);
    }

    // 根据method和url筛选哪些中间件需要访问
    match(method, url) {
        let stack = [];
        if (url === "/favicon.ico") {
            return stack;
        }
        // 获取routes
        let curRoutes = [];
        curRoutes = curRoutes.concat(this.routes.all);
        curRoutes = curRoutes.concat(this.routes[method]);

        curRoutes.forEach((routeInfo) => {
            if (url.indexOf(routeInfo.path) === 0) {
                // 比如:
                // url==='/api/get-cookie' 且 routeInfo.path==='/'
                // url==='/api/get-cookie' 且 routeInfo.path==='/api'
                // url==='/api/get-cookie' 且 routeInfo.path==='/api/get-cookie'
                stack = stack.concat(routeInfo.stack);
            }
        });
        return stack;
    }

    // 核心的 next 机制
    handle(req, res, stack) {
        const next = () => {
            // 拿到第一个匹配的中间件
            const middleware = stack.shift();
            if (middleware) {
                // 执行中间件函数
                middleware(req, res, next);
            }
        };
        next();
    }

    callback() {
        return (req, res) => {
            // 定义res.json函数
            res.json = (data) => {
                res.setHeader("Content-type", "application/json");
                res.end(JSON.stringify(data));
            };

            const url = req.url;
            const method = req.method.toLowerCase();

            const resultList = this.match(method, url); //返回当前已经匹配好的中间件列表
            this.handle(req, res, resultList);
        };
    }

    listen(...args) {
        const server = http.createServer(this.callback);
        server.listen(...args);
    }
}

module.exports = new LikeExpress();
