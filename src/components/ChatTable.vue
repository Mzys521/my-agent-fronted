<template>
    <div class="chat-table">
        <!-- 顶部标题栏 -->
        <div class="chat-header">
            <h2>旅行智能助手</h2>
            <div class="tag">AI 旅行规划</div>
        </div>

        <!-- 消息滚动区域 -->
        <div class="message-scroll" ref="msgWrap">
            <div class="message-box">
                <!-- 单循环正常渲染 -->
                <div class="msg-item" :class="item.sender" v-for="(item, idx) in messages" :key="idx">
                    <!-- 机器人消息：头像左 + 气泡右，同一行靠左 -->
                    <template v-if="item.sender === 'ai'">
                        <div class="avatar ai">🤖</div>
                        <div class="bubble ai">
                            {{ item.text }}
                            <span v-if="item.loading" class="dot"></span>
                        </div>
                    </template>

                    <!-- 用户消息：气泡左 + 头像右，同一行靠右 -->
                    <template v-else-if="item.sender === 'user'">
                        <div class="bubble user">{{ item.text }}</div>
                        <div class="avatar user">👤</div>
                    </template>
                </div>
            </div>
        </div>

        <!-- 底部输入栏 -->
        <div class="chat-footer">
            <div class="input-bar">
                <input v-model="inputText" placeholder="请输入旅行需求..." @keyup.enter="send" :disabled="isWaiting" />
                <button @click="isWaiting ? stopReply() : send()" :class="{ waiting: isWaiting }">
                    {{ isWaiting ? "停止回复" : "发送" }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const msgWrap = ref(null)
const inputText = ref('')

// 消息列表
const messages = ref([
    { sender: 'ai', text: '你好，我是你的旅行智能助手～' }
])

const isWaiting = ref(false)
let replyTimer = null

// 接收路由参数
onMounted(() => {
    const msg = route.query.userMessage
    if (msg) {
        messages.value.push({ sender: 'user', text: msg })
        simulateReply(`已收到：${msg}，马上为你规划行程`)
    }
})

// 发送消息
const send = () => {
    const val = inputText.value.trim()
    if (!val || isWaiting.value) return

    messages.value.push({ sender: 'user', text: val })
    inputText.value = ''
    scrollToBottom()

    simulateReply('我已收到你的问题，你可以告诉我出行时间、预算、人数，我会为你定制方案。')
}

// 模拟AI回复
const simulateReply = (text) => {
    isWaiting.value = true
    messages.value.push({ sender: 'ai', text: '', loading: true })

    replyTimer = setTimeout(() => {
        messages.value.pop()
        messages.value.push({ sender: 'ai', text })
        isWaiting.value = false
        scrollToBottom()
    }, 1500)
}

// 停止回复
const stopReply = () => {
    clearTimeout(replyTimer)
    if (messages.value.at(-1)?.loading) messages.value.pop()
    messages.value.push({ sender: 'ai', text: '已停止回复' })
    isWaiting.value = false
    scrollToBottom()
}

// 自动滚动到底
const scrollToBottom = () => {
    nextTick(() => {
        if (msgWrap.value) msgWrap.value.scrollTop = msgWrap.value.scrollHeight
    })
}

defineExpose({
    // 切换对话时重置消息
    switchChat(id) {
        // 清空当前消息
        messages.value = [
            { sender: 'ai', text: `已切换至对话 #${id}，你可以继续聊天~` }
        ]
        // 重置发送状态
        isWaiting.value = false
        clearTimeout(replyTimer)
        // 滚动到底部
        scrollToBottom()
    }
})
</script>

<style scoped>
/* 基础布局 */
.chat-table {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.chat-header {
    padding: 20px;
    background: #fff;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.chat-header h2 {
    margin: 0;
    font-size: 18px;
}

.tag {
    padding: 4px 10px;
    background: #eef4ff;
    color: #2962ff;
    border-radius: 20px;
    font-size: 12px;
}

/* 消息区域 */
.message-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
}

.message-box {
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

/* ====================== 核心消息布局 ====================== */
.msg-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    width: 100%;
}

/* 机器人消息：同一行、靠左对齐 */
.msg-item.ai {
    justify-content: flex-start;
    flex-direction: row;
}

/* 用户消息：同一行、靠右对齐、头像在右侧 */
.msg-item.user {
    justify-content: flex-end;
    flex-direction: row;
}

/* 头像：固定大小，不挤压、不变形 */
.avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
}

.avatar.ai {
    background: #2962ff;
    color: #fff;
}

.avatar.user {
    background: #10b981;
    color: #fff;
}

/* 气泡：文本左对齐、长文本自动换行、布局稳定 */
.bubble {
    max-width: 75%;
    min-width: 50px;
    padding: 12px 16px;
    border-radius: 18px;
    font-size: 15px;
    line-height: 1.5;
    animation: msgFadeIn 0.3s ease forwards;
    /* 核心：文本左对齐 */
    text-align: left;
    word-break: break-word;
    white-space: pre-wrap;
}

.bubble.ai {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
}

.bubble.user {
    background: #2962ff;
    color: #fff;
}

/* 加载动画 */
.dot {
    display: inline-block;
    width: 2px;
    height: 2px;
    border-radius: 50%;
    margin-left: 4px;
    animation: dot 1s infinite linear;
}

@keyframes dot {
    0% {
        box-shadow: 0 0 0 #666, 4px 0 0 #666, 8px 0 0 #666;
    }

    33% {
        box-shadow: 0 -4px 0 #666, 4px 0 0 #666, 8px 0 0 #666;
    }

    66% {
        box-shadow: 0 0 0 #666, 4px -4px 0 #666, 8px 0 0 #666;
    }

    100% {
        box-shadow: 0 0 0 #666, 4px 0 0 #666, 8px -4px 0 #666;
    }
}

@keyframes msgFadeIn {
    from {
        opacity: 0;
        transform: translateY(6px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 底部输入栏 */
.chat-footer {
    padding: 16px 24px;
    background: #fff;
    border-top: 1px solid #e5e7eb;
}

.input-bar {
    display: flex;
    gap: 10px;
}

.input-bar input {
    flex: 1;
    padding: 12px 16px;
    border-radius: 30px;
    border: 1px solid #ddd;
    outline: none;
}

.input-bar input:disabled {
    background: #f5f5f5;
}

.input-bar button {
    padding: 0 22px;
    border-radius: 30px;
    background: #2962ff;
    color: white;
    border: none;
    cursor: pointer;
}

.input-bar button.waiting {
    background: #f43f5e;
}
</style>