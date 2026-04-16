<template>
    <div class="home-page">
        <section class="video-section">
            <video class="video-bg" autoplay muted loop playsinline preload="auto">
                <source src="../assets/bg-video-trim.mp4" type="video/mp4" />
                您的浏览器不支持视频播放。
            </video>
            <div class="video-overlay">
                <div class="hero-particles" aria-hidden="true">
                    <span
                        v-for="particle in heroParticles"
                        :key="particle.id"
                        class="particle"
                        :style="particle.style"
                    />
                </div>

                <h1>探索世界，智能随行</h1>
                <p>AI 一键规划行程，覆盖全球目的地，让旅行更简单、更自由</p>

                <div
                    ref="searchShellRef"
                    class="search-shell"
                    :style="searchShellStyle"
                    @mousemove="handleSearchPointerMove"
                    @mouseleave="resetSearchPointer"
                >
                    <div class="search-box" :class="{ error: isInputError }">
                        <div class="search-input-wrap">
                            <input
                                v-model="searchKey"
                                type="text"
                                placeholder="输入目的地/景点/关键词"
                                class="search-input"
                                @input="isInputError = false"
                            />
                        </div>
                        <button class="search-btn" @click="doSearch">搜索</button>
                    </div>
                </div>

                <button class="history-entry-btn" @click="goToHistory">进入历史会话</button>
            </div>
        </section>

        <section class="category-section">
            <div class="container">
                <h2 class="section-title">热门旅行分类</h2>
                <div class="category-tags">
                    <div class="tag" v-for="(tag, index) in categoryTags" :key="index" @click="selectTag(tag)">
                        {{ tag }}
                    </div>
                </div>
            </div>
        </section>

        <section class="destination-section">
            <div class="container">
                <h2 class="section-title">本周热门景点 TOP3</h2>
                <div class="destination-grid">
                    <div class="destination-card" v-for="item in destinations" :key="item.id">
                        <div class="card-media">
                            <img class="card-img" :src="item.image" :alt="item.name" />
                        </div>
                        <div class="card-info">
                            <span class="badge">{{ item.styleTag }}</span>
                            <h3 class="card-title">{{ item.name }}</h3>
                            <p class="card-location">{{ item.location }}</p>
                            <p class="card-desc">{{ item.intro }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="advantage-section">
            <div class="container">
                <h2 class="section-title">为什么选择我们</h2>
                <div class="advantage-grid">
                    <div class="advantage-item" v-for="(item, index) in advantages" :key="index">
                        <div class="advantage-icon">{{ item.icon }}</div>
                        <h3 class="advantage-title">{{ item.title }}</h3>
                        <p class="advantage-desc">{{ item.description }}</p>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchWeeklyHotSpots } from '../api/hotSpots'

const router = useRouter()
const searchKey = ref('')
const isInputError = ref(false)

const searchShellRef = ref(null)
const rotateX = ref(0)
const rotateY = ref(0)
const searchShellStyle = computed(() => ({
    transform: `perspective(1200px) rotateX(${rotateX.value}deg) rotateY(${rotateY.value}deg)`,
}))

const heroParticles = Array.from({ length: 16 }, (_, index) => {
    const left = (index * 7 + 5) % 100
    const top = (index * 11 + 9) % 100
    const delay = `${(index % 6) * 0.7}s`
    const duration = `${8 + (index % 5) * 1.7}s`
    const size = 4 + (index % 4) * 2
    return {
        id: `particle-${index}`,
        style: {
            left: `${left}%`,
            top: `${top}%`,
            width: `${size}px`,
            height: `${size}px`,
            animationDelay: delay,
            animationDuration: duration,
        },
    }
})

const categoryTags = ref([
    '自然风光',
    '人文历史',
    '都市繁华',
    '海岛度假',
    '雪山冰川',
    '古镇风情',
    '美食之旅',
    '探险徒步',
])

const defaultDestinations = [
    {
        id: 'west-lake',
        name: '西湖',
        location: '浙江·杭州',
        styleTag: '湖山诗意',
        intro: '三面云山一面城，晨昏光影和湖岸慢行都很治愈。',
        image: 'https://picsum.photos/seed/west-lake/1200/900',
    },
    {
        id: 'gulangyu',
        name: '鼓浪屿',
        location: '福建·厦门',
        styleTag: '海岛人文',
        intro: '红瓦老别墅与海风并行，适合边走边拍的文艺小岛。',
        image: 'https://picsum.photos/seed/gulangyu/1200/900',
    },
    {
        id: 'jiuzhaigou',
        name: '九寨沟',
        location: '四川·阿坝州',
        styleTag: '高原秘境',
        intro: '层林彩池与瀑布群交错，色彩层次在晴天尤为惊艳。',
        image: 'https://picsum.photos/seed/jiuzhaigou/1200/900',
    },
]
const destinations = ref([...defaultDestinations])

const advantages = ref([
    {
        icon: 'AI',
        title: '智能规划',
        description: 'AI 根据偏好生成更契合的路线，减少预算和时间浪费。',
    },
    {
        icon: '快',
        title: '极速出发',
        description: '推荐热门路线与时令玩法，让旅行决策更高效。',
    },
    {
        icon: '云',
        title: '云端同步',
        description: '行程、门票、酒店信息一键同步，随时查看更安心。',
    },
])

const normalizeImage = (image) => {
    if (!image || typeof image !== 'string') return ''
    if (image.startsWith('/')) return image
    return image
}

const handleSearchPointerMove = (event) => {
    const shell = searchShellRef.value
    if (!shell) return
    const rect = shell.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2
    rotateY.value = Number((x * 3.2).toFixed(2))
    rotateX.value = Number((-y * 2.6).toFixed(2))
}

const resetSearchPointer = () => {
    rotateX.value = 0
    rotateY.value = 0
}

const doSearch = () => {
    const value = searchKey.value.trim()
    if (!value) {
        isInputError.value = true
        window.alert('请输入搜索内容')
        return
    }

    router.push({
        path: '/chat',
        query: { userMessage: value },
    })
}

const selectTag = (tag) => {
    searchKey.value = tag
    doSearch()
}

const goToHistory = () => {
    router.push({ path: '/chat' })
}

const loadWeeklyHotSpots = async () => {
    try {
        const response = await fetchWeeklyHotSpots(3)
        const items = response?.items
        if (Array.isArray(items) && items.length > 0) {
            destinations.value = items.slice(0, 3).map((item) => ({
                id: item.id,
                name: item.name,
                location: item.location,
                styleTag: item.styleTag,
                intro: item.intro,
                image: normalizeImage(item.image),
            }))
        }
    } catch (error) {
        console.warn('Failed to load weekly hot spots, using fallback data.', error)
        destinations.value = [...defaultDestinations]
    }
}

onMounted(() => {
    loadWeeklyHotSpots()
})
</script>

<style>
:root {
    --page-bg: #edf4fb;
    --text: #1a2438;
    --accent: #1ca27a;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.home-page {
    min-height: calc(100vh - 120px);
    color: var(--text);
    overflow-x: hidden;
    padding-bottom: 24px;
    font-family: "HarmonyOS Sans SC", "Noto Sans SC", "Microsoft YaHei", sans-serif;
}

.container {
    width: min(1200px, 100%);
    margin: 0 auto;
    padding: 0 24px;
}

.video-section {
    position: relative;
    width: 100%;
    min-height: 700px;
    overflow: hidden;
    display: grid;
    place-items: center;
}

.video-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: -2;
    filter: brightness(0.56) saturate(1.08);
}

.video-overlay {
    position: relative;
    width: 100%;
    height: 100%;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 32px;
    padding: 100px 32px 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 20px;
    box-shadow: 0 30px 80px rgba(15, 37, 76, 0.2);
    background:
        radial-gradient(circle at 20% 10%, rgba(62, 189, 224, 0.18), transparent 35%),
        radial-gradient(circle at 80% 90%, rgba(47, 158, 125, 0.18), transparent 40%),
        rgba(8, 31, 66, 0.26);
    overflow: hidden;
}

.video-overlay h1 {
    font-size: clamp(3rem, 5vw, 4.4rem);
    line-height: 1.02;
    font-weight: 900;
    letter-spacing: -0.04em;
    color: #fff;
    text-shadow: 0 8px 32px rgba(6, 22, 45, 0.28);
}

.video-overlay p {
    font-size: 1.08rem;
    max-width: 780px;
    color: rgba(255, 255, 255, 0.92);
    line-height: 1.8;
}

.hero-particles {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
}

.particle {
    position: absolute;
    border-radius: 999px;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(101, 246, 223, 0.65));
    box-shadow: 0 0 16px rgba(120, 242, 229, 0.45);
    animation: particleFloat 10s ease-in-out infinite;
    opacity: 0.55;
}

@keyframes particleFloat {
    0% {
        transform: translate3d(0, 0, 0) scale(0.8);
        opacity: 0.3;
    }
    50% {
        transform: translate3d(12px, -18px, 0) scale(1.15);
        opacity: 0.88;
    }
    100% {
        transform: translate3d(-10px, -36px, 0) scale(0.78);
        opacity: 0.2;
    }
}

.search-shell {
    width: min(720px, 92%);
    position: relative;
    z-index: 2;
    transition: transform 0.2s ease;
}

.search-box {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(245, 252, 255, 0.92));
    box-shadow:
        0 12px 35px rgba(5, 24, 52, 0.28),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
    transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.search-box.error {
    border-color: rgba(248, 113, 113, 0.9);
    box-shadow:
        0 12px 35px rgba(5, 24, 52, 0.28),
        0 0 0 4px rgba(248, 113, 113, 0.24);
}

.search-shell:hover .search-box,
.search-shell:focus-within .search-box {
    border-color: rgba(81, 221, 186, 0.9);
    box-shadow:
        0 14px 40px rgba(5, 24, 52, 0.3),
        0 0 0 4px rgba(70, 201, 165, 0.24);
}

.search-input-wrap {
    min-width: 0;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.72);
    padding: 0 6px;
}

.search-input {
    width: 100%;
    border: none;
    background: transparent;
    outline: none;
    padding: 16px 20px;
    font-size: 17px;
    color: #1f2f45;
}

.search-input::placeholder {
    color: #8ba0b6;
}

.search-btn {
    border: none;
    border-radius: 999px;
    min-width: 120px;
    padding: 15px 30px;
    background: linear-gradient(135deg, #16a979, #0d8f68);
    color: #fff;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.02em;
    cursor: pointer;
    box-shadow: 0 8px 20px rgba(20, 142, 104, 0.38);
    transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
}

.search-btn:hover {
    transform: translateY(-1px) scale(1.02);
    box-shadow: 0 12px 24px rgba(20, 142, 104, 0.42);
    filter: saturate(1.06);
}

.search-btn:active {
    transform: translateY(0);
}

.history-entry-btn {
    margin-top: 6px;
    padding: 12px 24px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.42);
    background: rgba(10, 28, 56, 0.34);
    color: #ffffff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    z-index: 2;
    transition: all 0.2s ease;
}

.history-entry-btn:hover {
    background: rgba(14, 39, 74, 0.56);
    border-color: rgba(159, 248, 235, 0.7);
}

.category-section,
.destination-section,
.advantage-section {
    padding: 70px 0;
}

.section-title {
    text-align: center;
    font-size: 34px;
    color: #1a202c;
    margin-bottom: 36px;
    font-weight: 700;
}

.category-tags {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 14px;
}

.tag {
    padding: 10px 18px;
    border: 1px solid #d5e2ee;
    border-radius: 999px;
    background: #fff;
    color: #4a5568;
    cursor: pointer;
    transition: 0.2s ease;
}

.tag:hover {
    background: #42b983;
    color: #fff;
}

.destination-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 28px;
}

.destination-card {
    position: relative;
    background: #fff;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    transition: transform 0.35s ease, box-shadow 0.35s ease;
    transform-style: preserve-3d;
}

.destination-card::after {
    content: '';
    position: absolute;
    inset: -120% 35% auto -45%;
    height: 220%;
    background: linear-gradient(
        115deg,
        rgba(255, 255, 255, 0) 12%,
        rgba(255, 255, 255, 0.32) 45%,
        rgba(255, 255, 255, 0) 78%
    );
    transform: translateX(-130%) rotate(8deg);
    transition: transform 0.55s ease;
    pointer-events: none;
}

.destination-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 22px 42px rgba(14, 44, 86, 0.18);
}

.destination-card:hover::after {
    transform: translateX(165%) rotate(8deg);
}

.card-media {
    position: relative;
    overflow: hidden;
    height: 236px;
    background: linear-gradient(140deg, #dce6f4, #f4f8ff);
}

.card-media::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 16% 20%, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0));
    pointer-events: none;
    z-index: 1;
}

.card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 44%;
    transform: scale(1.1);
    transition: transform 0.45s ease;
    will-change: transform;
}

.destination-card:hover .card-img {
    transform: scale(1.17);
}

.card-info {
    padding: 24px;
}

.badge {
    display: inline-flex;
    margin-bottom: 10px;
    padding: 6px 12px;
    border-radius: 999px;
    background: rgba(66, 185, 131, 0.12);
    color: #2c8c6d;
    font-size: 0.85rem;
    font-weight: 700;
}

.card-title {
    font-size: 20px;
    color: #1a202c;
    margin-bottom: 8px;
    font-weight: 600;
}

.card-location {
    font-size: 13px;
    color: #2c8c6d;
    margin-bottom: 8px;
}

.card-desc {
    font-size: 15px;
    color: #718096;
    line-height: 1.6;
}

.advantage-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 30px;
    text-align: center;
}

.advantage-item {
    background: #ffffff;
    border-radius: 20px;
    padding: 32px 24px;
    box-shadow: 0 10px 32px rgba(17, 50, 96, 0.08);
}

.advantage-icon {
    width: 62px;
    height: 62px;
    margin: 0 auto 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    background: linear-gradient(135deg, #42b983, #359469);
    color: #fff;
    font-weight: 700;
}

.advantage-title {
    font-size: 20px;
    margin-bottom: 10px;
}

.advantage-desc {
    font-size: 15px;
    color: #4a5568;
    line-height: 1.7;
}

@media (max-width: 768px) {
    .video-section {
        min-height: 540px;
    }

    .video-overlay {
        padding: 72px 18px 42px;
    }

    .video-overlay h1 {
        font-size: clamp(2.1rem, 10vw, 2.8rem);
    }

    .video-overlay p {
        font-size: 0.95rem;
    }

    .search-box {
        padding: 8px;
        gap: 8px;
    }

    .search-input {
        padding: 13px 16px;
        font-size: 15px;
    }

    .search-btn {
        min-width: 96px;
        padding: 12px 18px;
        font-size: 16px;
    }

    .destination-grid,
    .advantage-grid {
        grid-template-columns: 1fr;
    }
}
</style>
