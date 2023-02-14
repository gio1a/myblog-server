// 对应user集合
const mongoose = require('../db')

// 用 Schema 定义数据规范
const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: String,
    realName: String
}, { timestamps: true })

// Model 对应 collection
// collection名字写单数，mongoose会自动把它转换成复数形式
const User = mongoose.model('user', UserSchema)

module.exports = User

