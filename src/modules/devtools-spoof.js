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
            // 保持原型链完整，不修改 constructor 避免循环引用
            window.Function.prototype = origFunction.prototype;
            // toString camouflage
            window.Function.toString = () => origFunction.toString();
            window.Function.toString.toString = () => origFunction.toString.toString();
        } catch (e) {
            ctx.log('[DevToolsSpoof] Function patch failed:', e.message);
        }

        // --- console 格式化检测 ---
        // 部分站点通过 console.log 输出对象时的格式差异判断 devtools 是否打开
        // devtools 打开时 console.log 会格式化对象，关闭时不会
        // 通过劫持使输出格式始终一致，避免泄漏 devtools 状态
        // 注意：非 debug 模式下仍正常透传，不吞掉输出
        try {
            const consoleMethods = ['log', 'info', 'warn', 'error', 'debug', 'table', 'dir', 'dirxml'];
            for (const method of consoleMethods) {
                if (typeof console[method] === 'function') {
                    const orig = console[method];
                    const wrapper = function (...args) {
                        return orig.apply(console, args);
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
        // 但 outer === inner 是比 devtools 打开更强的 headless 信号
        // 因此不强制改写 outer 尺寸，保留浏览器原生行为

        // --- Performance 时序检测 ---
        // 部分站点用 performance.now() 检测 debugger 暂停导致的时间跳变
        // 同时用 Date.now() - performance.now() 的差值验证一致性
        // 策略：压缩 >200ms 的跳变，并用 Date.now() 锚定防止长期漂移
        try {
            let lastReal = performance.now();
            let offset = 0;
            const origPerfNow = performance.now.bind(performance);
            const wrapper = function () {
                const real = origPerfNow();
                const delta = real - lastReal;
                // 仅压缩超过 200ms 的跳变（debugger 暂停），保留正常帧间隔
                if (delta > 200) {
                    offset += delta - 16;
                    ctx.debug(`[DevToolsSpoof] Compressed timing jump: ${delta.toFixed(1)}ms`);
                }
                lastReal = real;
                const spoofed = real - offset;
                // 锚定：确保 performance.now() 与 Date.now() 的偏差不超过 500ms
                // 防止 offset 累积导致长期漂移被检测
                const anchor = Date.now();
                const perfEpoch = performance.timeOrigin;
                const expectedNow = anchor - perfEpoch;
                const drift = expectedNow - spoofed;
                if (drift > 500) {
                    offset -= drift - 100;
                }
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
