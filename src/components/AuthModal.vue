<template>
  <div v-if="visible" class="auth-modal-overlay">
    <div class="auth-modal">
      <button class="close-btn" @click="close">&times;</button>
      
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
          {{ loading ? '处理中...' : (mode === 'login' ? '登录' : '注册') }}
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
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.auth-modal {
  background: white;
  width: 400px;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  position: relative;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #888;
}

.close-btn:hover {
  color: #333;
}

.auth-tabs {
  display: flex;
  margin-bottom: 25px;
  border-bottom: 2px solid #eee;
}

.auth-tabs button {
  flex: 1;
  background: none;
  border: none;
  padding: 10px 0;
  font-size: 16px;
  font-weight: bold;
  color: #888;
  cursor: pointer;
  box-shadow: none;
}

.auth-tabs button.active {
  color: #007bff;
  border-bottom: 2px solid #007bff;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-size: 14px;
  margin-bottom: 8px;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 15px;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
}

.error-msg {
  color: #dc3545;
  font-size: 14px;
  margin-bottom: 15px;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover {
  background: #0056b3;
}

.submit-btn:disabled {
  background: #a0cfff;
  cursor: not-allowed;
}
</style>
