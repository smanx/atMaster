<template>
  <div class="atMaster" style="padding: 10px">
    <button @click="click">选择端口 {{ isOpen ? '（已开启）' : '（未开启）' }}</button>
    <div>
      <label>ip: </label>
      <input type="text" v-model="ip">
      <button @click="openADB">开启adb </button>
      <button @click="closeADB">关闭adb </button>
      <button @click="reboot">重启</button>
      <button @click="reboot1869">重启(1869系列)</button>
    </div>
    <div class="content" v-show="isOpen">
      <div style="padding: 10px 0;">
        <label>IMEI: </label>
        <input type="text" v-model="imei">
        <button @click="write('AT+CGSN')">读取</button>
        <button @click="write('AT+MODIMEI=' + imei)">写入</button>
      </div>
      <div style="padding: 10px 0;">
        <label>无线MAC: </label>
        <input type="text" v-model="mac">
        <button @click="write('AT+MAC?')">读取</button>
        <button @click="write('AT+MAC=' + mac)">写入</button>
      </div>
      <div style="padding: 10px 0;">
        <label>有线MAC: </label>
        <input type="text" v-model="mac2">
        <button @click="write('AT+MAC2?')">读取</button>
        <button @click="write('AT+MAC2=' + imei)">写入</button>
      </div>
      <!-- <van-checkbox-group v-model="checked" direction="horizontal">
        <van-checkbox :name="item" v-for="(item, i) in list" :key="i">LTE B{{ item }}</van-checkbox>
      </van-checkbox-group> -->
      <div style="display: flex; flex-wrap: wrap; align-items: center; padding: 10px 0;">
        <span v-for="(item, i) in list" :key="i"
          style="display: flex; flex-wrap: wrap; align-items: center; padding: 0 5px;">
          <label for="option1">LTE B{{ item }}</label>
          <input type="checkbox" id="option1" name="options[]" v-model.number="checked" :value="item"><br><br>
        </span>
        <button @click="getBand">读取频段</button>
        <button @click="submit">锁定频段</button>
      </div>

      <div style="padding: 10px 0;">
        <label>频点: </label>
        <input style="width: 80px;" type="text" v-model="lteCell.arfcn">
        <label style="margin-left: 20px;">小区: </label>
        <input style="width: 80px;" type="text" v-model="lteCell.pci">
        <label style="margin-left: 20px;">是否锁定: </label>
        <input type="checkbox" v-model.number="lteCell.isLock" :value="true">
        <button @click="write('AT+ZLC?')">读取</button>
        <button @click="write(`AT+ZLC=${lteCell.isLock ? 1 : 0},${lteCell.arfcn},${lteCell.pci}`)">写入</button>
        <div>
          <label style="opacity: 0.5;">显示的仅为之前保存锁定小区的数据，并非是当前实际接入的小区</label>
        </div>
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
      list: [],
      checked: [],
      imei: '',
      mac: '',
      mac2: '',
      ip: '192.168.0.1',
      lteCell: {
        isLock: false,
        arfcn: '',
        cell: ''
      }
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
            setTimeout(() => { this.write('AT+MAC?') }, 500)
            setTimeout(() => { this.write('AT+MAC2?') }, 1000)
            setTimeout(() => { this.getBand() }, 1500)
            setTimeout(() => { this.write('AT+ZLC?') }, 200)
          }
        }
      } catch (error) {
        console.log('error', error)
        error.message && !error.message.includes('No port selected by the user') && alert(error.message)
      }

    },
    getBand() {
      this.write('AT+ZLTEAMTBAND?')
      setTimeout(() => {
        this.write('AT+ZLTEBAND?')
      }, 200)
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
      console.log('发送', str)
      // this.dataR += str
      let arr = stringToUint8Array(str)
      await writer.write(arr);
      // console.log(Uint8ArrayToString(arr))
      setTimeout(() => {
        this.read()
      }, 500);
    },
    dataHandler(str) {
      let bandStr = 'ZLTEAMTBAND: '
      if (str.includes(bandStr) && str.includes(bandStr) && str.length > 20) {
        this.list = this.getSupportedBand(str.split(bandStr)[1].split('\r\n')[0])
        // console.log(this.list)
      }
      bandStr = '+ZLTEBAND: '
      if (str.includes(bandStr) && str.includes(bandStr) && str.length > 20) {
        let checked = this.getLockedBand(str.split(bandStr)[1].split('\r\n')[0])
        this.checked = checked
        // console.log('checked', checked)
      }
      bandStr = '+CGSN: '
      if (str.includes(bandStr)) {
        this.imei = str.split(bandStr)[1].split('\r\n')[0]
      }
      bandStr = '+MAC:'
      if (str.includes(bandStr)) {
        this.mac = str.split(bandStr)[1].split('\r\n')[0]
      }
      bandStr = '+MAC2:'
      if (str.includes(bandStr)) {
        this.mac2 = str.split(bandStr)[1].split('\r\n')[0]
      }
      bandStr = '+ZLC: '
      if (str.includes(bandStr)) {
        let arr = str.split(bandStr)[1].split('\r\n')[0].split(',')
        this.lteCell.isLock = arr[0] === '1'
        this.lteCell.arfcn = arr[1]
        this.lteCell.pci = arr[2]
      }

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
    getLockedBand(str) {
      return this.getSupportedBand(str).filter(item => this.list.includes(item))
    },
    submit() {
      // console.log('submit', this.checked)
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
      this.write('AT+ZLTEBAND=' + arr.join(','))
    },
    async reboot() {
      // let res = await fetch(`http://${this.ip}/goform/goform_set_cmd_process?goformId=REBOOT_DEVICE`)
      // alert(res.statusText)
      window.open(`http://${this.ip}/goform/goform_set_cmd_process?goformId=REBOOT_DEVICE`)
    },
    reboot1869() {
      window.open(`http://${this.ip}/reqproc/proc_post?isTest=false&goformId=REBOOT_DEVICE`)
    },
    async openADB() {
      // await fetch(`http://${this.ip}/goform/goform_set_cmd_process?goformId=SET_DEVICE_MODE&debug_enable=2`)
      // await fetch(`http://${this.ip}/goform/goform_set_cmd_process?goformId=SET_DEVICE_MODE&debug_enable=1`)
      // this.reboot()
      window.open(`http://${this.ip}/goform/goform_set_cmd_process?goformId=SET_DEVICE_MODE&debug_enable=1`)
    },
    async closeADB() {
      // await fetch(`http://${this.ip}/goform/goform_set_cmd_process?goformId=SET_DEVICE_MODE&debug_enable=0`)
      // this.reboot()
      window.open(`http://${this.ip}/goform/goform_set_cmd_process?goformId=SET_DEVICE_MODE&debug_enable=0`)
    }
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