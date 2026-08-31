"""Validate the published byte packs and data without modifying source files."""
from pathlib import Path
import hashlib, json, re, struct, zipfile
ROOT=Path(__file__).resolve().parent
manifest=json.loads((ROOT/'data/assets.json').read_text())
packs={str(p.relative_to(ROOT)):p.read_bytes() for p in (ROOT/'assets/packs').glob('*.bin')}
for path,item in manifest.items():
    raw=b''.join(packs[s['path']][s['offset']:s['offset']+s['length']] for s in item['segments'])
    assert len(raw)==item['bytes'],path
    assert hashlib.sha256(raw).hexdigest()==item['sha256'],path
records=json.loads((ROOT/'data/records.json').read_text());stats=json.loads((ROOT/'data/analysis.json').read_text())
assert len(records)==73 and sum(r['filtered_visible'] for r in records)==55
assert stats['nearest_serials'][:5]==[48,40,30,46,59]
for r in records:
    for k in ['photo','evidence','ruler','report','excel']:assert r[k] in manifest,(r['serial'],k)
    assert r['url'].startswith(('https://','http://'))
html=(ROOT/'index.html').read_text()
for attr in ['data-file','data-view-file','data-asset']:
    for path in re.findall(attr+r'="([^"]+)"',html):assert path in manifest,path
for ref in re.findall(r'(?:href|src)="([^"]+)"',html):
    if not ref.startswith(('#','http','data:')):assert (ROOT/ref.split('?')[0]).is_file(),ref
stlpath='cad/CAD/Bell_Hook_Inner_Edge_Join.stl';item=manifest[stlpath]
raw=b''.join(packs[s['path']][s['offset']:s['offset']+s['length']] for s in item['segments'])
n=struct.unpack_from('<I',raw,80)[0];assert len(raw)==84+n*50
xyz=[struct.unpack_from('<3f',raw,84+i*50+12+j*12) for i in range(n) for j in range(3)]
extent=[max(v[k] for v in xyz)-min(v[k] for v in xyz) for k in range(3)]
assert abs(extent[2]-8.16)<1e-5 and abs(extent[0]-8.01)<1e-5
for p in (ROOT/'downloads').glob('*.zip'):
    with zipfile.ZipFile(p) as z:assert z.testzip() is None
print(json.dumps({'asset_files_verified':len(manifest),'unique_byte_packs':len(packs),'records':73,'filtered':55,'stl_triangles':n,'stl_bounds':extent,'html_local_links':'PASS','byte_hashes':'PASS'},indent=2))
