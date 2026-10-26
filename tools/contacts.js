// แปลงไฟล์รายชื่อผู้ประสานงานรายจังหวัด (แตกจาก .rar แล้ว) เป็น src/contacts.private.json
// ใช้: node tools/contacts.js <โฟลเดอร์ที่แตกไฟล์>      (ต้อง npm i xlsx)
// ผลลัพธ์มีชื่อ/เบอร์โทร/LINE ID — ห้าม commit (อยู่ใน .gitignore แล้ว)
const X=require('xlsx'),fs=require('fs'),path=require('path');
const dir=process.argv[2];if(!dir){console.error('ระบุโฟลเดอร์ไฟล์ .xlsx');process.exit(1)}
const files=[];(function w(d){for(const f of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,f.name);f.isDirectory()?w(p):/\.xlsx$/i.test(f.name)&&files.push(p)}})(dir);
const nz=s=>String(s||'').replace(/[\s​.]+/g,'').replace(/^องค์การบริหารส่วนตำบล/,'อบต').replace(/^องค์การบริหารส่วนจังหวัด/,'อบจ').replace(/^ทต/,'เทศบาลตำบล').replace(/^ทม/,'เทศบาลเมือง').replace(/^ทน/,'เทศบาลนคร');
const cl=v=>String(v==null?'':v).replace(/\s+/g,' ').trim();
const ref=JSON.parse(fs.readFileSync(path.join(__dirname,'..','src','ref.json'),'utf8')).master;
const byFull=new Map(ref.map(([p,a,n])=>[p+'|'+a+'|'+nz(n),[p,a,n]]));
const byProv=new Map();ref.forEach(([p,a,n])=>{const k=p+'|'+nz(n);byProv.set(k,byProv.has(k)?null:[p,a,n])});
const out={laos:{},pro:{},dis:{}};let rows=0;const miss=[];
for(const f of files){
  const wb=X.readFile(f);
  for(const r of X.utils.sheet_to_json(wb.Sheets['อปท.'],{header:1,defval:''}).slice(3)){
    const p=cl(r[0]),am=cl(r[1]),n=cl(r[2]);if(!n)continue;rows++;
    let m=byFull.get(p+'|'+am+'|'+nz(n))||byProv.get(p+'|'+nz(n));
    if(!m&&n.includes('พัทยา'))m=byFull.get(p+'|'+am+'|'+nz('ท้องถิ่นรูปแบบพิเศษเมืองพัทยา'));
    if(!m){miss.push(p+'/'+am+'/'+n);continue}
    const person=i=>({n:cl(r[i]),t:cl(r[i+1]),tel:cl(r[i+2]),line:cl(r[i+3])});
    out.laos[m[0]+'|'+m[1]+'|'+nz(m[2])]=[person(3),person(7),person(11),{n:cl(r[15]),t:cl(r[16]),office:cl(r[17]),tel:cl(r[18]),line:cl(r[19])}];
  }
  if(wb.Sheets['สถจ.'])for(const r of X.utils.sheet_to_json(wb.Sheets['สถจ.'],{header:1,defval:''}).slice(2)){if(!cl(r[3]))continue;(out.pro[cl(r[1])]=out.pro[cl(r[1])]||[]).push({n:cl(r[3]),t:cl(r[4]),tel:cl(r[5]),line:cl(r[6])})}
  if(wb.Sheets['สถอ.'])for(const r of X.utils.sheet_to_json(wb.Sheets['สถอ.'],{header:1,defval:''}).slice(2)){if(!cl(r[3]))continue;const k=cl(r[1])+'|'+cl(r[2]);(out.dis[k]=out.dis[k]||[]).push({n:cl(r[3]),tel:cl(r[4]),line:cl(r[5])})}
}
fs.writeFileSync(path.join(__dirname,'..','src','contacts.private.json'),JSON.stringify(out));
console.log('แถว อปท. ในไฟล์',rows,'| จับคู่ได้',Object.keys(out.laos).length,'จาก',ref.length,'| ไม่ตรงชื่อ',miss.length);
if(miss.length)console.log('ตัวอย่างที่ไม่ตรง:',miss.slice(0,10));
