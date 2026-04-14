<template>
    <div class="history">
        <div class="history__header">
            <h3>历史对话</h3>
        </div>

        <div class="history__list">
            <div class="history-item" :class="{ active: activeId === item.id }" v-for="item in sortedList"
                :key="item.id" @click="switchHistory(item.id)">
                <!-- 重命名输入框 -->
                <input v-if="renameId === item.id" v-model="renameText" class="rename-input" autofocus
                    @blur="confirmRename" @keyup.enter="confirmRename" @click.stop />

                <!-- 正常标题 -->
                <div class="title-wrap" v-else>
                    <span class="title">{{ item.title }}</span>
                    <span class="pin-icon" v-if="item.pinned">📌</span>
                </div>

                <!-- 更多按钮 -->
                <div class="dots" @click.stop="openMenu(item.id)">⋮</div>

                <!-- 操作菜单 -->
                <div class="action-menu" v-if="openMenuId === item.id" @click.stop>
                    <div class="menu-item" @click.stop="rename(item.id)">重命名</div>
                    <div class="menu-item" @click.stop="togglePin(item.id)">
                        {{ item.pinned ? "取消置顶" : "置顶" }}
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
import { fetchChats, createChat, updateChat, deleteChat } from '../api/chat'
import { useUserStore } from '../stores/userStore'
const emit = defineEmits(['switch-chat'])
const userStore = useUserStore()

const historyList = ref([])
const activeId = ref(null)
const openMenuId = ref(null)
const renameId = ref(null)
const renameText = ref('')
const loadChats = async () => {
    if (!userStore.token) return;
    try {
        const res = await fetchChats();
        historyList.value = res || [];
        
        if (historyList.value.length === 0) {
            createNewPlan(true)
        } else {
            activeId.value = historyList.value[0].id
            emit('switch-chat', activeId.value)
        }
    } catch (e) {
        console.error('Failed to load chats', e)
    }
}

onMounted(() => {
    loadChats();

    // 接收从首页创建的对话
    window.addChatForUser = async (chatId, title) => {
        const exist = historyList.value.some(i => i.id === chatId)
        if (exist) return

        try {
            const res = await createChat({ title, pinned: false })
            historyList.value.unshift(res)
            activeId.value = res.id
            emit('switch-chat', res.id)
        } catch (e) {
            console.error('Failed to create route chat', e)
        }
    }
})

const sortedList = computed(() => {
    return [...historyList.value].sort((a, b) => {
        // Backend key is pinned
        if (a.pinned && !b.pinned) return -1
        if (!a.pinned && b.pinned) return 1
        return new Date(b.created_at) - new Date(a.created_at)
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

const confirmRename = async () => {
    const item = historyList.value.find(i => i.id === renameId.value)
    if (item) {
        const newTitle = renameText.value.trim()
        try {
            await updateChat(item.id, { title: newTitle })
            item.title = newTitle
        } catch (e) {
            console.error('Rename failed', e)
        }
    }
    renameId.value = null
}

const togglePin = async (id) => {
    const item = historyList.value.find(i => i.id === id)
    if (item) {
        try {
            await updateChat(item.id, { pinned: !item.pinned })
            item.pinned = !item.pinned
        } catch (e) {
            console.error('Toggle pin failed', e)
        }
    }
}

const deleteItem = async (id) => {
    try {
        await deleteChat(id)
        historyList.value = historyList.value.filter(i => i.id !== id)
        if (activeId.value === id) {
            activeId.value = historyList.value[0]?.id || null
            if (activeId.value) emit('switch-chat', activeId.value)
        }
    } catch (e) {
        console.error('Delete chat failed', e)
    }
}

async function createNewPlan(isDefault = false) {
    try {
        const title = isDefault ? '默认对话' : `新对话 ${historyList.value.length + 1}`
        const res = await createChat({ title, pinned: false })
        
        historyList.value.unshift(res)
        activeId.value = res.id
        emit('switch-chat', res.id)
    } catch (e) {
        console.error('Failed to create new plan', e)
    }
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

/* 历史列表区域 */
.history__list {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
}

/* 单个历史项 */
.history-item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    margin-bottom: 6px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s;
}

/* 悬浮效果 */
.history-item:hover {
    background: #e5e7eb;
}

/* 激活态 */
.history-item.active {
    background: #2962ff;
    color: #fff;
}

/* 标题容器：标题 + 置顶图标 */
.title-wrap {
    display: flex;
    align-items: center;
    gap: 4px;
    flex: 1;
    min-width: 0;
}

.title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* 置顶图标 */
.pin-icon {
    font-size: 12px;
    opacity: 0.7;
    flex-shrink: 0;
}

/* 重命名输入框 */
.rename-input {
    flex: 1;
    padding: 4px 6px;
    border: 1px solid #2962ff;
    border-radius: 4px;
    outline: none;
    font-size: 14px;
    background: #fff;
    color: #333;
}

/* 更多按钮... */
.dots {
    opacity: 0;
    font-size: 16px;
    padding: 0 4px;
    color: #666;
    transition: opacity 0.2s;
    flex-shrink: 0;
}

.history-item:hover .dots {
    opacity: 1;
}

.history-item.active .dots {
    color: #fff;
}

/* 下拉菜单 */
.action-menu {
    position: absolute;
    right: 0;
    top: 100%;
    width: 120px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
    z-index: 999;
    overflow: hidden;
}

.menu-item {
    padding: 8px 12px;
    font-size: 13px;
    color: #333;
}

.menu-item:hover {
    background: #f4f4f5;
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