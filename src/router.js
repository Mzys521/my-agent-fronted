import { createRouter, createWebHistory } from "vue-router";
import ChatView from "./views/ChatView.vue";
import FaceView from "./views/FaceView.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: FaceView,
  },
  {
    path: "/chat",
    name: "Chat",
    component: ChatView,
    props: (route) => ({
      userMessage: route.query.userMessage,
    }),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
