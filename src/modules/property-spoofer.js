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
            webkitHidden: { value: false },
            visibilityState: { value: 'visible' },
            webkitVisibilityState: { value: 'visible' },
            hasFocus: { value: () => true },
        };

        // on* handler traps — silently discard assignments
        const handlerNames = [
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

        try {
            Object.defineProperties(document, docOverrides);
        } catch (e) {
            ctx.log('[PropertySpoofer] document properties patch failed:', e.message);
        }

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

        try {
            Object.defineProperties(window, winOverrides);
        } catch (e) {
            ctx.log('[PropertySpoofer] window properties patch failed:', e.message);
        }

        ctx.debug('[PropertySpoofer] Properties overridden');
    },
});
