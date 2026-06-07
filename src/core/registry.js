// ============================================================
//  Module Registry
// ============================================================

const modules = [];

function registerModule(mod) {
    modules.push(mod);
}

function initAllModules() {
    const ctx = { log, debug, CONFIG };
    for (const mod of modules) {
        try {
            mod.init(ctx);
            debug(`Module [${mod.name}] initialized`);
        } catch (e) {
            log(`Module [${mod.name}] failed:`, e);
        }
    }
}
