# AT命令工具 (atMaster-Plus)

## 项目简介

这是一个基于Vue 3和Vite构建的网页版AT命令工具，用于通过浏览器直接与设备的串口通信，支持多种芯片平台的AT命令操作。该工具可以在浏览器中直接选择串口设备并发送AT命令，无需安装额外的桌面软件。
该项目基于atMaster项目，添加了一些美观的UI，并将毛坯助手修改为精装助手。（By xcfstudio，20250511）

## 支持的芯片平台

- **中兴微 (ZTE)** - zc.vue
- **ASR (翱捷科技)** - asr.vue  
- **展锐 (Spreadtrum)** - sprd.vue

## 功能特性

### 通用功能
- 🌐 基于Web Serial API，支持Chrome内核浏览器
- 📱 串口设备选择和连接管理
- 📝 自定义AT命令发送
- 📋 实时数据显示和日志记录
- 🎯 频段锁定和网络管理
- ⚡ 工厂模式切换

### 中兴微 (ZTE) 功能
- IMEI读写操作
- 无线MAC和有线MAC地址读写
- LTE频段读取和锁定
- 小区锁定功能
- ADB调试开关控制
- 设备重启功能

### ASR (翱捷科技) 功能
- IMEI、SN号、WiFi MAC读写
- 双卡切换支持
- LTE频段管理
- 工厂模式控制

### 展锐 (Spreadtrum) 功能
- 双IMEI读写支持
- LTE频段锁定
- 设备重启

## 系统要求

- **浏览器**: 需要支持Web Serial API的基于Chromium内核的浏览器（如Chrome、Edge等）
- **操作系统**: Windows、macOS、Linux
- **设备**: 需要连接支持AT命令的设备并通过USB转串口驱动连接到电脑

## 使用说明

### 准备工作
1. 使用USB线连接设备到电脑
2. 安装对应的USB转串口驱动程序
3. 在支持的浏览器中打开本工具

### 基本操作流程
1. 点击"选择端口"按钮，从浏览器弹出的串口列表中选择对应的AT端口
2. 端口连接成功后，相关功能按钮将变为可用状态
3. 根据需要选择对应芯片平台的功能页面
4. 执行相应的AT命令操作

### 注意事项
- 首次使用时需要安装对应设备的驱动程序
- 仅支持基于Chromium内核的浏览器
- 串口波特率固定为9600
- 如果发现数据显示异常，可多次点击读取按钮刷新数据

## 项目结构

```
src/
├── views/           # 各芯片平台的功能页面
│   ├── index.vue    # 主页，芯片平台选择
│   ├── zc.vue       # 中兴微AT命令功能
│   ├── asr.vue      # ASR AT命令功能  
│   └── sprd.vue     # 展锐AT命令功能
├── router/          # 路由配置
└── main.js          # 应用入口
```

## 技术栈

- **框架**: Vue 3 + Vue Router
- **构建工具**: Vite
- **核心API**: Web Serial API
- **部署**: GitHub Actions + GitHub Pages

## 开发环境搭建

```bash
# 安装依赖
yarn install

# 启动开发服务器
yarn dev

# 构建生产版本
yarn build

# 预览生产构建
yarn preview
```

## 部署

项目通过GitHub Actions自动部署到GitHub Pages，支持PWA功能。

## 常见问题

1. **浏览器不支持串口功能**
   - 请使用Chrome、Edge等基于Chromium内核的浏览器
   - 确保浏览器版本支持Web Serial API

2. **找不到串口设备**
   - 检查USB连接和驱动安装
   - 在系统设备管理器中确认串口设备是否识别

3. **数据读取异常**
   - 多次点击读取按钮刷新数据
   - 检查串口线连接是否稳定

## 贡献

欢迎提交Issue和Pull Request来改进这个工具。

## 许可证

MIT License
