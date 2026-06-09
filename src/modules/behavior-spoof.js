// ============================================================
//  Module: Behavior Spoof
//  绕过浏览器行为与环境检测，阻止 headless/automation 指纹识别
// ============================================================

registerModule({
    name: 'BehaviorSpoof',
    init(ctx) {
        // --- navigator.webdriver ---
        // 自动化浏览器（Puppeteer/Playwright/Selenium）会设置此属性为 true
        try {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => false,
                configurable: true,
            });
        } catch (e) {
            ctx.log('[BehaviorSpoof] webdriver patch failed:', e.message);
        }

        // 删除 navigator 原型链上的 webdriver（部分检测读取原型链）
        try {
            const proto = Object.getPrototypeOf(navigator);
            if (proto && 'webdriver' in proto) {
                delete proto.webdriver;
            }
        } catch (e) {
            ctx.log('[BehaviorSpoof] webdriver proto delete failed:', e.message);
        }

        // --- navigator.plugins ---
        // headless 浏览器通常 plugins 为空，伪装为非空 PluginArray
        try {
            if (navigator.plugins.length === 0) {
                Object.defineProperty(navigator, 'plugins', {
                    get: () => {
                        const pluginData = [
                            { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
                            { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: '' },
                            { name: 'Native Client', filename: 'internal-nacl-plugin', description: '' },
                        ];
                        const plugins = pluginData.map(p => Object.assign({}, p));
                        plugins.length = 3;
                        // 模拟 PluginArray 的 item() / namedItem() 接口
                        plugins.item = (index) => plugins[index] || null;
                        plugins.namedItem = (name) => plugins.find(p => p.name === name) || null;
                        plugins.refresh = () => {};
                        return plugins;
                    },
                    configurable: true,
                });
            }
        } catch (e) {
            ctx.log('[BehaviorSpoof] plugins patch failed:', e.message);
        }

        // --- navigator.mimeTypes ---
        try {
            if (navigator.mimeTypes.length === 0) {
                Object.defineProperty(navigator, 'mimeTypes', {
                    get: () => {
                        const mimeData = [
                            { type: 'application/pdf', suffixes: 'pdf', description: 'Portable Document Format' },
                            { type: 'application/x-google-chrome-pdf', suffixes: 'pdf', description: 'Portable Document Format' },
                        ];
                        const mimeTypes = mimeData.map(m => Object.assign({}, m));
                        mimeTypes.length = 2;
                        // 模拟 MimeTypeArray 的 item() / namedItem() 接口
                        mimeTypes.item = (index) => mimeTypes[index] || null;
                        mimeTypes.namedItem = (name) => mimeTypes.find(m => m.type === name) || null;
                        return mimeTypes;
                    },
                    configurable: true,
                });
            }
        } catch (e) {
            ctx.log('[BehaviorSpoof] mimeTypes patch failed:', e.message);
        }

        // --- navigator.languages ---
        // 某些检测脚本检查 languages 是否为空
        // 优先使用浏览器实际值，仅在为空时保底
        try {
            if (!navigator.languages || navigator.languages.length === 0) {
                const fallback = [navigator.language || 'en-US', 'en'];
                Object.defineProperty(navigator, 'languages', {
                    get: () => fallback,
                    configurable: true,
                });
            }
        } catch (e) {
            ctx.log('[BehaviorSpoof] languages patch failed:', e.message);
        }

        // --- navigator.platform ---
        // headless 浏览器可能返回空或异常值
        // 优先使用浏览器实际值，仅在为空时根据 UA 推断
        try {
            if (!navigator.platform) {
                const ua = navigator.userAgent || '';
                const fallback = /Mac/i.test(ua) ? 'MacIntel' : /Linux/i.test(ua) ? 'Linux x86_64' : 'Win32';
                Object.defineProperty(navigator, 'platform', {
                    get: () => fallback,
                    configurable: true,
                });
            }
        } catch (e) {
            ctx.log('[BehaviorSpoof] platform patch failed:', e.message);
        }

        // --- navigator.hardwareConcurrency ---
        // headless 通常为 1，真实浏览器一般 >= 2
        try {
            if (navigator.hardwareConcurrency <= 1) {
                Object.defineProperty(navigator, 'hardwareConcurrency', {
                    get: () => 4,
                    configurable: true,
                });
            }
        } catch (e) {
            ctx.log('[BehaviorSpoof] hardwareConcurrency patch failed:', e.message);
        }

        // --- chrome 对象 ---
        // Chrome 浏览器特有，部分检测通过此对象判断是否为真实 Chrome 环境
        try {
            if (!window.chrome) {
                window.chrome = {
                    runtime: {},
                    loadTimes: function () {},
                    csi: function () {},
                    app: {},
                };
            }
        } catch (e) {
            ctx.log('[BehaviorSpoof] chrome object patch failed:', e.message);
        }

        // --- Notification.permission ---
        // 不硬编码权限值——用户可能已授予/拒绝通知
        // 伪造为 'default' 反而暴露异常（真实浏览器可能是 'granted'）
        // 保留原生 Notification.permission 行为

        // --- permissions API ---
        // 伪造 permissions.query 结果，防止通过权限状态检测
        try {
            if (navigator.permissions && navigator.permissions.query) {
                const origQuery = navigator.permissions.query.bind(navigator.permissions);
                const wrapper = (desc) => {
                    if (desc && desc.name === 'notifications') {
                        return Promise.resolve({ state: 'prompt', onchange: null });
                    }
                    return origQuery(desc);
                };
                navigator.permissions.query = wrapper;
                // toString camouflage
                wrapper.toString = () => origQuery.toString();
                wrapper.toString.toString = () => origQuery.toString.toString();
            }
        } catch (e) {
            ctx.log('[BehaviorSpoof] permissions.query patch failed:', e.message);
        }

        ctx.debug('[BehaviorSpoof] Behavior spoofing active');
    },
});
