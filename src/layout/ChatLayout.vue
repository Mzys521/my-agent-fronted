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
    background-color: var(--bg-primary, #f8fafc);
}

.chat-layout__left {
    width: 260px; /* Fixed modern sidebar width */
    flex-shrink: 0;
    height: 100%;
    background: #f8fafc;
    border-right: 1px solid rgba(0, 0, 0, 0.05); /* Soft border */
    box-shadow: 2px 0 8px rgba(0,0,0,0.02); /* Soft shadow */
    overflow: hidden;
    position: relative;
    z-index: 10;
}

.chat-layout__right {
    flex: 1;
    min-width: 0;
    height: 100%;
    background: #ffffff;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
}

@media (max-width: 768px) {
    .chat-layout__left {
        display: none; /* simple responsive handling for now */
    }
}
</style>