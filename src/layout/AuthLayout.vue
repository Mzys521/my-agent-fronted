<template>
    <div class="auth-page">
        <!-- 居中卡片 -->
        <div class="auth-card">
            <!-- 左侧：宣传区域插槽 -->
            <div class="auth-left">
                <slot name="left" />
            </div>

            <!-- 右侧：表单区域插槽 -->
            <div class="auth-right">
                <slot name="right" />
            </div>
        </div>
    </div>
</template>

<script setup>
// 纯布局骨架，无业务逻辑
</script>

<style scoped>
/* 页面全屏容器 */
.auth-page {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    /* 外层大背景 */
    background: linear-gradient(135deg, #d1f7e5 0%, #e8f5ff 100%);
    padding: 20px;
    box-sizing: border-box;
}

/* 主卡片 */
.auth-card {
    width: 100%;
    max-width: 900px;
    height: 600px;
    background: #ffffff;
    border-radius: 24px;
    box-shadow: 0 15px 70px rgba(17, 50, 96, 0.15);
    overflow: hidden;
    display: flex;
    flex-direction: row;
    position: relative;
    border: 1px solid rgba(66, 185, 131, 0.1);
}

/* 左侧：宣传区域（强区分 + 主题背景） */
.auth-left {
    width: 50%;
    height: 100%;
    /* 左侧主题渐变背景，即使不放视频也非常美观 */
    background: linear-gradient(180deg, #42b983 0%, #359469 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
    /* 右侧分隔线，彻底区分左右 */
    border-right: 1px solid #eef1f5;
}

/* 左侧遮罩（放视频时更高级） */
.auth-left::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.1);
    z-index: 1;
}

/* 左侧插槽内容层级高于遮罩 */
.auth-left>* {
    position: relative;
    z-index: 2;
}

/* 右侧：表单区域（纯白干净） */
.auth-right {
    width: 50%;
    height: 100%;
    padding: 60px 40px;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-sizing: border-box;
    overflow-y: auto;
}

/* 移动端适配：左右 → 上下 */
@media (max-width: 768px) {
    .auth-card {
        height: auto;
        min-height: 90vh;
        flex-direction: column;
    }

    .auth-left,
    .auth-right {
        width: 100%;
    }

    .auth-left {
        height: 220px;
        /* 移动端改为底部分隔线 */
        border-right: none;
        border-bottom: 1px solid #eef1f5;
    }

    .auth-right {
        padding: 40px 24px;
        height: auto;
    }
}
</style>