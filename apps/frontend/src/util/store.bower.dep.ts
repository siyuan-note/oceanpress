import { storeDep } from "@/dependency";

storeDep.getItem = getItem;
storeDep.setItem = setItem;

export function setItem(key: string, value: string) {
  return localStorage.setItem(key, value);
}

export function getItem(key: string): string | undefined {
  return localStorage.getItem(key) ?? undefined;
}
