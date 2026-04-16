<template>
  <router-view />
  <AuthModal ref="authModal" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useUserStore } from './stores/userStore';
import request from './api/request';
import AuthModal from './components/AuthModal.vue';

const authModal = ref(null);
const userStore = useUserStore();

const showLogin = () => {
  if (authModal.value) {
    authModal.value.open();
  }
};

onMounted(async () => {
  // Listen for unauthorized events to show login modal
  window.addEventListener('auth-unauthorized', showLogin);

  // If token exists on load, restore user info
  if (userStore.token) {
    try {
      const res = await request.get('/api/auth/user/info');
      userStore.setUserInfo(res);
    } catch (e) {
      // If fetching user info fails, token is likely invalid
      userStore.logout();
      showLogin();
    }
  }
});

onUnmounted(() => {
  window.removeEventListener('auth-unauthorized', showLogin);
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  overflow: auto;
}
</style>