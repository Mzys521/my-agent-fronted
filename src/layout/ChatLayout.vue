<template>
    <div class="chat-layout">
        <div class="chat-layout__left">
            <slot name="left" />
        </div>
        <div class="chat-layout__right">
            <slot name="right" />
        </div>
    </div>
</template>

<style scoped>
.chat-layout {
    display: flex;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
}

.chat-layout__left {
    width: 16.6667%;
    height: 100%;
    background: #f8fafc;

    border-right: 2px solid #d4d7dd;
    overflow: hidden;
}

.chat-layout__right {
    width: 83.3333%;
    height: 100%;
    background: #ffffff;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}
</style>