(async()=>{
 'use strict';
 const A=ResearchAssets,esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),fmt=(x,k='')=>x===null||x===undefined||x===''?'Not provided':typeof x==='number'?x.toFixed(k.startsWith('h_')?4:2):String(x),sid=r=>String(r.serial).padStart(3,'0');
 const get=async p=>{const r=await fetch(p);if(!r.ok)throw Error('Data unavailable. Please reload.');return r.json();};
 try{
  const [records,columns,photos,featured]=await Promise.all(['data/records.json','data/columns.json','data/artefact-photos.json','data/featured-photos.json'].map(get));
  for(const[id,key]of[['ruler-photo','ruler'],['caliper-photo','caliper']])document.getElementById(id).dataset.asset=featured[key];
  document.getElementById('original-gallery').innerHTML=photos.map(p=>`<figure><a data-view-file="${esc(p.path)}"><img loading="lazy" data-asset="${esc(p.path)}" alt="Original artefact photograph, ${esc(p.original_name)}"></a><figcaption>${esc(p.original_name)}<br><a data-file="${esc(p.path)}">Download original ↗</a></figcaption></figure>`).join('');
  const dialog=document.getElementById('record-dialog');document.getElementById('close-dialog').onclick=()=>dialog.close();dialog.onclick=e=>{if(e.target===dialog)dialog.close();};
  function show(r){
    const details=columns.filter(([k])=>k!=='photo').map(([k,label])=>`<dt>${esc(label)}</dt><dd>${k==='url'?`<a href="${esc(r[k])}" target="_blank" rel="noopener">Original source ↗</a>`:esc(k==='serial'?sid(r):fmt(r[k],k))}</dd>`).join('');
    document.getElementById('record-detail').innerHTML=`<div class="detail-layout"><div><img data-asset="${esc(r.photo)}" alt="${esc(r.name)}"><div class="actions">${[['Photo',r.photo],['Ruler PNG',r.ruler],['Report PDF',r.report],['Evidence PDF',r.evidence],['Individual Excel',r.excel]].map(([label,path])=>`<a data-view-file="${esc(path)}">${label} ↗</a>`).join('')}</div></div><div><p class="eyebrow">RECORD ${sid(r)} · ${esc(r.id)}</p><h2>${esc(r.name)}</h2><dl>${details}<dt>Region / site (supplied graph)</dt><dd>${esc(r.region)}</dd><dt>Dimensional distance to Ambal reference</dt><dd>${r.distance.toFixed(3)} mm (two-dimensional Euclidean distance)</dd><dt>Display status</dt><dd>${r.filtered_visible?'Visible in both views':r.outlier?'IQR-excluded from close-up; retained in full dataset':'Outside 50 × 50 frame; retained in full dataset'}</dd></dl></div></div>`;A.hydrate(dialog);dialog.showModal();
  }
  const collection=document.getElementById('collection');
  function gallery(query=''){
    const q=query.toLowerCase().trim(),rs=records.filter(r=>[sid(r),r.id,r.name,r.period,r.material,r.source,r.region].join(' ').toLowerCase().includes(q));
    collection.innerHTML=rs.length?rs.map(r=>`<button class="record-card" data-record="${r.serial}"><img loading="lazy" data-asset="${esc(r.photo)}" alt="${esc(r.name)}"><small>${sid(r)} / ${esc(r.id)}</small><strong>${esc(r.name)}</strong><span>${esc(r.period)}</span><span>W/D ${r.x.toFixed(2)} · h ${r.y.toFixed(2)}</span></button>`).join(''):'<p>No matching records. Try a serial number, material or source.</p>';
    collection.querySelectorAll('[data-record]').forEach(b=>b.onclick=()=>show(records.find(r=>r.serial===Number(b.dataset.record))));A.hydrate(collection);document.getElementById('record-count').textContent=`${rs.length} of 73 records`;
  }
  gallery();document.getElementById('search').oninput=e=>gallery(e.target.value);
  for(const filtered of [true,false])for(const[field,title]of[['era','By era / period'],['material_group','By material'],['region','By reported region / site'],['source','By source / institution']]){const panel=document.createElement('article');document.getElementById(filtered?'filtered-plots':'full-plots').append(panel);makeBellPlot(panel,records,{field,title,filtered,hook:true,onSelect:show});}
  const nearest=[...records].sort((a,b)=>a.distance-b.distance||a.serial-b.serial).slice(0,15),table=document.getElementById('nearest-table');
  table.querySelector('thead').innerHTML='<tr><th>Rank</th><th>Distance (mm)</th>'+columns.map(([,label])=>`<th>${esc(label)}</th>`).join('')+'<th>Region / site</th></tr>';
  table.querySelector('tbody').innerHTML=nearest.map((r,i)=>`<tr><td>${i+1}</td><td>${r.distance.toFixed(3)}</td>${columns.map(([k])=>`<td>${k==='photo'?`<button class="outline" data-record="${r.serial}" aria-label="Open record ${sid(r)}"><img loading="lazy" data-asset="${esc(r.photo)}" alt="${esc(r.name)}"></button>`:k==='url'?`<a href="${esc(r.url)}" target="_blank" rel="noopener">Source ↗</a>`:esc(k==='serial'?sid(r):fmt(r[k],k))}</td>`).join('')}<td>${esc(r.region)}</td></tr>`).join('');table.querySelectorAll('[data-record]').forEach(b=>b.onclick=()=>show(records.find(r=>r.serial===Number(b.dataset.record))));
  A.hydrate();startBellModel();
  let downloading=false;
  document.querySelectorAll('[data-bundle]').forEach(button=>button.onclick=async()=>{
    if(downloading)return;downloading=true;const buttons=[...document.querySelectorAll('[data-bundle]')];buttons.forEach(b=>b.disabled=true);const status=document.getElementById('download-status');status.textContent='Preparing source files…';
    try{
      const kind=button.dataset.bundle,manifest=await A.manifest();
      const selectors={all:()=>true,photos:n=>n.startsWith('collection/01_Photos/'),evidence:n=>n.startsWith('collection/02_Evidence/'),rulers:n=>n.startsWith('collection/04_Ruler_Reports/'),artefact:n=>n.startsWith('artefact/'),cad:n=>n.startsWith('cad/')};
      const paths=Object.keys(manifest).filter(selectors[kind]),entries=[];
      for(let i=0;i<paths.length;i++){const path=paths[i];status.textContent=`Reading & verifying ${i+1} / ${paths.length} files…`;entries.push({name:path,blob:await A.bytes(path,true)});}
      if(kind==='all')for(const path of ['graphs/full-dataset.html','graphs/full-with-hook.html','graphs/filtered-dataset.html','graphs/filtered-with-hook.html','downloads/Original_Graph_HTMLs.zip','downloads/Bell_73_Web_Data.csv','downloads/Nearest_15.csv','models/original-profile/Bell_Hook_Original_Profile.step','models/original-profile/Bell_Hook_Original_Profile.stl','models/original-profile/Bell_Hook_Original_Profile.brep','models/original-profile/Bell_Hook_Original_Profile_Engineering_Drawing.pdf','data/records.json','data/analysis.json','data/artefact-photos.json','data/cad-dimensions.json','data/assets.json','data/validation.json','RESEARCH_METHODS.md']){const r=await fetch(path);if(!r.ok)throw Error('A research file could not be downloaded');entries.push({name:path,blob:await r.blob()});}
      const zip=await A.zip(entries,(i,total)=>{status.textContent=`Packaging ${i} / ${total} files…`;});A.save(zip,`BellRecon_${kind==='all'?'Complete_Research_Collection':kind}.zip`);status.textContent=`Ready: ${entries.length} files packaged. If prompted, choose Save. Keep the browser open until the download finishes.`;
    }catch(e){status.textContent=e.message+' Please retry; no source files were changed.';}finally{downloading=false;buttons.forEach(b=>b.disabled=false);}
  });
 }catch(e){const p=document.createElement('p');p.className='load-error';p.textContent=e.message;document.getElementById('dataset').prepend(p);}
})();
