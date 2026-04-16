<template>
    <ChatLayout>
        <template #left>
            <ChatHistory :initialMessage="userMessage" @switch-chat="handleSwitchChat" />
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
import { useRoute, useRouter } from 'vue-router'

const chatRef = ref(null)
const route = useRoute()
const router = useRouter()

const userMessage = route.query.userMessage || ''

const handleSwitchChat = (id, triggerContent) => {
    if (chatRef.value) {
        chatRef.value.switchChat(id).then(() => {
            if (triggerContent) {
                // Replace route to clear the query
                router.replace({ path: '/chat' })
                chatRef.value.sendDirectly(triggerContent)
            }
        })
    }
}
</script>