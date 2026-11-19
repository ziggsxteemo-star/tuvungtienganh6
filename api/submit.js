const { redis, json, cleanId, configured } = require("./_lib");

const MODES = ["quiz", "type", "fill"];

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") { res.setHeader("Allow", "POST"); return json(res, 405, { error: "Chỉ nhận POST" }); }
    if (!configured()) return json(res, 503, { error: "Máy chủ chưa cấu hình" });

    // Giới hạn tốc độ đơn giản theo IP: 60 lượt mỗi phút
    const ip = String(req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim().slice(0, 64);
    const rk = "rl:" + ip + ":" + Math.floor(Date.now() / 60000);
    const n = await redis(["INCR", rk]);
    if (n === 1) await redis(["EXPIRE", rk, 90]);
    if (n > 60) return json(res, 429, { error: "Gửi quá nhanh, hãy thử lại sau" });

    const b = req.body || {};
    const a = cleanId(b.a);
    const name = String(b.n || "").trim().slice(0, 40);
    const m = String(b.m || "");
    const t = Math.round(+b.t), s = Math.round(+b.s);
    if (!a || !name || !MODES.includes(m) || !(t >= 1 && t <= 50) || !(s >= 0 && s <= t)) {
      return json(res, 400, { error: "Dữ liệu điểm không hợp lệ" });
    }
    const metaRaw = await redis(["GET", "meta:" + a]);
    if (!metaRaw) return json(res, 404, { error: "Không tìm thấy bài kiểm tra" });
    const meta = JSON.parse(metaRaw);

    if (meta.once) {
      const first = await redis(["SET", "sub:" + a + ":" + m + ":" + name.toLowerCase(), "1", "NX"]);
      if (!first) return json(res, 409, { error: "Em đã nộp điểm phần này rồi." });
    }
    const rec = { a, i: meta.title || "", n: name, m, s, t, o: b.o ? 1 : 0, d: Date.now() };
    await redis(["RPUSH", "scores:" + a, JSON.stringify(rec)]);
    await redis(["LTRIM", "scores:" + a, -5000, -1]);
    return json(res, 200, { ok: true });
  } catch (e) {
    return json(res, 500, { error: "Lỗi máy chủ" });
  }
};
