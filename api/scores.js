const { redis, isTeacher, json, cleanId, configured } = require("./_lib");

module.exports = async (req, res) => {
  try {
    if (req.method !== "GET") { res.setHeader("Allow", "GET"); return json(res, 405, { error: "Chỉ nhận GET" }); }
    if (!configured()) return json(res, 503, { error: "Máy chủ chưa cấu hình" });
    if (!isTeacher(req)) return json(res, 401, { error: "Sai mật khẩu giáo viên" });

    const one = cleanId(req.query.a);
    const ids = one ? [one] : (await redis(["SMEMBERS", "assigns"])) || [];
    const scores = [];
    for (const id of ids) {
      const rows = (await redis(["LRANGE", "scores:" + id, 0, -1])) || [];
      for (const r of rows) { try { scores.push(JSON.parse(r)); } catch (e) {} }
    }
    return json(res, 200, { scores });
  } catch (e) {
    return json(res, 500, { error: "Lỗi máy chủ" });
  }
};
