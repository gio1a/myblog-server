const { exec, escape } = require("../db/mysql");
const { genPassword } = require("../utils/cryp");

class UserController {
    login(username, password) {
        // 生成加密密码
        password = genPassword(password);
        
        username = escape(username);
        password = escape(password);

        const sql = `select username,realName from users where username=${username} and password=${password}`;
        return exec(sql).then((rows) => {
            return rows[0] || {};
        });
    }
}

module.exports = new UserController();
