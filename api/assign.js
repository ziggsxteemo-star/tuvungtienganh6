const { redis, isTeacher, json, cleanId, newId, configured } = require("./_lib");

const mins = (v) => Math.max(0, Math.min(180, Math.round(+v || 0)));

module.exports = async (req, res) => {
  try {
    if (!configured()) return json(res, 503, { error: "Máy chủ chưa cấu hình Upstash Redis hoặc TEACHER_KEY" });

    // Học sinh mở link: lấy cấu hình bài (không cần đăng nhập)
    if (req.method === "GET") {
      const id = cleanId(req.query.id);
      if (!id) return json(res, 400, { error: "Thiếu mã bài" });
      const v = await redis(["GET", "assign:" + id]);
      if (!v) return json(res, 404, { error: "Không tìm thấy bài kiểm tra" });
      return json(res, 200, JSON.parse(v));
    }

    // Giáo viên tạo hoặc cập nhật bài (cần mật khẩu)
    if (req.method === "POST") {
      if (!isTeacher(req)) return json(res, 401, { error: "Sai mật khẩu giáo viên" });
      const b = req.body || {};
      const id = cleanId(b.id) || newId();
      const cfg = {
        id,
        title: String(b.title || "").slice(0, 80),
        unit: b.unit === "all" ? "all" : Math.max(0, Math.min(11, Math.round(+b.unit || 0))),
        t: { quiz: mins(b.t && b.t.quiz), type: mins(b.t && b.t.type), fill: mins(b.t && b.t.fill) },
        once: !!b.once,
        srv: true,
        data: b.data && typeof b.data === "object" ? b.data : {},
      };
      const s = JSON.stringify(cfg);
      if (s.length > 900000) return json(res, 413, { error: "Dữ liệu bài quá lớn" });
      await redis(["SET", "assign:" + id, s]);
      await redis(["SET", "meta:" + id, JSON.stringify({ title: cfg.title, once: cfg.once })]);
      await redis(["SADD", "assigns", id]);
      return json(res, 200, { id });
    }

    res.setHeader("Allow", "GET, POST");
    return json(res, 405, { error: "Phương thức không hỗ trợ" });
  } catch (e) {
    return json(res, 500, { error: "Lỗi máy chủ" });
  }
};
