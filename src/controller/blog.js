const { exec } = require('../db/mysql')

const getList = (author, keyword) => {
    // 先返回假数据（格式是正确的）
    let sql = `select * from myblog.blogs where 1=1 `
    if (author) {
        sql += `and author='${author}'`
    }
    if (keyword) {
        sql += `and title like '%${keyword}%'`
    }
    sql += `order by createtime desc;`

    // 返回promise
    return exec(sql)
}

const getDetail = (id) => {
    let sql = `select * from blogs where id='${id}'`
    return exec(sql).then(rows => {
        return rows[0]
    })
}

const newBlog = (blogData = {}) => {
    // blogData 是一个博客对象
    const title = blogData.title
    const content = blogData.content
    const author = blogData.author
    const createtime = Date.now()

    const sql = `insert into blogs (title,content,createtime,author) 
    values ('${title}','${content}','${createtime}','${author}')`

    return exec(sql).then(insertData => {
        return {
            id: insertData.insertId
        }
    })
}

const updataBlog = (id, blogData = {}) => {
    // id 就是要更新博客的id
    // blogData 是一个博客对象

    const title = blogData.title
    const content = blogData.content

    const sql = `update blogs set title='${title}',content='${content}' where id='${id}'`

    return exec(sql).then(updateData => {
        if (updateData.affectedRows > 0) {
            return true
        }
        return false
    })
}

const delBlog = (id, author) => {
    const sql = `delete from blogs where id='${id}' and author='${author}'`

    return exec(sql).then(deleteData => {
        if (deleteData.affectedRows > 0) {
            return true
        }
        return false
    })
}

module.exports = {
    getList,
    getDetail,
    newBlog,
    updataBlog,
    delBlog
}