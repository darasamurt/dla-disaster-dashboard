// รวม template + data + map เป็น index.html   ใช้: node src/build-html.js
const fs=require('fs'),path=require('path');
const r=f=>fs.readFileSync(path.join(__dirname,f),'utf8');
fs.writeFileSync(path.join(__dirname,'..','index.html'),r('template.html').replace('/*DATA*/null',()=>r('data.json')).replace('/*MAP*/null',()=>r('map.json')));
console.log('index.html สร้างแล้ว');
