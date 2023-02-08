const querystring = require("querystring");

const {access} = require('./src/utils/log')
const { set, get } = require("./src/db/redis");
const handleBlogRouter = require("./src/router/blog");
const handleUserRouter = require("./src/router/user");

// session 数据
const SESSION_DATA = {};

// 处理post data
const getPostData = (req) => {
    return new Promise((resolve, reject) => {
        if (req.method !== "POST") {
            // method不是post 则返回空
            resolve({});
            return;
        }
        if (req.headers["content-type"] !== "application/json") {
            // 发送的数据不是json格式
            resolve({});
            return;
        }

        let postData = "";
        req.on("data", (chunk) => (postData += chunk.toString())); // ???????????
        req.on("end", () => {
            if (!postData) {
                // 没有数据
                resolve({});
                return;
            }
            resolve(JSON.parse(postData));
        });
    });
};

// 获取cookie过期时间
const getCookieExpires = () => {
    const d = new Date();
    // 假设:当前时间＋24小时
    d.setTime(d.getTime() + 24 * 60 * 60 * 1000);
    return d.toGMTString();
};

const serverHandler = (req, res) => {
    
    // 记录access log,传入一个字符串，通过stream写入access.log
    access(`${req.method} -- ${req.url} -- ${req.headers[`user-agent`]} -- ${Date.now()}`)

    // 设置返回格式 JSON
    res.setHeader("Content-type", "application/json");

    // 获取path、url
    const url = req.url;
    req.path = url.split("?")[0]; // ?的前面

    // 解析query
    req.query = querystring.parse(url.split("?")[1]); // ?的后面

    // 解析cookie
    req.cookie = {};
    const cookieStr = req.headers.cookie || "";
    cookieStr.split(";").forEach((item) => {
        if (!item) {
            return;
        }
        const arr = item.split("=");
        const key = arr[0].trim();
        const val = arr[1].trim();
        req.cookie[key] = val;
    });

    // 解析session (使用redis)
    let needSetCookie = false;
    let userId = req.cookie.userid;
    if (!userId) {
        needSetCookie = true;
        userId = `${Date.now()}_${Math.random()}`;
        // 初始化redis中的session值
        set(userId, {});
    }
    // 获取session
    req.sessionId = userId;
    get(req.sessionId)
        .then((sessionData) => {
            if (sessionData == null) {
                // 初始化redis中的session值
                set(req.sessionId, {});
                // 设置session
                req.session = {};
            } else {
                // 设置session
                req.session = sessionData;
            }
            console.log("req.session ---> ", req.session);

            // 处理post data
            return getPostData(req);
        })
        .then((postData) => {
            // 处理postData
            req.body = postData;

            // 处理blog路由
            const blogResult = handleBlogRouter(req, res);
            if (blogResult) {
                blogResult.then((blogData) => {
                    if (needSetCookie) {
                        // 如果需要设置cookie
                        // 设置cookie的值；path设置生效路由(这里写成根路由)；httpOnly 表示cookie只能通过后端来改，前端不能改;expires设置过期时间
                        res.setHeader(
                            "Set-Cookie",
                            `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`
                        );
                    }
                    res.end(JSON.stringify(blogData));
                });
                return;
            }

            // 处理user路由
            const userResult = handleUserRouter(req, res);
            if (userResult) {
                userResult.then((userData) => {
                    if (needSetCookie) {
                        res.setHeader(
                            "Set-Cookie",
                            `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`
                        );
                    }
                    res.end(JSON.stringify(userData));
                });
                return;
            }

            // 未命中路由，404
            res.writeHead(404, { "Content-type": "text/plain" });
            res.write("404 Not Found ~");
            res.end();
        });
};

module.exports = serverHandler;
