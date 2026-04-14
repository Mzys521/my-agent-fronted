<template>
    <div class="history">
        <div class="history__header">
            <h3>历史对话</h3>
        </div>

        <div class="history__list">
            <div class="history-item" :class="{ active: activeId === item.id }" v-for="item in sortedList" :key="item.id"
                @click="switchHistory(item.id)">
                <input v-if="renameId === item.id" v-model="renameText" class="rename-input" autofocus
                    @blur="confirmRename" @keyup.enter="confirmRename" />
                <div class="title-wrap" v-else>
                    <span class="title">{{ item.title }}</span>
                    <span class="pin-icon" v-if="item.pin">📌</span>
                </div>
                <div class="dots" @click.stop="openMenu(item.id)">⋮</div>
                <div class="action-menu" v-if="openMenuId === item.id" @click.stop>
                    <div class="menu-item" @click.stop="rename(item.id)">重命名</div>
                    <div class="menu-item" @click.stop="togglePin(item.id)">
                        {{ item.pin ? '取消置顶' : '置顶' }}
                    </div>
                    <div class="menu-item delete" @click.stop="deleteItem(item.id)">删除</div>
                </div>
            </div>
        </div>

        <div class="history__footer">
            <button class="new-btn" @click="createNewPlan">+ 新增旅行规划</button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getUserChatList, saveUserChatList, deleteChat } from '../utils/storage'
const emit = defineEmits(['switch-chat'])

const historyList = ref([])
const activeId = ref(null)
const openMenuId = ref(null)
const renameId = ref(null)
const renameText = ref('')

onMounted(() => {
    historyList.value = getUserChatList()

    if (historyList.value.length === 0) {
        createNewPlan(true)
    } else {
        activeId.value = historyList.value[0].id
        emit('switch-chat', activeId.value)
    }

    // 接收从首页创建的对话
    window.addChatForUser = (chatId, title) => {
        const exist = historyList.value.some(i => i.id === chatId)
        if (exist) return

        const item = {
            id: chatId,
            title: title,
            pin: false,
            createTime: new Date().toISOString()
        }

        historyList.value.unshift(item)
        saveUserChatList(historyList.value)
        activeId.value = chatId
        emit('switch-chat', chatId)
    }
})

const sortedList = computed(() => {
    return [...historyList.value].sort((a, b) => {
        if (a.pin && !b.pin) return -1
        if (!a.pin && b.pin) return 1
        return b.id - a.id
    })
})

const switchHistory = (id) => {
    activeId.value = id
    openMenuId.value = null
    emit('switch-chat', id)
}

const rename = (id) => {
    renameId.value = id
    renameText.value = historyList.value.find(i => i.id === id)?.title || ''
}

const confirmRename = () => {
    const item = historyList.value.find(i => i.id === renameId.value)
    if (item) item.title = renameText.value.trim()
    renameId.value = null
    saveUserChatList(historyList.value)
}

const togglePin = (id) => {
    const item = historyList.value.find(i => i.id === id)
    if (item) item.pin = !item.pin
    saveUserChatList(historyList.value)
}

const deleteItem = (id) => {
    deleteChat(id)
    historyList.value = getUserChatList()
    activeId.value = historyList.value[0]?.id || null
}

function createNewPlan(isDefault = false) {
    const newId = Date.now()
    const item = {
        id: newId,
        title: isDefault ? '默认对话' : `新对话 ${historyList.value.length + 1}`,
        pin: false
    }
    historyList.value.unshift(item)
    activeId.value = newId
    emit('switch-chat', newId)
    saveUserChatList(historyList.value)
}

const openMenu = (id) => openMenuId.value = openMenuId.value === id ? null : id
</script>

<style scoped>
.history {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #f9fafb;
}

.history__header {
    padding: 18px 16px;
    border-bottom: 1px solid #e5e7eb;
}

.history__header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
}

.history__list {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
}

.history-item {
    position: relative;
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.history-item:hover {
    background: #e5e7eb;
}

.history-item.active {
    background: #2962ff;
    color: #fff;
}

.title-wrap {
    display: flex;
    align-items: center;
    gap: 4px;
    flex: 1;
}

.pin-icon {
    font-size: 12px;
    opacity: 0.7;
}

.rename-input {
    flex: 1;
    padding: 4px 6px;
    border: 1px solid #2962ff;
    border-radius: 4px;
    outline: none;
    font-size: 14px;
    background: #fff;
}

.dots {
    opacity: 0;
}

.history-item:hover .dots {
    opacity: 1;
}

.action-menu {
    position: absolute;
    right: 0;
    top: 100%;
    width: 120px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    z-index: 99;
}

.menu-item {
    padding: 8px 12px;
    font-size: 13px;
}

.menu-item.delete {
    color: #f43f5e;
}

.history__footer {
    padding: 12px;
    border-top: 1px solid #e5e7eb;
}

.new-btn {
    width: 100%;
    padding: 10px 0;
    border-radius: 8px;
    border: none;
    background: #2962ff;
    color: #fff;
    cursor: pointer;
}
</style>