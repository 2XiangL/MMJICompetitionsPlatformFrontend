<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3>关于我们</h3>
        <p>MMJI竞赛管理平台致力于为学生提供优质的竞赛信息服务，帮助学生更好地参与各类学术竞赛活动。</p>
      </div>

      <div class="footer-section">
        <h3>快速链接</h3>
        <ul>
          <li><a href="/">首页</a></li>
          <li><a href="/competitions">竞赛列表</a></li>
          <li><a href="/teams">团队管理</a></li>
          <li><a href="/about">关于我们</a></li>
        </ul>
      </div>

      <div class="footer-section">
        <h3>联系我们</h3>
        <p><el-icon><Message /></el-icon> 邮箱：contact@mmji.edu.cn</p>
        <p><el-icon><Location /></el-icon> 地址：湖北大学曼城联合学院103办公室</p>
      </div>

      <div class="footer-section">
        <h3>Powered By:</h3>
        <p>湖北大学曼城联合学院</p>
        <p>湖北大学曼城联合学院学生会学术科技部</p>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; 2025 MMJI竞赛管理平台. All rights reserved.</p>
    </div>
  </footer>
</template>

<script setup>
import { Message, Location } from '@element-plus/icons-vue'
</script>

<style scoped>
.app-footer {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 40px 0 20px;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-bottom: 30px;
}

.footer-section h3 {
  color: #667eea;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.footer-section p {
  margin: 8px 0;
  font-size: 0.9rem;
  line-height: 1.5;
  opacity: 0.9;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section ul li {
  margin: 8px 0;
}

.footer-section ul li a {
  color: white;
  text-decoration: none;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.footer-section ul li a:hover {
  opacity: 1;
  color: #667eea;
}

.footer-section p {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-bottom {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.8rem;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .footer-section ul li {
    text-align: center;
  }
}
</style>
