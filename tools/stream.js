const fs=require('fs');
const [,,inp,out]=process.argv;
const ss=fs.existsSync(inp.replace(/worksheets.*/,'sharedStrings.xml'))?null:null;
let shared=null;const sp=inp.replace(/worksheets.*/,'sharedStrings.xml');
if(fs.existsSync(sp)){const t=fs.readFileSync(sp,'utf8');shared=[...t.matchAll(/<si>([\s\S]*?)<\/si>/g)].map(m=>[...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map(x=>x[1]).join(''))}
const dec=s=>s.replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,'&');
const col=r=>{let n=0;for(const ch of r.replace(/\d/g,''))n=n*26+ch.charCodeAt(0)-64;return n-1};
const o=fs.createWriteStream(out);let buf='',cnt=0;
const rs=fs.createReadStream(inp,{encoding:'utf8',highWaterMark:1<<22});
function proc(row){const cells=[];for(const m of row.matchAll(/<c r="([A-Z]+\d+)"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)){const body=m[3]||'';let v='';
 if(/t="inlineStr"/.test(m[2])){const t=body.match(/<t[^>]*>([\s\S]*?)<\/t>/);v=t?dec(t[1]):''}
 else{const t=body.match(/<v>([\s\S]*?)<\/v>/);v=t?dec(t[1]):'';if(/t="s"/.test(m[2])&&shared)v=shared[+v]}
 cells[col(m[1])]=v}
 const arr=[];for(let i=0;i<cells.length;i++)arr.push(cells[i]===undefined?'':cells[i]);o.write(JSON.stringify(arr)+'\n');cnt++}
rs.on('data',c=>{buf+=c;let i;while((i=buf.indexOf('</row>'))>=0){const s=buf.lastIndexOf('<row',i);if(s>=0)proc(buf.slice(s,i));buf=buf.slice(i+6)}});
rs.on('end',()=>{o.end();console.log(inp,cnt)});
