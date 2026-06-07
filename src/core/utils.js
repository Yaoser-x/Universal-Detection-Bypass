// ============================================================
//  Utilities
// ============================================================

const log = console.log.bind(console, '[UDB]');
const debug = CONFIG.debug ? log : () => {};
