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
