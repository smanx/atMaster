<template>
  <button @click="$router.push({path: 'zc'});">中兴微</button>
  <button @click="$router.push({path: 'asr'});">ASR</button>
  <button @click="$router.push({path: 'sprd'});">展锐</button>
  <p style="opacity: 0.5;">需要先安装对应驱动到电脑，支持基于chromium内核的浏览器，串行端口需要选择AT端口</p>
  <p style="opacity: 0.5;">若发现数据不对，请多点几次任意读取相关的按钮刷新数据</p>
</template>

<script>
export default {

}
</script>

<style scoped>
button {
  margin: 5px 10px;
}
</style>