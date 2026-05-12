const http = require("http");
const path = require("path");
const { handleClassroomRequest } = require("./server/api/classroomController");
const { config } = require("./server/config/env");
const { serveStaticFile } = require("./server/helpers/http");

// Updated: Serve from public directory
const publicDir = path.join(__dirname, "public");

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  // API Routes
  if (url.pathname === "/api/classroom") {
    handleClassroomRequest(req, res);
    return;
  }

  // Serve static files from public directory
  serveStaticFile(req, res, publicDir);
});

server.listen(config.port, () => {
  console.log(`PrePa server running at http://localhost:${config.port}`);
  console.log(`Serving files from: ${publicDir}`);
  if (!config.geminiApiKey) {
    console.warn("GEMINI_API_KEY is not set. Classroom AI requests will return a setup error.");
  }
});
