# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/lang/zh-CN/).

## [Unreleased]

## [1.3.0] - 2026-06-09

### Fixed
- **[严重] 修复 console 方法在非 debug 模式下被完全静音的问题** — 之前 `CONFIG.debug=false` 时所有 `console.log/warn/error` 等输出被吞掉，导致网站运行时错误被掩盖；现在正常透传
- **[严重] 修复 `Function.prototype.constructor` 循环引用** — `devtools-spoof.js` 中 `window.Function.prototype.constructor = window.Function` 导致原型链异常，移除该赋值
- **[严重] 修复 `navigator.plugins` / `navigator.mimeTypes` 返回值类型错误** — 返回普通 `Array` 而非模拟 `PluginArray`/`MimeTypeArray`，添加 `item()`/`namedItem()`/`refresh()` 方法
- **[中等] 移除 `outerWidth`/`outerHeight` 过度伪装** — `outer === inner` 是比 devtools 打开更强的 headless 信号，移除该伪装保留浏览器原生行为
- **[中等] 修复 `performance.now()` 时序漂移** — offset 只增不减导致时间长期落后于真实值，用 `Date.now()` 锚定防止 `Date.now() - performance.now()` 差值暴露篡改；跳变阈值从 100ms 调整为 200ms
- **[中等] 修复 `navigator.connection` 属性定义缺少 `configurable: true`** — 其他 userscript 或页面脚本尝试 patch 时会抛 `TypeError`
- **[中等] 将 `navigator.__proto__` 替换为 `Object.getPrototypeOf()`** — `__proto__` 已废弃，某些环境不可用
- **[中等] 移除 `Notification.permission` 硬编码为 `'default'`** — 用户可能已授予/拒绝通知，硬编码反而暴露异常；保留原生行为
- **[中等] 从事件拦截中移除 `mouseleave`/`mouseenter`** — 这些是高频 UI 事件，阻断会导致下拉菜单、tooltip 等交互异常
- **[中等] 从事件拦截中移除 `pagehide`/`pageshow`** — 阻断会破坏 bfcache 和 SPA 框架的生命周期管理
- **[低] 修复 `document.hasFocus` 定义方式** — 箭头函数改为普通函数，保持与原生 API 的 `this` 行为一致

### Changed
- EventInterceptor 模块现在仅拦截 `visibilitychange` 事件，其余事件的反检测由 PropertySpoofer 的属性重写层保证
- 性能时序压缩阈值从 100ms 调整为 200ms，减少误压缩正常帧间隔

## [1.2.1] - 2026-06-07

### Fixed
- 修复 `property-spoofer.js` 中 `hasFocus` getter 返回函数而非布尔值的 bug（`get: () => () => true` → `value: () => true`）
- 为 `devtools-spoof.js` 中所有 monkey-patch（Function 构造器、console 方法、performance.now）添加 toString 伪装
- 为 `behavior-spoof.js` 中 `navigator.permissions.query` 添加 toString 伪装
- 修复 `navigator.platform` 硬编码为 `Win32` 的问题，改为根据 UA 动态推断
- 所有模块的 `catch (_) {}` 改为 `catch (e) { ctx.log(...) }`，关键保护层失败时输出日志

## [1.2.0] - 2026-06-07

### Added
- 开发者工具检测绕过模块（DevToolsSpoof）：覆盖 debugger 陷阱、console 格式化检测、窗口尺寸检测、Performance 时序检测、自动化标志清理
- `navigator.platform` 保底：headless 浏览器返回空时伪造为 `Win32`
- `navigator.hardwareConcurrency` 保底：headless 通常为 1，伪造为 4
- `document.webkitHidden` 覆盖：兼容旧 WebKit 浏览器
- `pageshow` 事件拦截：部分站点用此检测页面恢复

### Changed
- `navigator.languages` 不再硬编码 `zh-CN`，改为从浏览器实际 `navigator.language` 读取，仅在为空时保底

## [1.1.1] - 2026-06-07

### Fixed
- 移除 `src/main.js` 中未被构建脚本使用的 `BUILD_INSERT` 占位符
- 移除空壳模块 `raf-guard.js`（no-op，注册但不执行任何逻辑）
- 移除 `event-interceptor.js` 中无效的 `return false`（`stopImmediatePropagation` + `preventDefault` 已覆盖）
- 移除 `property-spoofer.js` 中与 `defineProperties` 重复的 `document.hasFocus` 赋值
- 修复 `document.onvisibilitychange` 被 `PropertySpoofer` 和 `VisibilityEventNullifier` 两个模块重复覆盖的冲突，统一由 `VisibilityEventNullifier` 负责
- 修正 README/CHANGELOG 中「所有劫持函数均保留原始 toString 表现」的夸大描述，实际仅 `addEventListener` 劫持做了 toString 伪装

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
- toString 指纹伪装：`addEventListener` 劫持保留原始 `toString` 表现
- 调试模式：`CONFIG.debug` 开关，控制台输出 `[UDB]` 前缀日志
- GitHub Actions CI/CD：推送到 `main` 自动构建校验语法创建 Release
- 项目基础设施：README、CHANGELOG、GPL-3.0 License、.gitignore、package.json

[Unreleased]: https://github.com/Yaoser-x/Universal-Detection-Bypass/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/Yaoser-x/Universal-Detection-Bypass/compare/v1.2.1...v1.3.0
[1.2.1]: https://github.com/Yaoser-x/Universal-Detection-Bypass/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/Yaoser-x/Universal-Detection-Bypass/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/Yaoser-x/Universal-Detection-Bypass/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/Yaoser-x/Universal-Detection-Bypass/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Yaoser-x/Universal-Detection-Bypass/releases/tag/v1.0.0
