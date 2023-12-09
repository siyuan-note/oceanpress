export function expect<T>(value: T) {
  return {
    toBe(expected: T) {
      if (value !== expected) {
        throw new Error(`Expected ${value}`);
      }
    },
  };
}
import "@/util/isPathValid.test";
