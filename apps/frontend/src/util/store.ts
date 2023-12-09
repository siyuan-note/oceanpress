import { writeFileSync, readFileSync } from "fs";

// simple store by : node/browser

export function setItem(key: string, value: string) {
  if (globalThis.localStorage) {
    return localStorage.setItem(key, value);
  } else {
    return writeFileSync(`./store/${key}`, value, "utf-8");
  }
}

export function getItem(key: string): string | undefined {
  if (globalThis.localStorage) {
    return localStorage.getItem(key) ?? undefined;
  } else {
    try {
      return readFileSync(`./store/${key}`, "utf-8");
    } catch (_) {
      return undefined;
    }
  }
}
