<template>
    <header class="header">
        <div class="container header-content">
            <div class="logo">✈️ 旅行智能体</div>
            <nav class="nav">
                <a href="#">首页</a>
                <a href="#">目的地</a>
                <a href="#">智能规划</a>
                <a href="#">攻略</a>
                <a href="#">我的</a>
            </nav>
        </div>
    </header>
</template>

<script setup>
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
</style>