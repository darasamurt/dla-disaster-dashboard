const X=require('xlsx'),fs=require('fs');
const dir="C:/Users/Stitch/OneDrive/Sun/กปภ/กปภ - สำเนา/10.ระบบฐานข้อมูล/ติดตามการบันทึกข้อมูล/1.18-6-69/";
const m=X.utils.sheet_to_json(X.readFile(dir+'ข้อมูลพื้นฐาน จังหวัด อำเภอ อปท..xlsx').Sheets[X.readFile(dir+'ข้อมูลพื้นฐาน จังหวัด อำเภอ อปท..xlsx').SheetNames[0]],{header:1}).slice(1).filter(r=>r[3]);
const g=X.utils.sheet_to_json(X.readFile(dir+'กลุ่มจังหวัด.xlsx').Sheets.Sheet1,{header:1}).slice(1).filter(r=>r[3]);
const G={};g.forEach(r=>{const n=String(r[1]).replace(/^กลุ่มจังหวัด/,'').trim();(G[n]=G[n]||[]).push(String(r[3]).trim())});
fs.writeFileSync('ref.json',JSON.stringify({master:m.map(r=>[String(r[1]).trim(),String(r[2]).trim(),String(r[3]).trim()]),groups:G}));
console.log(m.length,Object.keys(G).length,Object.entries(G).map(([k,v])=>k+':'+v.length).join(' '));
console.log('provs in master',new Set(m.map(r=>r[1])).size,'in groups',new Set(g.map(r=>r[3])).size);
