const mysql = require('mysql')
const { MYSQL_CONFIG } = require('../config/db')

// 创建连接配置
const con = mysql.createConnection(MYSQL_CONFIG)

// 开始连接
con.connect()

// 统一执行sql的函数
function exec(sql) {
    const promise = new Promise((resolve, reject) => {
        con.query(sql, (err, result) => {
            if (err) {
                reject(err)
            }
            resolve(result)
        })
    })
    return promise
}

module.exports = {
    exec
}