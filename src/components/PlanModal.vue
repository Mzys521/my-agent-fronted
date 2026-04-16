<template>
  <div class="modal-overlay" v-if="visible" @click.self="close">
    <div class="modal-content">
      <button class="close-btn" @click="close">&times;</button>
      
      <div class="modal-header">
        <div class="icon-wrap">
          <span class="icon">✨</span>
        </div>
        <h3 class="title">{{ plan.type || '旅行方案' }}</h3>
        <div class="budget-badge">{{ plan.budget || '预算待定' }}</div>
      </div>

      <div class="modal-body">
        <div class="section">
          <h4 class="section-title">方案核心特点</h4>
          <p class="section-text">{{ plan.desc || '暂无描述' }}</p>
        </div>

        <!-- 针对未来后端可能会传过来的更详细数据做占位设计 -->
        <div class="section placeholder-section">
          <h4 class="section-title">预估亮点建议</h4>
          <ul class="feature-list">
            <li>📍 优先规划高性价比路线与交通方式</li>
            <li>🏨 提供极具本地特色的优选住宿建议</li>
            <li>🍜 匹配符合您口味的地道美食推荐</li>
          </ul>
        </div>
      </div>

      <div class="modal-footer">
        <button class="action-btn cancel" @click="close">再看看</button>
        <button class="action-btn confirm" @click="confirmPlan">就选这个方案</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const visible = ref(false);
const plan = ref({});

const emit = defineEmits(['select-plan']);

const open = (planData) => {
  plan.value = planData;
  visible.value = true;
};

const close = () => {
  visible.value = false;
};

const confirmPlan = () => {
  emit('select-plan', plan.value);
  close();
};

defineExpose({ open, close });
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(12px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: rgba(255, 255, 255, 0.95);
  width: 100%;
  max-width: 480px;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.6);
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.close-btn {
  position: absolute;
  top: 24px;
  right: 24px;
  background: var(--bg-muted, #f1f5f9);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  color: var(--text-secondary, #475569);
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e2e8f0;
  color: var(--text-primary, #0f172a);
  transform: rotate(90deg);
}

.modal-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 32px;
}

.icon-wrap {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #e0e7ff, #eff6ff);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 16px;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.5), 0 4px 6px rgba(37, 99, 235, 0.1);
}

.title {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 800;
  color: var(--text-primary, #0f172a);
}

.budget-badge {
  background: #f0fdf4;
  color: #166534;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
  border: 1px solid #bbf7d0;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary, #0f172a);
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title::before {
  content: '';
  display: block;
  width: 4px;
  height: 14px;
  background: var(--accent-primary, #2563eb);
  border-radius: 4px;
}

.section-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary, #475569);
  background: var(--bg-primary, #f8fafc);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--border-color, #e2e8f0);
}

.feature-list {
  margin: 0;
  padding: 16px;
  list-style: none;
  background: var(--bg-primary, #f8fafc);
  border-radius: 12px;
  border: 1px solid var(--border-color, #e2e8f0);
}

.feature-list li {
  font-size: 14px;
  color: var(--text-secondary, #475569);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.feature-list li:last-child {
  margin-bottom: 0;
}

.modal-footer {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.action-btn.cancel {
  background: var(--bg-muted, #f1f5f9);
  color: var(--text-secondary, #475569);
}

.action-btn.cancel:hover {
  background: #e2e8f0;
  color: var(--text-primary, #0f172a);
}

.action-btn.confirm {
  background: linear-gradient(135deg, var(--accent-primary, #2563eb), var(--accent-hover, #1d4ed8));
  color: white;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.action-btn.confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
}
</style>
