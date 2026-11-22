// ============================================================
//  SERTIFIKAT — tata letak bawaan & penggambar kanvas (A4 landscape 1123×794 px)
// ============================================================
const BUILTIN = { logo: 'assets/logo.png', tiger: 'assets/harimau.png' };
const imgCache={};
const assetStore = {};   // id gambar di server → data URL
function img(src) {
  let u = BUILTIN[src] || src;
  if (typeof u === 'string' && u.indexOf('asset:') === 0) { const id = u.slice(6); u = assetStore[id]; if (!u) { if (window.onAssetMissing) window.onAssetMissing(id); return { complete: false, naturalWidth: 0 }; } }
  if (!imgCache[u]) { const im = new Image(); im.onload = () => { if (window.onImgLoad) window.onImgLoad(); }; im.src = u; imgCache[u] = im; }
  return imgCache[u];
}

/* ---------- menggambar sertifikat (koordinat px 96 dpi: A4 1123×794, F4 1247×813, mendatar) ---------- */
const PAPER={A4:{w:1123,h:794,mm:[297,210],label:'A4 · 297 × 210 mm'},F4:{w:1247,h:813,mm:[330,215],label:'F4 · 330 × 215 mm'}};
function paperOf(layout){const m=(layout||[]).find(e=>e&&e.type==='page');return m&&PAPER[m.paper]?m.paper:'A4'}
function dims(layout){return PAPER[paperOf(layout)]}
const G='#1f4d2e',DK='#163a22',GOLD='#b8913a',CREAM='#f6efdc';
const FONTS=['Montserrat','Poppins','Playfair Display','Cinzel','Merriweather','Oswald','Great Vibes','Times New Roman','Arial'];
function fnt(el,w,s){return (el.it?'italic ':'')+w+' '+s+'px "'+el.font+'", Arial, sans-serif'}
function poly(c,pts,fill){c.beginPath();for(let i=0;i<pts.length;i+=2)i?c.lineTo(pts[i],pts[i+1]):c.moveTo(pts[i],pts[i+1]);c.closePath();c.fillStyle=fill;c.fill()}
function line(c,x1,y1,x2,y2,col,w){c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.strokeStyle=col;c.lineWidth=w;c.stroke()}
function shade(hex,f){const n=parseInt(String(hex).slice(1),16)||0;return 'rgb('+[(n>>16)&255,(n>>8)&255,n&255].map(v=>Math.round(v*f))+')'}
const RIB=[['M238,252 L238,365 L400,492 Q230,540 130,640 L150,445 L5,385 Q120,300 238,252 Z',1],['M1632,252 L1632,365 L1470,492 Q1640,540 1740,640 L1720,445 L1865,385 Q1750,300 1632,252 Z',1],['M268,372 L422,338 L422,482 Z',0],['M1602,372 L1448,338 L1448,482 Z',0],['M260,80 Q935,-80 1610,80 L1610,355 Q935,161 260,355 Z',1]];

function T(o){return {type:'text',font:'Montserrat',w:500,it:false,color:G,sp:0,maxW:0,align:'center',show:'all',deco:'',upper:false,...o}}
function defaultLayout(c={},mode){
  const sig=(x,side,t,n)=>[T({label:'Jabatan '+side,t,x,y:621,s:15,color:'#2b4a35',maxW:280}),{type:'rule',label:'Garis tanda tangan '+side,x,y:708,w:240,h:2,color:G,show:'all'},T({label:'Nama penandatangan '+side,t:n,x,y:723,s:13,w:800,maxW:280})];
  return [
    {type:'image',label:'Watermark harimau',src:'tiger',x:561,y:460,w:620,op:c.wm??0.14,show:'all'},
    {type:'ribbon',label:'Pita',x:561,y:120,w:440,color:G,show:'all'},
    {type:'image',label:'Logo ASAD',src:'logo',x:561,y:75,w:122,op:1,show:'all'},
    T({label:'Pengurus Kabupaten',t:'PENGURUS KABUPATEN',x:561,y:218,s:20,sp:3}),
    T({label:'Persinas ASAD',t:'PERSINAS ASAD',x:561,y:253,s:44,w:800,sp:1}),
    T({label:'Kutai Timur',t:'KUTAI TIMUR',x:561,y:288,s:20,sp:4}),
    T({label:'Sertifikat',t:'SERTIFIKAT',x:561,y:336,s:64,w:800,sp:8}),
    {type:'divider',label:'Hiasan garis (sertifikat juara)',x:561,y:381,w:260,color:GOLD,show:'juara'},
    T({label:'Penghargaan (sertifikat peserta)',t:'PENGHARGAAN',x:561,y:382,s:18,w:700,sp:6,deco:'lines',show:'peserta'}),
    T({label:'Diberikan kepada',t:'Diberikan kepada :',x:561,y:404,s:16,color:'#3a5844'}),
    T({label:mode==='desa'?'Nama desa':'Nama peserta',t:'{nama}',x:561,y:443,s:34,w:800,sp:1,maxW:860,deco:'underline',upper:true}),
    T({label:'Kalimat keterangan',t:'Atas prestasinya dalam **"{event}"** di {tempat} sebagai :',tp:'Atas partisipasi dan semangatnya dalam **"{event}"** di {tempat} sebagai :',x:561,y:490,s:16,color:'#2b4a35',maxW:900}),
    T({label:'Hasil / juara',t:'{hasil}',x:561,y:528,s:42,w:800,sp:2,maxW:900,upper:true}),
    ...(mode==='desa'?[]:[T({label:'Kelas, SD kelas & desa',t:'{keterangan}',x:561,y:559,s:16,w:600,color:'#2b4a35',maxW:620})]),
    {type:'medal',label:'Medali',x:561,y:652,w:96,show:'all'},
    T({label:'Kota & tanggal',t:c.tanggal||'Kutai Timur, ........................ 2026',x:791,y:585,s:17,w:700,maxW:300}),
    ...sig(331,'kiri',c.s1t||'Dewan Pembina\nPersinas ASAD KUTIM',c.s1n||'H. MUFLIKUN ASSIDDIQI, SH.'),
    ...sig(791,'kanan',c.s2t||'Ketua\nPersinas ASAD KUTIM',c.s2n||'H. KHOIRUL ARIFIN, S.Sos., S.H., M.H.')
  ];
}
function fillT(el,p,cfg){
  const j=p.h!=='Peserta';let t=(!j&&el.tp!=null)?el.tp:el.t;const tp=(cfg.tempat||'').trim();
  if(!tp)t=t.replace(/\s*di\s*\{tempat\}/g,'');
  const ket=[p.kk?'Kelas '+p.kk:'',p.sd?'SD Kelas '+p.sd:'',p.d||''].filter(Boolean).join(' · ');
  t=t.replace(/\{desa\}/g,p.d||'').replace(/\{sdkelas\}/g,p.sd||'').replace(/\{kelas\}/g,p.kk||'').replace(/\{keterangan\}/g,ket);
  const isD=cfg.mode==='desa';let nm=p.n||(isD?'Nama Desa':'Nama Peserta');
  if(isD&&p.n&&cfg.prefix&&!p.n.toLowerCase().startsWith(cfg.prefix.toLowerCase()+' '))nm=cfg.prefix+' '+p.n;
  return t.replace(/\{nama\}/g,nm).replace(/\{hasil\}/g,(j?p.h:'Peserta')+(isD&&p.k?' '+p.k:'')).replace(/\{event\}/g,cfg.ev).replace(/\{tempat\}/g,tp);
}
function parseRuns(l){const o=[];l.split(/(\*\*[^*]+\*\*)/).forEach(s=>{if(!s)return;/^\*\*[^*]+\*\*$/.test(s)?o.push({t:s.slice(2,-2),b:1}):o.push({t:s,b:0})});return o.length?o:[{t:'',b:0}]}
function drawText(c,el,p,cfg){
  let t=fillT(el,p,cfg);if(el.upper)t=t.toUpperCase();
  const lines=t.split('\n').map(parseRuns),sp=+el.sp||0;let size=+el.s||10;
  const lw=runs=>{let w=0,n=0;for(const r of runs){c.font=fnt(el,r.b?800:el.w,size);if(sp)for(const ch of r.t){w+=c.measureText(ch).width;n++}else w+=c.measureText(r.t).width}return w+(sp?sp*Math.max(0,n-1):0)};
  let ws=lines.map(lw),mx=Math.max(0,...ws);
  if(+el.maxW&&mx>+el.maxW){size=size*el.maxW/mx;ws=lines.map(lw);mx=Math.max(0,...ws)}
  const lh=size*1.3,H=lines.length*lh;c.textBaseline='middle';c.textAlign='left';c.fillStyle=el.color;
  lines.forEach((runs,i)=>{const w=ws[i];let x=el.align==='left'?el.x:el.align==='right'?el.x-w:el.x-w/2;const y=el.y-(lines.length-1)*lh/2+i*lh;
    for(const r of runs){c.font=fnt(el,r.b?800:el.w,size);if(sp)for(const ch of r.t){c.fillText(ch,x,y);x+=c.measureText(ch).width+sp}else{c.fillText(r.t,x,y);x+=c.measureText(r.t).width}}});
  const x1=el.align==='left'?el.x:el.align==='right'?el.x-mx:el.x-mx/2;
  if(el.deco==='underline'){const y=el.y+(lines.length-1)*lh/2+size*.76;line(c,x1-48,y,x1+mx+48,y,GOLD,2)}
  if(el.deco==='lines'){line(c,x1-110,el.y,x1-16,el.y,GOLD,2);line(c,x1+mx+16,el.y,x1+mx+110,el.y,GOLD,2)}
  const pad=Math.max(0,(24-mx)/2);return{x1:x1-pad,y1:el.y-H/2,x2:x1+mx+pad,y2:el.y+H/2};
}
function drawEl(c,el,p,cfg){
  const x=+el.x,y=+el.y,w=+el.w;
  if(el.type==='text')return drawText(c,el,p,cfg);
  if(el.type==='image'){const im=img(el.src);let h=w;if(im.complete&&im.naturalWidth){h=w*im.naturalHeight/im.naturalWidth;c.globalAlpha=+el.op;c.drawImage(im,x-w/2,y-h/2,w,h);c.globalAlpha=1}return{x1:x-w/2,y1:y-h/2,x2:x+w/2,y2:y+h/2}}
  if(el.type==='ribbon'){const k=w/1870;c.save();c.translate(x-935*k,y-320*k);c.scale(k,k);c.lineJoin='round';for(const [d,m] of RIB){const P=new Path2D(d);c.fillStyle=m?el.color:shade(el.color,.7);c.fill(P);c.strokeStyle=CREAM;c.lineWidth=10;c.stroke(P)}c.restore();return{x1:x-w/2,y1:y-320*k,x2:x+w/2,y2:y+320*k}}
  if(el.type==='medal'){const k=w/96;c.save();c.translate(x-48*k,y-60*k);c.scale(k,k);
    poly(c,[30,62,18,116,34,106,44,118,50,70],G);poly(c,[66,62,78,116,62,106,52,118,46,70],DK);
    const circ=(r,f)=>{c.beginPath();c.arc(48,46,r,0,7);c.fillStyle=f;c.fill()};circ(40,GOLD);circ(33,'#e2c675');
    c.beginPath();c.arc(48,46,27,0,7);c.strokeStyle=GOLD;c.lineWidth=2;c.stroke();
    poly(c,[48,30,52.1,40.3,63.2,41.1,54.7,48.2,57.4,58.9,48,53,38.6,58.9,41.3,48.2,32.8,41.1,43.9,40.3],'#9c7a2c');
    c.restore();return{x1:x-w/2,y1:y-60*k,x2:x+w/2,y2:y+60*k}}
  if(el.type==='divider'){const h=w/2;line(c,x-h,y,x-18,y,el.color,2);line(c,x+18,y,x+h,y,el.color,2);poly(c,[x,y-7,x+7,y,x,y+7,x-7,y],el.color);return{x1:x-h,y1:y-9,x2:x+h,y2:y+9}}
  if(el.type==='rule'){line(c,x-w/2,y,x+w/2,y,el.color,+el.h||2);return{x1:x-w/2,y1:y-7,x2:x+w/2,y2:y+7}}
  return null;
}
const visible=(el,p)=>!el.hidden&&(!el.show||el.show==='all'||(el.show==='juara')===(p.h!=='Peserta'));
function drawCert(c,sc,p,cfg,layout,boxes){
  const {w:W,h:H}=dims(layout);
  c.setTransform(sc,0,0,sc,0,0);
  c.fillStyle=CREAM;c.fillRect(0,0,W,H);
  poly(c,[0,0,190,0,0,330],G);poly(c,[0,0,110,0,0,190],DK);line(c,214,0,0,372,GOLD,3);
  poly(c,[W-190,0,W,0,W,240],G);poly(c,[W-100,0,W,0,W,130],DK);line(c,W-214,0,W,278,GOLD,3);
  poly(c,[0,H-194,0,H,194,H],G);poly(c,[0,H-114,0,H,114,H],DK);line(c,0,H-214,214,H,GOLD,3);
  poly(c,[W,H-194,W,H,W-194,H],G);poly(c,[W,H-114,W,H,W-114,H],DK);line(c,W,H-214,W-214,H,GOLD,3);
  c.strokeStyle=GOLD;c.lineWidth=2.5;c.strokeRect(34,34,W-68,H-68);c.strokeStyle='#d9b968';c.lineWidth=1;c.strokeRect(43,43,W-86,H-86);
  layout.forEach((el,i)=>{const b=visible(el,p)?drawEl(c,el,p,cfg):null;if(boxes)boxes[i]=b});
  c.setTransform(1,0,0,1,0,0);
}
function loadFonts(layout){if(!document.fonts)return Promise.resolve();const s=new Set();layout.forEach(el=>{if(el.type==='text'){s.add(fnt(el,el.w,20));s.add(fnt(el,800,20))}});return Promise.all([...s].map(f=>document.fonts.load(f).catch(()=>{})))}
