<template>
  <div class="at-container">
    <!-- 顶部操作栏 -->
    <div class="top-bar">
      <div class="port-section">
        <button class="btn-port" :class="{ 'port-active': isOpen }" @click="click">
          <span class="port-icon">{{ isOpen ? '✓' : '○' }}</span>
          选择端口
          <span class="port-status">{{ isOpen ? '已开启' : '未开启' }}</span>
        </button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content" v-show="isOpen">
      <div class="card-grid">
        <!-- 工厂模式 -->
        <div class="card">
          <h3 class="card-title">工厂模式</h3>
          <div class="btn-group">
            <button class="btn btn-warning" @click="write('AT*PROD=1')">进入工厂模式</button>
            <button class="btn btn-secondary" @click="write('AT*PROD=0')">退出工厂模式</button>
          </div>
          <p class="warning-text">需开启工厂模式才能写号，写入之前先删除</p>
        </div>

        <!-- IMEI配置 -->
        <div class="card">
          <h3 class="card-title">IMEI 配置</h3>
          <div class="input-group">
            <label>IMEI</label>
            <input type="text" class="form-input" v-model="imei" placeholder="请输入IMEI">
            <div class="btn-group">
              <button class="btn btn-primary" @click="write('AT+CGSN')">读取</button>
              <button class="btn btn-danger" @click="write('AT*MRD_IMEI=D')">删除</button>
              <button class="btn btn-success" @click="write('AT*MRD_IMEI=W,0,01JAN1970,' + imei)">写入</button>
            </div>
          </div>
        </div>

        <!-- SN配置 -->
        <div class="card">
          <h3 class="card-title">SN 配置</h3>
          <div class="input-group">
            <label>SN 号</label>
            <input type="text" class="form-input" v-model="sn" placeholder="仅支持有SN号的设备">
            <div class="btn-group">
              <button class="btn btn-primary" @click="write('AT*MRD_SN?')">读取</button>
              <button class="btn btn-danger" @click="write('AT*MRD_SN=D')">删除</button>
              <button class="btn btn-success" @click="write('AT*MRD_SN=W,0,01JAN1970,' + sn)">写入</button>
            </div>
          </div>
        </div>

        <!-- MAC配置 -->
        <div class="card">
          <h3 class="card-title">MAC 配置</h3>
          <div class="input-group">
            <label>WiFi MAC</label>
            <input type="text" class="form-input" v-model="mac" placeholder="请输入MAC地址">
            <div class="btn-group">
              <button class="btn btn-primary" @click="write('AT*MRD_WIFIID?')">读取</button>
              <button class="btn btn-danger" @click="write('AT*MRD_WIFIID=D')">删除</button>
              <button class="btn btn-success" @click="write('AT*MRD_WIFIID=W,0,01JAN1970,' + mac)">写入</button>
            </div>
          </div>
        </div>

        <!-- SIM切换 -->
        <div class="card">
          <h3 class="card-title">SIM 切换</h3>
          <div class="btn-group">
            <button class="btn btn-primary" @click="write('AT+SWSIM=0')">切到卡1</button>
            <button class="btn btn-primary" @click="write('AT+SWSIM=1')">切到卡2</button>
            <button class="btn btn-danger" @click="write('AT+RESET')">重启设备</button>
          </div>
        </div>

        <!-- 频段配置 -->
        <div class="card card-wide">
          <h3 class="card-title">LTE 频段锁定</h3>
          <div class="band-section">
            <div class="band-checkboxes">
              <label v-for="item in list" :key="item" class="band-checkbox">
                <input type="checkbox" v-model.number="checked" :value="item">
                <span class="band-label">B{{ item }}</span>
              </label>
            </div>
            <div class="band-actions">
              <button class="btn btn-primary" @click="getBand">读取频段</button>
              <button class="btn btn-success" @click="submit">锁定频段</button>
            </div>
            <p class="hint">显示的频段不一定支持，能成功锁定的频段才算是支持</p>
          </div>
        </div>

        <!-- 自定义指令 -->
        <div class="card card-wide">
          <h3 class="card-title">自定义 AT 指令</h3>
          <div class="custom-command">
            <input type="text" class="form-input" v-model="dataW" placeholder="发送自定义AT指令">
            <button class="btn btn-primary" @click="write()">发送</button>
          </div>
        </div>
      </div>

      <!-- 日志输出区 -->
      <div class="log-section">
        <div class="log-header">
          <h3 class="log-title">串口日志</h3>
          <button class="btn btn-danger btn-sm" @click="dataR = ''">清空日志</button>
        </div>
        <textarea id="scroll_text" class="log-textarea" v-model="dataR" readonly></textarea>
      </div>
    </div>

    <!-- 未连接提示 -->
    <div class="no-connection" v-show="!isOpen">
      <div class="no-connection-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 20V10" />
          <path d="M18 20V4" />
          <path d="M6 20v-6" />
        </svg>
      </div>
      <h3>请先选择串口</h3>
      <p>点击上方按钮选择AT端口进行连接</p>
    </div>
  </div>
</template>

<script>
export default {
  mixins: [],
  data() {
    return {
      port: {},
      reader: {},
      isOpen: false,
      dataR: '',
      dataW: '',
      timer: null,
      reader: {},
      writer: {},
      list: [1, 3, 5, 8, 38, 39, 40, 41],
      checked: [],
      imei: '',
      sn: '',
      mac: '',
      bandStr: '',
      ip: '192.168.0.1'
    };
  },
  computed: {
  },
  created() {
    window.that = this
    this.timer = setInterval(() => {
      this.isOpen = !!this.port.readable
    }, 100)
  },
  methods: {
    async click() {
      if (!navigator.serial) {
        alert('该浏览器不支持，仅支持基于chromium内核的pc浏览器')
        return;
      }
      try {
        if (this.port.getInfo && this.port.readable) {
          try {
            this.reader.releaseLock()
            this.writer.releaseLock()
          } catch (error) { }
          await this.port.close()
          this.reader = {}
        } else {
          const port = await navigator.serial.requestPort();
          this.port = port
          if (!this.port.readable) {
            // 打开串口
            await port.open({
              dataBits: 8, // 数据位
              stopBits: 1, // 停止位
              parity: "none", // 奇偶校验
              baudRate: 9600, // 波特率
            });
            this.reader = this.port.readable.getReader();
            this.writer = this.port.writable.getWriter()
            this.write('AT+CGSN')
            setTimeout(() => { this.write('AT*MRD_SN?') }, 500)
            setTimeout(() => { this.write('AT*MRD_WIFIID?') }, 1000)
            setTimeout(() => { this.getBand() }, 1500)
          }
        }
      } catch (error) {
        console.log('error', error)
        error.message && !error.message.includes('No port selected by the user') && alert(error.message)
      }

    },
    getBand() {
      this.write('AT*BAND?')
    },
    async read() {
      const reader = this.reader
      // 监听来自串口的数据
      const { value, done } = await reader.read();
      let str = Uint8ArrayToString(value)
      console.log('接收', str)
      this.dataR += str
      this.dataHandler(str)
    },
    async write(atStr) {
      const writer = this.writer;
      let str = (atStr || this.dataW) + '\r\n'
      // this.dataR += str
      // console.log('发送', str)
      let arr = stringToUint8Array(str)
      await writer.write(arr);
      setTimeout(() => {
        this.read()
      }, 500);
    },
    dataHandler(str) {
      let bandStr = 'ZLTEAMTBAND: '
      bandStr = '*BAND:'
      if (str.includes(bandStr) && str.length > 20) {
        this.bandStr = str.split(bandStr)[1].split('\r\n')[0]
        let arr = str.split(',')
        let bandH = parseInt(arr[3]).toString(2).split('').reverse()
        let bandL = parseInt(arr[4]).toString(2).split('').reverse()
        let checked = []
        bandH.forEach((item, index) => {
          if (item === '1') {
            if (index === 5) {
              checked.push(38)
            }
            if (index === 6) {
              checked.push(39)
            }
            if (index === 7) {
              checked.push(40)
            }
            if (index === 8) {
              checked.push(41)
            }
          }
        })
        bandL.forEach((item, index) => {
          if (item === '1' && [1, 3, 5, 8].includes(index + 1)) {
            checked.push(index + 1)
          }
        })
        this.checked = checked
      }
      bandStr = '+CGSN: '
      if (str.includes(bandStr)) {
        this.imei = str.split(bandStr)[1].split('\r\n')[0]
      }
      bandStr = 'AT+CGSN\r\r\n'
      if (!str.includes('+CGSN: ') && str.includes(bandStr)) {
        this.imei = str.split(bandStr)[1].split('\r\n')[0]
      }
      bandStr = '*MRD_SN:'
      if (str.includes(bandStr)) {
        this.sn = str.split(bandStr)[1].split('\r\n')[0]
      }
      bandStr = '*MRD_WIFIID: '
      if (str.includes(bandStr)) {
        this.mac = str.split(bandStr)[1].split('\r\n')[0].replaceAll(':', '')
      }
    },
    submit() {
      let arr = []
      let bandH = 0
      let bandL = 0
      this.checked.forEach(item => {
        if (item <= 20) {
          bandL += Math.pow(2, item - 1)
        }
        if (item >= 38 && item <= 41) {
          bandH += Math.pow(2, item - 33)
        }
      })
      let bandArr = this.bandStr.split(',')
      bandArr[3] = bandH
      bandArr[4] = bandL
      let bandStr = `AT*BAND=${bandArr.join(',')}`
      this.write(bandStr)
    },
  },
  async unmounted() {
    clearInterval(this.timer)
    try {
      this.reader.releaseLock()
      this.writer.releaseLock()
      await this.port.close()
      this.reader = {}
    } catch (error) { }
  },
  watch: {
    dataR() {
      this.$nextTick(() => {
        const textarea = document.getElementById('scroll_text');
        textarea.scrollTop = textarea.scrollHeight;
      })
    }
  }
};
function Uint8ArrayToString(fileData) {
  var dataString = "";
  for (var i = 0; i < fileData.length; i++) {
    dataString += String.fromCharCode(fileData[i]);
  }

  return dataString

}

function stringToUint8Array(str) {
  var arr = [];
  for (var i = 0; i < str.length; i++) {
    arr.push(str.charCodeAt(i));
  }

  var tmpUint8Array = new Uint8Array(arr);
  return tmpUint8Array
}
</script>

<style scoped>
.at-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  min-height: 100vh;
}

/* 顶部操作栏 */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.port-section {
  flex-shrink: 0;
}

.btn-port {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #3498db, #2980b9);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(52, 152, 219, 0.4);
}

.btn-port:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(52, 152, 219, 0.5);
}

.port-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.port-status {
  font-size: 13px;
  opacity: 0.8;
  font-weight: 400;
}

/* 按钮样式 */
.btn {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: #fff;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
}

.btn-success {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(34, 197, 94, 0.5);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.5);
}

.btn-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.btn-warning:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.5);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-sm {
  padding: 6px 14px;
  font-size: 12px;
}

/* 主内容区 */
.main-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 卡片网格 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.card-wide {
  grid-column: span 2;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.warning-text {
  font-size: 12px;
  color: #fbbf24;
  margin-top: 12px;
  padding: 8px 12px;
  background: rgba(251, 191, 36, 0.1);
  border-radius: 8px;
}

/* 输入组 */
.input-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-group label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  transition: all 0.2s ease;
  outline: none;
}

.form-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

/* 按钮组 */
.btn-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* 频段选择 */
.band-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.band-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.band-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.band-checkbox:hover {
  background: rgba(255, 255, 255, 0.1);
}

.band-checkbox input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.band-label {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.band-actions {
  display: flex;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* 自定义指令 */
.custom-command {
  display: flex;
  gap: 12px;
  align-items: center;
}

.custom-command .form-input {
  flex: 1;
}

/* 日志区域 */
.log-section {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.log-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.log-textarea {
  width: 100%;
  height: 300px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border: none;
  color: #e2e8f0;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
  outline: none;
}

/* 未连接提示 */
.no-connection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
}

.no-connection-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 32px;
  margin-bottom: 24px;
}

.no-connection h3 {
  font-size: 24px;
  color: #fff;
  margin-bottom: 12px;
}

.no-connection p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

/* 响应式 */
@media (max-width: 768px) {
  .top-bar {
    flex-direction: column;
    gap: 16px;
  }

  .card-wide {
    grid-column: span 1;
  }

  .custom-command {
    flex-direction: column;
  }

  .custom-command .form-input {
    width: 100%;
  }
}
</style>