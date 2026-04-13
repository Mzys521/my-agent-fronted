<template>
    <ChatLayout>
        <template #left>
            <!-- 左侧：历史对话 -->
            <ChatHistory @switch-chat="handleSwitchChat" />
        </template>

        <template #right>
            <!-- 右侧：聊天窗口（绑定ref调用方法） -->
            <ChatTable ref="chatRef" />
        </template>
    </ChatLayout>
</template>

<script setup>
import ChatLayout from '../layout/ChatLayout.vue'
import ChatHistory from '../components/ChatHistory.vue'
import ChatTable from '../components/ChatTable.vue'
import { ref } from 'vue'

// 聊天窗口实例
const chatRef = ref(null)

// 监听历史切换 → 联动右侧聊天框
const handleSwitchChat = (id) => {
    console.log('切换到对话 ID：', id)
    // 调用子组件方法，切换对话内容
    if (chatRef.value) {
        chatRef.value.switchChat(id)
    }
}
</script>