const User = require('../db/models/User')
const { genPassword } = require("../utils/cryp");

class UserController {
    async login(username, password) {
        // 使用加密后的密码
        password = genPassword(password);
        const userList = await User.find({
            username,
            password
        })
        
        if(userList.length === 0) return {}
        return userList[0]
    }
}

module.exports = new UserController();
