<template>
  <div
    class="atMaster"
    style="padding: 10px"
  >
    <button @click="click">
      选择端口 {{ isOpen ? '（已开启）' : '（未开启）' }}
    </button>
    <div>
      <label>ip: </label>
      <input
        v-model="ip"
        type="text"
      >
      <button @click="openADB">
        开启adb
      </button>
      <button @click="closeADB">
        关闭adb
      </button>
      <button @click="openADB2">
        开启adb2
      </button>
      <button @click="closeADB2">
        关闭adb2
      </button>
      <button @click="reboot">
        重启
      </button>
      <button @click="reboot1869">
        重启2
      </button>
    </div>
    <div
      v-show="isOpen"
      class="content"
    >
      <div style="padding: 10px 0;">
        <button @click="write('AT+ZMODE=1')">
          工厂模式
        </button>
        <button @click="write('AT+ZMODE=0')">
          退出工厂模式
        </button>
      </div>
      <div style="padding: 10px 0;">
        <label>IMEI: </label>
        <input
          v-model="imei"
          type="text"
        >
        <button @click="write('AT+CGSN')">
          读取
        </button>
        <button @click="write('AT+MODIMEI=' + imei)">
          写入
        </button>
      </div>
      <div style="padding: 10px 0;">
        <label>无线MAC: </label>
        <input
          v-model="mac"
          type="text"
        >
        <button @click="write('AT+MAC?')">
          读取
        </button>
        <button @click="write('AT+MAC=' + mac)">
          写入
        </button>
      </div>
      <div style="padding: 10px 0;">
        <label>有线MAC: </label>
        <input
          v-model="mac2"
          type="text"
        >
        <button @click="write('AT+MAC2?')">
          读取
        </button>
        <button @click="write('AT+MAC2=' + imei)">
          写入
        </button>
      </div>
      <div style="display: flex; flex-wrap: wrap; align-items: center; padding: 10px 0;">
        <span
          v-for="(item, i) in list"
          :key="i"
          style="display: flex; flex-wrap: wrap; align-items: center; padding: 0 5px;"
        >
          <label for="option1">LTE B{{ item }}</label>
          <input
            v-model.number="checked"
            type="checkbox"
            :value="item"
          ><br><br>
        </span>
        <button @click="getBand">
          读取频段
        </button>
        <button @click="submit">
          锁定频段
        </button>
        <button @click="resetNetWork">
          重启网络
        </button>
      </div>

      <div style="padding: 10px 0;">
        <label>频点: </label>
        <input
          v-model="lteCell.arfcn"
          style="width: 80px;"
          type="text"
        >
        <label style="margin-left: 20px;">小区: </label>
        <input
          v-model="lteCell.pci"
          style="width: 80px;"
          type="text"
        >
        <label style="margin-left: 20px;">是否锁定: </label>
        <input
          v-model.number="lteCell.isLock"
          type="checkbox"
          :value="true"
        >
        <button @click="write('AT+ZLC?')">
          读取
        </button>
        <button @click="write(`AT+ZLC=${lteCell.isLock ? 1 : 0},${lteCell.arfcn},${lteCell.pci}`)">
          写入
        </button>
        <div>
          <label style="opacity: 0.5;">显示的仅为之前保存锁定小区的数据，并非是当前实际接入的小区</label>
        </div>
      </div>
      <div>
        <input
          v-model="dataW"
          type="text"
          placeholder="发送自定义AT指令"
        >
        <button @click="write()">
          发送
        </button>
        <button @click="write('AT+CGEQOSRDP=1')">
          限速检测
        </button>
      </div>
      <div class="right">
        <textarea
          id="scroll_text"
          v-model="dataR"
          cols="30"
          rows="10"
          readonly=""
        />
        <button @click="dataR = ''">
          清理
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { SerialPortManager } from '../utils/serial.js'

export default {
  name: 'ZTEView',
  data() {
    return {
      serialManager: null,
      isOpen: false,
      dataR: '',
      dataW: '',
      timer: null,
      list: [],
      checked: [],
      imei: '',
      mac: '',
      mac2: '',
      ip: '192.168.0.1',
      lteCell: {
        isLock: false,
        arfcn: '',
        pci: ''
      }
    }
  },
  created() {
    this.serialManager = new SerialPortManager()
    this.serialManager.setDataHandler(this.handleSerialData)
    this.serialManager.setErrorHandler(this.handleSerialError)

    // 定时检查连接状态
    this.timer = setInterval(() => {
      this.isOpen = this.serialManager.isOpen
    }, 100)
  },
  beforeUnmount() {
    this.cleanup()
  },
  methods: {
    async click() {
      if (!SerialPortManager.isSupported()) {
        alert('该浏览器不支持，仅支持基于chromium内核的pc浏览器')
        return
      }

      try {
        if (this.isOpen) {
          // 断开连接
          await this.serialManager.closePort()
        } else {
          // 请求端口并连接
          const portSelected = await this.serialManager.requestPort()
          if (portSelected) {
            const opened = await this.serialManager.openPort()
            if (opened) {
              // 连接成功后初始化数据
              this.initializeData()
            }
          }
        }
      } catch (error) {
        console.error('Connection error:', error)
        if (error.message && !error.message.includes('No port selected by the user')) {
          alert(error.message)
        }
      }
    },

    initializeData() {
      // 延迟发送初始化命令
      setTimeout(() => this.sendCommand('AT+CGSN'), 500)
      setTimeout(() => this.sendCommand('AT+MAC?'), 1000)
      setTimeout(() => this.sendCommand('AT+MAC2?'), 1500)
      setTimeout(() => this.getBand(), 2000)
      setTimeout(() => this.sendCommand('AT+ZLC?'), 2500)
    },

    async sendCommand(command) {
      if (!this.isOpen) {return}

      try {
        await this.serialManager.sendCommand(command)
        // 延迟读取响应
        setTimeout(() => this.readResponse(), 300)
      } catch (error) {
        console.error('Send command error:', error)
        this.handleSerialError(error)
      }
    },

    async readResponse() {
      try {
        const data = await this.serialManager.readData()
        if (data) {
          this.dataR += data
        }
      } catch (error) {
        console.error('Read response error:', error)
      }
    },

    handleSerialData(data) {
      this.dataR += data
      this.parseResponse(data)
    },

    handleSerialError(error) {
      console.error('Serial error:', error)
      if (error.message && !error.message.includes('No port selected by the user')) {
        alert(`串口错误: ${error.message}`)
      }
    },

    parseResponse(str) {
      // 解析IMEI
      if (str.includes('+CGSN: ')) {
        this.imei = str.split('+CGSN: ')[1].split('\r\n')[0]
      }

      // 解析MAC地址
      if (str.includes('+MAC:')) {
        this.mac = str.split('+MAC:')[1].split('\r\n')[0]
      }

      if (str.includes('+MAC2:')) {
        this.mac2 = str.split('+MAC2:')[1].split('\r\n')[0]
      }

      // 解析频段信息
      if (str.includes('ZLTEAMTBAND: ')) {
        this.list = this.getSupportedBand(str.split('ZLTEAMTBAND: ')[1].split('\r\n')[0])
      }

      // 解析已锁定频段
      if (str.includes('+ZLTEBAND: ')) {
        let checked = this.getLockedBand(str.split('+ZLTEBAND: ')[1].split('\r\n')[0])
        this.checked = checked
      }

      // 解析小区锁定信息
      if (str.includes('+ZLC: ')) {
        let arr = str.split('+ZLC: ')[1].split('\r\n')[0].split(',')
        this.lteCell.isLock = arr[0] === '1'
        this.lteCell.arfcn = arr[1]
        this.lteCell.pci = arr[2]
      }
    },

    getSupportedBand(str) {
      return str.split(',').reduce((p, c, i) => {
        let arrStr = parseInt(c).toString(2)
        for (var j = 0; j < arrStr.length; j++) {
          if (parseInt(arrStr[arrStr.length - j - 1])) {
            p.push(i * 8 + j + 1)
          }
        }
        return p
      }, [])
    },

    getLockedBand(str) {
      return this.getSupportedBand(str).filter(item => this.list.includes(item))
    },

    getBand() {
      this.sendCommand('AT+ZLTEAMTBAND?')
      setTimeout(() => {
        this.sendCommand('AT+ZLTEBAND?')
      }, 200)
    },

    submit() {
      let arr = []
      for (var i = 0; i < 8; i++) {
        let str = ''
        for (var j = 0; j < 8; j++) {
          let isLock = this.checked.includes(i * 8 + j + 1)
          if (isLock) {
            str = '1' + str
          } else {
            str = '0' + str
          }
        }
        arr.push(parseInt(str, 2))
      }
      this.sendCommand('AT+ZLTEBAND=' + arr.join(','))
    },

    resetNetWork() {
      this.sendCommand('AT+CFUN=4')
      setTimeout(() => {
        this.sendCommand('AT+CFUN=1')
      }, 5000)
    },

    // ADB相关方法
    openADB() {
      window.open(`http://${this.ip}/goform/goform_set_cmd_process?goformId=SET_DEVICE_MODE&debug_enable=1`)
    },

    closeADB() {
      window.open(`http://${this.ip}/goform/goform_set_cmd_process?goformId=SET_DEVICE_MODE&debug_enable=0`)
    },

    openADB2() {
      window.open(`http://${this.ip}/reqproc/proc_post?goformId=SET_DEVICE_MODE&debug_enable=1`)
    },

    closeADB2() {
      window.open(`http://${this.ip}/reqproc/proc_post?goformId=SET_DEVICE_MODE&debug_enable=0`)
    },

    reboot() {
      window.open(`http://${this.ip}/goform/goform_set_cmd_process?goformId=REBOOT_DEVICE`)
    },

    reboot1869() {
      window.open(`http://${this.ip}/reqproc/proc_post?isTest=false&goformId=REBOOT_DEVICE`)
    },

    cleanup() {
      if (this.timer) {
        clearInterval(this.timer)
      }
      if (this.serialManager) {
        this.serialManager.closePort()
      }
    }
  }
}
</script>

<style scoped>
.atMaster {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

button {
  margin: 5px 10px;
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s;
}

button:hover:not(:disabled) {
  background-color: #f0f0f0;
  border-color: #999;
}

input {
  margin: 0 5px;
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

input:focus {
  outline: none;
  border-color: #1890ff;
}

.content {
  margin-top: 20px;
}

.right {
  margin-top: 20px;
}

textarea {
  width: 100%;
  min-height: 200px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  resize: vertical;
}

label {
  font-weight: bold;
  margin-right: 5px;
}
</style>
