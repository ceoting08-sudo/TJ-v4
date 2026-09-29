const KEY="TJPRO_v3";const ACCOUNT_KEY="TJPRO_ACCOUNT_v1";
let trades=JSON.parse(localStorage.getItem(KEY)||"[]");
let account={initial:1000,currency:"USD"};
try{account={...account,...JSON.parse(localStorage.getItem(ACCOUNT_KEY)||"{}")}}catch(e){}
let calDate=new Date();const $=id=>document.getElementById(id),today=()=>new Date().toISOString().slice(0,10);$("fDate").value=today();
function pnlOf(t){const v=Number(t.pnl);return Number.isFinite(v)?v:(Number(t.risk)||0)*(Number(t.r)||0)}
function stats(a=trades){let r=a.reduce((s,t)=>s+ +t.r,0),pnl=a.reduce((s,t)=>s+pnlOf(t),0),w=a.filter(t=>t.result==="WIN"),l=a.filter(t=>t.result==="LOSS"),gw=w.reduce((s,t)=>s+Math.max(0,+t.r),0),gl=Math.abs(l.reduce((s,t)=>s+Math.min(0,+t.r),0)),eq=0,peak=0,dd=0;a.forEach(t=>{eq+=+t.r;peak=Math.max(peak,eq);dd=Math.max(dd,peak-eq)});return{r,pnl,w:w.length,l:l.length,n:a.length,wr:a.length?w.length/a.length*100:0,pf:gl?gw/gl:gw?Infinity:0,exp:a.length?r/a.length:0,dd,gw,gl}}
function save(msg){localStorage.setItem(KEY,JSON.stringify(trades));render();toast(msg||"Enregistré ✓")}
function toast(x){let t=$("toast");t.textContent=x;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1700)}
function go(p){document.querySelectorAll(".page").forEach(x=>x.classList.toggle("active",x.id===p));document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.dataset.page===p));scrollTo(0,0)}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>go(b.dataset.page));document.querySelectorAll("[data-pagego]").forEach(b=>b.onclick=()=>go(b.dataset.pagego));
function row(t){let c=t.result==="WIN"?"win":t.result==="LOSS"?"loss":"be",p=pnlOf(t);return `<div class="tradeRow"><div class="tradeMain"><b>${t.asset} • ${t.direction}</b><span>${t.date} ${t.time} • ${t.tf}</span>${t.imageData?`<div class="tradeImage"><img src="${t.imageData}" alt="Capture du trade"></div>`:""}</div><div class="tradeMeta">${t.session}<br>${t.setup||"—"}</div><div class="${c}"><b>${t.result}</b></div><div class="${p>=0?"win":"loss"}"><b>${p>=0?"+":""}${p.toFixed(2)} $</b><br><span>${t.r>=0?"+":""}${(+t.r).toFixed(2)} R</span><br><button class="iconBtn" onclick="del(${t.id})">🗑️</button></div></div>`}
window.del=id=>{if(confirm("Supprimer ce trade ?")){trades=trades.filter(t=>t.id!==id);save("Trade supprimé")}}
function bars(id,key,vals){let b=$(id);if(!trades.length){b.innerHTML='<p class="muted">Pas encore de données.</p>';return}let d=vals.map(v=>{let a=trades.filter(t=>t[key]===v),r=a.reduce((s,t)=>s+ +t.r,0);return[v,r,a.length]}),mx=Math.max(1,...d.map(x=>Math.abs(x[1])));b.innerHTML=d.map(x=>`<div class="barRow"><div class="barTop"><span>${x[0]} (${x[2]})</span><b class="${x[1]>=0?"win":"loss"}">${x[1]>=0?"+":""}${x[1].toFixed(2)} R</b></div><div class="barTrack"><div class="barFill ${x[1]<0?"loss":""}" style="width:${Math.min(100,Math.abs(x[1])/mx*100)}%"></div></div></div>`).join("")}
function chart(){let c=$("equityChart"),ctx=c.getContext("2d"),w=c.clientWidth,h=230,d=devicePixelRatio||1;c.width=w*d;c.height=h*d;ctx.scale(d,d);let a=[...trades].sort((x,y)=>(x.date+x.time).localeCompare(y.date+y.time)),lim=$("chartPeriod").value;if(lim!=="all")a=a.slice(-+lim);let v=[0],e=0;a.forEach(t=>{e+=+t.r;v.push(e)}),mx=Math.max(...v,1),mn=Math.min(...v,-1),rg=mx-mn||1;ctx.strokeStyle="#23314a";for(let i=0;i<5;i++){let y=15+i*(h-30)/4;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}ctx.beginPath();v.forEach((x,i)=>{let X=10+i*(w-20)/Math.max(1,v.length-1),Y=15+(mx-x)/rg*(h-30);i?ctx.lineTo(X,Y):ctx.moveTo(X,Y)});ctx.strokeStyle="#7d9cff";ctx.lineWidth=2.5;ctx.stroke()}
function render(){let s=stats(),balance=(Number(account.initial)||0)+s.pnl;$("balanceValue").textContent="$"+balance.toFixed(2);$("balanceChange").textContent=(s.pnl>=0?"+":"")+s.pnl.toFixed(2)+" $ depuis le capital initial";$("heroProfit").textContent=(s.r>=0?"+":"")+s.r.toFixed(2)+" R";$("heroR").textContent=`${s.r.toFixed(2)} R • ${s.n} trade${s.n>1?"s":""}`;$("mWin").textContent=s.wr.toFixed(1)+"%";$("mPF").textContent=s.pf===Infinity?"∞":s.pf.toFixed(2);$("mExp").textContent=s.exp.toFixed(2)+" R";$("mDD").textContent="-"+s.dd.toFixed(2)+" R";chart();bars("sessionBars","session",["Londres","New York","Asie","Autre"]);bars("mentalBars","mental",["Calme","Confiant","Hésitant","Stressé","FOMO","Revenge"]);let recent=[...trades].reverse().slice(0,5);$("recent").innerHTML=recent.length?recent.map(row).join(""):'<p class="muted">Aucun trade enregistré.</p>';let q=$("search").value.toLowerCase(),fr=$("filterResult").value,fs=$("filterSession").value,a=[...trades].reverse().filter(t=>(!q||JSON.stringify(t).toLowerCase().includes(q))&&(!fr||t.result===fr)&&(!fs||t.session===fs));$("tradeList").innerHTML=a.length?a.map(row).join(""):'<p class="muted">Aucun résultat.</p>';calendar();analysis();risk()}
function calendar(){let y=calDate.getFullYear(),m=calDate.getMonth(),first=new Date(y,m,1),days=new Date(y,m+1,0).getDate(),off=(first.getDay()+6)%7;$("monthTitle").textContent=first.toLocaleDateString("fr-FR",{month:"long",year:"numeric"});let h="";for(let i=0;i<off;i++)h+='<button class="empty"></button>';for(let d=1;d<=days;d++){let ds=`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`,a=trades.filter(t=>t.date===ds),r=a.reduce((s,t)=>s+ +t.r,0);h+=`<button class="${a.length?(r>=0?"winDay":"lossDay"):""} ${ds===today()?"today":""}" onclick="day('${ds}')">${d}${a.length?`<span class="dayR">${r>=0?"+":""}${r.toFixed(1)}R</span>`:""}</button>`}$("calendarGrid").innerHTML=h}
window.day=ds=>{let a=trades.filter(t=>t.date===ds),r=a.reduce((s,t)=>s+ +t.r,0);$("dayDetail").innerHTML=`<h2>${new Date(ds+"T12:00").toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}</h2>${a.length?`<p class="${r>=0?"win":"loss"}"><b>${r>=0?"+":""}${r.toFixed(2)} R</b> • ${a.length} trade(s)</p>${a.map(row).join("")}`:'<p class="muted">Aucun trade ce jour.</p>'}`}
function group(k){let ns=[...new Set(trades.map(t=>t[k]).filter(Boolean))];return ns.length?ns.map(n=>{let s=stats(trades.filter(t=>t[k]===n));return `<div class="tradeRow"><div><b>${n}</b><br><span class="muted">${s.n} trades</span></div><div>${s.wr.toFixed(0)}%</div><div>${s.exp.toFixed(2)}R</div><div class="${s.r>=0?"win":"loss"}"><b>${s.r>=0?"+":""}${s.r.toFixed(2)}R</b></div></div>`}).join(""):'<p class="muted">Pas encore de données.</p>'}
function analysis(){let s=stats();$("aTrades").textContent=s.n;$("aWin").textContent=(s.gw/(s.w||1)).toFixed(2)+" R";$("aLoss").textContent=-(s.gl/(s.l||1)).toFixed(2)+" R";$("aR").textContent=s.r.toFixed(2)+" R";$("setupTable").innerHTML=group("setup");$("tfTable").innerHTML=group("tf")}
function risk(){let cap=+$("capital").value||0,p=+$("riskPct").value||0,sl=+$("slPoints").value||0,rr=+$("targetRR").value||0;$("riskDollar").textContent="$"+(cap*p/100).toFixed(2);$("lotHint").textContent=sl?`TP ${sl*rr} pts`:"—"}
function open(){ $("modal").classList.add("open");$("fDate").value=today()}function close(){$("modal").classList.remove("open")}
$("newTrade").onclick=open;$("newTradeTop").onclick=open;$("closeModal").onclick=close;$("modal").onclick=e=>{if(e.target.id==="modal")close()};
function compressImage(file,maxSize=1000,quality=.62){
 return new Promise((resolve,reject)=>{if(!file){resolve("");return}
 const fr=new FileReader();fr.onload=()=>{const img=new Image();img.onload=()=>{let w=img.width,h=img.height,scale=Math.min(1,maxSize/Math.max(w,h));w=Math.round(w*scale);h=Math.round(h*scale);const c=document.createElement("canvas");c.width=w;c.height=h;c.getContext("2d").drawImage(img,0,0,w,h);resolve(c.toDataURL("image/jpeg",quality))};img.onerror=reject;img.src=fr.result};fr.onerror=reject;fr.readAsDataURL(file)})
}
$("tradeForm").onsubmit=async e=>{e.preventDefault();let r=+$("fR").value,riskv=+$("fRisk").value||0;let manual=$("fPnl").value.trim(),pnl=manual===""?riskv*r:+manual;let imageData="";try{imageData=await compressImage($("fImage").files?.[0])}catch(err){alert("L'image n'a pas pu être ajoutée, mais le trade peut être enregistré.")}trades.push({id:Date.now(),date:$("fDate").value,time:$("fTime").value,asset:$("fAsset").value,session:$("fSession").value,tf:$("fTf").value,direction:$("fDir").value,risk:riskv,rr:+$("fRR").value||0,result:$("fResult").value,r,pnl,setup:$("fSetup").value,mental:$("fMental").value,rules:$("fRules").value,reason:$("fReason").value,lesson:$("fLesson").value,imageData});e.target.reset();$("fAsset").value="XAUUSD";$("imagePreview").innerHTML="";close();save()};

function csvEscape(v){
  const s = String(v ?? "");
  return '"' + s.replace(/"/g,'""') + '"';
}
const CSV_FIELDS=["id","date","time","asset","session","tf","direction","risk","rr","result","r","pnl","setup","mental","rules","reason","lesson"];
function exportCSV(){
  const lines=[CSV_FIELDS.join(",")];
  trades.forEach(t=>lines.push(CSV_FIELDS.map(k=>csvEscape(t[k])).join(",")));
  const blob=new Blob(["\ufeff"+lines.join("\n")],{type:"text/csv;charset=utf-8"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="trading-journal-trades.csv";
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  toast("Trades exportés ✓");
}
function exportJSON(){
  const blob=new Blob([JSON.stringify(trades,null,2)],{type:"application/json"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="trading-journal-trades.json";
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function parseCSV(text){
  const rows=[]; let row=[], cell="", quoted=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i], nx=text[i+1];
    if(quoted){
      if(ch==='"' && nx==='"'){cell+='"';i++}
      else if(ch==='"') quoted=false;
      else cell+=ch;
    }else{
      if(ch==='"') quoted=true;
      else if(ch===','){row.push(cell);cell=""}
      else if(ch==='\n'){row.push(cell);rows.push(row);row=[];cell=""}
      else if(ch!=='\r') cell+=ch;
    }
  }
  if(cell.length || row.length){row.push(cell);rows.push(row)}
  return rows;
}
function normalizeImported(t,i){
  return {
    id: Number(t.id)||Date.now()+i,
    date:t.date||today(),
    time:t.time||"00:00",
    asset:t.asset||"XAUUSD",
    session:t.session||"Autre",
    tf:t.tf||"M5",
    direction:t.direction||"BUY",
    risk:Number(t.risk)||0,
    rr:Number(t.rr)||0,
    result:t.result||"BREAK-EVEN",
    r:Number(t.r)||0,
    pnl:Number.isFinite(Number(t.pnl))?Number(t.pnl):(Number(t.risk)||0)*(Number(t.r)||0),
    setup:t.setup||"",
    mental:t.mental||"Calme",
    rules:t.rules||"Oui",
    reason:t.reason||"",
    lesson:t.lesson||"",
    imageData:t.imageData||""
  };
}
function importData(text,name){
  try{
    let incoming=[];
    if(name.toLowerCase().endsWith(".json")){
      const parsed=JSON.parse(text);
      incoming=Array.isArray(parsed)?parsed:[];
    }else{
      const rows=parseCSV(text);
      if(!rows.length) throw new Error("CSV vide");
      const headers=rows[0].map(x=>x.trim());
      incoming=rows.slice(1).filter(r=>r.some(Boolean)).map(r=>{
        const o={}; headers.forEach((h,i)=>o[h]=r[i]??""); return o;
      });
    }
    incoming=incoming.map(normalizeImported);
    if(!incoming.length) throw new Error("Aucun trade trouvé");
    const existing=new Set(trades.map(t=>String(t.id)));
    let added=0;
    incoming.forEach(t=>{
      let id=String(t.id);
      if(existing.has(id)){t.id=Date.now()+Math.floor(Math.random()*1000000); id=String(t.id)}
      existing.add(id); trades.push(t); added++;
    });
    save(`${added} trade${added>1?"s":""} importé${added>1?"s":""} ✓`);
  }catch(err){
    alert("Import impossible : "+err.message);
  }
}
$("exportTrades").onclick=exportCSV;
$("importTrades").onclick=()=>$("importFile").click();
$("importFile").onchange=e=>{
  const file=e.target.files?.[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>importData(String(reader.result),file.name);
  reader.readAsText(file);
  e.target.value="";
};
["search","filterResult","filterSession","chartPeriod"].forEach(x=>$(x).addEventListener("input",render));["capital","riskPct","slPoints","targetRR"].forEach(x=>$(x).addEventListener("input",risk));$("prevMonth").onclick=()=>{calDate.setMonth(calDate.getMonth()-1);calendar()};$("nextMonth").onclick=()=>{calDate.setMonth(calDate.getMonth()+1);calendar()};addEventListener("resize",chart);render();
function saveAccount(){localStorage.setItem(ACCOUNT_KEY,JSON.stringify(account));render();toast("Capital initial enregistré ✓")}
$("setCapitalBtn").onclick=()=>{const v=prompt("Capital initial du compte en $",String(account.initial));if(v!==null&&!isNaN(+v)&&+v>=0){account.initial=+v;$("capital").value=account.initial;saveAccount()}};
$("capital").addEventListener("change",()=>{const v=+$("capital").value;if(Number.isFinite(v)&&v>=0){account.initial=v;localStorage.setItem(ACCOUNT_KEY,JSON.stringify(account));render()}});
$("fImage").addEventListener("change",async e=>{const f=e.target.files?.[0];$("imagePreview").innerHTML="";if(!f)return;try{const src=await compressImage(f,700,.6);$("imagePreview").innerHTML=`<img src="${src}" alt="Aperçu">`}catch(err){}});
