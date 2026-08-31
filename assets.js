/* Byte-preserving access to source assets. No photo or CAD transformation. */
(() => {
  'use strict';
  let manifestPromise;
  const packs=new Map(), urls=new Map();
  const manifest=()=>manifestPromise||(manifestPromise=fetch('data/assets.json').then(r=>{if(!r.ok)throw Error('Asset index unavailable');return r.json();}));
  const mime=n=>({'pdf':'application/pdf','jpg':'image/jpeg','jpeg':'image/jpeg','png':'image/png','xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','json':'application/json','py':'text/plain','step':'application/step','stl':'application/octet-stream','brep':'application/octet-stream','txt':'text/plain'}[n.split('.').pop().toLowerCase()]||'application/octet-stream');
  const pack=p=>{if(!packs.has(p))packs.set(p,fetch(p).then(r=>{if(!r.ok)throw Error('Source file download failed. Please retry.');return r.arrayBuffer();}).catch(e=>{packs.delete(p);throw e;}));return packs.get(p);};
  async function bytes(path,verify=false){
    const item=(await manifest())[path];if(!item)throw Error('Unknown source file');
    const parts=await Promise.all(item.segments.map(async s=>new Uint8Array(await pack(s.path),s.offset,s.length)));
    const blob=new Blob(parts,{type:mime(path)});
    if(blob.size!==item.bytes)throw Error('Source size mismatch');
    if(verify){const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer())),b=>b.toString(16).padStart(2,'0')).join('');if(hash!==item.sha256)throw Error('Source integrity check failed');}
    return blob;
  }
  async function url(path){if(!urls.has(path))urls.set(path,bytes(path).then(b=>URL.createObjectURL(b)));return urls.get(path);}
  function save(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),60000);}
  function link(path,download=false){return 'asset.html?file='+encodeURIComponent(path)+(download?'&download=1':'');}
  const observed=new WeakSet();
  async function loadImage(img){try{img.src=await url(img.dataset.asset);}catch(e){img.classList.add('asset-error');img.alt+=' — image unavailable; retry the page';}}
  const observer=typeof IntersectionObserver!=='undefined'?new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){observer.unobserve(e.target);loadImage(e.target);}},{rootMargin:'500px'}):null;
  function hydrate(root=document){
    root.querySelectorAll('img[data-asset]').forEach(img=>{if(observed.has(img))return;observed.add(img);if(observer)observer.observe(img);else loadImage(img);});
    root.querySelectorAll('[data-file]').forEach(a=>{a.href=link(a.dataset.file,true);a.target='_blank';a.rel='noopener';});
    root.querySelectorAll('[data-view-file]').forEach(a=>{a.href=link(a.dataset.viewFile);a.target='_blank';a.rel='noopener';});
  }
  // ZIP32 with STORE entries. CRC32 and UTF-8 filenames preserve all source bytes.
  const crcTable=Uint32Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
  function crc32(b){let c=0xffffffff;for(const x of b)c=crcTable[(c^x)&255]^(c>>>8);return(c^0xffffffff)>>>0;}
  async function zip(entries,progress=()=>{}){
    const local=[],central=[];let offset=0,index=0;
    for(const entry of entries){
      const data=new Uint8Array(await entry.blob.arrayBuffer()),name=new TextEncoder().encode(entry.name),crc=crc32(data);
      const h=new Uint8Array(30+name.length),v=new DataView(h.buffer);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint16(12,33,true);v.setUint32(14,crc,true);v.setUint32(18,data.length,true);v.setUint32(22,data.length,true);v.setUint16(26,name.length,true);h.set(name,30);
      const c=new Uint8Array(46+name.length),w=new DataView(c.buffer);w.setUint32(0,0x02014b50,true);w.setUint16(4,20,true);w.setUint16(6,20,true);w.setUint16(8,0x800,true);w.setUint16(14,33,true);w.setUint32(16,crc,true);w.setUint32(20,data.length,true);w.setUint32(24,data.length,true);w.setUint16(28,name.length,true);w.setUint32(42,offset,true);c.set(name,46);
      local.push(h,entry.blob);central.push(c);offset+=h.length+data.length;progress(++index,entries.length);
    }
    const end=new Uint8Array(22),v=new DataView(end.buffer);v.setUint32(0,0x06054b50,true);v.setUint16(8,entries.length,true);v.setUint16(10,entries.length,true);v.setUint32(12,central.reduce((s,c)=>s+c.length,0),true);v.setUint32(16,offset,true);
    return new Blob([...local,...central,end],{type:'application/zip'});
  }
  window.ResearchAssets={manifest,bytes,url,save,link,hydrate,zip};
})();
