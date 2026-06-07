// ============================================================
//  Module: Visibility Event Nullifier
//  重写 visibilitychange 事件的构造与分发，防止手动 dispatchEvent 触发检测
// ============================================================

registerModule({
    name: 'VisibilityEventNullifier',
    init(ctx) {
        // --- dispatchEvent 拦截 ---
        // 阻止手动 dispatchEvent('visibilitychange') 触发检测
        try {
            const origDispatchEvent = EventTarget.prototype.dispatchEvent;
            const wrapper = function (event) {
                if (event && event.type === 'visibilitychange') {
                    ctx.debug('[VisibilityEventNullifier] Suppressed dispatchEvent(visibilitychange)');
                    return true; // pretend it succeeded
                }
                return origDispatchEvent.call(this, event);
            };
            EventTarget.prototype.dispatchEvent = wrapper;
            // toString camouflage
            wrapper.toString = () => origDispatchEvent.toString();
            wrapper.toString.toString = () => origDispatchEvent.toString.toString();
        } catch (e) {
            ctx.log('[VisibilityEventNullifier] dispatchEvent patch failed:', e.message);
        }

        // --- onvisibilitychange 覆盖 ---
        // 防止站点通过 property assignment 设置 visibilitychange handler
        try {
            Object.defineProperty(document, 'onvisibilitychange', {
                get: () => null,
                set: () => {},
                configurable: true,
            });
        } catch (e) {
            ctx.log('[VisibilityEventNullifier] onvisibilitychange patch failed:', e.message);
        }
    },
});
