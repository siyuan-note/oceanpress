import { readFileSync, writeFileSync } from "fs";
import http from "http";

const server = http.createServer((req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    // 将数据块拼接到请求体中
    body += chunk;
  });

  req.on("end", () => {
    // 请求体接收完毕，可以对其进行处理
    const json = JSON.parse(body);
    console.log(`write ${json.data.length}`, json.path);
    writeFileSync(json.path, json.data);
    // 发送响应
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Access-Control-Allow-Origin", "*"); // 允许所有来源的请求
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE"); // 允许的 HTTP 方法
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.end("Received request body" + json.data.length + json.path);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`[write file] Server is running on port ${PORT}`);
});
