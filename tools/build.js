const fs=require('fs');
const rd=f=>fs.readFileSync(f,'utf8').split('\n').filter(Boolean).map(JSON.parse);
const nz=s=>(s||'').replace(/[\s​]+/g,'');
const REF=JSON.parse(fs.readFileSync('ref.json','utf8'));
const GROUPS={};for(const[k,v]of Object.entries(REF.groups))GROUPS[k]=v.join(' ');
const P2G={};for(const[g,p]of Object.entries(GROUPS))p.split(' ').forEach(x=>P2G[x]=g);
const r1=rd('r1.jsonl').slice(4).filter(r=>/^\d+$/.test(r[0]));
const r2=rd('r2.jsonl').slice(4).filter(r=>/^\d+$/.test(r[0]));
const r3=rd('r3.jsonl').slice(3).filter(r=>/^\d+$/.test(r[0]));
const tot={vol:r1.length,dev:r2.length,veh:r3.length};
const V=r1.filter(r=>r[6]==='มีชีวิต'),D=r2.filter(r=>r[13]==='พร้อมปฏิบัติงาน'),H=r3.filter(r=>r[13]==='พร้อมปฏิบัติงาน');
console.log(tot,'kept',V.length,D.length,H.length);
// entity registry
const ents=[],eidx=new Map();
const pn=new Map();let extra=0,viaName=0;const unm=[];
REF.master.forEach(([p,a,n])=>{const k=p+'|'+a+'|'+nz(n);if(eidx.has(k))return;eidx.set(k,ents.length);ents.push({p,a,n:n.replace(/\s+/g,' ').trim(),k,master:1});const k2=p+'|'+nz(n);pn.set(k2,pn.has(k2)?-1:ents.length-1)});
function ent(p,a,name){let z=nz(name);if(z.includes('พัทยา'))z='ท้องถิ่นรูปแบบพิเศษเมืองพัทยา';let i=eidx.get(p+'|'+a+'|'+z);if(i!==undefined)return i;
 i=eidx.get(p+'|'+a+'|'+z.replace('ท้องถิ่นรูปแบบพิเศษ','').replace('รูปแบบพิเศษ',''));if(i!==undefined)return i;
 const j=pn.get(p+'|'+z);if(j>=0&&j!==undefined){viaName++;return j}
 unm.push(p+'/'+a+'/'+name);i=ents.length;eidx.set(p+'|'+a+'|'+z,i);ents.push({p,a,n:name.replace(/\s+/g,' ').trim(),k:'',extra:1});extra++;return i}
const opTypeOf=n=>{n=nz(n);if(n.startsWith('อบจ'))return'อบจ.';if(n.startsWith('อบต'))return'อบต.';if(n.startsWith('เทศบาลนคร'))return'เทศบาลนคร';if(n.startsWith('เทศบาลเมือง'))return'เทศบาลเมือง';if(n.startsWith('เทศบาลตำบล')||n.startsWith('ทต'))return'เทศบาลตำบล';if(n.includes('พัทยา')||n.includes('กรุงเทพ'))return'รูปแบบพิเศษ';return'อื่นๆ'};
// d2 name: type+name
const d2name=r=>{const t=nz(r[3]),n=nz(r[4]);return n.startsWith(t)||t===''?n:t+n};
V.forEach(r=>r.e=ent(r[1],r[2],r[3])); H.forEach(r=>r.e=ent(r[1],r[2],r[3])); D.forEach(r=>r.e=ent(r[1],r[2],d2name(r)));
// matching diagnostics
const s1=new Set(V.map(r=>r.e)),s2=new Set(D.map(r=>r.e)),s3=new Set(H.map(r=>r.e));
console.log('ents',ents.length,'vol',s1.size,'dev',s2.size,'veh',s3.size,'dev-only',[...s2].filter(i=>!s1.has(i)&&!s3.has(i)).length);
console.log('sample dev-only',[...s2].filter(i=>!s1.has(i)&&!s3.has(i)).slice(0,8).map(i=>ents[i].p+'/'+ents[i].a+'/'+ents[i].n));
console.log('sample veh-only',[...s3].filter(i=>!s1.has(i)&&!s2.has(i)).slice(0,8).map(i=>ents[i].p+'/'+ents[i].a+'/'+ents[i].n));
console.log('noGroup',[...new Set(ents.map(e=>e.p))].filter(p=>!P2G[p]));
// dictionaries
const dict=()=>{const m=new Map(),a=[];return{a,id:s=>{let i=m.get(s);if(i===undefined){i=a.length;m.set(s,i);a.push(s)}return i}}};
const cl=(s,fb='ไม่ระบุ')=>{s=(s||'').replace(/\s+/g,' ').trim();return(s===''||s==='-'||s==='0')?fb:s};
// volunteers
const male=/^(นาย|ด\.ช\.|เด็กชาย|ว่าที่(ร้อย|ร\.)?(ตรี|โท|เอก)?(?!หญิง)|ส\.ต\.|ส\.อ\.|จ\.ส\.|พ\.จ\.|ร\.ต\.|ร\.อ\.|พ\.ต\.|พ\.ท\.|พ\.อ\.|อส\.)/;
const gender=n=>{n=nz(n);if(/หญิง/.test(n)||/^(นางสาว|นาง|น\.ส\.|ด\.ญ\.|เด็กหญิง|นส\.)/.test(n))return'หญิง';if(male.test(n))return'ชาย';return'ไม่ระบุ'};
const SPEC=[['ดับเพลิง',/ดับเพลิง|ดับไฟ|เพลิง/],['กู้ภัย/กู้ชีพ/พยาบาล',/กู้|พยาบาล|แพทย์|สาธารณสุข|อสม|ปฐม|ช่วยชีวิต|CPR/i],['ช่าง/ก่อสร้าง',/ช่าง|ไฟฟ้า|ประปา|ก่อสร้าง|ไม้|เชื่อม|ปูน|เครื่องยนต์|ยานยนต์/],['เกษตรกรรม/ปศุสัตว์',/เกษตร|ทำนา|ทำสวน|ทำไร่|ปศุสัตว์|ประมง|เลี้ยง/],['จราจร/รักษาความปลอดภัย',/จราจร|รปภ|รักษาความปลอดภัย|ตำรวจ|ทหาร|ป้องกันฝ่ายพลเรือน|ยาม/],['ป้องกันและบรรเทาสาธารณภัย',/ป้องกัน|บรรเทา|สาธารณภัย|อปพร|ภัยพิบัติ|ทั่วไป/],['สื่อสาร/วิทยุ/คอมพิวเตอร์',/วิทยุ|สื่อสาร|คอม|IT|โทรคมนาคม/i],['ขับรถ/เรือ',/ขับ|พลขับ|เรือ|รถ/]];
const spec=s=>{s=(s||'').trim();if(s===''||/^[-–.0]+$/.test(s)||/^(ไม่มี|ไม่ระบุ|ไม่มีข้อมูล|ไม่)$/.test(s))return'ไม่ระบุ';for(const[k,re]of SPEC)if(re.test(s))return k;return'อื่นๆ'};
const sexD=dict(),specD=dict(),vagg=new Map();
V.forEach(r=>{const key=r.e+'|'+sexD.id(gender(r[4]))+'|'+specD.id(spec(r[7]));vagg.set(key,(vagg.get(key)||0)+1)});
const vol=[...vagg].map(([k,c])=>[...k.split('|').map(Number),c]);
// equipment/vehicle
const yr=y=>{y=+String(y).trim();return(y>=2480&&y<=2575)?y:0};
function agg(rows,gi,si,yi,hi){const gD=dict(),sD=dict(),hD=dict(),m=new Map();rows.forEach(r=>{const key=[r.e,gD.id(cl(r[gi])),sD.id(cl(r[si])),yr(r[yi]),hD.id(cl(r[hi],'ไม่ระบุ'))].join('|');m.set(key,(m.get(key)||0)+1)});
 return{g:gD.a,s:sD.a,h:hD.a,rows:[...m].map(([k,c])=>[...k.split('|').map(Number),c])}}
const dev=agg(D,8,9,12,5),veh=agg(H,11,12,9,10);
// compact entities, only those used
console.log('viaName',viaName,'extra',extra,'uniqueExtra',new Set(unm).size,[...new Set(unm)].slice(0,20));const used=new Set(ents.map((e,i)=>i).filter(i=>ents[i].master||s1.has(i)||s2.has(i)||s3.has(i)));const remap=new Map();const E=[];
[...used].sort((a,b)=>ents[a].p.localeCompare(ents[b].p,'th')).forEach(i=>{remap.set(i,E.length);const e=ents[i];E.push([e.p,e.a,e.n,opTypeOf(e.n)])});
const fix=(rows,pos=0)=>rows.forEach(r=>r[pos]=remap.get(r[pos]));
fix(vol);fix(dev.rows);fix(veh.rows);
const out={asof:'9 กันยายน 2569',E,groups:GROUPS,sex:sexD.a,spec:specD.a,vol,dev,veh,tot,kept:{vol:V.length,dev:D.length,veh:H.length}};
fs.writeFileSync('data.json',JSON.stringify(out));console.log('bytes',fs.statSync('data.json').size,'vol rows',vol.length,'dev',dev.rows.length,'veh',veh.rows.length,'E',E.length);
console.log(sexD.a,V.length);
const sc={};V.forEach(r=>{const s=spec(r[7]);sc[s]=(sc[s]||0)+1});console.log(sc);
const gc={};V.forEach(r=>{const s=gender(r[4]);gc[s]=(gc[s]||0)+1});console.log(gc);
console.log('dev groups',dev.g.length,'sub',dev.s.length,'haz',dev.h.length,'| veh',veh.g.length,veh.s.length,veh.h.length);
