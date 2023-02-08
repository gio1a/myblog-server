const mysql = require("mysql");
const { MYSQL_CONF } = require("../conf/db");

// 创建连接对象
const conn = mysql.createConnection(MYSQL_CONF);

conn.connect();

// 统一执行sql的函数
function exec(sql) {
    return new Promise((resolve, reject) => {
        conn.query(sql, (err, res) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(res);
        });
    });
}

module.exports = { exec, escape: mysql.escape };
