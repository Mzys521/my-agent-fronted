<template>
    <header class="header">
        <div class="container header-content">
            <div class="logo"><img src="/face-logo.png" alt="遇川" class="logo-icon" />遇川旅行</div>
            <nav class="nav">
                <a href="#">首页</a>
                <a href="#">目的地</a>
                <a href="#">智能规划</a>
                <a href="#">攻略</a>
                <div v-if="userStore.token" class="user-menu">
                  <span class="user-name">欢迎, {{ userStore.userInfo?.username }}</span>
                  <a href="#" @click.prevent="logout">登出</a>
                </div>
                <a v-else href="#" @click.prevent="openLogin">登录 / 注册</a>
            </nav>
        </div>
    </header>
</template>

<script setup>
import { useUserStore } from '../stores/userStore';

const userStore = useUserStore();

const openLogin = () => {
  window.dispatchEvent(new CustomEvent('auth-unauthorized'));
};

const logout = () => {
  userStore.logout();
};
</script>

<style>
.header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    background: rgba(0, 0, 0, 0.35);
    color: #fff;
    padding: 16px 0;
    box-shadow: 0 2px 18px rgba(0, 0, 0, 0.18);
    backdrop-filter: blur(12px);
    z-index: 20;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    font-size: 24px;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 8px;
}

.logo-icon {
    width: 60px;
    height: 60px;
}

.nav {
    display: flex;
    gap: 20px;
    align-items: center;
}

.nav a {
    color: #fff;
    text-decoration: none;
    font-size: 16px;
    padding: 8px 14px;
    border-radius: 999px;
    transition: background 0.25s ease, color 0.25s ease, transform 0.25s ease;
}

.nav a:hover,
.nav a.active {
    background: rgba(255, 255, 255, 0.16);
    color: #fff;
    transform: translateY(-1px);
}

.nav a:hover {
    background: rgba(0, 0, 0, 0.25);
}

.user-menu {
    display: flex;
    align-items: center;
    gap: 15px;
}

.user-name {
    font-size: 15px;
    font-weight: 500;
}
</style>