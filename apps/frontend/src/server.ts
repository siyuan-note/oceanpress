import { serve } from "@hono/node-server";
import { Hono } from "hono";

export function server() {
  const app = new Hono();
  app.get("/", (c) => c.text("Hello Node.js!"));
  return new Promise((resolve, _reject) => {
    serve(
      {
        fetch: app.fetch,
        port: 0,
      },
      (info) => {
        resolve({ info, app });
        console.log(`Listening on :${JSON.stringify(info)}`);
      },
    );
  });
}
