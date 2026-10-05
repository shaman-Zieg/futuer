# 匿名愿望箱

访客无需登录即可提交愿望，主人使用管理密钥查看。支持手机与电脑。

- `public/`：可直接部署到 GitHub Pages 的前端。
- `worker/`：云端 API，愿望存于 D1 数据库，不进入 GitHub。
- `db/`、`drizzle/`：数据库结构和迁移。
- `node scripts/build.mjs`：构建。
- `node --test tests/api.test.mjs`：验证存储、重复提交、访问权限。
- `node scripts/dev.mjs`：本地预览（临时内存数据库，重启清空）。

生产环境需配置 DB 绑定和 ADMIN_KEY_HASH（管理密钥的 SHA-256），应用 drizzle 数据库迁移。前端通过 public/config.js 指向 API；不允许把管理密钥放进该文件。

## GitHub Pages
将 public 目录发布为站点内容。源码与网页公开，愿望和管理密钥不公开。管理入口为网页地址加 #admin。

## 匿名范围
不要求姓名或联系方式，不使用统计追踪。数据库不保存 IP、设备资料及精确提交时间。托管服务可能保留网络日志。请勿主动在愿望里填写个人身份信息。

当前版本提供基础输入限制和重复提交保护，不适合遭受大规模自动灌水的开放场景。
