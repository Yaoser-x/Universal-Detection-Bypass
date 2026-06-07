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
