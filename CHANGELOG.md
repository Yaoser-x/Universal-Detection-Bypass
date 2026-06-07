# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/lang/zh-CN/).

## [Unreleased]

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
- GitHub Actions CI/CD：推送到 `main` 自动构建、校验语法、创建 Release
- 项目基础设施：README、CHANGELOG、GPL-3.0 License、.gitignore、package.json

[Unreleased]: https://github.com/Yaoser-x/Universal-Detection-Bypass/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Yaoser-x/Universal-Detection-Bypass/releases/tag/v1.0.0
