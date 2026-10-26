// สร้างฉบับที่มีรายชื่อ/เบอร์โทรผู้ประสานงาน (ใช้ภายในองค์กร ห้ามขึ้น GitHub)
// ใช้: node src/build-private.js                 → private/dashboard_มีเบอร์โทร.html (ทุกจังหวัด)
//      node src/build-private.js สตูล ภูเก็ต      → private/dashboard_สตูล_ภูเก็ต.html (เบอร์เฉพาะจังหวัดที่ระบุ)
const fs=require('fs'),path=require('path');
const r=f=>fs.readFileSync(path.join(__dirname,f),'utf8');
const cf=path.join(__dirname,'contacts.private.json');
if(!fs.existsSync(cf)){console.error('ยังไม่มี src/contacts.private.json — รัน node tools/contacts.js <โฟลเดอร์> ก่อน');process.exit(1)}
const nz=s=>String(s||'').replace(/[\s​.]+/g,'').replace(/^องค์การบริหารส่วนตำบล/,'อบต').replace(/^องค์การบริหารส่วนจังหวัด/,'อบจ').replace(/^ทต/,'เทศบาลตำบล').replace(/^ทม/,'เทศบาลเมือง').replace(/^ทน/,'เทศบาลนคร');
const data=JSON.parse(r('data.json')),C=JSON.parse(fs.readFileSync(cf,'utf8'));
const only=process.argv.slice(2);const keep=p=>!only.length||only.includes(p);
const CT={laos:{},pro:{},dis:{}};
data.E.forEach((e,i)=>{if(!keep(e[0]))return;const c=C.laos[e[0]+'|'+e[1]+'|'+nz(e[2])];if(c)CT.laos[i]=c});
for(const p in C.pro)if(keep(p))CT.pro[p]=C.pro[p];
for(const k in C.dis)if(keep(k.split('|')[0]))CT.dis[k]=C.dis[k];
const html=r('template.html').replace('/*DATA*/null',()=>r('data.json')).replace('/*MAP*/null',()=>r('map.json')).replace('/*CONTACTS*/null',()=>JSON.stringify(CT));
const out=path.join(__dirname,'..','private');fs.mkdirSync(out,{recursive:true});
const f=path.join(out,'dashboard_'+(only.length?only.join('_'):'มีเบอร์โทร')+'.html');
fs.writeFileSync(f,html);
console.log('สร้างแล้ว:',f,'| อปท. ที่มีเบอร์',Object.keys(CT.laos).length);
