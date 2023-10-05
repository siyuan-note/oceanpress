export function deepAssign<T>(target: any, source: any, config = { add: true, update: true }): T {
    for (let key in source) {
      if (source.hasOwnProperty(key)) {
        if (source[key] instanceof Object && !Array.isArray(source[key])) {
          // 如果属性是对象且不是数组，则递归执行深度合并
          if (!target.hasOwnProperty(key)) {
            // 目标对象不存在该属性则创建空对象
            target[key] = {};
          }
          deepAssign(target[key], source[key], config);
        } else {
          // 如果属性不是对象或者是数组，则直接赋值
          if (!target.hasOwnProperty(key) && config.add) {
            // 目标属性不存在属于新增
            target[key] = source[key];
          } else if (config.update) {
            // 更新
            target[key] = source[key];
          }
        }
      }
    }
    return target;
  }
