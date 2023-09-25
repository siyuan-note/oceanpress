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
    /** 打包成 zip */
    compressedZip: true,
    /** 不将 publicZip 打包到 zip 包中 */
    withoutPublicZip: true,
    /** 不复制 assets/ ，勾选此选项则需要自行处理资源文件 */
    excludeAssetsCopy: false,
    /** 开启增量编译，当开启增量编译时，
     * 在编译过程中会依据 __skipBuilds__ 的内容来跳过一些没有变化不需要重新输出的内容
     */
    enableIncrementalCompilation: false,
    /** 跳过编译的资源 */
    __skipBuilds__: {} as { [id: string]: { hash?: string } | undefined },

    cdn: {
      /** 思源 js、css等文件的前缀 */
      siyuanPrefix:
        "https://fastly.jsdelivr.net/gh/siyuan-note/oceanpress@main/apps/frontend/public/notebook/",
      /** 思源 js、css等文件zip包地址  */
      publicZip:
        "https://fastly.jsdelivr.net/gh/siyuan-note/oceanpress@main/apps/frontend/public/public.zip",
    },
  },
});

/** 加载配置文件 */
export const loadConfig = () => {
  // TODO 在node.js环境下需要额外处理
  const localConfig = localStorage.getItem("configs");
  if (localConfig) {
    deepAssign(configs, JSON.parse(localConfig));
  }
  function deepAssign(target: any, source: any) {
    for (let key in source) {
      if (source.hasOwnProperty(key)) {
        if (source[key] instanceof Object && !Array.isArray(source[key])) {
          // 如果属性是对象且不是数组，则递归执行深度合并
          if (!target.hasOwnProperty(key)) {
            // 如果目标对象没有该属性，直接赋值
            target[key] = source[key];
          } else {
            deepAssign(target[key], source[key]);
          }
        } else {
          // 如果属性不是对象或者是数组，则直接赋值
          target[key] = source[key];
        }
      }
    }
  }
};

export const saveConfig = () => {
  if (configs.__init__ === false) localStorage.setItem("configs", JSON.stringify(configs));
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
