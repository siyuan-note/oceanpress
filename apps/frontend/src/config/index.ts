import { computed, reactive, watch, watchEffect } from "vue";
import { notebook } from "../fs/siyuan_type";
import { setAuthorizedToken } from "@/fs/siyuan_api";

export const configs = reactive({
  __current__: "default" as const,
  /** 为true是表示是代码中设置的默认值，不会保存到本地，避免覆盖之前保存的数据，在加载本地配置后会自动修改为false */
  __init__: true,
  default: {
    name: "default",
    notebook: {} as notebook,
    authorized: "",
  },
});

/** 从本地加载配置文件 */
export const loadConfig = () => {
  const localConfig = localStorage.getItem("configs");
  if (localConfig) {
    Object.assign(configs, JSON.parse(localConfig));
  }
};

export const saveConfig = () => {
  if (configs.__init__ === false)
    localStorage.setItem("configs", JSON.stringify(configs));
};

export const currentConfig = computed(() => {
  return configs[configs.__current__];
});
watchEffect(() => setAuthorizedToken(currentConfig.value.authorized));

let timer: NodeJS.Timeout | null = null;
/** 防抖的保存配置 */
export const debounceSaveConfig = () => {
  if (timer) {
    clearTimeout(timer);
  }
  timer = setTimeout(() => {
    saveConfig();
    timer = null;
  }, 700);
};
watch(configs, debounceSaveConfig, { deep: true });
loadConfig();
configs.__init__ = false;
