<template>
    <AuthLayout>
        <!-- 左侧：视频/插画 -->
        <template #left>
            <video class="left-video" autoplay muted loop playsinline>
                <source src="../assets/travel-bg.mp4" type="video/mp4" />
            </video>
        </template>

        <!-- 右侧：登录表单 -->
        <template #right>
            <h2>欢迎登录</h2>
            <p>同步你的旅行规划与对话历史</p>

            <!-- 账号输入框：v-model 绑定 -->
            <div class="form-item">
                <input v-model="account" placeholder="请输入账号/手机号" type="text" />
            </div>
            <!-- 密码输入框：v-model 绑定 -->
            <div class="form-item">
                <input v-model="password" placeholder="请输入密码" type="password" />
            </div>

            <!-- 登录按钮：绑定点击事件 -->
            <button class="submit-btn" @click="handleLogin">登录</button>

            <!-- 去注册：添加点击跳转 -->
            <p class="to-register">没有账号？<span @click="toRegister">去注册</span></p>
        </template>
    </AuthLayout>
</template>

<script setup>
import AuthLayout from '../layout/AuthLayout.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// 路由跳转
const router = useRouter()

// 表单绑定变量
const account = ref('')
const password = ref('')

// 登录逻辑
const handleLogin = () => {
    // 去除空格校验
    const acc = account.value.trim()
    const pwd = password.value.trim()

    // 空值判断
    if (!acc || !pwd) {
        alert('请输入账号和密码！')
        return
    }

    // 固定账号密码校验
    if (acc === 'admin' && pwd === '123456') {
        // 登录成功：存储登录态
        localStorage.setItem('userToken', 'admin_login_token')
        alert('登录成功！')
        // 跳转到聊天页面
        router.push('/chat')
    } else {
        // 登录失败
        alert('账号或密码错误！\n正确账号：admin\n正确密码：123456')
    }
}

// 跳转到注册页
const toRegister = () => {
    router.push('/register')
}
</script>

<style scoped>
/* 登录表单样式 */
.form-item {
    margin: 16px 0;
}

input {
    width: 100%;
    padding: 14px 16px;
    border-radius: 12px;
    border: 1px solid #eee;
    outline: none;
    box-sizing: border-box;
}

input:focus {
    border-color: #42b983;
}

.submit-btn {
    width: 100%;
    padding: 14px;
    background: #42b983;
    color: #fff;
    border-radius: 12px;
    border: none;
    margin-top: 20px;
    cursor: pointer;
    transition: background 0.3s;
}

.submit-btn:hover {
    background: #359469;
}

.to-register {
    text-align: center;
    margin-top: 20px;
    font-size: 14px;
    color: #666;
}

.to-register span {
    color: #42b983;
    cursor: pointer;
}

.left-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>