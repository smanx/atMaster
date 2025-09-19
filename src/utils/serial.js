/**
 * 串口通信工具类
 * 提供统一的串口操作接口
 */
export class SerialPortManager {
  constructor() {
    this.port = null
    this.reader = null
    this.writer = null
    this.isOpen = false
    this.dataHandler = null
    this.errorHandler = null
  }

  /**
   * 检查浏览器是否支持Web Serial API
   */
  static isSupported() {
    return 'serial' in navigator
  }

  /**
   * 请求用户选择串口设备
   */
  async requestPort() {
    try {
      this.port = await navigator.serial.requestPort()
      return true
    } catch (error) {
      if (this.errorHandler) {
        this.errorHandler(error)
      }
      return false
    }
  }

  /**
   * 打开串口连接
   */
  async openPort(options = {}) {
    if (!this.port) {
      throw new Error('No port selected')
    }

    const defaultOptions = {
      baudRate: 9600,
      dataBits: 8,
      stopBits: 1,
      parity: 'none'
    }

    try {
      await this.port.open({ ...defaultOptions, ...options })
      this.reader = this.port.readable.getReader()
      this.writer = this.port.writable.getWriter()
      this.isOpen = true
      return true
    } catch (error) {
      if (this.errorHandler) {
        this.errorHandler(error)
      }
      return false
    }
  }

  /**
   * 关闭串口连接
   */
  async closePort() {
    if (!this.isOpen) {return}

    try {
      if (this.reader) {
        await this.reader.releaseLock()
      }
      if (this.writer) {
        await this.writer.releaseLock()
      }
      if (this.port) {
        await this.port.close()
      }
    } catch (error) {
      console.error('Error closing port:', error)
    } finally {
      this.port = null
      this.reader = null
      this.writer = null
      this.isOpen = false
    }
  }

  /**
   * 发送AT命令
   */
  async sendCommand(command) {
    if (!this.isOpen || !this.writer) {
      throw new Error('Port is not open')
    }

    try {
      const data = this.stringToUint8Array(command + '\r\n')
      await this.writer.write(data)
      return true
    } catch (error) {
      if (this.errorHandler) {
        this.errorHandler(error)
      }
      return false
    }
  }

  /**
   * 读取串口数据
   */
  async readData() {
    if (!this.isOpen || !this.reader) {
      throw new Error('Port is not open')
    }

    try {
      const { value, done } = await this.reader.read()
      if (done) {
        return null
      }

      const data = this.uint8ArrayToString(value)
      if (this.dataHandler) {
        this.dataHandler(data)
      }
      return data
    } catch (error) {
      if (this.errorHandler) {
        this.errorHandler(error)
      }
      return null
    }
  }

  /**
   * 发送命令并等待响应
   */
  async sendAndWait(command, timeout = 1000) {
    await this.sendCommand(command)

    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        resolve('')
      }, timeout)

      const checkResponse = async () => {
        const data = await this.readData()
        if (data) {
          clearTimeout(timer)
          resolve(data)
        } else {
          setTimeout(checkResponse, 100)
        }
      }

      setTimeout(checkResponse, 100)
    })
  }

  /**
   * 设置数据处理器
   */
  setDataHandler(handler) {
    this.dataHandler = handler
  }

  /**
   * 设置错误处理器
   */
  setErrorHandler(handler) {
    this.errorHandler = handler
  }

  /**
   * 字符串转Uint8Array
   */
  stringToUint8Array(str) {
    const arr = []
    for (let i = 0; i < str.length; i++) {
      arr.push(str.charCodeAt(i))
    }
    return new Uint8Array(arr)
  }

  /**
   * Uint8Array转字符串
   */
  uint8ArrayToString(uint8Array) {
    let dataString = ''
    for (let i = 0; i < uint8Array.length; i++) {
      dataString += String.fromCharCode(uint8Array[i])
    }
    return dataString
  }
}
