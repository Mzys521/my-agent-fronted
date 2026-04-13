<template>
    <ChatLayout>
        <template #left>
            <ChatHistory @switch-chat="handleSwitchChat" />
        </template>

        <template #right>
            <ChatTable ref="chatRef" />
        </template>
    </ChatLayout>
</template>

<script setup>
import ChatLayout from '../layout/ChatLayout.vue'
import ChatHistory from '../components/ChatHistory.vue'
import ChatTable from '../components/ChatTable.vue'
import { ref } from 'vue'

const chatRef = ref(null)
const handleSwitchChat = (id) => {
    console.log('切换到对话：', id)
    // 这里可以后续做真实接口切换
}
</script>