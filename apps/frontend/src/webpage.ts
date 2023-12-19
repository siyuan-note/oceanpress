import "@/util/store.bower.dep";

import { createApp } from "vue";
import App from "@/pages/App.vue";
import { createRouter, createWebHashHistory } from "vue-router";

import steps from "@/pages/steps/steps.vue";
import test from "@/pages/test.vue";

const routes = [
  { path: "/", component: steps },
  { path: "/test", component: test },
];

const router = createRouter({
  // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
  history: createWebHashHistory(),
  routes, // `routes: routes` 的缩写
});

const app = createApp(App);

app.use(router);
app.mount("#app");
app.provide("config", {});
