<template>
  <button @click="$router.push({path: 'zc'});">中兴微</button>
  <button @click="$router.push({path: 'asr'});">ASR</button>
  <button @click="$router.push({path: ''});">展锐（开发中）</button>
  <p style="opacity: 0.1;">需要先安装对应驱动到电脑，支持基于chromium内核的浏览器，串行端口需要选择AT端口</p>
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