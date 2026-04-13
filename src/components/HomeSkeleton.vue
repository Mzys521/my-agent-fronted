<template>
    <div class="home-page">
        <section class="video-section">
            <video class="video-bg" autoplay muted loop playsinline preload="auto">
                <source src="../assets/bg-video-trim.mp4" type="video/mp4" />
                您的浏览器不支持视频播放。
            </video>
            <div class="video-overlay">
                <h1>探索世界，智能随行</h1>
                <p>AI一键规划行程，覆盖全球目的地，让旅行更简单、更自由</p>
                <div class="search-box" :class="{ 'error': isInputError }">
                    <input v-model="searchKey" type="text" placeholder="输入目的地/景点/关键词" class="search-input"
                        @input="isInputError = false" />
                    <button class="search-btn" @click="doSearch">搜索</button>
                </div>
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
                <h2 class="section-title">本周热门目的地</h2>
                <div class="destination-grid">
                    <div class="destination-card" v-for="(item, index) in destinations" :key="index">
                        <img class="card-img" :src="item.image" :alt="item.title" />
                        <div class="card-info">
                            <span class="badge">{{ item.type }}</span>
                            <h3 class="card-title">{{ item.title }}</h3>
                            <p class="card-desc">{{ item.subtitle }}</p>
                            <div class="card-price">{{ item.price }}</div>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// const bgvideo = ref("../assets/bg-video-trim.mp4")
const router = useRouter()
const searchKey = ref('')
const isInputError = ref(false)
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

const destinations = ref([
    {
        title: '巴厘岛·热带海岛',
        subtitle: '阳光海岸、温柔沙滩与浪漫双人夜。',
        type: '海岛度假',
        price: '4300 3天2晚起',
        image: 'https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=1200&q=80',
    },
    {
        title: '京都·古都巡礼',
        subtitle: '千年寺庙、枫叶与和风美学相遇。',
        type: '人文历史',
        price: '5800 4天3晚起',
        image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
    },
    {
        title: '瑞士·雪山秘境',
        subtitle: '高山湖泊、纯净空气与冬季户外体验。',
        type: '雪山冰川',
        price: '6900 5天4晚起',
        image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    },
])

const advantages = ref([
    {
        icon: '🧭',
        title: '智能规划',
        description: 'AI根据偏好生成最优行程，减少预算和时间浪费。',
    },
    {
        icon: '⚡',
        title: '极速出发',
        description: '推荐热门路线与时令玩法，让旅行决策更快速。',
    },
    {
        icon: '☁️',
        title: '云端同步',
        description: '行程、门票、酒店信息一键同步，随时查看更安心。',
    },
])

const doSearch = () => {
    const value = searchKey.value.trim()
    if (!value) {
        isInputError.value = true
        alert('请输入搜索内容')
        return
    }

    router.push({
        path: '/chat',
        query: {
            userMessage: value
        }
    })
}

const selectTag = (tag) => {
    searchKey.value = tag
    doSearch()
}
</script>

<style>
:root {
    --page-bg: #edf4fb;
    --surface: #ffffff;
    --surface-soft: #f7fbff;
    --text: #1a2438;
    --text-secondary: #58637a;
    --accent: #42b983;
    --accent-strong: #2f805f;
    --border: rgba(42, 105, 154, 0.12);
    --shadow: 0 24px 70px rgba(13, 27, 56, 0.08);
    --radius: 30px;
    font-family: "Microsoft YaHei", "Segoe UI", sans-serif;
    font-size: 16px;
    line-height: 1.75;
    color: var(--text);
    background: var(--page-bg);
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    min-height: 100vh;
    /* background: linear-gradient(180deg, #eff5fb 0%, #f8fbff 100%); */
    color: var(--text);
}

h1,
h2,
h3,
p,
button,
input {
    margin: 0;
}

.home-page {
    min-height: calc(100vh - 120px);
    color: var(--text);
    overflow-x: hidden;
    padding-bottom: 24px;
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
    z-index: -1;
    filter: brightness(0.6) saturate(1.05);
}

.video-overlay {
    width: 100%;
    height: 100%;
    background: rgba(8, 31, 66, 0.24);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 32px;
    padding: 100px 32px 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 22px;
    position: relative;
    box-shadow: 0 30px 80px rgba(15, 37, 76, 0.18);
}

.video-overlay::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, rgba(255, 255, 255, 0.08), transparent 50%);
    pointer-events: none;
    border-radius: inherit;
}

.video-overlay h1 {
    font-size: clamp(3rem, 5vw, 4.4rem);
    line-height: 1.02;
    font-weight: 800;
    letter-spacing: -0.05em;
    text-shadow: 0 22px 90px rgba(0, 0, 0, 0.32);
    color: #fff;
}

.video-overlay p {
    font-size: 1.05rem;
    max-width: 720px;
    color: rgba(255, 255, 255, 0.92);
    line-height: 1.8;
}

.search-box {
    display: flex;
    width: 600px;
    max-width: 90%;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 50px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    overflow: hidden;
    position: relative;
    z-index: 1;
    animation: fadeInUp 1s ease-out 0.4s both;
}

.search-box.error {
    border-color: #ef4444;
    box-shadow: 0 8px 32px rgba(239, 68, 68, 0.3);
}

.search-input {
    flex: 1;
    padding: 18px 24px;
    border: none;
    border-radius: 50px 0 0 50px;
    font-size: 16px;
    outline: none;
    background: transparent;
    color: #333;
}

.search-input::placeholder {
    color: #999;
    font-weight: 400;
}

.search-input:focus {
    background: rgba(255, 255, 255, 0.98);
}

.search-btn {
    padding: 18px 32px;
    background: linear-gradient(135deg, #42b983, #359469);
    color: #fff;
    border: none;
    border-radius: 0 50px 50px 0;
    cursor: pointer;
    transition: background 0.3s ease, box-shadow 0.3s ease;
    font-weight: 600;
    font-size: 16px;
}

.search-btn:hover {
    background: linear-gradient(135deg, #359469, #2a7d4a);
    box-shadow: 0 6px 20px rgba(66, 185, 131, 0.4);
}

.category-section {
    padding: 60px 0;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    margin: 30px 0;
    border-radius: 20px;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
    position: relative;
    overflow: hidden;
}

.category-section::before {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #42b983, #667eea, #764ba2);
}

.section-title {
    text-align: center;
    font-size: 36px;
    color: #1a202c;
    margin-bottom: 40px;
    font-weight: 700;
    position: relative;
}

.section-title::after {
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 4px;
    background: linear-gradient(135deg, #42b983, #667eea);
    border-radius: 2px;
}

.category-tags {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px;
    max-width: 1200px;
    margin: 0 auto;
}

.tag {
    padding: 12px 24px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 2px solid #e2e8f0;
    border-radius: 50px;
    color: #4a5568;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.tag::before {

    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(66, 185, 131, 0.1), transparent);
    transition: left 0.5s;
}

.tag:hover::before {
    left: 100%;
}

.tag:hover {
    background: linear-gradient(135deg, #42b983, #359469);
    color: #fff;
    border-color: #42b983;
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(66, 185, 131, 0.3);
}

.destination-section {
    padding: 80px 0;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

.destination-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 32px;
    margin-top: 50px;
    max-width: 1400px;
    margin-left: auto;
    margin-right: auto;
}

.destination-card {
    background: #fff;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    transition: all 0.4s ease;
    position: relative;
    border: 1px solid rgba(255, 255, 255, 0.8);
}

.destination-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #42b983, #667eea);
    transform: scaleX(0);
    transition: transform 0.3s ease;
}

.destination-card:hover::before {
    transform: scaleX(1);
}

.destination-card:hover {
    transform: translateY(-12px) scale(1.02);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.card-img {
    width: 100%;
    height: 220px;
    object-fit: cover;
    transition: transform 0.4s ease;
}

.destination-card:hover .card-img {
    transform: scale(1.1);
}

.card-info {
    padding: 28px;
    position: relative;
}

.badge {
    display: inline-flex;
    margin-bottom: 14px;
    padding: 8px 14px;
    border-radius: 999px;
    background: rgba(66, 185, 131, 0.12);
    color: #2c8c6d;
    font-size: 0.9rem;
    font-weight: 700;
}

.advantage-item {
    background: #ffffff;
    border-radius: 28px;
    padding: 42px 28px 32px;
    box-shadow: 0 20px 60px rgba(17, 50, 96, 0.08);
    border: 1px solid rgba(66, 185, 131, 0.12);
    position: relative;
}

.card-title {
    font-size: 20px;
    color: #1a202c;
    margin-bottom: 12px;
    font-weight: 600;
    line-height: 1.4;
}

.card-desc {
    font-size: 15px;
    color: #718096;
    margin-bottom: 18px;
    line-height: 1.6;
}

.card-price {
    color: #42b983;
    font-weight: 700;
    font-size: 18px;
    position: relative;
}

.card-price::before {
    content: '¥';
    font-size: 14px;
    margin-right: 2px;
}

.advantage-section {
    padding: 100px 0;
    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
    margin: 60px 0;
    position: relative;
    overflow: hidden;
}

.advantage-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 80%, rgba(66, 185, 131, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(102, 126, 234, 0.05) 0%, transparent 50%);
}

.advantage-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 40px;
    margin-top: 60px;
    text-align: center;
    max-width: 1400px;
    margin-left: auto;
    margin-right: auto;
    position: relative;
    z-index: 1;
}

.advantage-icon {
    width: 80px;
    height: 80px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 20px;
    background: linear-gradient(135deg, #42b983, #359469);
    color: #fff;
    font-size: 32px;
    margin-bottom: 24px;
    box-shadow: 0 8px 24px rgba(66, 185, 131, 0.3);
    transition: all 0.3s ease;
    position: relative;
}

.advantage-icon::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 22px;
    background: linear-gradient(135deg, #42b983, #667eea);
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.advantage-icon:hover {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 12px 32px rgba(66, 185, 131, 0.4);
}

.advantage-icon:hover::before {
    opacity: 1;
}

.advantage-title {
    font-size: 22px;
    color: #1a202c;
    margin-bottom: 16px;
    font-weight: 600;
}

.advantage-desc {
    font-size: 16px;
    color: #4a5568;
    line-height: 1.7;
    max-width: 300px;
    margin: 0 auto;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideInLeft {
    from {
        opacity: 0;
        transform: translateX(-50px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(50px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@media (max-width: 768px) {
    .video-section {
        height: 480px;
    }

    .video-overlay h1 {
        font-size: 36px;
        margin-bottom: 20px;
    }

    .video-overlay p {
        font-size: 18px;
        margin-bottom: 32px;
    }

    .search-box {
        width: 90%;
        flex-direction: column;
    }

    .search-input {
        border-radius: 50px 50px 0 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }

    .search-btn {
        border-radius: 0 0 50px 50px;
    }

    .category-section {
        padding: 40px 20px;
        margin: 20px 0;
        border-radius: 16px;
    }

    .section-title {
        font-size: 28px;
        margin-bottom: 32px;
    }

    .category-tags {
        gap: 12px;
    }

    .tag {
        padding: 10px 20px;
        font-size: 14px;
    }

    .destination-section {
        padding: 60px 20px;
    }

    .destination-grid {
        grid-template-columns: 1fr;
        gap: 24px;
        margin-top: 40px;
    }

    .destination-card {
        max-width: 100%;
    }

    .advantage-section {
        padding: 60px 20px;
        margin: 40px 0;
    }

    .advantage-grid {
        grid-template-columns: 1fr;
        gap: 32px;
        margin-top: 40px;
    }

    .advantage-icon {
        width: 70px;
        height: 70px;
        font-size: 28px;
    }

    .advantage-title {
        font-size: 20px;
    }

    .advantage-desc {
        font-size: 15px;
    }
}

@media (max-width: 480px) {
    .video-overlay h1 {
        font-size: 28px;
    }

    .video-overlay p {
        font-size: 16px;
    }

    .search-input,
    .search-btn {
        padding: 16px 20px;
        font-size: 15px;
    }

    .section-title {
        font-size: 24px;
    }

    .tag {
        padding: 8px 16px;
        font-size: 13px;
    }

    .card-info {
        padding: 20px;
    }

    .card-title {
        font-size: 18px;
    }

    .card-desc {
        font-size: 14px;
    }
}
</style>
