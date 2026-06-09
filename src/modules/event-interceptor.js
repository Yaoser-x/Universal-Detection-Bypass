// ============================================================
//  Module: Event Interceptor
//  拦截并阻止与页面可见性、焦点相关的事件传播
// ============================================================

registerModule({
    name: 'EventInterceptor',
    init(ctx) {
        const blockedEvents = new Set([
            'visibilitychange',
            // blur / focus / focusin / focusout 不在此拦截
            // 原因：弹窗式人机验证（reCAPTCHA / hCaptcha 等）依赖这些事件驱动弹窗生命周期
            // 反检测由 PropertySpoofer 通过属性重写实现（hasFocus()→true, hidden→false 等）
            // pagehide / pageshow 不拦截——破坏 bfcache 和 SPA 路由生命周期
            // mouseleave / mouseenter 不拦截——影响正常 UI 交互（hover 菜单、tooltip 等）
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
