<template>
  <div class="home-container">
    <!-- 标题区域 -->
    <div class="header">
      <h1 class="title">AT Master Plus</h1>
      <p class="subtitle">智能串口调试工具</p>
    </div>

    <!-- 设备选择卡片 -->
    <div class="device-grid">
      <div class="device-card zte-card" @click="navigateTo('zc')">
        <div class="device-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 9h6M9 15h6" />
          </svg>
        </div>
        <h3 class="device-name">中兴微</h3>
        <p class="device-desc">ZTE Microchip</p>
        <div class="device-features">
          <span class="feature-tag">IMEI读写</span>
          <span class="feature-tag">MAC配置</span>
          <span class="feature-tag">频段锁定</span>
        </div>
      </div>

      <div class="device-card asr-card" @click="navigateTo('asr')">
        <div class="device-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M15.5 8.5a3 3 0 1 0 0 6" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <h3 class="device-name">ASR</h3>
        <p class="device-desc">ASR Microelectronics</p>
        <div class="device-features">
          <span class="feature-tag">IMEI读写</span>
          <span class="feature-tag">SN配置</span>
          <span class="feature-tag">频段锁定</span>
        </div>
      </div>

      <div class="device-card sprd-card" @click="navigateTo('sprd')">
        <div class="device-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <h3 class="device-name">展锐</h3>
        <p class="device-desc">Spreadtrum</p>
        <div class="device-features">
          <span class="feature-tag">双IMEI</span>
          <span class="feature-tag">频段锁定</span>
          <span class="feature-tag">设备重启</span>
        </div>
      </div>
    </div>

    <!-- 注意事项 -->
    <div class="notice-card">
      <div class="notice-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 9v2m0 4h.01" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      </div>
      <div class="notice-content">
        <h4 class="notice-title">使用说明</h4>
        <ul class="notice-list">
          <li>需要先安装对应驱动到电脑</li>
          <li>支持基于 Chromium 内核的浏览器</li>
          <li>串行端口需要选择 AT 端口</li>
          <li>若发现数据不对，请多点几次读取按钮刷新数据</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    navigateTo(path) {
      this.$router.push({ path })
    }
  }
}
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 48px;
}

.title {
  font-size: 42px;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  letter-spacing: -1px;
}

.subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 400;
}

.device-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.device-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 32px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.device-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.zte-card::before {
  background: linear-gradient(90deg, #e74c3c, #c0392b);
}

.asr-card::before {
  background: linear-gradient(90deg, #3498db, #2980b9);
}

.sprd-card::before {
  background: linear-gradient(90deg, #2ecc71, #27ae60);
}

.device-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  background: rgba(255, 255, 255, 0.08);
}

.device-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  font-size: 28px;
  transition: all 0.3s ease;
}

.zte-card .device-icon {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.2), rgba(192, 57, 43, 0.1));
  color: #e74c3c;
}

.asr-card .device-icon {
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.2), rgba(41, 128, 185, 0.1));
  color: #3498db;
}

.sprd-card .device-icon {
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.2), rgba(39, 174, 96, 0.1));
  color: #2ecc71;
}

.device-card:hover .device-icon {
  transform: scale(1.1);
}

.device-name {
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
}

.device-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 20px;
}

.device-features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.feature-tag {
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

.notice-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 20px;
}

.notice-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(234, 179, 8, 0.1));
  color: #fbbf24;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 20px;
}

.notice-content {
  flex: 1;
}

.notice-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 12px;
}

.notice-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.notice-list li {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  padding: 6px 0;
  padding-left: 20px;
  position: relative;
}

.notice-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #22c55e;
  font-size: 12px;
}

@media (max-width: 768px) {
  .title {
    font-size: 28px;
  }

  .subtitle {
    font-size: 14px;
  }

  .device-grid {
    grid-template-columns: 1fr;
  }

  .notice-card {
    flex-direction: column;
  }
}
</style>