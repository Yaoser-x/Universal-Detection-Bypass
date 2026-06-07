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
