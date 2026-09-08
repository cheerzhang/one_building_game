# 一栋楼

纯 HTML、CSS、JavaScript 的手机 WAP 游戏，通过 GitHub Actions 自动部署到 GitHub Pages。

每次推送到 `main` 后，Pages 会生成形如 `v0.1.0+20260831.abc1234` 的版本号。已打开的游戏页面会自动检查新版本，并提示玩家更新。

## 发布本地 AI 策略

AI 的进化训练只在浏览器本地进行。请使用 `node server.js` 启动本地游戏；训练页的“保存到策略文件”会将最佳策略直接写入仓库根目录的 `ai-policy.json`，无需下载或手动替换文件。之后只提交并推送这个策略文件，GitHub Pages 部署后，线上版就会自动加载它。线上玩家可以直接开启 AI 托管，不会在设备上自动训练。
