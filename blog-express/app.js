var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);
const redisClient = require("./db/redis");

// 引入路由
const blogRouter = require("./routes/blog");
const userRouter = require("./routes/user");

var app = express();

// 类似原生的生成access日志
const ENV = process.env.NODE_ENV;
if (ENV !== "production") {
    // 开发或测试环境 用dev
    app.use(logger("dev"));
} else {
    // 线上环境 用combined
    const logFileName = path.join(__dirname, "logs", "access.log"); // 要写入的文件名
    const writeStream = fs.createWriteStream(logFileName, {
        flags: "a",
    });
    app.use(
        logger("combined", {
            stream: writeStream,
        })
    );
}

app.use(express.json()); // 原生的处理post data并将数据再返回给req.body
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); //注册

const sessionStore = new RedisStore({
    client: redisClient,
});
app.use(
    session({
        secret: "Asdf_0207#",
        cookie: {
            // path和httpOnly都是默认配置
            path: "/",
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
        },
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
    })
);

// 注册路由
app.use("/api/blog", blogRouter);
app.use("/api/user", userRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "dev" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.send("error");
});

module.exports = app;
