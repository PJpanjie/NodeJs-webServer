const env = process.env.NODE_ENV // 环境参数

// 配置
let MYSQL_CONFIG
let RDIS_CONFIG

if (env === 'dev') {
    // mysql
    MYSQL_CONFIG = {
        host: 'localhost',
        user: 'root',
        password: 'pj513620',
        port: '3306',
        database: 'myblog'
    }

    // redis
    RDIS_CONFIG = {
        port: 6379,
        host: '127.0.0.1'
    }
}

if (env === 'production') {
    // mysql
    MYSQL_CONFIG = {
        host: 'localhost',
        user: 'root',
        password: 'pj513620',
        port: '3306',
        database: 'myblog'
    }

    // redis
    RDIS_CONFIG = {
        port: 6379,
        host: '127.0.0.1'
    }
}

module.exports = {
    MYSQL_CONFIG,
    RDIS_CONFIG
}