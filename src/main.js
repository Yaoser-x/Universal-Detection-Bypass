// ==UserScript==
// @name         Universal Detection Bypass
// @namespace    https://github.com/Yaoser-x/Universal-Detection-Bypass
// @version      1.1.0
// @description  统一的 Web 检测绕过框架 — 拦截浏览器焦点、页面可见性等状态检测，使页面始终认为处于激活状态
// @author       Yaoser-x
// @match        *://*/*
// @run-at       document-start
// @grant        none
// @license      GPL-3.0
// @downloadURL  https://github.com/Yaoser-x/Universal-Detection-Bypass/releases/latest/download/Universal-Detection-Bypass.user.js
// @updateURL    https://github.com/Yaoser-x/Universal-Detection-Bypass/releases/latest/download/Universal-Detection-Bypass.user.js
// @homepageURL  https://github.com/Yaoser-x/Universal-Detection-Bypass
// @supportURL   https://github.com/Yaoser-x/Universal-Detection-Bypass/issues
// ==/UserScript==

// === BUILD_INSERT_CORE ===

// === BUILD_INSERT_MODULES ===

// ============================================================
//  Boot
// ============================================================

(function () {
    'use strict';

    log(`v${CONFIG.version} loading...`);
    initAllModules();
    log('All modules initialized. Detection bypass active.');
})();
