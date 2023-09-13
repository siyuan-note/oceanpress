import { reactive } from "vue";
export const reqStore = reactive({} as { [k: string]: any });
export const resStore = reactive({} as { [k: string]: any });

export function sendRequestMessage(name: string, value: any) {
  window.parent.postMessage({ name: `_req_${name}`, value }, "*");
}
export function sendTreatmentResults(name: string, value: any) {
  window.parent.postMessage({ name: `_res_${name}`, value }, "*");
}
/** 在所有页面之间同步这些状态 */
window.addEventListener("message", (ev) => {
  const { name, value } = ev.data;
  if (!name || !value) return;

  if (name.startsWith("_req_")) {
    reqStore[name.slice(5)] = value;
  } else if (name.startsWith("_res_")) {
    resStore[name.slice(5)] = value;
  }
});
