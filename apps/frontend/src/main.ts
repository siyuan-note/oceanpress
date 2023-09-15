import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { createRouter, createWebHashHistory } from "vue-router";
// 1. 定义路由组件.
// 也可以从其他文件导入
import steps from "@/pages/steps/steps.vue";
import test from "@/pages/test.vue";

// 2. 定义一些路由
// 每个路由都需要映射到一个组件。
// 我们后面再讨论嵌套路由。
const routes = [
  { path: "/", component: steps },
  { path: "/test", component: test },
];
// 3. 创建路由实例并传递 `routes` 配置
// 你可以在这里输入更多的配置，但我们在这里
// 暂时保持简单
const router = createRouter({
  // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
  history: createWebHashHistory(),
  routes, // `routes: routes` 的缩写
});
const app = createApp(App);
//确保 _use_ 路由实例使
//整个应用支持路由。
app.use(router);
app.mount("#app");
app.provide("config", {});
