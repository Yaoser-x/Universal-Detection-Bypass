# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/lang/zh-CN/).

## [Unreleased]

## [1.1.0] - 2026-06-07

### Added
- 浏览器行为检测绕过模块（BehaviorSpoof）：伪造 `navigator.webdriver` 为 `false`，防止 Puppeteer/Playwright/Selenium 检测
- `navigator.plugins` / `navigator.mimeTypes` 伪装：headless 浏览器通常为空数组，伪装为标准 Chrome 插件列表
- `navigator.languages` 保底：确保非空，防止语言指纹异常检测
- `chrome` 对象注入：保证 `window.chrome` 存在，防止 Chrome 环境检测
- `Notification.permission` 伪造：返回 `'default'`，防止通过通知权限状态检测自动化环境
- `permissions.query` 拦截：对 `notifications` 权限返回 `'prompt'` 状态

### Changed
- 源码拆分为模块化目录结构：`src/core/`（配置/注册器/工具）+ `src/modules/`（6 个功能模块）
- 新增构建脚本 `scripts/build.mjs`：CI 端自动拼接模块为最终 `.user.js`，本地不执行整合
- `package.json` 新增 `build` 和 `check` 脚本，`check` 依赖 `build` 先执行
- CI workflow 更新：先 `node scripts/build.mjs` 构建，再对 `dist/` 产物执行语法校验和发布

## [1.0.0] - 2026-06-07

### Added
- 事件拦截模块（EventInterceptor）：capture 阶段拦截 `visibilitychange`、`blur`、`focus`、`focusin`、`focusout`、`pagehide`、`mouseleave`、`mouseenter`
- 事件监听黑名单：劫持 `window`/`document`/`document.body` 的 `addEventListener`，阻止注册检测事件
- 属性伪造模块（PropertySpoofer）：重写 `document.hidden`、`document.visibilityState`、`document.webkitVisibilityState`、`document.hasFocus`，以及 `on*` 事件处理器陷阱
- 分发拦截模块（VisibilityEventNullifier）：拦截 `dispatchEvent('visibilitychange')` 调用
- 生命周期伪造模块（PageLifecycleSpoof）：伪造 `document.wasDiscarded` 和 `navigator.connection` 状态
- RAF 守护模块（RAFGuard）：预留 `requestAnimationFrame` 频率检测绕过接口
- 模块化架构：`registerModule` + `initAllModules`，支持按类别扩展新模块
- toString 指纹伪装：所有劫持的函数均保留原始 `toString` 表现
- 调试模式：`CONFIG.debug` 开关，控制台输出 `[UDB]` 前缀日志
- GitHub Actions CI/CD：推送到 `main` 自动构建校验语法创建 Release
- 项目基础设施：README、CHANGELOG、GPL-3.0 License、.gitignore、package.json

[Unreleased]: https://github.com/Yaoser-x/Universal-Detection-Bypass/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/Yaoser-x/Universal-Detection-Bypass/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Yaoser-x/Universal-Detection-Bypass/releases/tag/v1.0.0
