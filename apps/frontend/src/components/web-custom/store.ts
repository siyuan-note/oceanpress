import { reactive } from "vue";

export const aElement = reactive([] as HTMLAnchorElement[]);
export function addAnchorELement(el: HTMLAnchorElement) {
  if (!aElement.includes(el)) aElement.push(el);
}
export function removeAnchorELement(el: HTMLAnchorElement) {
  if (aElement.includes(el)) aElement.splice(aElement.indexOf(el), 1);
}
