import{_ as a,c,o as n}from"./index-DsRTB0WI.js";const s={methods:{async testclick(){let e=await fetch("http://192.168.0.1/reqproc/proc_get?multi_data=1&isTest=false&cmd=modem_main_state%2Cpin_status%2Cblc_wan_mode%2Cblc_wan_auto_mode%2Cloginfo%2Cfota_new_version_state%2Cfota_current_upgrade_state%2Cfota_upgrade_selector%2Cnetwork_provider%2Cnetwork_provider_zh%2CLanguage%2Cis_mandatory%2Csta_count%2Cm_sta_count&_=1712882928579",{headers:{accept:"application/json, text/javascript, */*; q=0.01","accept-language":"zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6","cache-control":"no-cache",pragma:"no-cache","x-requested-with":"XMLHttpRequest"},referrer:"http://192.168.0.1/index.html",referrerPolicy:"strict-origin-when-cross-origin",body:null,method:"GET",mode:"no-cors",credentials:"include"});console.log("res",e)}}};function _(e,t,i,l,d,o){return n(),c("button",{onClick:t[0]||(t[0]=(...r)=>o.testclick&&o.testclick(...r))},"test")}const u=a(s,[["render",_]]);export{u as default};
