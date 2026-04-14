<template>
    <div class="chat-table">
        <div class="chat-header">
            <h2>旅行智能助手</h2>
            <div class="tag">AI 旅行规划</div>
        </div>

        <div class="message-scroll" ref="msgWrap">
            <div class="message-box">
                <div class="msg-item" :class="item.sender" v-for="(item, idx) in messages" :key="idx">
                    <template v-if="item.sender === 'ai'">
                        <div class="avatar ai">🤖</div>
                        <div class="bubble ai">
                            {{ item.text }}
                            <span v-if="item.loading" class="dot"></span>
                        </div>
                    </template>
                    <template v-else-if="item.sender === 'user'">
                        <div class="bubble user">{{ item.text }}</div>
                        <div class="avatar user">👤</div>
                    </template>
                </div>
            </div>
        </div>

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
import { ref, nextTick } from 'vue'
import { getChatMessages, saveChatMessages } from '../utils/storage'

const msgWrap = ref(null)
const inputText = ref('')
const messages = ref([])
const currentChatId = ref(null)

const isWaiting = ref(false)
let replyTimer = null

// 从首页进入：自动创建对话并发送消息
function startFromHome(content) {
    const chatId = Date.now()
    const title = content.slice(0, 10)

    currentChatId.value = chatId
    messages.value = [
        { sender: 'ai', text: '你好，我是你的旅行智能助手～' },
        { sender: 'user', text: content }
    ]

    saveChatMessages(chatId, messages.value)
    scrollToBottom()

    // 通知历史栏创建对话
    if (window.addChatForUser) {
        window.addChatForUser(chatId, title)
    }

    // AI 自动回复
    setTimeout(() => {
        simulateReply('我已收到你的旅行需求，正在为你定制专属行程方案...')
    }, 800)
}

// 切换对话
function switchChat(chatId) {
    currentChatId.value = chatId
    messages.value = getChatMessages(chatId)
    isWaiting.value = false
    clearTimeout(replyTimer)
    scrollToBottom()
}

// 发送消息
const send = () => {
    const val = inputText.value.trim()
    if (!val || isWaiting.value || !currentChatId.value) return
    messages.value.push({ sender: 'user', text: val })
    inputText.value = ''
    saveChatMessages(currentChatId.value, messages.value)
    scrollToBottom()
    simulateReply('已收到，我会为你继续完善旅行方案～')
}

// 模拟回复
const simulateReply = (text) => {
    isWaiting.value = true
    messages.value.push({ sender: 'ai', text: '', loading: true })
    replyTimer = setTimeout(() => {
        messages.value.pop()
        messages.value.push({ sender: 'ai', text })
        isWaiting.value = false
        saveChatMessages(currentChatId.value, messages.value)
        scrollToBottom()
    }, 1500)
}

// 停止回复
const stopReply = () => {
    clearTimeout(replyTimer)
    if (messages.value.at(-1)?.loading) messages.value.pop()
    messages.value.push({ sender: 'ai', text: '已停止回复' })
    isWaiting.value = false
    saveChatMessages(currentChatId.value, messages.value)
    scrollToBottom()
}

// 滚动到底部
const scrollToBottom = () => {
    nextTick(() => {
        if (msgWrap.value) msgWrap.value.scrollTop = msgWrap.value.scrollHeight
    })
}

defineExpose({ startFromHome, switchChat })
</script>

<style scoped>
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

.msg-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    width: 100%;
}

.msg-item.ai {
    justify-content: flex-start;
}

.msg-item.user {
    justify-content: flex-end;
}

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

.bubble {
    max-width: 75%;
    min-width: 50px;
    padding: 12px 16px;
    border-radius: 18px;
    font-size: 15px;
    line-height: 1.5;
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