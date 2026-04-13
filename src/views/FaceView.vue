<template>
    <div class="home-page">
        <BaseLayout>
            <HomeSkeleton />
        </BaseLayout>
    </div>
</template>

<script setup>
import HomeSkeleton from '../components/HomeSkeleton.vue';
import BaseLayout from '../layout/BasicLayout.vue';
</script>

<style scoped></style>