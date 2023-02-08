const {
    getList,
    getDetail,
    createBlog,
    updateBlog,
    deleteBlog,
} = require("../controller/blog");
const { SuccessModel, ErrorModel } = require("../model/resModel");


// 登录验证
const loginCheck = req => {
    if (req.session.username) {
        return Promise.resolve(new ErrorModel("尚未登录!"));
    }
}

const handleBlogRouter = (req, res) => {
    const method = req.method;
    const id = req.query.id;

    // 获取博客列表
    if (method === "GET" && req.path === "/api/blog/list") {
        let author = req.query.author || "";
        const keyword = req.query.keyword || "";

        if(req.query.isadmin){
            // 管理员界面
            const loginCheckRes = loginCheck(req)
            if(loginCheckRes){
                // 未登录
                return loginCheckRes
            }
            // 强制查询自己的博客
            author = req.session.username
        }

        return getList(author, keyword).then((listData) => {
            return new SuccessModel(listData);
        });
    }

    // 获取博客详情
    if (method === "GET" && req.path === "/api/blog/detail") {
        const result = getDetail(id);
        return result.then((data) => {
            return new SuccessModel(data);
        });
    }

    // 新建博客
    if (method === "POST" && req.path === "/api/blog/new") {
        const loginCheckRes = loginCheck(req)
        if(loginCheckRes) return loginCheckRes

        req.body.author = req.session.username
        const result = createBlog(req.body);
        return result.then((data) => {
            return new SuccessModel(data);
        });
    }

    // 更新博客
    if (method === "POST" && req.path === "/api/blog/update") {
        const loginCheckRes = loginCheck(req)
        if(loginCheckRes) return loginCheckRes

        const result = updateBlog(id, req.body);
        return result.then((val) => {
            if (val) return new SuccessModel();
            else return new ErrorModel("更新博客失败！");
        });
    }

    // 删除博客
    if (method === "POST" && req.path === "/api/blog/del") {
        const loginCheckRes = loginCheck(req)
        if(loginCheckRes) return loginCheckRes
        
        const author = req.session.username
        const result = deleteBlog(id, author);
        return result.then((val) => {
            if (val) return new SuccessModel();
            else return new ErrorModel("删除博客失败！");
        });
    }
};

module.exports = handleBlogRouter;
