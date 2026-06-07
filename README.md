# Universal Detection Bypass

统一的 Web 检测绕过框架 — 通过拦截和重写浏览器焦点、页面可见性等状态接口，使网站始终认为当前页面处于激活状态。

[![Release](https://img.shields.io/github/v/release/Yaoser-x/Universal-Detection-Bypass)](https://github.com/Yaoser-x/Universal-Detection-Bypass/releases/latest)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)

---

## 功能特性

### 当前版本 (v1.0.0)

- **事件拦截** — capture 阶段拦截 `visibilitychange`、`blur`、`focus`、`focusin`、`focusout`、`pagehide`、`mouseleave`、`mouseenter`
- **事件监听黑名单** — 劫持 `addEventListener`，阻止页面注册检测事件
- **属性伪造** — 重写 `document.hidden`、`document.visibilityState`、`document.hasFocus` 等只读属性
- **分发拦截** — 阻止手动 `dispatchEvent('visibilitychange')` 触发检测
- **生命周期伪造** — 伪造 `document.wasDiscarded`、`navigator.connection` 状态
- **toString 伪装** — 所有劫持函数保留原始 `toString` 表现，防止指纹检测
- **模块化架构** — `registerModule` + `initAllModules`，支持按类别扩展新模块

### 后续开发方向

| 阶段 | 功能 | 状态 |
|------|------|------|
| v1.1 | 浏览器行为检测绕过（自动化行为指纹） | 规划中 |
| v1.2 | 开发者工具检测绕过 | 规划中 |
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

在脚本头部将 `debug` 设为 `true`：

```javascript
const CONFIG = {
    debug: true,  // 改为 true 开启调试日志
    version: '1.0.0',
};
```

开启后可在浏览器控制台看到 `[UDB]` 前缀的调试日志。

---

## 架构设计

```
Universal Detection Bypass
├── EventInterceptor          — 事件拦截（capture 阶段 + addEventListener 补丁）
├── PropertySpoofer           — document/window 属性伪造
├── VisibilityEventNullifier  — dispatchEvent 分发拦截
├── PageLifecycleSpoof        — Page Lifecycle API 伪造
├── RAFGuard                  — requestAnimationFrame 守护（预留）
├── [DevToolsDetector]        — 开发者工具检测绕过（规划中）
├── [UserActivitySimulator]   — 用户活跃度模拟（规划中）
└── [SiteSpecificRules]       — 站点特定规则（规划中）
```

每个模块通过 `registerModule({ name, init(ctx) })` 注册，核心引擎在启动时统一初始化。

---

## 项目结构

```
Universal-Detection-Bypass/
├── .github/workflows/release.yml   # CI/CD 自动构建发布
├── src/
│   └── Universal-Detection-Bypass.user.js  # 主脚本
├── CHANGELOG.md                     # 版本变更记录
├── README.md                        # 项目文档
├── LICENSE                          # GPL-3.0 许可证
├── .gitignore
└── package.json                     # 版本元数据
```

---

## 开发

### 本地验证

```bash
node --check src/Universal-Detection-Bypass.user.js
```

### 版本发布

1. 更新 `src/Universal-Detection-Bypass.user.js` 中的 `@version`
2. 更新 `CHANGELOG.md`
3. 更新 `package.json` 中的 `version`
4. 推送到 `main` 分支，CI 自动创建 Release

---

## 参考与致谢

- [阻止切屏检测](https://greasyfork.org/scripts/488944) by PRO — addEventListener 黑名单方案
- [破解切屏检测](https://greasyfork.org/scripts/457563) by share121 — stopImmediatePropagation 方案
- [JHS](https://github.com/Yaoser-Archive/JHS) — 项目结构与 CI/CD 参考

---

## 许可证

[GPL-3.0 License](LICENSE)
