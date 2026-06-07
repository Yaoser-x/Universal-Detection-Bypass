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
