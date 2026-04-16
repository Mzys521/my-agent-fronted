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
const props = defineProps({
    initialMessage: { type: String, default: '' }
})
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
        
        if (props.initialMessage && props.initialMessage.trim()) {
            const title = props.initialMessage.slice(0, 10);
            await createNewPlan(false, title, props.initialMessage.trim());
            return;
        }

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

async function createNewPlan(isDefault = false, customTitle = null, triggerContent = null) {
    try {
        const title = customTitle || (isDefault ? '默认对话' : `新对话 ${historyList.value.length + 1}`)
        const res = await createChat({ title, pinned: false })
        
        historyList.value.unshift(res)
        activeId.value = res.id
        emit('switch-chat', res.id, triggerContent)
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
    background: transparent;
}

.history__header {
    padding: 24px 20px 16px;
    /* Soft border or none for modern look */
}

.history__header h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--text-muted, #94a3b8);
    letter-spacing: 0.05em;
}

/* 历史列表区域 */
.history__list {
    flex: 1;
    overflow-y: auto;
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

/* 单个历史项 */
.history-item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    border-radius: 12px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    color: var(--text-secondary, #475569);
    font-weight: 500;
}

/* 悬浮效果 */
.history-item:hover {
    background: var(--bg-secondary, #ffffff);
    box-shadow: var(--shadow-sm);
    color: var(--text-primary, #0f172a);
}

/* 激活态 */
.history-item.active {
    background: var(--bg-secondary, #ffffff);
    border-color: var(--border-color, #e2e8f0);
    box-shadow: var(--shadow-sm);
    color: var(--accent-primary, #2563eb);
}

/* 标题容器：标题 + 置顶图标 */
.title-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
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
    padding: 6px 10px;
    border: 1px solid var(--accent-light, #e0e7ff);
    border-radius: 6px;
    outline: none;
    font-size: 14px;
    background: var(--bg-secondary, #ffffff);
    color: var(--text-primary, #0f172a);
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

/* 更多按钮... */
.dots {
    opacity: 0;
    font-size: 18px;
    padding: 0 6px;
    color: var(--text-muted, #94a3b8);
    transition: all 0.2s;
    flex-shrink: 0;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.dots:hover {
    background: var(--bg-muted, #f1f5f9);
    color: var(--text-primary, #0f172a);
}

.history-item:hover .dots {
    opacity: 1;
}

.history-item.active .dots {
    opacity: 1;
}

/* 下拉菜单 */
.action-menu {
    position: absolute;
    right: 12px;
    top: calc(100% - 10px);
    width: 140px;
    background: #fff;
    border-radius: 12px;
    box-shadow: var(--shadow-lg);
    z-index: 999;
    overflow: hidden;
    border: 1px solid var(--border-color, #e2e8f0);
    padding: 4px;
}

.menu-item {
    padding: 10px 12px;
    font-size: 13px;
    color: var(--text-secondary, #475569);
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s ease;
}

.menu-item:hover {
    background: var(--bg-muted, #f1f5f9);
    color: var(--text-primary, #0f172a);
}

.menu-item.delete {
    color: #ef4444;
}

.menu-item.delete:hover {
    background: #fef2f2;
}

.history__footer {
    padding: 20px;
    background: linear-gradient(to top, var(--bg-primary, #f8fafc) 60%, transparent);
}

.new-btn {
    width: 100%;
    padding: 12px 0;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, var(--accent-primary, #2563eb), var(--accent-hover, #1d4ed8));
    color: #fff;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.new-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
}

.new-btn:active {
    transform: translateY(0);
}
</style>