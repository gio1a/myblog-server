const { exec } = require("../db/mysql");

class BlogController {
    getList(author, keyword) {
        let sql = `select id,title,content,createTime,author from blogs where 1=1 `;
        if (author) {
            sql += `and author='${author}'`;
        }
        if (keyword) {
            sql += `and title like '%${keyword}%' `;
        }
        sql += `order by createTime desc`;
        console.log('getList sql ---> ',sql)
        return exec(sql);
    }

    getDetail(id) {
        let sql = `select * from blogs where id=${id} `;
        return exec(sql).then((rows) => {
            return rows[0];
        });
    }

    createBlog(data = {}) {
        // data 是一个对象，包含title content等内容

        let sql = `
            insert into blogs (title,content,author,createTime) 
            values ('${data.title}','${data.content}','${
            data.author
        }',${Date.now()})
        `;
        return exec(sql).then((insertData) => {
            return {
                id: insertData.insertId,
            };
        });
    }

    updateBlog(id, data = {}) {
        // id 要更新的博客id
        // data 是一个对象，包含title content等内容
        let sql = `update blogs set title='${data.title}',content='${data.content}' where id = ${id}`;
        return exec(sql).then((updateData) => {
            if (updateData.affectedRows > 0) return true;
            else return false;
        });
    }

    deleteBlog(id, author) {
        // 只能删除自己发的
        let sql = `delete from blogs where id = ${id} and author='${author}'`;
        return exec(sql).then((deleteData) => {
            if (deleteData.affectedRows > 0) return true;
            else return false;
        });
    }
}

module.exports = new BlogController();
