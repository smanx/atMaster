<template>
  <div class="atMaster" style="padding: 10px">
    <button @click="click">选择端口 {{ isOpen ? '（已开启）' : '（未开启）' }}</button>
    <div class="content" v-show="isOpen">
      <div>
        <button @click="write('AT*PROD=1')">工厂模式</button>
        <button @click="write('AT*PROD=0')">退出工厂模式</button>
      </div>
      <label style="opacity: 0.5;">需开启工厂模式才能写号，写入之前先删除</label>
      <div style="padding: 10px 0;">
        <label>IMEI: </label>
        <input type="text" v-model="imei">
        <button @click="write('AT+CGSN')">读取</button>
        <button @click="write('AT*MRD_IMEI=D')">删除</button>
        <button @click="write('AT*MRD_IMEI=W,0,01JAN1970,' + imei)">写入</button>
      </div>
      <div style="padding: 10px 0;">
        <label>SN: </label>
        <input type="text" v-model="sn" placeholder="仅支持有SN号的设备">
        <button @click="write('AT*MRD_SN?')">读取</button>
        <button @click="write('AT*MRD_SN=D')">删除</button>
        <button @click="write('AT*MRD_SN=W,0,01JAN1970,' + sn)">写入</button>
      </div>
      <div style="padding: 10px 0;">
        <label>MAC: </label>
        <input type="text" v-model="mac">
        <button @click="write('AT*MRD_WIFIID?')">读取</button>
        <button @click="write('AT*MRD_WIFIID=D')">删除</button>
        <button @click="write('AT*MRD_WIFIID=W,0,01JAN1970,' + mac)">写入</button>
      </div>
      <div>
        <button @click="write('AT+SWSIM=0')">切到卡1</button>
        <button @click="write('AT+SWSIM=1')">切到卡2</button>
        <button @click="write('AT+RESET')">重启</button>
      </div>
      <!-- <van-checkbox-group v-model="checked" direction="horizontal">
        <van-checkbox :name="item" v-for="(item, i) in list" :key="i">LTE B{{ item }}</van-checkbox>
      </van-checkbox-group> -->
      <div style="display: flex; flex-wrap: wrap; align-items: center; padding: 10px 0;">
        <span v-for="(item, i) in list" :key="i"
          style="display: flex; flex-wrap: wrap; align-items: center; padding: 0 5px;">
          <label for="option1">LTE B{{ item }}</label>
          <input type="checkbox" v-model.number="checked" :value="item"><br><br>
        </span>
        <button @click="getBand">读取频段</button>
        <button @click="submit">锁定频段</button>
        <span style="opacity: 0.5;">显示的频段不一定支持，能成功锁定的频段才算是支持</span>
      </div>

      <!-- <van-button type="primary" :disabled="!isOpen || !checked.length">锁定频段</van-button> -->
      <div>
        <input type="text" v-model="dataW" placeholder="发送自定义AT指令">
        <button @click="write()">发送</button>
      </div>
      <div class="right">
        <textarea id="scroll_text" cols="30" rows="10" v-model="dataR" readonly=""></textarea>
        <button @click="dataR = ''">清理</button>
      </div>
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
button {
  margin: 5px 10px;
}
</style>