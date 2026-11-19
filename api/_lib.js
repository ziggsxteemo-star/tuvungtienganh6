const crypto = require("crypto");

const REDIS_URL = () => process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const REDIS_TOKEN = () => process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

exports.configured = () => !!(REDIS_URL() && REDIS_TOKEN() && process.env.TEACHER_KEY);

// Gọi Upstash Redis qua REST, ví dụ redis(["SET", "k", "v"])
exports.redis = async (cmd) => {
  const r = await fetch(REDIS_URL(), {
    method: "POST",
    headers: { Authorization: "Bearer " + REDIS_TOKEN(), "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
  });
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(j.error || "redis error");
  return j.result;
};

exports.isTeacher = (req) => {
  const k = String(req.headers["x-teacher-key"] || "");
  const t = String(process.env.TEACHER_KEY || "");
  if (!k || !t) return false;
  const a = crypto.createHash("sha256").update(k).digest();
  const b = crypto.createHash("sha256").update(t).digest();
  return crypto.timingSafeEqual(a, b);
};

exports.json = (res, code, obj) => {
  res.setHeader("Cache-Control", "no-store");
  res.status(code).json(obj);
};

exports.cleanId = (v) => String(v || "").replace(/[^a-z0-9]/gi, "").slice(0, 32);
exports.newId = () => crypto.randomBytes(5).toString("hex");
