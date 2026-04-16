<template>
  <div class="weather-card" @click="$emit('open-detail')" v-if="data && data.days && data.days.length">
    <div class="weather-card__header">
      <div class="weather-card__location">
        <span class="location-icon">📍</span>
        <span class="location-name">{{ data.destination }}</span>
        <span class="location-badge">未来{{ data.days.length }}天天气</span>
      </div>
      <div class="weather-card__hint">
        点击查看详情 →
      </div>
    </div>

    <div class="weather-card__days">
      <div 
        class="day-item" 
        v-for="(day, idx) in data.days.slice(0, 7)" 
        :key="idx"
        :class="{ today: idx === 0 }"
      >
        <div class="day-label">{{ idx === 0 ? '今天' : formatDate(day.date) }}</div>
        <div class="day-icon">{{ getWeatherIcon(day.weather_code) }}</div>
        <div class="day-desc">{{ day.weather_desc }}</div>
        <div class="day-temp">
          <span class="temp-max">{{ Math.round(day.max_temp_c) }}°</span>
          <div class="temp-bar">
            <div class="temp-bar-fill" :style="getTempBarStyle(day)"></div>
          </div>
          <span class="temp-min">{{ Math.round(day.min_temp_c) }}°</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  data: { type: Object, required: true }
})

defineEmits(['open-detail'])

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const month = d.getMonth() + 1
  const day = d.getDate()
  return `${month}/${day} ${weekdays[d.getDay()]}`
}

const getWeatherIcon = (code) => {
  if (code === undefined || code === null) return '🌤️'
  if (code === 0) return '☀️'
  if (code <= 3) return '⛅'
  if (code <= 48) return '🌫️'
  if (code <= 57) return '🌦️'
  if (code <= 67) return '🌧️'
  if (code <= 77) return '🌨️'
  if (code <= 82) return '🌧️'
  if (code <= 86) return '🌨️'
  if (code >= 95) return '⛈️'
  return '🌤️'
}

const getTempBarStyle = (day) => {
  // Normalize temp to a gradient position (0°C = 0%, 40°C = 100%)
  const minP = Math.max(0, Math.min(100, (day.min_temp_c / 40) * 100))
  const maxP = Math.max(0, Math.min(100, (day.max_temp_c / 40) * 100))
  return {
    left: `${minP}%`,
    width: `${Math.max(maxP - minP, 8)}%`,
  }
}
</script>

<style scoped>
.weather-card {
  background: linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 50%, #4da0d8 100%);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 12px;
  cursor: pointer;
  color: #fff;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(30, 58, 95, 0.3);
  animation: weatherSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
}

.weather-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -30%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.weather-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(30, 58, 95, 0.4);
}

@keyframes weatherSlideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.weather-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.weather-card__location {
  display: flex;
  align-items: center;
  gap: 8px;
}

.location-icon {
  font-size: 16px;
}

.location-name {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.location-badge {
  font-size: 11px;
  background: rgba(255, 255, 255, 0.2);
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 500;
  backdrop-filter: blur(4px);
}

.weather-card__hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  transition: color 0.2s;
}
.weather-card:hover .weather-card__hint {
  color: rgba(255, 255, 255, 1);
}

.weather-card__days {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
}

.weather-card__days::-webkit-scrollbar {
  display: none;
}

.day-item {
  flex: 1;
  min-width: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 6px;
  border-radius: 12px;
  transition: background 0.2s;
}

.day-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.day-item.today {
  background: rgba(255, 255, 255, 0.15);
}

.day-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
}

.day-icon {
  font-size: 22px;
  line-height: 1;
}

.day-desc {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
}

.day-temp {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
}

.temp-max {
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  min-width: 24px;
  text-align: right;
}

.temp-min {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  min-width: 24px;
}

.temp-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  position: relative;
  min-width: 20px;
}

.temp-bar-fill {
  position: absolute;
  top: 0;
  height: 100%;
  background: linear-gradient(to right, #60a5fa, #f97316);
  border-radius: 2px;
}
</style>
