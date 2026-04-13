<template>
    <div class="history">
        <div class="history__header">
            <h3>历史对话</h3>
        </div>

        <div class="history__list">
            <div class="history-item" :class="{ active: activeId === item.id }" v-for="item in sortedList"
                :key="item.id" @click="switchHistory(item.id)">
                <!-- 原地重命名输入框 -->
                <input v-if="renameId === item.id" v-model="renameText" class="rename-input" autofocus
                    @blur="confirmRename" @keyup.enter="confirmRename" @click.stop />

                <!-- 正常标题 + 置顶图标 -->
                <div class="title-wrap" v-else>
                    <span class="title">{{ item.title }}</span>
                    <span class="pin-icon" v-if="item.pin">📌</span>
                </div>

                <!-- 操作菜单按钮 -->
                <div class="dots" @click.stop="openMenu(item.id)">⋮</div>

                <!-- 下拉操作菜单 -->
                <div class="action-menu" v-if="openMenuId === item.id" @click.stop>
                    <div class="menu-item" @click.stop="rename(item.id)">重命名</div>
                    <div class="menu-item" @click.stop="togglePin(item.id)">
                        {{ item.pin ? "取消置顶" : "置顶" }}
                    </div>
                    <div class="menu-item delete" @click.stop="deleteItem(item.id)">删除</div>
                </div>
            </div>
        </div>

        <!-- 底部新增按钮 -->
        <div class="history__footer">
            <button class="new-btn" @click="createNewPlan">+ 新增旅行规划</button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getHistoryList, saveHistoryList } from '../utils/storage'
const emit = defineEmits(['switch-chat'])

// 从本地 temp 存储读取数据（无测试数据）
const historyList = ref([])

// 激活项
const activeId = ref(null)
const openMenuId = ref(null)
const renameId = ref(null)
const renameText = ref('')

// 页面加载时读取本地存储
onMounted(() => {
    historyList.value = getHistoryList()
    // 默认选中第一条
    if (historyList.value.length) {
        activeId.value = historyList.value[0].id
    }
})

// 排序规则：置顶优先 > 最新创建
const sortedList = computed(() => {
    return [...historyList.value].sort((a, b) => {
        if (a.pin && !b.pin) return -1
        if (!a.pin && b.pin) return 1
        return b.id - a.id
    })
})

// 打开操作菜单
const openMenu = (id) => {
    openMenuId.value = openMenuId.value === id ? null : id
    renameId.value = null
}

// 切换对话
const switchHistory = (id) => {
    activeId.value = id
    openMenuId.value = null
    emit('switch-chat', id)
}

// 原地重命名
const rename = (id) => {
    renameId.value = id
    renameText.value = historyList.value.find(i => i.id === id)?.title || ''
    openMenuId.value = null
    setTimeout(() => {
        document.querySelector('.rename-input:focus')?.select()
    }, 0)
}

// 确认重命名（自动保存）
const confirmRename = () => {
    if (!renameId.value || !renameText.value.trim()) {
        renameId.value = null
        return
    }
    const item = historyList.value.find(i => i.id === renameId.value)
    if (item) item.title = renameText.value.trim()
    renameId.value = null
    saveHistoryList(historyList.value)
}

// 置顶/取消置顶（自动保存）
const togglePin = (id) => {
    const item = historyList.value.find(i => i.id === id)
    if (item) item.pin = !item.pin
    openMenuId.value = null
    saveHistoryList(historyList.value)
}

// 删除项目（自动保存）
const deleteItem = (id) => {
    historyList.value = historyList.value.filter(i => i.id !== id)
    if (activeId.value === id) {
        activeId.value = sortedList.value[0]?.id || null
    }
    openMenuId.value = null
    saveHistoryList(historyList.value)
}

// 新建规划（自动保存）
const createNewPlan = () => {
    const newId = Date.now()
    const newItem = {
        id: newId,
        title: `新对话 ${historyList.value.length + 1}`,
        pin: false,
        createTime: new Date().toISOString()
    }
    historyList.value.unshift(newItem)
    activeId.value = newId
    emit('switch-chat', newId)
    saveHistoryList(historyList.value)
}

// 点击空白关闭菜单
document.addEventListener('click', () => {
    openMenuId.value = null
    renameId.value = null
})
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
    transition: background 0.2s;
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
    font-size: 16px;
    padding: 0 4px;
    color: #666;
    transition: opacity 0.2s;
}

.history-item:hover .dots {
    opacity: 1;
}

.active .dots {
    color: #fff;
}

.action-menu {
    position: absolute;
    right: 0;
    top: 110%;
    width: 120px;
    background: #ffffff;
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
    font-size: 14px;
    cursor: pointer;
}

.new-btn:hover {
    background: #1d4ed8;
}
</style>