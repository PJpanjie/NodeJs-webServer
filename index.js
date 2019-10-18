// const http = require('http')
// const querystring = require('querystring')

// const server = http.createServer((req, res) => {
//     const url = req.url
//     const method = req.method
//     const path = url.split('?')[0]
//     const query = querystring.parse(url.split('?')[1])

//     // 设置返回格式为 JSON
//     res.setHeader('Content-type', 'application/json')

//     // 返回数据
//     const reqData = {
//         method,
//         url,
//         path,
//         query
//     }

//     // 返回
//     if (method === 'GET') {
//         res.end(JSON.stringify(reqData))
//     }

//     if (method === 'POST') {
//         let postData = '';
//         req.on('data', chunk => {
//             postData += chunk.toString();
//         })
//         req.end('end', () => {
//             reqData.postData = postData;
//             // 返回
//             res.end(JSON.stringify(reqData))
//         })
//     }
// })

// const server = http.createServer((req, res) => {
//     if (req.method == 'POST') {
//         console.log('req content-type', req.headers['content-type'])
//         let postData = ''
//         req.on('data', chunk => {
//             postData += chunk.toString()
//         })
//         req.on('end', () => {
//             console.log('postData', postData)
//             res.end('hello world')
//         })
//     }
// })

// server.listen(3000)
// console.log('OK')

const handleBlogRouter = require('./src/router/blog')
const handleUserRouter = require('./src/router/user')
const querystring = require('querystring')
const {get, set } = require('./src/db/redis')

// 获取cookie的过期时间
const getCookieExpires = () => {
    const d = new Date()
    d.setTime(d.getTime() + (24 * 60 * 60 * 1000))
    console.log(d.toGMTString())
    return d.toGMTString()
}

// session 数据
// const SESSION_DATA = {}

// 用于处理post data
const getPostData = (req) => {
    const promise = new Promise((resolve, reject) => {
        if (req.method !== 'POST') {
            resolve({})
            return
        }
        if (req.headers['content-type'] !== 'application/json') {
            resolve({})
            return
        }
        let postData = ''
        req.on('data', chunk => {
            postData += chunk.toString()
        })
        req.on('end', () => {
            if (!postData) {
                resolve({})
                return
            }
            resolve(JSON.parse(postData))
        })
    })
    return promise
}

const serverHandle = (req, res) => {
    // 设置返回格式
    res.setHeader('Content-type', 'application/json')

    // 解析path
    const url = req.url
    req.path = url.split('?')[0]

    // 解析query
    req.query = querystring.parse(url.split('?')[1])

    // 解析cookie
    req.cookie = {}
    const cookieStr = req.headers.cookie || ''
    cookieStr.split(';').forEach(item => {
        if (!item) return
        const arr = item.split('=')
        const key = arr[0].trim()
        const val = arr[1].trim()
        req.cookie[key] = val
    })

    // // 解析session
    // let needSetCookie = false
    // let userId = req.cookie.userid
    // if (userId) {
    //     if (!SESSION_DATA[userId]) {
    //         SESSION_DATA[userId] = {}
    //     }
    // } else {
    //     needSetCookie = true
    //     userId = `${Date.now()}_${Math.random()}`
    //     SESSION_DATA[userId] = {}
    // }
    // req.session = SESSION_DATA[userId]

    // 解析session 使用redis
    let needSetCookie = false
    let userId = req.cookie.userid
    if (!userId) {
        needSetCookie = true
        userId = `${Date.now()}_${Math.random()}`
            // 初始化 redis中的session值
        set(userId, {})
    }
    // 获取session
    req.sessionId = userId;
    get(req.sessionId).then(sessionData => {
        if (sessionData == null) {
            // 初始化 redis中的session值
            set(req.sessionId, {})
                // 设置session
            req.session = {}
        } else {
            // 设置session
            req.session = sessionData
        }
        console.log('req.session', req.session)
            // 处理post data
        return getPostData(req)
    }).then(postData => {
        req.body = postData

        // 处理blog路由
        const blogResult = handleBlogRouter(req, res)
        if (blogResult) {
            blogResult.then(blogData => {
                if (needSetCookie) {
                    res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`)
                }
                res.end(JSON.stringify(blogData))
            })
            return
        }

        const userResult = handleUserRouter(req, res)
        if (userResult) {
            userResult.then(userData => {
                if (needSetCookie) {
                    res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`)
                }
                res.end(JSON.stringify(userData))
            })
            return
        }

        // 未命中路由，返回404
        res.writeHead(404, { "Content-type": "text/plain" })
        res.write('404 Not Found\n')
        res.end()
    })
}

module.exports = serverHandle