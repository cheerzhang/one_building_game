# 一栋楼

纯 HTML、CSS、JavaScript 的手机 WAP 游戏，通过 GitHub Actions 自动部署到 GitHub Pages。

每次推送到 `main` 后，Pages 会生成形如 `v0.1.0+20260831.abc1234` 的版本号。已打开的游戏页面会自动检查新版本，并提示玩家更新。

## 发布本地 AI 策略

AI 的进化训练只在浏览器本地进行。训练页的“导出线上策略”会下载 `ai-policy.json`；用它替换仓库根目录的同名文件并推送到 `main`，GitHub Pages 部署后，线上版会自动加载该策略。线上玩家可以直接开启 AI 托管，不会在设备上自动训练。
