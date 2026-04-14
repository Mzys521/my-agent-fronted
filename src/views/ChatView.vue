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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const chatRef = ref(null)
const route = useRoute()

onMounted(() => {
    // 读取首页传过来的内容
    const content = route.query.userMessage
    if (content && content.trim()) {
        setTimeout(() => {
            // 自动创建对话 + 发消息
            if (chatRef.value) {
                chatRef.value.startFromHome(content)
            }
        }, 300)
    }
})

const handleSwitchChat = (id) => {
    if (chatRef.value) {
        chatRef.value.switchChat(id)
    }
}
</script>