const { SuccessModel, ErrorModel } = require("../model/resModel");
const { login } = require("../controller/user");
const {set} = require('../db/redis')


const handleUserRouter = (req, res) => {
    const method = req.method;

    // 登录
    if (method === "POST" && req.path === "/api/user/login") {
        const { username, password } = req.body;
        const result = login(username, password);
        return result.then((data) => {
            if (data.username) {
                // 设置session
                req.session.username = data.username
                req.session.realName = data.realName

                // 同步到redis
                set(req.sessionId,req.session)
                return new SuccessModel();
            }  
            return new ErrorModel("登录失败！");
        });
    }
};

module.exports = handleUserRouter;
