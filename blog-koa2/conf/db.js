// 获取环境变量
const env = process.env.NODE_ENV;

// 配置
let MYSQL_CONF;
let REDIS_CONF;

if (env === "dev") {
    // mysql配置
    MYSQL_CONF = {
        host: "localhost",
        user: "root",
        password: "987234",
        port: "3306",
        database: "myblog",
    };

    // redis配置
    REDIS_CONF = {
        port: 6379,
        host: "127.0.0.1",
    };
}

if (env === "production") {
    // 线上环境
    MYSQL_CONF = {
        host: "localhost",
        user: "root",
        password: "987234",
        port: "3306",
        database: "myblog",
    };

    REDIS_CONF = {
        port: 6379,
        host: "127.0.0.1",
    };
}

module.exports = {
    MYSQL_CONF,
    REDIS_CONF,
};
