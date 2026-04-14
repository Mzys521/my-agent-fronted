<template>
    <div class="chat-table">
        <div class="chat-header">
            <h2>旅行智能助手</h2>
            <div class="tag">AI 旅行规划</div>
        </div>

        <div class="message-scroll" ref="msgWrap">
            <div class="message-box">
                <div class="msg-item" :class="item.role === 'assistant' ? 'ai' : 'user'" v-for="(item, idx) in messages" :key="idx">
                    <template v-if="item.role === 'assistant'">
                        <div class="avatar ai">🤖</div>
                        <div class="bubble ai">
                            <div class="markdown-body" v-html="renderHtml(item.content)"></div>
                            
                            <div class="plans-container" v-if="extractPlans(item.content)">
                                <div class="plan-card" v-for="(plan, idx) in extractPlans(item.content)" :key="idx" @click="openPlanDetails(plan)">
                                    <div class="plan-header">
                                        <span class="plan-type">{{ plan.type }}</span>
                                        <span class="plan-budget">{{ plan.budget }}</span>
                                    </div>
                                    <div class="plan-desc">{{ plan.desc }}</div>
                                </div>
                            </div>

                            <span v-if="item.loading" class="dot"></span>
                        </div>
                    </template>
                    <template v-else-if="item.role === 'user'">
                        <div class="bubble user">{{ item.content }}</div>
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

        <!-- 方案详情模态框 -->
        <PlanModal ref="planModalRef" @select-plan="handlePlanSelect" />
    </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { fetchMessages, sendStreamMessage } from '../api/chat'
import PlanModal from './PlanModal.vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

marked.setOptions({
    highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
        } else {
            return hljs.highlightAuto(code).value;
        }
    }
});

const renderHtml = (text) => {
    if (!text) return '';
    const cleanText = text.replace(/<plan_recommendation>[\s\S]*?(<\/plan_recommendation>|$)/g, '');
    return DOMPurify.sanitize(marked.parse(cleanText));
};

const extractPlans = (text) => {
    if (!text) return null;
    const match = text.match(/<plan_recommendation>([\s\S]*?)(?:<\/plan_recommendation>|$)/);
    if (match && match[1]) {
        try {
            return JSON.parse(match[1]);
        } catch (e) {
            return null; // Ignore incomplete JSON during streaming
        }
    }
    return null;
};

const planModalRef = ref(null);

const openPlanDetails = (plan) => {
    if (planModalRef.value) {
        planModalRef.value.open(plan);
    }
};

const handlePlanSelect = (plan) => {
    // 用户点了确认该方案后自动发送消息
    const msg = `我想选择方案：【${plan.type}】，请帮我详细生成该方案的具体行程，并细化吃住推荐。`;
    sendDirectly(msg);
};

const msgWrap = ref(null)
const inputText = ref('')
const messages = ref([])
const currentChatId = ref(null)

const isWaiting = ref(false)
let abortController = null

// 从上层路由/历史组件接收立即发送指令
const sendDirectly = (text) => {
    if (!text || isWaiting.value || !currentChatId.value) return
    messages.value.push({ role: 'user', content: text })
    scrollToBottom()
    sendRealMessage(text)
}

// 核心交互：发起真实请求
const sendRealMessage = async (content) => {
    isWaiting.value = true;
    abortController = new AbortController()

    // Add reactive empty placeholder for AI response to ensure stream updates the UI
    const assistantMessage = reactive({ role: 'assistant', content: '', loading: true })
    messages.value.push(assistantMessage)
    scrollToBottom()

    try {
        await sendStreamMessage(currentChatId.value, content, {
            signal: abortController.signal,
            onStart: () => {
                assistantMessage.loading = false
            },
            onDelta: (data) => {
                if (data && data.content) {
                    assistantMessage.content += data.content
                    scrollToBottom()
                }
            },
            onDone: () => {
                isWaiting.value = false
                assistantMessage.loading = false
            },
            onError: (err) => {
                if (err.name !== 'AbortError') {
                    console.error("Stream error", err)
                    assistantMessage.content += '\n[服务响应异常]'
                }
                isWaiting.value = false
                assistantMessage.loading = false
            }
        })
    } catch(err) {
        if (err.name !== 'AbortError') {
             isWaiting.value = false
             assistantMessage.loading = false
        }
    }
}

// 切换对话
async function switchChat(chatId) {
    if (abortController) stopReply()
    
    currentChatId.value = chatId
    isWaiting.value = false
    try {
        const history = await fetchMessages(chatId)
        // Ensure mapped clearly
        messages.value = history || []
    } catch (e) {
        console.error('Failed to fetch messages', e)
        messages.value = []
    }
    
    scrollToBottom()
}

// 发送消息
const send = () => {
    const val = inputText.value.trim()
    if (!val || isWaiting.value || !currentChatId.value) return
    messages.value.push({ role: 'user', content: val })
    inputText.value = ''
    scrollToBottom()
    sendRealMessage(val)
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
    if (abortController) {
        abortController.abort()
        abortController = null
    }
    const lastMessage = messages.value.at(-1)
    if (lastMessage && lastMessage.loading) {
       lastMessage.loading = false
    }
    isWaiting.value = false
    scrollToBottom()
}

// 滚动到底部
const scrollToBottom = () => {
    nextTick(() => {
        if (msgWrap.value) msgWrap.value.scrollTop = msgWrap.value.scrollHeight
    })
}

defineExpose({ sendDirectly, switchChat })
</script>

<style scoped>
.chat-table {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--bg-secondary, #ffffff);
    position: relative;
}

.chat-header {
    padding: 20px 32px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border-color, #e2e8f0);
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 20;
}

.chat-header h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary, #0f172a);
    letter-spacing: -0.02em;
}

.tag {
    padding: 6px 14px;
    background: var(--accent-light, #e0e7ff);
    color: var(--accent-primary, #2563eb);
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
}

.message-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 32px;
    scroll-behavior: smooth;
}

.message-box {
    max-width: 860px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 32px;
    padding-bottom: 40px;
}

.msg-item {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    width: 100%;
    animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.msg-item.ai {
    justify-content: flex-start;
}

.msg-item.user {
    justify-content: flex-end;
}

.avatar {
    width: 36px;
    height: 36px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
    box-shadow: var(--shadow-sm);
}

.avatar.ai {
    background: linear-gradient(135deg, var(--accent-primary, #2563eb), #60a5fa);
    color: #fff;
}

.avatar.user {
    background: linear-gradient(135deg, #10b981, #34d399);
    color: #fff;
}

.bubble {
    max-width: 80%;
    min-width: 50px;
    padding: 16px 20px;
    border-radius: 20px;
    font-size: 15px;
    line-height: 1.6;
    text-align: left;
    word-break: break-word;
    box-shadow: var(--shadow-sm);
}

.bubble.ai {
    background: var(--bg-secondary, #ffffff);
    border: 1px solid var(--border-color, #e2e8f0);
    color: var(--text-primary, #0f172a);
    border-top-left-radius: 4px;
}

.bubble.user {
    background: var(--text-primary, #0f172a);
    color: #fff;
    border-top-right-radius: 4px;
}

.dot {
    display: inline-block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: var(--accent-primary, #2563eb);
    margin-left: 8px;
    animation: pulse 1s infinite alternate;
}

@keyframes pulse {
    0% { transform: scale(0.8); opacity: 0.5; }
    100% { transform: scale(1.5); opacity: 1; }
}

.chat-footer {
    padding: 0 32px 32px;
    background: transparent;
    position: relative;
}

.chat-footer::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 120px;
    background: linear-gradient(to bottom, transparent, var(--bg-secondary, #ffffff) 50%);
    pointer-events: none;
    z-index: 0;
}

.input-bar {
    display: flex;
    gap: 12px;
    max-width: 860px;
    margin: 0 auto;
    background: var(--bg-secondary, #ffffff);
    padding: 10px 10px 10px 24px;
    border-radius: 36px;
    border: 1px solid var(--border-color, #e2e8f0);
    box-shadow: var(--shadow-lg);
    position: relative;
    z-index: 10;
    transition: box-shadow 0.3s ease, border-color 0.3s ease;
}

.input-bar:focus-within {
    border-color: var(--accent-light, #e0e7ff);
    box-shadow: var(--shadow-float);
}

.input-bar input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 15px;
    color: var(--text-primary, #0f172a);
}

.input-bar input::placeholder {
    color: var(--text-muted, #94a3b8);
}

.input-bar button {
    padding: 10px 24px;
    border-radius: 30px;
    background: var(--text-primary, #0f172a);
    color: white;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.input-bar button:hover {
    background: var(--accent-primary, #2563eb);
    transform: translateY(-1px);
}

.input-bar button.waiting {
    background: #ef4444;
}

.input-bar button.waiting:hover {
    background: #dc2626;
}

/* Markdown Styles */
:deep(.markdown-body) {
    font-size: 15px;
    line-height: 1.6;
}

:deep(.markdown-body p) {
    margin-bottom: 12px;
}
:deep(.markdown-body p:last-child) {
    margin-bottom: 0;
}
:deep(.markdown-body ul), :deep(.markdown-body ol) {
    padding-left: 20px;
    margin-bottom: 12px;
}
:deep(.markdown-body li) {
    margin-bottom: 4px;
}
:deep(.markdown-body pre) {
    background: #f6f8fa;
    padding: 12px;
    border-radius: 8px;
    overflow-x: auto;
    margin-bottom: 12px;
}
:deep(.markdown-body code) {
    font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace;
    font-size: 13px;
    background: rgba(0,0,0,0.05);
    padding: 2px 4px;
    border-radius: 4px;
}
:deep(.markdown-body pre code) {
    background: transparent;
    padding: 0;
}
:deep(.markdown-body strong) {
    font-weight: 600;
    color: var(--text-primary);
}

/* Plan Cards Styles */
.plans-container {
    display: flex;
    gap: 12px;
    margin-top: 16px;
    flex-wrap: wrap;
}

.plan-card {
    flex: 1;
    min-width: 200px;
    background: linear-gradient(135deg, #ffffff, #f8fafc);
    border: 1px solid var(--border-color, #e2e8f0);
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: var(--shadow-sm);
}

.plan-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: var(--accent-light, #e0e7ff);
}

.plan-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.plan-type {
    font-weight: 700;
    color: var(--accent-primary, #2563eb);
    font-size: 15px;
}

.plan-budget {
    font-size: 13px;
    background: #eef2ff;
    color: #4338ca;
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: 600;
}

.plan-desc {
    font-size: 13px;
    color: var(--text-secondary, #475569);
    line-height: 1.5;
}
</style>