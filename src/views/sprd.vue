<template>
  <div class="atMaster" style="padding: 10px">
    <button @click="click">选择端口 {{ isOpen ? '（已开启）' : '（未开启）' }}</button>
    <div class="content" v-show="isOpen">
      <div style="padding: 10px 0;">
        <label>IMEI1: </label>
        <input type="text" v-model="imei1">
        <button @click="readIMEI1()">读取</button>
        <button @click='write(`AT+SPIMEI =0,"${imei1}"`)'>写入</button>
      </div>
      <div style="padding: 10px 0;">
        <label>IMEI2: </label>
        <input type="text" v-model="imei2">
        <button @click="readIMEI2()">读取</button>
        <button @click='write(`AT+SPIMEI =1,"${imei2}"`)'>写入</button>
      </div>
      <div>
        <button @click="write('AT+RESET=1')">重启</button>
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
      imei1: '',
      imei2: '',
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
            this.readIMEI1()
            setTimeout(() => { this.readIMEI2() }, 800)
            setTimeout(() => { this.getBand() }, 800)

          }
        }
      } catch (error) {
        console.log('error', error)
        error.message && !error.message.includes('No port selected by the user') && alert(error.message)
      }

    },
    getBand() {
      this.write('AT+SPLBAND=0')
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
    readIMEI1() {
      this.imei = 1
      this.write('AT+SPACTCARD=0')
      this.write('AT+SPIMEI?')
    },
    readIMEI2() {
      this.imei = 2
      this.write('AT+SPACTCARD=1')
      this.write('AT+SPIMEI?')
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
      }, 300);
    },
    dataHandler(str) {
      let arr = str.split('\r\n')
      if (arr.length >= 3) {
        arr.forEach((item, i) => {
          console.log(arr)
          if (item.length === 15 && arr[i - 1] === '' && arr[i + 1] === '') {
            if (this.imei === 1) {
              this.imei1 = item
            }
            if (this.imei === 2) {
              this.imei2 = item
            }
          }
        })
      }
      let bandStr = '+SPLBAND: '
      if (str.includes(bandStr)) {
        let arr = str.split(',')
        let bandH = arr[1].toString(2)
        let bandL = arr[3].toString(2)
        let checked = []
        checked.push(...this.getSupportedBand(bandL.toString(2)))
        parseInt(bandH).toString(2).split('').reverse().forEach((item, index) => {
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
        this.checked = checked
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
      let bandStr = `AT+SPLBAND=1,0,${bandH},0,${bandL},0`
      this.write(bandStr)
    },
    getSupportedBand(str) {
      // console.log(str)
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