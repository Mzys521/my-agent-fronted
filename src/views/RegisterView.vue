<template>
    <AuthLayout>
        <template #left>
            <video class="left-video" autoplay muted loop playsinline>
                <source src="../assets/travel-bg.mp4" type="video/mp4" />
            </video>
        </template>

        <template #right>
            <h2>开启智能旅行</h2>
            <p>注册后永久保存你的AI旅行规划与对话历史</p>

            <div class="form-item">
                <input placeholder="请输入昵称" type="text" />
            </div>
            <div class="form-item">
                <input placeholder="请输入账号/手机号" type="text" />
            </div>
            <div class="form-item">
                <input placeholder="请输入密码（不少于6位）" type="password" />
            </div>
            <div class="form-item">
                <input placeholder="请确认密码" type="password" />
            </div>

            <div class="agreement">
                <input type="checkbox" id="agree" />
                <label for="agree">
                    我已阅读并同意
                    <span class="link">用户协议</span>
                    和
                    <span class="link">隐私政策</span>
                </label>
            </div>

            <button class="submit-btn">立即注册</button>
            <p class="to-login">已有账号？<span @click="toLogin">去登录</span></p>
        </template>
    </AuthLayout>
</template>

<script setup>
import AuthLayout from '../layout/AuthLayout.vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const toLogin = () => {
    router.push('/login')
}
</script>

<style scoped>
/* 整体表单容器：垂直居中 + 无滚动 */
.auth-right>* {
    flex-shrink: 0;
}

.form-item {
    margin: 12px 0;
    /* 缩小间距，避免溢出 */
}

input {
    width: 100%;
    padding: 12px 16px;
    border-radius: 12px;
    border: 1px solid #eee;
    outline: none;
    transition: border-color 0.3s;
    box-sizing: border-box;
}

input:focus {
    border-color: #42b983;
}

.submit-btn {
    width: 100%;
    padding: 12px;
    background: #42b983;
    color: #fff;
    border-radius: 12px;
    border: none;
    margin-top: 16px;
    cursor: pointer;
    transition: background 0.3s;
    font-size: 16px;
}

.submit-btn:hover {
    background: #359469;
}

.agreement {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
    font-size: 13px;
    color: #555;
}

.agreement input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: #42b983;
    flex-shrink: 0;
}

.agreement label {
    cursor: pointer;
}

.agreement .link {
    color: #42b983;
    font-weight: 500;
}

.agreement .link:hover {
    text-decoration: underline;
}

.to-login {
    text-align: center;
    margin-top: 16px;
    font-size: 14px;
    color: #666;
}

.to-login span {
    color: #42b983;
    cursor: pointer;
}

.left-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>