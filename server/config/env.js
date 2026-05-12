const fs = require("fs");
const path = require("path");

function loadEnvFile(filePath = path.join(process.cwd(), ".env")) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) return;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    if (!key || process.env[key]) return;

    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  });
}

loadEnvFile();

const config = {
  port: Number(process.env.PORT || 3000),
  geminiApiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  publicDir: path.resolve(__dirname, "..", "..")
};

module.exports = { config };
