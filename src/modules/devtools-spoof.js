// ============================================================
//  Module: DevTools Spoof
//  绕过开发者工具检测，阻止 debugger 陷阱、console 格式化检测、
//  窗口尺寸检测、Performance 时序检测
// ============================================================

registerModule({
    name: 'DevToolsSpoof',
    init(ctx) {
        // --- debugger 陷阱 ---
        // 检测站点插入 debugger; 语句，使 devtools 打开时反复暂停
        // 重写 Function 构造器，过滤 debugger 语句
        try {
            const origFunction = Function;
            const trapPattern = /\bdebugger\b/;
            window.Function = function (...args) {
                const body = args[args.length - 1];
                if (typeof body === 'string' && trapPattern.test(body)) {
                    args[args.length - 1] = body.replace(/\bdebugger\b\s*;?/g, ';');
                    ctx.debug('[DevToolsSpoof] Stripped debugger from Function constructor');
                }
                return origFunction.apply(this, args);
            };
            window.Function.prototype = origFunction.prototype;
            window.Function.prototype.constructor = window.Function;
            // toString camouflage
            window.Function.toString = () => origFunction.toString();
            window.Function.toString.toString = () => origFunction.toString.toString();
        } catch (e) {
            ctx.log('[DevToolsSpoof] Function patch failed:', e.message);
        }

        // --- console 格式化检测 ---
        // 部分站点通过 console.log 输出对象时的格式差异判断 devtools 是否打开
        // devtools 打开时 console.log 会格式化对象，关闭时不会
        // 拦截 console 方法，避免泄漏 devtools 状态
        try {
            const consoleMethods = ['log', 'info', 'warn', 'error', 'debug', 'table', 'dir', 'dirxml'];
            for (const method of consoleMethods) {
                if (typeof console[method] === 'function') {
                    const orig = console[method].bind(console);
                    const wrapper = function (...args) {
                        // 仅在 debug 模式下实际输出
                        if (CONFIG.debug) {
                            return orig(...args);
                        }
                    };
                    console[method] = wrapper;
                    // toString camouflage
                    wrapper.toString = () => orig.toString();
                    wrapper.toString.toString = () => orig.toString.toString();
                }
            }
        } catch (e) {
            ctx.log('[DevToolsSpoof] Console patch failed:', e.message);
        }

        // --- 窗口尺寸检测 ---
        // 检测站点比较 outerWidth/Height vs innerWidth/Height 的差值
        // devtools 打开时 outer > inner，重写 outer 使其等于 inner
        try {
            Object.defineProperties(window, {
                outerWidth: { get: () => window.innerWidth, configurable: true },
                outerHeight: { get: () => window.innerHeight, configurable: true },
            });
        } catch (e) {
            ctx.log('[DevToolsSpoof] Window size patch failed:', e.message);
        }

        // --- Performance 时序检测 ---
        // 部分站点用 performance.now() 检测 debugger 暂停导致的时间跳变
        // 伪造 performance.now() 使其平滑递增，掩盖暂停
        try {
            const startTime = performance.now();
            let lastReal = startTime;
            let offset = 0;
            const origPerfNow = performance.now.bind(performance);
            const wrapper = function () {
                const real = origPerfNow();
                const delta = real - lastReal;
                // 如果时间跳变超过 100ms（可能是 debugger 暂停），压缩到正常范围
                if (delta > 100) {
                    offset += delta - 16; // 保留约一帧的时间
                    ctx.debug(`[DevToolsSpoof] Compressed timing jump: ${delta.toFixed(1)}ms`);
                }
                lastReal = real;
                return real - offset;
            };
            performance.now = wrapper;
            // toString camouflage
            wrapper.toString = () => origPerfNow.toString();
            wrapper.toString.toString = () => origPerfNow.toString.toString();
        } catch (e) {
            ctx.log('[DevToolsSpoof] Performance timing patch failed:', e.message);
        }

        // --- DevTools protocol 检测 ---
        // 某些站点检测 __WEBDRIVER__ 等自动化标志
        try {
            const flags = [
                '__webdriver_evaluate', '__driver_evaluate', '__webdriver_unwrapped',
                '__driver_unwrapped', '__fxdriver_evaluate', '__fxdriver_unwrapped',
                '_phantom', '__nightmare', '_selenium', 'callSelenium',
                '__webdriver_script_function', '__lastWatirAlert', '__lastWatirConfirm',
                '__lastWatirPrompt', 'callPhantom', '_CallPhantom',
            ];
            for (const flag of flags) {
                if (flag in window) {
                    delete window[flag];
                }
                if (flag in document) {
                    delete document[flag];
                }
            }
        } catch (e) {
            ctx.log('[DevToolsSpoof] Automation flag cleanup failed:', e.message);
        }

        ctx.debug('[DevToolsSpoof] DevTools detection bypass active');
    },
});
