const catalog={schemaVersion:1,lastReviewed:null,entries:[]};
const ORIGINS=new Set(["https://kamenriderspider1-coder.github.io"]);
const HOSTS=new Set(["gamebanana.com","www.gamebanana.com","files.gamebanana.com","projectplusgame.com","www.projectplusgame.com"]);
const MAX_PAGE=2*1024*1024,MAX_FILE=100*1024*1024;
const cors=o=>({...ORIGINS.has(o)?{"Access-Control-Allow-Origin":o}:{}, "Access-Control-Allow-Methods":"GET, OPTIONS","Access-Control-Allow-Headers":"Content-Type","Access-Control-Max-Age":"600","Vary":"Origin"});
const json=(b,s,o)=>new Response(JSON.stringify(b),{status:s,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff",...cors(o)}});
function safeUrl(v){try{const u=new URL(v);return u.protocol==="https:"&&HOSTS.has(u.hostname.toLowerCase())?u:null}catch{return null}}
async function readText(r,limit){if(Number(r.headers.get("content-length")||0)>limit)throw Error("Page exceeds 2 MB scan limit.");const rd=r.body?.getReader();if(!rd)return "";let chunks=[],n=0;try{while(true){const x=await rd.read();if(x.done)break;n+=x.value.byteLength;if(n>limit){await rd.cancel();throw Error("Page exceeds 2 MB scan limit.")}chunks.push(x.value)}}finally{rd.releaseLock()}const b=new Uint8Array(n);let p=0;for(const c of chunks){b.set(c,p);p+=c.length}return new TextDecoder().decode(b)}
function scan(html,base){const found=[],seen=new Set(),re=/<a\b[^>]*?href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a\s*>/gi;let m;while((m=re.exec(html))&&found.length<20){const raw=(m[1]||m[2]||m[3]||"").replace(/&amp;/g,"&").trim(),label=(m[4]||"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim().slice(0,120);let u;try{u=new URL(raw,base)}catch{continue}if(!safeUrl(u.href)||seen.has(u.href))continue;const zip=/\.zip(?:$|[?#])/i.test(u.href),dl=/\/(?:dl|download)(?:\/|\?|$)/i.test(u.pathname+u.search)&&/download|archive|zip/i.test(label);if(!zip&&!dl)continue;seen.add(u.href);found.push({url:u.href,label:label||"Download archive",host:u.hostname})}return found}
async function discover(raw){const u=safeUrl(raw);if(!u)return {error:"Only HTTPS GameBanana and Project+ creator pages are supported."};const r=await fetch(u,{redirect:"follow",headers:{Accept:"text/html,application/xhtml+xml","User-Agent":"BrawlModManager/1.0"},signal:AbortSignal.timeout(15000)});const final=safeUrl(r.url||u.href);if(!final)return {error:"Creator page redirected outside supported domains."};if(!r.ok)return {error:"Creator page returned HTTP "+r.status};if(!/text\/html|application\/xhtml\+xml/i.test(r.headers.get("content-type")||""))return {error:"Source did not return HTML."};return {source:final.href,candidates:scan(await readText(r,MAX_PAGE),final.href)}}
async function searchWeb(q){
 const query=String(q||"").trim().slice(0,180);
 if(query.length<2)return {error:"Enter at least two characters."};
 const full=query+" Super Smash Bros. Brawl Wii mod";
 const endpoint="https://html.duckduckgo.com/html/?q="+encodeURIComponent(full);
 const r=await fetch(endpoint,{headers:{Accept:"text/html","User-Agent":"Mozilla/5.0 BrawlModManager/1.0"},signal:AbortSignal.timeout(12000)});
 if(!r.ok)return {error:"Search provider returned HTTP "+r.status};
 const html=await readText(r,2*1024*1024);
 const results=[],seen=new Set();
 const re=/<a[^>]*class=["'][^"']*result__a[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>([\\s\\S]*?)<\\/a>/gi;
 let m;
 while((m=re.exec(html))&&results.length<12){
  let href=m[1].replace(/&amp;/g,"&"),u;
  try{const x=new URL(href,"https://html.duckduckgo.com");u=x.searchParams.get("uddg")?new URL(x.searchParams.get("uddg")):x;}catch{continue}
  if(!["http:","https:"].includes(u.protocol)||seen.has(u.href))continue;
  seen.add(u.href);
  const title=m[2].replace(/<[^>]*>/g," ").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\\s+/g," ").trim().slice(0,180);
  const pos=m.index,frag=html.slice(pos,Math.min(html.length,pos+1800));
  const sm=frag.match(/class=["'][^"']*result__snippet[^"']*["'][^>]*>([\\s\\S]*?)<\\/[^>]+>/i);
  const snippet=sm?sm[1].replace(/<[^>]*>/g," ").replace(/&amp;/g,"&").replace(/\\s+/g," ").trim().slice(0,300):"";
  if(title)results.push({title,url:u.href,snippet});
 }
 return {query,results};
}
async function download(raw,o){const u=safeUrl(raw);if(!u)return json({ok:false,error:"Unsupported download host."},400,o);const r=await fetch(u,{redirect:"follow",headers:{Accept:"application/zip,application/octet-stream,*/*","User-Agent":"BrawlModManager/1.0"},signal:AbortSignal.timeout(60000)});if(!safeUrl(r.url||u.href))return json({ok:false,error:"Download redirected outside supported domains."},403,o);if(!r.ok||!r.body)return json({ok:false,error:"Download returned HTTP "+r.status},502,o);if(Number(r.headers.get("content-length")||0)>MAX_FILE)return json({ok:false,error:"Archive exceeds 100 MB."},413,o);const rd=r.body.getReader();let total=0;const body=new ReadableStream({async pull(c){try{const x=await rd.read();if(x.done){c.close();return}total+=x.value.byteLength;if(total>MAX_FILE){await rd.cancel();c.error(Error("Archive exceeds 100 MB."));return}c.enqueue(x.value)}catch(e){c.error(e)}},cancel(){return rd.cancel()}});return new Response(body,{headers:{"Content-Type":"application/zip","Content-Disposition":'attachment; filename="creator-mod.zip"',"Cache-Control":"no-store","X-Content-Type-Options":"nosniff",...cors(o)}})}
export default{async fetch(req){const u=new URL(req.url),o=req.headers.get("Origin")||"";if(o&&!ORIGINS.has(o))return json({ok:false,error:"Origin not allowed"},403,"");if(req.method==="OPTIONS")return o?new Response(null,{status:204,headers:cors(o)}):new Response(null,{status:403});if(req.method!=="GET")return json({ok:false,error:"Method not allowed"},405,o);if(["/","/health","/api/health"].includes(u.pathname))return json({ok:true,service:"brawl-mod-manager-cloud-api",version:"1.2.0",capabilities:["health-check","read-only-catalog","creator-page-link-discovery","bounded-archive-proxy","in-app-web-search"],notEnabled:["server-side-MEGA-account-access","background-jobs","Wii-file-serving","mod-installation"]},200,o);if(["/catalog","/api/catalog"].includes(u.pathname))return json(catalog,200,o);if(u.pathname==="/api/search"){try{const x=await searchWeb(u.searchParams.get("q")||"");return x.error?json({ok:false,error:x.error},400,o):json({ok:true,...x},200,o)}catch(e){return json({ok:false,error:e.message||"Search failed"},502,o)}}if(u.pathname==="/api/discover"){try{const x=await discover(u.searchParams.get("url")||"");return x.error?json({ok:false,error:x.error},400,o):json({ok:true,...x},200,o)}catch(e){return json({ok:false,error:e.message||"Scan failed"},502,o)}}if(u.pathname==="/api/archive")return download(u.searchParams.get("url")||"",o);return json({ok:false,error:"Route not found"},404,o)}};