const { json, configured } = require("./_lib");
module.exports = (req, res) => json(res, 200, { ok: true, configured: configured() });
