export function setItem(key: string, value: string) {
  return localStorage.setItem(key, value)
}

export function getItem(key: string): string | undefined {
  return localStorage.getItem(key) ?? undefined
}
export const bowerApiDep = {
  setItem,
  getItem,
}
