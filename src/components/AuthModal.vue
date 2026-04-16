<template>
  <div v-if="visible" class="auth-modal-overlay">
    <div class="auth-modal" @click.stop>
      <button class="close-btn" @click="close">&times;</button>
      
      <div class="auth-header">
        <div class="logo">遇川旅行</div>
        <p class="subtitle">{{ mode === 'login' ? '欢迎回来，继续您的探索' : '加入我们，开启智能旅行' }}</p>
      </div>

      <div class="auth-tabs">
        <button 
          :class="{ active: mode === 'login' }" 
          @click="mode = 'login'"
        >
          登录
        </button>
        <button 
          :class="{ active: mode === 'register' }" 
          @click="mode = 'register'"
        >
          注册
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label>用户名</label>
          <input 
            type="text" 
            v-model="form.username" 
            required 
            placeholder="请输入用户名" 
          />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input 
            type="password" 
            v-model="form.password" 
            required 
            placeholder="请输入密码" 
          />
        </div>
        
        <div v-if="errorMessage" class="error-msg">{{ errorMessage }}</div>

        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? '处理中...' : (mode === 'login' ? '立即登录' : '注册账号') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import request from '../api/request'
import { useUserStore } from '../stores/userStore'

const userStore = useUserStore()

const visible = ref(false)
const mode = ref('login') // 'login' or 'register'
const loading = ref(false)
const errorMessage = ref('')

const form = reactive({
  username: '',
  password: ''
})

const open = () => {
  visible.value = true
  mode.value = 'login'
  form.username = ''
  form.password = ''
  errorMessage.value = ''
}

const close = () => {
  visible.value = false
}

const fetchUserInfo = async () => {
  try {
    const res = await request.get('/api/auth/user/info')
    userStore.setUserInfo(res)
  } catch (error) {
    console.error('Failed to parse user info', error)
  }
}

const handleSubmit = async () => {
  errorMessage.value = ''
  loading.value = true
  try {
    const url = mode.value === 'login' ? '/api/auth/login' : '/api/auth/register'
    const res = await request.post(url, {
      username: form.username,
      password: form.password
    })
    
    // AuthData structure: { token, user }
    if (res.token) {
      userStore.setToken(res.token)
      if (res.user) {
        userStore.setUserInfo(res.user)
      } else {
        await fetchUserInfo()
      }
      close()
    } else {
      errorMessage.value = '返回结果中未找到 Token'
    }

  } catch (error) {
    errorMessage.value = error.message || '操作失败'
  } finally {
    loading.value = false
  }
}

// Expose methods to be called via template ref
defineExpose({
  open,
  close
})
</script>

<style scoped>
.auth-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.auth-modal {
  background: rgba(255, 255, 255, 0.95);
  width: 100%;
  max-width: 420px;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.5);
  animation: slideUpFade 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
  color: var(--text-muted, #94a3b8);
  transition: color 0.2s;
  padding: 4px;
}

.close-btn:hover {
  color: var(--text-primary, #0f172a);
}

.auth-header {
  text-align: center;
  margin-bottom: 24px;
}

.logo {
  font-size: 24px;
  font-weight: 800;
  color: var(--accent-primary, #2563eb);
  margin-bottom: 8px;
  letter-spacing: 0.05em;
}

.subtitle {
  font-size: 14px;
  color: var(--text-secondary, #475569);
  margin: 0;
}

.auth-tabs {
  display: flex;
  margin-bottom: 28px;
  background: var(--bg-muted, #f1f5f9);
  padding: 4px;
  border-radius: 12px;
}

.auth-tabs button {
  flex: 1;
  background: transparent;
  border: none;
  padding: 10px 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary, #475569);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.auth-tabs button.active {
  color: var(--accent-primary, #2563eb);
  background: #ffffff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--text-primary, #0f172a);
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-primary, #f8fafc);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 10px;
  font-size: 15px;
  box-sizing: border-box;
  transition: all 0.2s ease;
  color: var(--text-primary, #0f172a);
}

.form-group input::placeholder {
  color: var(--text-muted, #94a3b8);
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent-primary, #2563eb);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  background: #ffffff;
}

.error-msg {
  color: #ef4444;
  font-size: 14px;
  margin-bottom: 16px;
  padding: 10px;
  background: #fef2f2;
  border-radius: 8px;
  text-align: center;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--accent-primary, #2563eb), var(--accent-hover, #1d4ed8));
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
}

.submit-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  box-shadow: none;
}
</style>
