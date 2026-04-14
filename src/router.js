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
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("./views/LoginView.vue"),
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("./views/RegisterView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 登录鉴权守卫
router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth;
  const isLogin = localStorage.getItem("userToken");

  if (requiresAuth && !isLogin) {
    next("/login");
  } else {
    next();
  }
});

export default router;
