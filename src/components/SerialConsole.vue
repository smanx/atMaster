<template>
  <div class="serial-console">
    <div class="console-header">
      <slot name="header">
        <h3>串口控制台</h3>
      </slot>
    </div>

    <div class="console-controls">
      <slot name="controls" />
    </div>

    <div class="console-input">
      <input
        v-model="customCommand"
        type="text"
        :placeholder="inputPlaceholder"
        class="command-input"
        @keyup.enter="sendCustomCommand"
      >
      <button
        :disabled="!isConnected"
        class="send-button"
        @click="sendCustomCommand"
      >
        发送
      </button>
      <button
        class="clear-button"
        @click="clearOutput"
      >
        清理
      </button>
    </div>

    <div class="console-output">
      <textarea
        ref="outputTextarea"
        v-model="outputData"
        readonly
        :rows="rows"
        class="output-textarea"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'SerialConsole',
  props: {
    outputData: {
      type: String,
      default: ''
    },
    isConnected: {
      type: Boolean,
      default: false
    },
    inputPlaceholder: {
      type: String,
      default: '发送自定义AT指令'
    },
    rows: {
      type: Number,
      default: 10
    }
  },
  emits: ['send-command', 'clear-output'],
  data() {
    return {
      customCommand: ''
    }
  },
  watch: {
    outputData() {
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    }
  },
  methods: {
    sendCustomCommand() {
      if (!this.customCommand.trim()) {return}

      this.$emit('send-command', this.customCommand.trim())
      this.customCommand = ''
    },
    clearOutput() {
      this.$emit('clear-output')
    },
    scrollToBottom() {
      const textarea = this.$refs.outputTextarea
      if (textarea) {
        textarea.scrollTop = textarea.scrollHeight
      }
    }
  }
}
</script>

<style scoped>
.serial-console {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  background-color: #f9f9f9;
}

.console-header {
  margin-bottom: 12px;
}

.console-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.console-controls {
  margin-bottom: 12px;
}

.console-input {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.command-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.send-button, .clear-button {
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  font-size: 14px;
}

.send-button:hover:not(:disabled) {
  background-color: #e6f7ff;
  border-color: #1890ff;
}

.send-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.clear-button:hover {
  background-color: #fff7e6;
  border-color: #fa8c16;
}

.console-output {
  width: 100%;
}

.output-textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  resize: vertical;
  background-color: white;
}
</style>
