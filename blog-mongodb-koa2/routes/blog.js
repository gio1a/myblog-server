const router = require('koa-router')()
const {
    getList,
    getDetail,
    createBlog,
    updateBlog,
    deleteBlog,
} = require("../controller/blog");
const { SuccessModel, ErrorModel } = require("../model/resModel");
const loginCheck = require("../middleware/loginCheck");

router.prefix('/api/blog')

router.get('/list', async (ctx, next) => {
    let author = ctx.query.author || "";
    const keyword = ctx.query.keyword || "";

    if (ctx.query.isadmin) {
        if (ctx.session.username == null) {
            ctx.body = new ErrorModel("未登录")
            return;
        }
        author = ctx.session.username;
    }

    const listData = await getList(author, keyword)
    ctx.body = new SuccessModel(listData)
})

router.get("/detail", async (ctx, next) => {
    const result = await getDetail(ctx.query.id)
    ctx.body = new SuccessModel(result)
});

router.post("/new", loginCheck, async (ctx, next) => {
    const body = ctx.request.body
    body.author = ctx.session.username;

    const result = await createBlog(body);
    ctx.body = new SuccessModel(result)
});

router.post("/update", loginCheck, async (ctx, next) => {
    const result = await updateBlog(ctx.query.id, ctx.request.body);

    if (result) ctx.body = new SuccessModel()
    else ctx.body = new ErrorModel("更新博客失败！")
});

router.post("/del", loginCheck, async (ctx, next) => {
    const author = ctx.session.username;
    const result = await deleteBlog(ctx.query.id, author);

    if (result) ctx.body = new SuccessModel()
    else ctx.body = new ErrorModel("删除博客失败！")
});

module.exports = router
