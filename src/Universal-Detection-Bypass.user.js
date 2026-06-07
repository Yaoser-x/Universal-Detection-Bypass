// ==UserScript==
// @name         Universal Detection Bypass
// @namespace    https://github.com/Yaoser-x/Universal-Detection-Bypass
// @version      1.0.0
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

(function () {
    'use strict';

    // ============================================================
    //  Configuration
    // ============================================================

    const CONFIG = {
        debug: false,
        version: '1.0.0',
    };

    const log = console.log.bind(console, '[UDB]');
    const debug = CONFIG.debug ? log : () => {};

    // ============================================================
    //  Module Registry
    // ============================================================

    const modules = [];

    function registerModule(mod) {
        modules.push(mod);
    }

    function initAllModules() {
        const ctx = { log, debug, CONFIG };
        for (const mod of modules) {
            try {
                mod.init(ctx);
                debug(`Module [${mod.name}] initialized`);
            } catch (e) {
                log(`Module [${mod.name}] failed:`, e);
            }
        }
    }

    // ============================================================
    //  Module: Event Interceptor
    //  拦截并阻止与页面可见性、焦点相关的事件传播
    // ============================================================

    registerModule({
        name: 'EventInterceptor',
        init(ctx) {
            const blockedEvents = new Set([
                'visibilitychange',
                'blur',
                'focus',
                'focusin',
                'focusout',
                'pagehide',
                'mouseleave',
                'mouseenter',
            ]);

            // Phase 1: Capture-phase interception via stopImmediatePropagation
            for (const evt of blockedEvents) {
                window.addEventListener(
                    evt,
                    (e) => {
                        ctx.debug(`[EventInterceptor] Blocked: ${evt}`);
                        e.stopImmediatePropagation();
                        e.stopPropagation();
                        e.preventDefault();
                        return false;
                    },
                    true // capture phase — runs before any page listener
                );
            }

            // Phase 2: Patch addEventListener to blacklist future registrations
            const patchTarget = (obj, name) => {
                const original = obj.addEventListener;
                obj.addEventListener = function (...args) {
                    const type = args[0];
                    if (blockedEvents.has(type)) {
                        ctx.log(`[EventInterceptor] Blocked addEventListener: ${name}.on(${type})`);
                        return undefined;
                    }
                    return original.apply(this, args);
                };
                // toString camouflage
                obj.addEventListener.toString = () => original.toString();
                obj.addEventListener.toString.toString = () => original.toString.toString();
            };

            patchTarget(window, 'window');
            patchTarget(document, 'document');

            document.addEventListener(
                'DOMContentLoaded',
                () => {
                    if (document.body) {
                        patchTarget(document.body, 'document.body');
                    }
                },
                { once: true, passive: true, capture: true }
            );
        },
    });

    // ============================================================
    //  Module: Property Spoofer
    //  重写 document / window 的只读属性，使检测脚本读到"页面可见"的状态
    // ============================================================

    registerModule({
        name: 'PropertySpoofer',
        init(ctx) {
            // --- document properties ---
            const docOverrides = {
                hidden: { value: false },
                visibilityState: { value: 'visible' },
                webkitVisibilityState: { value: 'visible' },
                hasFocus: { value: () => true },
            };

            // on* handler traps — silently discard assignments
            const handlerNames = [
                'onvisibilitychange',
                'onblur',
                'onfocus',
                'onfocusin',
                'onfocusout',
                'onmouseleave',
                'onmouseenter',
            ];

            for (const name of handlerNames) {
                docOverrides[name] = {
                    get: () => undefined,
                    set: () => {},
                };
            }

            Object.defineProperties(document, docOverrides);

            // --- window properties ---
            const winOverrides = {
                onblur: { get: () => undefined, set: () => {} },
                onfocus: { get: () => undefined, set: () => {} },
                onpagehide: { get: () => undefined, set: () => {} },
                onpageshow: {
                    get: () => undefined,
                    set: () => {},
                },
            };

            Object.defineProperties(window, winOverrides);

            // --- document.hasFocus override (non-configurable in some browsers) ---
            try {
                document.hasFocus = () => true;
            } catch (_) {
                // Already overridden by defineProperties or not writable
            }

            ctx.debug('[PropertySpoofer] Properties overridden');
        },
    });

    // ============================================================
    //  Module: Visibility Event Nullifier
    //  重写 visibilitychange 事件的构造与分发，防止手动 dispatchEvent 触发检测
    // ============================================================

    registerModule({
        name: 'VisibilityEventNullifier',
        init(ctx) {
            const origDispatchEvent = EventTarget.prototype.dispatchEvent;
            EventTarget.prototype.dispatchEvent = function (event) {
                if (event && event.type === 'visibilitychange') {
                    ctx.debug('[VisibilityEventNullifier] Suppressed dispatchEvent(visibilitychange)');
                    return true; // pretend it succeeded
                }
                return origDispatchEvent.call(this, event);
            };
            origDispatchEvent.toString = () => EventTarget.prototype.dispatchEvent.toString();

            // Override document.onvisibilitychange setter (for sites using property assignment)
            try {
                Object.defineProperty(document, 'onvisibilitychange', {
                    get: () => null,
                    set: () => {},
                    configurable: true,
                });
            } catch (_) {}
        },
    });

    // ============================================================
    //  Module: Page Lifecycle Spoof
    //  阻止 Page Lifecycle API (freeze/resume) 相关检测
    // ============================================================

    registerModule({
        name: 'PageLifecycleSpoof',
        init(ctx) {
            // Spoof document.wasDiscarded — some sites check if page was frozen
            try {
                Object.defineProperty(document, 'wasDiscarded', {
                    value: false,
                    configurable: true,
                });
            } catch (_) {}

            // Spoof navigator.connection.downlink / rtt for network-based detection
            try {
                if (navigator.connection) {
                    const conn = navigator.connection;
                    Object.defineProperties(conn, {
                        downlink: { get: () => 10 },
                        rtt: { get: () => 50 },
                        effectiveType: { get: () => '4g' },
                        saveData: { get: () => false },
                    });
                }
            } catch (_) {}
        },
    });

    // ============================================================
    //  Module: RequestAnimationFrame Guard
    //  一些网站用 rAF 的回调频率检测页面是否可见
    // ============================================================

    registerModule({
        name: 'RAFGuard',
        init(ctx) {
            // No-op for now: rAF naturally throttles in background tabs.
            // If a site detects throttling via rAF timing, we can inject
            // synthetic timestamps here in a future version.
            ctx.debug('[RAFGuard] Registered (passive mode)');
        },
    });

    // ============================================================
    //  Boot
    // ============================================================

    log(`v${CONFIG.version} loading...`);
    initAllModules();
    log('All modules initialized. Detection bypass active.');
})();
