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
