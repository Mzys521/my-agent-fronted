<template>
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-col">
                    <h3>旅行智能体</h3>
                    <ul>
                        <li><a href="#">关于我们</a></li>
                        <li><a href="#">联系我们</a></li>
                        <li><a href="#">隐私政策</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h3>目的地</h3>
                    <ul>
                        <li><a href="#">国内游</a></li>
                        <li><a href="#">出境游</a></li>
                        <li><a href="#">周边游</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h3>服务</h3>
                    <ul>
                        <li><a href="#">行程规划</a></li>
                        <li><a href="#">酒店预订</a></li>
                        <li><a href="#">景点门票</a></li>
                    </ul>
                </div>
            </div>
            <div class="copyright">© 2026 旅行智能体 版权所有</div>
        </div>
    </footer>
</template>

<script setup>
</script>

<style>
.footer {
    background: #333;
    color: #fff;
    padding: 40px 0;
    margin-top: 40px;
}

.footer-content {
    display: flex;
    flex-wrap: wrap;
    gap: 30px;
}

.footer-col {
    flex: 1;
    min-width: 200px;
}

.footer-col h3 {
    font-size: 18px;
    margin-bottom: 20px;
    color: #42b983;
}

.footer-col ul {
    list-style: none;
}

.footer-col li {
    margin-bottom: 10px;
}

.footer-col a {
    color: #ccc;
    text-decoration: none;
    font-size: 14px;
}

.copyright {
    text-align: center;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #444;
    color: #888;
    font-size: 14px;
}
</style>