<template>
    <div class="layout-page">
        <AppHeader />
        <slot />
        <AppFooter />
    </div>
</template>

<script setup>
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'
</script>

<style>
.layout-page {
    min-height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
}

.layout-content {
    flex: 1;
    width: 100%;
    max-width: 1440px;
    margin: 0 auto;
    padding: 100px 24px 32px;
    box-sizing: border-box;
}

@media (max-width: 768px) {
    .layout-content {
        padding: 88px 16px 24px;
    }
}
</style>