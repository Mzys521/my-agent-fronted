<template>
  <router-view />
  <!-- <LoginView /> -->
  <!-- <RegisterView /> -->

</template>

<script setup>
import LoginView from './views/LoginView.vue';
import RegisterView from './views/RegisterView.vue';
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