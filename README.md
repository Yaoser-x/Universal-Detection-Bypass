# Universal Detection Bypass

统一的 Web 检测绕过框架 — 通过拦截和重写浏览器焦点、页面可见性等状态接口，使网站始终认为当前页面处于激活状态。

[![Release](https://img.shields.io/github/v/release/Yaoser-x/Universal-Detection-Bypass)](https://github.com/Yaoser-x/Universal-Detection-Bypass/releases/latest)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)

---

## 功能特性

### 当前版本 (v1.2.0)

- **事件拦截** — capture 阶段拦截 `visibilitychange`、`blur`、`focus`、`focusin`、`focusout`、`pagehide`、`pageshow`、`mouseleave`、`mouseenter`
- **事件监听黑名单** — 劫持 `addEventListener`，阻止页面注册检测事件
- **属性伪造** — 重写 `document.hidden`、`document.webkitHidden`、`document.visibilityState`、`document.hasFocus` 等只读属性
- **分发拦截** — 阻止手动 `dispatchEvent('visibilitychange')` 触发检测
- **生命周期伪造** — 伪造 `document.wasDiscarded`、`navigator.connection` 状态
- **浏览器行为伪造** — `navigator.webdriver`、`plugins`、`mimeTypes`、`languages`、`platform`、`hardwareConcurrency`、`chrome` 对象、`Notification.permission`
- **开发者工具检测绕过** — debugger 陷阱拦截、console 格式化检测防护、窗口尺寸伪造、Performance 时序平滑、自动化标志清理
- **toString 伪装** — `addEventListener` 劫持保留原始 `toString` 表现，防止指纹检测
- **模块化架构** — 源码拆分为 `core/` + `modules/`，CI 端自动构建整合

### 后续开发方向

| 阶段 | 功能 | 状态 |
|------|------|------|
| v1.3 | 用户活跃度检测绕过（鼠标/键盘模拟） | 规划中 |
| v2.0 | 站点特定检测逻辑适配 | 规划中 |

---

## 安装

### 前置条件

安装 [Tampermonkey](https://www.tampermonkey.net/) 或 [Violentmonkey](https://violentmonkey.github.io/) 等用户脚本管理器。

### 安装脚本

**[📥 安装 Universal Detection Bypass](https://github.com/Yaoser-x/Universal-Detection-Bypass/releases/latest/download/Universal-Detection-Bypass.user.js)**

---

## 使用方法

安装后脚本自动在所有网站上运行，无需额外配置。

### 开启调试模式

编辑 `src/core/config.js`，将 `debug` 设为 `true`：

```javascript
const CONFIG = {
    debug: true,  // 改为 true 开启调试日志
    version: '{{VERSION}}',
};
```

重新构建后安装，控制台将输出 `[UDB]` 前缀的调试日志。

---

## 架构设计

```
Universal Detection Bypass
├── core/
│   ├── config.js                — 配置（debug 开关、版本号）
│   ├── registry.js              — 模块注册器
│   └── utils.js                 — log / debug 工具
├── modules/
│   ├── event-interceptor.js     — 事件拦截（capture + addEventListener 补丁）
│   ├── property-spoofer.js      — document/window 属性伪造
│   ├── visibility-nullifier.js  — dispatchEvent 分发拦截
│   ├── lifecycle-spoof.js       — Page Lifecycle API 伪造
│   ├── behavior-spoof.js        — 浏览器行为与环境检测绕过
│   └── devtools-spoof.js        — 开发者工具检测绕过
├── main.js                      — 入口：metadata block
└── scripts/build.mjs            — 构建脚本：模块拼接 → dist/
```

每个模块通过 `registerModule({ name, init(ctx) })` 注册，核心引擎在启动时统一初始化。

---

## 项目结构

```
Universal-Detection-Bypass/
├── .github/workflows/release.yml   # CI/CD 自动构建发布
├── src/
│   ├── main.js                     # 入口文件（metadata block）
│   ├── core/                       # 核心模块
│   │   ├── config.js
│   │   ├── registry.js
│   │   └── utils.js
│   └── modules/                    # 功能模块
│       ├── behavior-spoof.js
│       ├── devtools-spoof.js
│       ├── event-interceptor.js
│       ├── lifecycle-spoof.js
│       ├── property-spoofer.js
│       └── visibility-nullifier.js
├── scripts/
│   └── build.mjs                   # 构建脚本
├── dist/                           # CI 构建产物
├── CHANGELOG.md
├── README.md
├── LICENSE
├── .gitignore
└── package.json
```

---

## 开发

### 本地构建

```bash
# 构建（模块拼接 → dist/）
node scripts/build.mjs

# 构建 + 语法校验
npm run check
```

### 添加新模块

1. 在 `src/modules/` 下创建新文件
2. 使用 `registerModule({ name, init(ctx) })` 注册
3. 运行 `node scripts/build.mjs` 验证构建
4. CI 自动整合所有模块

### 版本发布

1. 更新 `src/main.js` 中的 `@version`
2. 更新 `package.json` 中的 `version`
3. 更新 `CHANGELOG.md`
4. 推送到 `main` 分支，CI 自动构建并创建 Release

---

## 参考与致谢

- [阻止切屏检测](https://greasyfork.org/scripts/488944) by PRO — addEventListener 黑名单方案
- [破解切屏检测](https://greasyfork.org/scripts/457563) by share121 — stopImmediatePropagation 方案
- [JHS](https://github.com/Yaoser-Archive/JHS) — 项目结构与 CI/CD 参考

---

## 许可证

[GPL-3.0 License](LICENSE)
