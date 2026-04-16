<template>
  <div class="modal-overlay" v-if="visible" @click.self="close">
    <div class="modal-content">
      <button class="close-btn" @click="close">&times;</button>

      <div class="modal-header">
        <div class="icon-wrap">
          <span class="icon">🌤️</span>
        </div>
        <h3 class="title">{{ weatherData.destination }} 天气预报</h3>
        <div class="subtitle">未来 {{ weatherData.days?.length || 0 }} 天天气详情</div>
      </div>

      <!-- SVG Temperature Chart -->
      <div class="chart-section" v-if="weatherData.days?.length">
        <h4 class="section-title">温度趋势</h4>
        <div class="chart-container">
          <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" class="temp-chart">
            <!-- Grid lines -->
            <line v-for="(y, i) in gridLines" :key="'grid-'+i"
              :x1="chartPadding" :y1="y" :x2="chartWidth - chartPadding" :y2="y"
              stroke="rgba(0,0,0,0.06)" stroke-width="1" />

            <!-- Temperature labels -->
            <text v-for="(label, i) in tempLabels" :key="'label-'+i"
              :x="chartPadding - 8" :y="label.y + 4"
              text-anchor="end" fill="#94a3b8" font-size="11">{{ label.text }}°</text>

            <!-- Max temp gradient area -->
            <defs>
              <linearGradient id="maxGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="rgba(249, 115, 22, 0.3)" />
                <stop offset="100%" stop-color="rgba(249, 115, 22, 0.02)" />
              </linearGradient>
              <linearGradient id="minGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="rgba(59, 130, 246, 0.2)" />
                <stop offset="100%" stop-color="rgba(59, 130, 246, 0.02)" />
              </linearGradient>
            </defs>

            <!-- Max temp area fill -->
            <path :d="maxAreaPath" fill="url(#maxGrad)" />
            <!-- Min temp area fill -->
            <path :d="minAreaPath" fill="url(#minGrad)" />

            <!-- Max temp line -->
            <polyline :points="maxLinePoints" fill="none" stroke="#f97316" stroke-width="2.5" 
              stroke-linecap="round" stroke-linejoin="round" />
            <!-- Min temp line -->
            <polyline :points="minLinePoints" fill="none" stroke="#3b82f6" stroke-width="2.5"
              stroke-linecap="round" stroke-linejoin="round" />

            <!-- Data points and labels - Max -->
            <g v-for="(pt, i) in maxPoints" :key="'maxpt-'+i">
              <circle :cx="pt.x" :cy="pt.y" r="4" fill="#fff" stroke="#f97316" stroke-width="2" />
              <text :x="pt.x" :y="pt.y - 10" text-anchor="middle" fill="#f97316" 
                font-size="11" font-weight="600">{{ Math.round(pt.temp) }}°</text>
            </g>

            <!-- Data points and labels - Min -->
            <g v-for="(pt, i) in minPoints" :key="'minpt-'+i">
              <circle :cx="pt.x" :cy="pt.y" r="4" fill="#fff" stroke="#3b82f6" stroke-width="2" />
              <text :x="pt.x" :y="pt.y + 18" text-anchor="middle" fill="#3b82f6"
                font-size="11" font-weight="600">{{ Math.round(pt.temp) }}°</text>
            </g>

            <!-- Date labels on X axis -->
            <text v-for="(pt, i) in maxPoints" :key="'date-'+i"
              :x="pt.x" :y="chartHeight - 4"
              text-anchor="middle" fill="#94a3b8" font-size="10">{{ formatShortDate(weatherData.days[i]?.date) }}</text>
          </svg>

          <!-- Legend -->
          <div class="chart-legend">
            <span class="legend-item"><span class="dot max"></span>最高温</span>
            <span class="legend-item"><span class="dot min"></span>最低温</span>
          </div>
        </div>
      </div>

      <!-- Day Detail Cards -->
      <div class="days-section" v-if="weatherData.days?.length">
        <h4 class="section-title">逐日详情</h4>
        <div class="days-grid">
          <div class="day-detail-card" v-for="(day, idx) in weatherData.days" :key="idx">
            <div class="day-detail-header">
              <div class="day-detail-date">
                <span class="date-text">{{ formatFullDate(day.date) }}</span>
                <span class="day-badge" v-if="idx === 0">今天</span>
              </div>
              <div class="day-detail-weather">
                <span class="weather-icon-lg">{{ getWeatherIcon(day.weather_code) }}</span>
                <span class="weather-text">{{ day.weather_desc }}</span>
              </div>
            </div>

            <div class="day-detail-grid">
              <div class="detail-item">
                <span class="detail-icon">🌡️</span>
                <span class="detail-label">温度</span>
                <span class="detail-value">{{ day.min_temp_c }}° ~ {{ day.max_temp_c }}°C</span>
              </div>
              <div class="detail-item">
                <span class="detail-icon">💨</span>
                <span class="detail-label">风力</span>
                <span class="detail-value">{{ day.wind_direction }} {{ day.wind_speed_max }}km/h</span>
              </div>
              <div class="detail-item">
                <span class="detail-icon">💧</span>
                <span class="detail-label">湿度</span>
                <span class="detail-value humidity">
                  {{ day.avg_humidity }}%
                  <span class="humidity-bar">
                    <span class="humidity-fill" :style="{ width: day.avg_humidity + '%' }"></span>
                  </span>
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-icon">☀️</span>
                <span class="detail-label">紫外线</span>
                <span class="detail-value">
                  <span class="uv-badge" :class="getUvClass(day.max_uv_index)">
                    {{ day.max_uv_index }} · {{ getUvLevel(day.max_uv_index) }}
                  </span>
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-icon">🌫️</span>
                <span class="detail-label">空气质量</span>
                <span class="detail-value">
                  <span class="aqi-badge" :class="getAqiClass(day.air_quality_aqi)">
                    {{ day.air_quality_level }}
                    <template v-if="day.air_quality_aqi"> · AQI {{ day.air_quality_aqi }}</template>
                  </span>
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-icon">🌅</span>
                <span class="detail-label">日出/日落</span>
                <span class="detail-value">{{ day.sunrise }} / {{ day.sunset }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <div class="data-source">数据来源：Open-Meteo</div>
        <button class="action-btn" @click="close">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const visible = ref(false)
const weatherData = ref({})

const chartWidth = 600
const chartHeight = 220
const chartPadding = 50
const chartTop = 30
const chartBottom = 30

const open = (data) => {
  weatherData.value = data
  visible.value = true
}

const close = () => {
  visible.value = false
}

// Chart computations
const tempRange = computed(() => {
  if (!weatherData.value.days?.length) return { min: 0, max: 40 }
  const allTemps = weatherData.value.days.flatMap(d => [d.max_temp_c, d.min_temp_c]).filter(t => t != null)
  const min = Math.floor(Math.min(...allTemps)) - 3
  const max = Math.ceil(Math.max(...allTemps)) + 3
  return { min, max }
})

const tempToY = (temp) => {
  const { min, max } = tempRange.value
  const usableHeight = chartHeight - chartTop - chartBottom
  return chartTop + usableHeight * (1 - (temp - min) / (max - min))
}

const getX = (idx, total) => {
  const usableWidth = chartWidth - chartPadding * 2
  return chartPadding + (usableWidth / (total - 1 || 1)) * idx
}

const maxPoints = computed(() => {
  if (!weatherData.value.days?.length) return []
  return weatherData.value.days.map((d, i) => ({
    x: getX(i, weatherData.value.days.length),
    y: tempToY(d.max_temp_c),
    temp: d.max_temp_c,
  }))
})

const minPoints = computed(() => {
  if (!weatherData.value.days?.length) return []
  return weatherData.value.days.map((d, i) => ({
    x: getX(i, weatherData.value.days.length),
    y: tempToY(d.min_temp_c),
    temp: d.min_temp_c,
  }))
})

const maxLinePoints = computed(() => maxPoints.value.map(p => `${p.x},${p.y}`).join(' '))
const minLinePoints = computed(() => minPoints.value.map(p => `${p.x},${p.y}`).join(' '))

const maxAreaPath = computed(() => {
  if (!maxPoints.value.length) return ''
  const pts = maxPoints.value
  const bottom = chartHeight - chartBottom
  return `M${pts[0].x},${bottom} ` + pts.map(p => `L${p.x},${p.y}`).join(' ') + ` L${pts[pts.length-1].x},${bottom} Z`
})

const minAreaPath = computed(() => {
  if (!minPoints.value.length) return ''
  const pts = minPoints.value
  const bottom = chartHeight - chartBottom
  return `M${pts[0].x},${bottom} ` + pts.map(p => `L${p.x},${p.y}`).join(' ') + ` L${pts[pts.length-1].x},${bottom} Z`
})

const gridLines = computed(() => {
  const lines = []
  const { min, max } = tempRange.value
  const step = Math.ceil((max - min) / 4)
  for (let t = min; t <= max; t += step) {
    lines.push(tempToY(t))
  }
  return lines
})

const tempLabels = computed(() => {
  const labels = []
  const { min, max } = tempRange.value
  const step = Math.ceil((max - min) / 4)
  for (let t = min; t <= max; t += step) {
    labels.push({ y: tempToY(t), text: t })
  }
  return labels
})

// Formatting helpers
const formatShortDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

const formatFullDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`
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

const getUvLevel = (uv) => {
  if (uv == null) return '暂无'
  if (uv <= 2) return '低'
  if (uv <= 5) return '中等'
  if (uv <= 7) return '高'
  if (uv <= 10) return '很高'
  return '极高'
}

const getUvClass = (uv) => {
  if (uv == null) return ''
  if (uv <= 2) return 'uv-low'
  if (uv <= 5) return 'uv-mid'
  if (uv <= 7) return 'uv-high'
  return 'uv-extreme'
}

const getAqiClass = (aqi) => {
  if (aqi == null) return ''
  if (aqi <= 50) return 'aqi-good'
  if (aqi <= 100) return 'aqi-moderate'
  if (aqi <= 150) return 'aqi-unhealthy-sg'
  return 'aqi-unhealthy'
}

defineExpose({ open, close })
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(12px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 2000;
  padding: 40px 20px;
  overflow-y: auto;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: rgba(255, 255, 255, 0.97);
  width: 100%;
  max-width: 680px;
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
  margin-bottom: 28px;
}

.icon-wrap {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #dbeafe, #eff6ff);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 12px;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.5), 0 4px 6px rgba(59, 130, 246, 0.1);
}

.title {
  margin: 0 0 6px 0;
  font-size: 22px;
  font-weight: 800;
  color: var(--text-primary, #0f172a);
}

.subtitle {
  font-size: 14px;
  color: var(--text-muted, #94a3b8);
}

/* Chart */
.chart-section {
  margin-bottom: 28px;
}

.section-title {
  margin: 0 0 14px 0;
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

.chart-container {
  background: var(--bg-primary, #f8fafc);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid var(--border-color, #e2e8f0);
}

.temp-chart {
  width: 100%;
  height: auto;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary, #475569);
  font-weight: 500;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.dot.max { background: #f97316; }
.dot.min { background: #3b82f6; }

/* Day Details */
.days-section {
  margin-bottom: 24px;
}

.days-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.day-detail-card {
  background: var(--bg-primary, #f8fafc);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 16px;
  padding: 16px 20px;
  transition: all 0.2s;
}

.day-detail-card:hover {
  box-shadow: var(--shadow-sm);
  border-color: #cbd5e1;
}

.day-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color, #e2e8f0);
}

.day-detail-date {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-text {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary, #0f172a);
}

.day-badge {
  font-size: 11px;
  background: #dbeafe;
  color: #1d4ed8;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.day-detail-weather {
  display: flex;
  align-items: center;
  gap: 6px;
}

.weather-icon-lg {
  font-size: 22px;
}

.weather-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary, #475569);
}

.day-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.detail-icon {
  font-size: 15px;
  flex-shrink: 0;
}

.detail-label {
  color: var(--text-muted, #94a3b8);
  min-width: 48px;
  font-weight: 500;
}

.detail-value {
  color: var(--text-primary, #0f172a);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail-value.humidity {
  flex: 1;
  gap: 8px;
}

.humidity-bar {
  flex: 1;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  max-width: 60px;
  overflow: hidden;
}

.humidity-fill {
  height: 100%;
  background: linear-gradient(to right, #60a5fa, #3b82f6);
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* UV Badge */
.uv-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 8px;
  font-weight: 600;
}
.uv-low { background: #dcfce7; color: #166534; }
.uv-mid { background: #fef9c3; color: #854d0e; }
.uv-high { background: #fed7aa; color: #9a3412; }
.uv-extreme { background: #fecaca; color: #991b1b; }

/* AQI Badge */
.aqi-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 8px;
  font-weight: 600;
}
.aqi-good { background: #dcfce7; color: #166534; }
.aqi-moderate { background: #fef9c3; color: #854d0e; }
.aqi-unhealthy-sg { background: #fed7aa; color: #9a3412; }
.aqi-unhealthy { background: #fecaca; color: #991b1b; }

/* Footer */
.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.data-source {
  font-size: 12px;
  color: var(--text-muted, #94a3b8);
}

.action-btn {
  padding: 10px 28px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  background: var(--text-primary, #0f172a);
  color: white;
}

.action-btn:hover {
  background: var(--accent-primary, #2563eb);
  transform: translateY(-1px);
}
</style>
