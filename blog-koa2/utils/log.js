const fs = require('fs')
const path = require('path')

// 写日志
// 将log写入destWriteStream
function writeLog(destWriteStream, log){
    destWriteStream.write(log+'\n') // 关键代码
}

// 生成 dest write Stream(可以理解为第二个水桶)
function createDestWriteStream(fileName) {
    const fullFileName = path.join(__dirname, '../', '../', 'logs', fileName)
    const writeStream = fs.createWriteStream(fullFileName,{
        flags:'a'
    })
    return writeStream
}

// 写访问日志
const accessWriteStream = createDestWriteStream('access.log')
function access(log) {
    writeLog(accessWriteStream,log) //相当于起到连接作用
}

module.exports = {
    access
}


