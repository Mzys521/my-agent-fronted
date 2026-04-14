import { createRouter, createWebHistory } from "vue-router";
import Home from "./views/FaceView.vue";
import ChatView from "./views/ChatView.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/chat",
    name: "Chat",
    component: ChatView,
    props: (route) => ({
      userMessage: route.query.userMessage,
    }),
    meta: { requiresAuth: true },
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 登录鉴权守卫
router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth;
  const isLogin = localStorage.getItem("token");

  if (requiresAuth && !isLogin) {
    window.dispatchEvent(new CustomEvent('auth-unauthorized'));
    next(false); // 取消导航
  } else {
    next();
  }
});

export default router;
