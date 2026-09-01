/* Self-contained SVG plots. This function is also embedded in HTML exports. */
function makeBellPlot(mount, records, options={}) {
  const field=options.field||'era',filtered=!!options.filtered,title=options.title||'Loop dimensions';
  const data=records.filter(r=>!filtered||r.filtered_visible);
  const groups=[...new Set(records.map(r=>String(r[field]||'Not stated')))].sort();
  const palette=['#276554','#b66b38','#4c7099','#985a77','#80794a','#6b627a','#477c7d','#9d493c'];
  const color=g=>palette[Math.max(0,groups.indexOf(g))%palette.length];
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeURL=s=>/^https?:\/\//.test(s||'')?s:'#';
  const num=x=>Number(x).toFixed(2),id=r=>'#'+String(r.serial).padStart(3,'0');
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const nice=x=>{const k=10**Math.floor(Math.log10(x));return Math.ceil(x/k)*k;};
  const maxX=filtered?50:nice(Math.max(...data.map(r=>r.x))*1.05),maxY=filtered?50:nice(Math.max(...data.map(r=>r.y))*1.05);
  const uid='clip-'+Math.random().toString(36).slice(2),left=82,top=45,width=826,height=400;
  const X=x=>left+x/maxX*width,Y=y=>top+height-y/maxY*height;
  let selectedGroup=groups.includes(options.selectedGroup)?options.selectedGroup:'All categories',hook=options.hook!==false,svg;
  mount.classList.add('plot-panel');
  mount.innerHTML=`<div class="plot-title-row"><h3>${esc(title)}</h3><span class="plot-count"></span></div><div class="plot-controls"><label>Highlight / filter <select aria-label="Filter ${esc(title)}"><option>All categories</option>${groups.map(g=>`<option>${esc(g)}</option>`).join('')}</select></label><label><input type="checkbox" ${hook?'checked':''}> Show Ambal reference ★</label><button type="button" class="reset-plot">Reset</button></div><div class="svg-host"></div><div class="plot-selection" aria-live="polite">Select a point for the exact period, material and source. Colour categories are broad display groupings.</div><div class="export-row">${['PNG','JPG','SVG','HTML'].map(t=>`<button type="button" class="export-button" data-format="${t}">Download ${t}</button>`).join('')}</div><p class="micro">${filtered?'1.0×IQR filter + 50 × 50 frame; the master still contains 73 records.':'Full source dataset; no outlier filtering.'} Star height includes the base; it is not ring-only height.</p>`;
  const selection=mount.querySelector('.plot-selection'),select=mount.querySelector('select'),checkbox=mount.querySelector('input');
  function detail(r){
    selection.innerHTML=`<strong>${esc(id(r)+' · '+r.name)}</strong> — ${esc(r.id)}<br>Loop W/D ${num(r.x)} · h ${num(r.y)} · ${esc(r.period)} · ${esc(r.material)}<br>${esc(r.region)} · ${esc(r.source)} <a href="${esc(safeURL(r.url))}" target="_blank" rel="noopener">Original source ↗</a>`;
    if(typeof options.onSelect==='function'){const b=document.createElement('button');b.textContent='Full record';b.className='export-button';b.onclick=()=>options.onSelect(r);selection.append(' ',b);}
  }
  function draw(){
    const shown=data.filter(r=>selectedGroup==='All categories'||String(r[field]||'Not stated')===selectedGroup);
    mount.querySelector('.plot-count').textContent=`${shown.length} of ${data.length} records · ${hook?'+ reference star':'dataset only'}`;
    const legend=groups.filter(g=>data.some(r=>String(r[field]||'Not stated')===g));
    const legendLines=legend.flatMap(g=>{const chunks=g.match(/.{1,95}(?:\s|$)|.{1,95}/g)||[g];return chunks.map((text,i)=>({g,text,i}));});
    const totalH=558+legendLines.length*20;
    let content=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 ${totalH}" class="plot-svg" role="img" aria-label="${esc(title)}: loop width versus height"><rect width="960" height="${totalH}" fill="#fffef9"/><text x="82" y="23" fill="#243a33" font-family="Arial,sans-serif" font-size="15">${esc(title)} · ${filtered?'filtered':'full dataset'} · ${shown.length} records</text><defs><clipPath id="${uid}"><rect x="${left}" y="${top}" width="${width}" height="${height}"/></clipPath></defs>`;
    for(let i=0;i<=5;i++){
      const x=left+i*width/5,y=top+i*height/5;
      content+=`<path d="M ${x} ${top} V ${top+height} M ${left} ${y} H ${left+width}" fill="none" stroke="#e4e7df" stroke-width="1"/><text x="${x}" y="470" text-anchor="middle" fill="#68736b" font-size="13" font-family="Arial">${Number((maxX*i/5).toFixed(2))}</text><text x="69" y="${y+4}" text-anchor="end" fill="#68736b" font-size="13" font-family="Arial">${Number((maxY*(5-i)/5).toFixed(2))}</text>`;
    }
    content+=`<path d="M 82 45 V 445 H 908" fill="none" stroke="#52665a"/><text x="495" y="500" text-anchor="middle" font-family="Arial" font-size="16" fill="#243a33">Loop outer width / diameter (mm)</text><text transform="translate(22 245) rotate(-90)" text-anchor="middle" font-family="Arial" font-size="16" fill="#243a33">Loop height h (mm)</text><g clip-path="url(#${uid})">`;
    for(const r of shown)content+=`<circle data-serial="${r.serial}" cx="${X(r.x)}" cy="${Y(r.y)}" r="4.5" fill="${color(String(r[field]||'Not stated'))}" stroke="#fffef9" stroke-width="1" fill-opacity="0.87" tabindex="0" role="button" aria-label="${esc(id(r)+' '+r.name+', width '+num(r.x)+', height '+num(r.y))}"><title>${esc(id(r)+' '+r.name+' | '+r.period+' | '+r.material+' | '+num(r.x)+' × '+num(r.y))}</title></circle>`;
    content+='</g>';
    if(hook){const pts=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?6.2:15;pts.push(`${X(6.45)+r*Math.cos(a)},${Y(8.16)+r*Math.sin(a)}`);}content+=`<circle cx="${X(6.45)}" cy="${Y(8.16)}" r="18" fill="#fffef9" stroke="#ba332b" stroke-width="2.5"/><polygon class="reference-star" points="${pts.join(' ')}" fill="#ba332b" stroke="#243a33" stroke-width="1.5" tabindex="0" role="button" aria-label="Ambal reference: width 6.45, whole component height 8.16"><title>Ambal reference: 6.45 × 8.16; whole component height, not ring-only</title></polygon>`;}
    content+=`<text x="82" y="524" font-family="Arial" font-size="13" fill="#7b5140">${hook?'★ Ambal reference: 6.45 × 8.16 — height includes the surviving base.':'Dataset only — Ambal reference is hidden.'}</text>`;
    legendLines.forEach((l,i)=>{const y=549+i*20;content+=(l.i===0?`<circle cx="87" cy="${y-4}" r="4" fill="${color(l.g)}"/>`:'')+`<text x="99" y="${y}" font-family="Arial" font-size="13" fill="#52665a">${esc(l.text)}</text>`;});
    content+='</svg>';mount.querySelector('.svg-host').innerHTML=content;svg=mount.querySelector('svg');
    svg.querySelectorAll('[data-serial]').forEach(p=>{const r=records.find(r=>r.serial===Number(p.dataset.serial));p.style.cursor='pointer';p.onclick=()=>detail(r);p.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();detail(r);}};});
    const star=svg.querySelector('.reference-star');if(star){const f=()=>selection.textContent='★ Ambal reference · Width 6.45 mm; whole surviving component height 8.16 mm. CAD ring-only outer height is 6.75 mm. Dimensional proximity does not establish archaeological identity.';star.onclick=f;star.onkeydown=e=>{if(e.key==='Enter')f();};}
  }
  select.value=selectedGroup;select.onchange=()=>{selectedGroup=select.value;draw();};checkbox.onchange=()=>{hook=checkbox.checked;draw();};mount.querySelector('.reset-plot').onclick=()=>{selectedGroup='All categories';select.value=selectedGroup;hook=options.hook!==false;checkbox.checked=hook;draw();};
  function save(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),60000);}
  mount.querySelectorAll('[data-format]').forEach(b=>b.onclick=async()=>{
    try{const format=b.dataset.format,base=`BellRecon_${filtered?'Filtered':'Full'}_${field}_${hook?'With_Reference':'Dataset_Only'}`;
      if(format==='HTML'){
        const opts={field,filtered,title,hook,selectedGroup},jsData=JSON.stringify(records).replace(/</g,'\\u003c'),jsOptions=JSON.stringify(opts).replace(/</g,'\\u003c');
        const text='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(title)+' — BellRecon</title><style>body{max-width:1100px;margin:30px auto;padding:15px;font:16px/1.6 Arial;background:#f6f3ec;color:#243a33}.plot-svg{width:100%;height:auto}.plot-controls,.export-row{display:flex;gap:14px;flex-wrap:wrap;margin:15px 0}button,select{padding:8px;background:#fffef9;border:1px solid #c7cec2;color:inherit;font-size:14px}.plot-selection{padding:14px;background:#e5e9de}.micro{font-size:14px}.plot-count{font-size:14px}h1,h3{font-family:Georgia}</style><h1>BellRecon</h1><p>Source-linked comparative bell dimensions. Image-scaled estimates, not precision metrology.</p><main id="plot"></main><script>('+makeBellPlot.toString()+')(document.getElementById("plot"),'+jsData+','+jsOptions+');<\/script></html>';
        save(new Blob([text],{type:'text/html'}),base+'.html');return;
      }
      const blob=new Blob([svg.outerHTML],{type:'image/svg+xml'});
      if(format==='SVG'){save(blob,base+'.svg');return;}
      const u=URL.createObjectURL(blob),img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=u;});const canvas=document.createElement('canvas');canvas.width=1920;canvas.height=svg.viewBox.baseVal.height*2;const ctx=canvas.getContext('2d');ctx.fillStyle='#fffef9';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);URL.revokeObjectURL(u);const image=await new Promise(resolve=>canvas.toBlob(resolve,format==='JPG'?'image/jpeg':'image/png',.95));if(!image)throw Error('Image export unavailable');save(image,base+'.'+format.toLowerCase());
    }catch(e){selection.textContent='Export could not finish. Please retry or use SVG/HTML.';}
  });draw();return{draw,records:data};
}
if(typeof window!=='undefined')window.makeBellPlot=makeBellPlot;
if(typeof module!=='undefined')module.exports=makeBellPlot;
