/** ~/src/frontend/public/dev/http.js
 * 提供一个向本地写文件的http服务
 * 用于测试
 */
export async function writeFile(_: { path: string; data: string }) {
  return fetch(`http://127.0.0.1:3000`, {
    method: "POST",
    body: JSON.stringify(_),
  }).then((res) => res.text());
}
