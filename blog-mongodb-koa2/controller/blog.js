const Blog = require('../db/models/Blog')
const xss = require('xss')

class BlogController {
    async getList(author, keyword) {
        // 动态拼接查询条件
        const whereOpt = {}
        if(author) whereOpt.author = author
        if(keyword) whereOpt.title = new RegExp(keyword)

        // 按照id逆序，即按照创建时间逆序
        const list = await Blog.find(whereOpt).sort({ _id: -1 })
        return list
    }

    async getDetail(id) {
        const blog = await Blog.findById(id)
        return blog
    }

    async createBlog(data = {}) {
        const title = xss(data.title)
        const content = xss(data.content)
        const author = data.author

        const blog = await Blog.create({
            title,
            content,
            author
        })
        return { id: blog._id }
    }

    async updateBlog(id, data = {}) {
        const title = xss(data.title)
        const content = xss(data.content)
        
        // 返回修改之后的最新的内容
        const res = await Blog.findOneAndUpdate(
            { _id: id },
            { title, content },
            {
                new: true,
            }
        )
        if(res == null) return false
        return true
    }

    async deleteBlog(id, author) {
        // 返回被删除的内容
        const res = await Blog.findOneAndDelete({
            _id: id,
            author
        })
        if(res == null) return false
        return true
    }
}

module.exports = new BlogController();
