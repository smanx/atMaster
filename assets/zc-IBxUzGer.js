import{_ as w,o as a,c as m,a as e,t as c,w as d,v as u,d as h,F as k,r as A,e as b,p as f,b as v}from"./index-DlMeXW2A.js";const y={mixins:[],data(){return{port:{},reader:{},isOpen:!1,dataR:"",dataW:"",timer:null,reader:{},writer:{},list:[],checked:[],imei:"",mac:"",mac2:"",ip:"192.168.0.1",lteCell:{isLock:!1,arfcn:"",cell:""}}},computed:{},created(){window.that=this,this.timer=setInterval(()=>{this.isOpen=!!this.port.readable},100)},methods:{async click(){if(!navigator.serial){alert("该浏览器不支持，仅支持基于chromium内核的pc浏览器");return}try{if(this.port.getInfo&&this.port.readable){try{this.reader.releaseLock(),this.writer.releaseLock()}catch{}await this.port.close(),this.reader={}}else{const i=await navigator.serial.requestPort();this.port=i,this.port.readable||(await i.open({dataBits:8,stopBits:1,parity:"none",baudRate:9600}),this.reader=this.port.readable.getReader(),this.writer=this.port.writable.getWriter(),this.write("AT+CGSN"),setTimeout(()=>{this.write("AT+MAC?")},500),setTimeout(()=>{this.write("AT+MAC2?")},1e3),setTimeout(()=>{this.getBand()},1500),setTimeout(()=>{this.write("AT+ZLC?")},200))}}catch(i){console.log("error",i),i.message&&!i.message.includes("No port selected by the user")&&alert(i.message)}},getBand(){this.write("AT+ZLTEAMTBAND?"),setTimeout(()=>{this.write("AT+ZLTEBAND?")},200)},async read(){const i=this.reader,{value:t,done:o}=await i.read();let s=T(t);console.log("接收",s),this.dataR+=s,this.dataHandler(s)},async write(i){const t=this.writer;let o=(i||this.dataW)+`\r
`,s=x(o);await t.write(s),setTimeout(()=>{this.read()},500)},dataHandler(i){let t="ZLTEAMTBAND: ";if(i.includes(t)&&i.includes(t)&&i.length>20&&(this.list=this.getSupportedBand(i.split(t)[1].split(`\r
`)[0])),t="+ZLTEBAND: ",i.includes(t)&&i.includes(t)&&i.length>20){let o=this.getLockedBand(i.split(t)[1].split(`\r
`)[0]);this.checked=o}if(t="+CGSN: ",i.includes(t)&&(this.imei=i.split(t)[1].split(`\r
`)[0]),t="+MAC:",i.includes(t)&&(this.mac=i.split(t)[1].split(`\r
`)[0]),t="+MAC2:",i.includes(t)&&(this.mac2=i.split(t)[1].split(`\r
`)[0]),t="+ZLC: ",i.includes(t)){let o=i.split(t)[1].split(`\r
`)[0].split(",");this.lteCell.isLock=o[0]==="1",this.lteCell.arfcn=o[1],this.lteCell.pci=o[2]}},getSupportedBand(i){return i.split(",").reduce((t,o,s)=>{let n=parseInt(o).toString(2);for(var r=0;r<n.length;r++)parseInt(n[n.length-r-1])&&t.push(s*8+r+1);return t},[])},getLockedBand(i){return this.getSupportedBand(i).filter(t=>this.list.includes(t))},submit(){let i=[];for(var t=0;t<8;t++){let s="";for(var o=0;o<8;o++)this.checked.includes(t*8+o+1)?s="1"+s:s="0"+s;i.push(parseInt(s,2))}this.write("AT+ZLTEBAND="+i.join(","))},resetNetWork(){this.write("AT+CFUN=4"),setTimeout(()=>{this.write("AT+CFUN=1")},5e3)},async reboot(){window.open(`http://${this.ip}/goform/goform_set_cmd_process?goformId=REBOOT_DEVICE`)},reboot1869(){window.open(`http://${this.ip}/reqproc/proc_post?isTest=false&goformId=REBOOT_DEVICE`)},async openADB(){window.open(`http://${this.ip}/goform/goform_set_cmd_process?goformId=SET_DEVICE_MODE&debug_enable=1`)},async closeADB(){window.open(`http://${this.ip}/goform/goform_set_cmd_process?goformId=SET_DEVICE_MODE&debug_enable=0`)},async openADB2(){window.open(`http://${this.ip}/reqproc/proc_post?goformId=SET_DEVICE_MODE&debug_enable=1`)},async closeADB2(){window.open(`http://${this.ip}/reqproc/proc_post?goformId=SET_DEVICE_MODE&debug_enable=0`)}},async unmounted(){clearInterval(this.timer);try{this.reader.releaseLock(),this.writer.releaseLock(),await this.port.close(),this.reader={}}catch{}},watch:{dataR(){this.$nextTick(()=>{const i=document.getElementById("scroll_text");i.scrollTop=i.scrollHeight})}}};function T(i){for(var t="",o=0;o<i.length;o++)t+=String.fromCharCode(i[o]);return t}function x(i){for(var t=[],o=0;o<i.length;o++)t.push(i.charCodeAt(o));var s=new Uint8Array(t);return s}const p=i=>(f("data-v-50039c2b"),i=i(),v(),i),B={class:"atMaster",style:{padding:"10px"}},E=p(()=>e("label",null,"ip: ",-1)),D={class:"content"},I={style:{padding:"10px 0"}},L={style:{padding:"10px 0"}},M=p(()=>e("label",null,"IMEI: ",-1)),S={style:{padding:"10px 0"}},_=p(()=>e("label",null,"无线MAC: ",-1)),V={style:{padding:"10px 0"}},U=p(()=>e("label",null,"有线MAC: ",-1)),N={style:{display:"flex","flex-wrap":"wrap","align-items":"center",padding:"10px 0"}},O={for:"option1"},Z=["value"],R=p(()=>e("br",null,null,-1)),W=p(()=>e("br",null,null,-1)),q={style:{padding:"10px 0"}},F=p(()=>e("label",null,"频点: ",-1)),G=p(()=>e("label",{style:{"margin-left":"20px"}},"小区: ",-1)),H=p(()=>e("label",{style:{"margin-left":"20px"}},"是否锁定: ",-1)),z=p(()=>e("div",null,[e("label",{style:{opacity:"0.5"}},"显示的仅为之前保存锁定小区的数据，并非是当前实际接入的小区")],-1)),P={class:"right"};function J(i,t,o,s,n,r){return a(),m("div",B,[e("button",{onClick:t[0]||(t[0]=(...l)=>r.click&&r.click(...l))},"选择端口 "+c(n.isOpen?"（已开启）":"（未开启）"),1),e("div",null,[E,d(e("input",{type:"text","onUpdate:modelValue":t[1]||(t[1]=l=>n.ip=l)},null,512),[[u,n.ip]]),e("button",{onClick:t[2]||(t[2]=(...l)=>r.openADB&&r.openADB(...l))},"开启adb "),e("button",{onClick:t[3]||(t[3]=(...l)=>r.closeADB&&r.closeADB(...l))},"关闭adb "),e("button",{onClick:t[4]||(t[4]=(...l)=>r.openADB2&&r.openADB2(...l))},"开启adb2 "),e("button",{onClick:t[5]||(t[5]=(...l)=>r.closeADB2&&r.closeADB2(...l))},"关闭adb2 "),e("button",{onClick:t[6]||(t[6]=(...l)=>r.reboot&&r.reboot(...l))},"重启"),e("button",{onClick:t[7]||(t[7]=(...l)=>r.reboot1869&&r.reboot1869(...l))},"重启2")]),d(e("div",D,[e("div",I,[e("button",{onClick:t[8]||(t[8]=l=>r.write("AT+ZMODE=1"))},"工厂模式"),e("button",{onClick:t[9]||(t[9]=l=>r.write("AT+ZMODE=0"))},"退出工厂模式")]),e("div",L,[M,d(e("input",{type:"text","onUpdate:modelValue":t[10]||(t[10]=l=>n.imei=l)},null,512),[[u,n.imei]]),e("button",{onClick:t[11]||(t[11]=l=>r.write("AT+CGSN"))},"读取"),e("button",{onClick:t[12]||(t[12]=l=>r.write("AT+MODIMEI="+n.imei))},"写入")]),e("div",S,[_,d(e("input",{type:"text","onUpdate:modelValue":t[13]||(t[13]=l=>n.mac=l)},null,512),[[u,n.mac]]),e("button",{onClick:t[14]||(t[14]=l=>r.write("AT+MAC?"))},"读取"),e("button",{onClick:t[15]||(t[15]=l=>r.write("AT+MAC="+n.mac))},"写入")]),e("div",V,[U,d(e("input",{type:"text","onUpdate:modelValue":t[16]||(t[16]=l=>n.mac2=l)},null,512),[[u,n.mac2]]),e("button",{onClick:t[17]||(t[17]=l=>r.write("AT+MAC2?"))},"读取"),e("button",{onClick:t[18]||(t[18]=l=>r.write("AT+MAC2="+n.imei))},"写入")]),e("div",N,[(a(!0),m(k,null,A(n.list,(l,C)=>(a(),m("span",{key:C,style:{display:"flex","flex-wrap":"wrap","align-items":"center",padding:"0 5px"}},[e("label",O,"LTE B"+c(l),1),d(e("input",{type:"checkbox","onUpdate:modelValue":t[19]||(t[19]=g=>n.checked=g),value:l},null,8,Z),[[b,n.checked,void 0,{number:!0}]]),R,W]))),128)),e("button",{onClick:t[20]||(t[20]=(...l)=>r.getBand&&r.getBand(...l))},"读取频段"),e("button",{onClick:t[21]||(t[21]=(...l)=>r.submit&&r.submit(...l))},"锁定频段"),e("button",{onClick:t[22]||(t[22]=(...l)=>r.resetNetWork&&r.resetNetWork(...l))},"重启网络")]),e("div",q,[F,d(e("input",{style:{width:"80px"},type:"text","onUpdate:modelValue":t[23]||(t[23]=l=>n.lteCell.arfcn=l)},null,512),[[u,n.lteCell.arfcn]]),G,d(e("input",{style:{width:"80px"},type:"text","onUpdate:modelValue":t[24]||(t[24]=l=>n.lteCell.pci=l)},null,512),[[u,n.lteCell.pci]]),H,d(e("input",{type:"checkbox","onUpdate:modelValue":t[25]||(t[25]=l=>n.lteCell.isLock=l),value:!0},null,512),[[b,n.lteCell.isLock,void 0,{number:!0}]]),e("button",{onClick:t[26]||(t[26]=l=>r.write("AT+ZLC?"))},"读取"),e("button",{onClick:t[27]||(t[27]=l=>r.write(`AT+ZLC=${n.lteCell.isLock?1:0},${n.lteCell.arfcn},${n.lteCell.pci}`))},"写入"),z]),e("div",null,[d(e("input",{type:"text","onUpdate:modelValue":t[28]||(t[28]=l=>n.dataW=l),placeholder:"发送自定义AT指令"},null,512),[[u,n.dataW]]),e("button",{onClick:t[29]||(t[29]=l=>r.write())},"发送")]),e("div",P,[d(e("textarea",{id:"scroll_text",cols:"30",rows:"10","onUpdate:modelValue":t[30]||(t[30]=l=>n.dataR=l),readonly:""},null,512),[[u,n.dataR]]),e("button",{onClick:t[31]||(t[31]=l=>n.dataR="")},"清理")])],512),[[h,n.isOpen]])])}const Q=w(y,[["render",J],["__scopeId","data-v-50039c2b"]]);export{Q as default};
