<template>
  <div class="band-selector">
    <div class="band-controls">
      <slot name="controls">
        <button
          :disabled="!isConnected"
          class="control-button"
          @click="readBands"
        >
          读取频段
        </button>
        <button
          :disabled="!isConnected || !selectedBands.length"
          class="control-button"
          @click="submitBands"
        >
          锁定频段
        </button>
      </slot>
    </div>

    <div class="band-list">
      <div
        v-for="band in availableBands"
        :key="band"
        class="band-item"
      >
        <label class="band-label">
          <input
            v-model="selectedBands"
            type="checkbox"
            :value="band"
            class="band-checkbox"
          >
          <span class="band-text">LTE B{{ band }}</span>
        </label>
      </div>
    </div>

    <div
      v-if="showTips"
      class="band-tips"
    >
      <slot name="tips">
        <p class="tip-text">
          显示的频段不一定支持，能成功锁定的频段才算是支持
        </p>
      </slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BandSelector',
  props: {
    availableBands: {
      type: Array,
      default: () => [1, 3, 5, 8, 38, 39, 40, 41]
    },
    isConnected: {
      type: Boolean,
      default: false
    },
    showTips: {
      type: Boolean,
      default: true
    },
    initialSelectedBands: {
      type: Array,
      default: () => []
    }
  },
  emits: ['read-bands', 'submit-bands', 'update:selected-bands'],
  data() {
    return {
      selectedBands: []
    }
  },
  watch: {
    initialSelectedBands: {
      handler(newVal) {
        this.selectedBands = [...newVal]
      },
      immediate: true
    },
    selectedBands: {
      handler(newVal) {
        this.$emit('update:selected-bands', newVal)
      },
      deep: true
    }
  },
  methods: {
    readBands() {
      this.$emit('read-bands')
    },
    submitBands() {
      this.$emit('submit-bands', this.selectedBands)
    }
  }
}
</script>

<style scoped>
.band-selector {
  padding: 16px 0;
}

.band-controls {
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
}

.control-button {
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  font-size: 14px;
}

.control-button:hover:not(:disabled) {
  background-color: #e6f7ff;
  border-color: #1890ff;
}

.control-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.band-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.band-item {
  display: flex;
  align-items: center;
}

.band-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.band-label:hover {
  background-color: #f0f0f0;
}

.band-checkbox {
  margin-right: 6px;
}

.band-text {
  font-size: 14px;
  color: #333;
}

.band-tips {
  margin-top: 8px;
}

.tip-text {
  margin: 0;
  font-size: 12px;
  color: #666;
  opacity: 0.8;
}
</style>
