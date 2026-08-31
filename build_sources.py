"""Reproducible, source-only website asset preparation. Does not edit source workbooks or CAD."""
from pathlib import Path
import csv, hashlib, html, json, math, re, shutil, zipfile
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent
UPLOAD = ROOT.parent / 'upload'
SOURCE = ROOT.parent / 'sources'
def dump(path, value):
    target = ROOT/path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(value, ensure_ascii=False, indent=2))
def digest(raw): return hashlib.sha256(raw).hexdigest()

# Read cached cell values directly; retain the original XLSX byte-for-byte.
book = SOURCE/'dataset/Bell_Dataset_73_Master.xlsx'
NS = {'x':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
with zipfile.ZipFile(book) as z:
    strings = []
    if 'xl/sharedStrings.xml' in z.namelist():
        strings = [''.join(n.itertext()) for n in ET.fromstring(z.read('xl/sharedStrings.xml'))]
    rows = {}
    for row in ET.fromstring(z.read('xl/worksheets/sheet1.xml')).findall('.//x:row', NS):
        vals = []
        for c in row.findall('x:c', NS):
            col = re.match('[A-Z]+', c.attrib['r'])[0]
            idx = 0
            for char in col: idx = idx*26+ord(char)-64
            while len(vals)<idx: vals.append(None)
            value = c.find('x:v',NS)
            value = value.text if value is not None else None
            if c.attrib.get('t')=='s' and value is not None: value=strings[int(value)]
            elif c.attrib.get('t')=='inlineStr': value=''.join(c.find('x:is',NS).itertext())
            elif value is not None and c.attrib.get('t') not in ('str','e'):
                value=float(value)
            if c.attrib.get('t')=='e': raise ValueError(f'Excel error {c.attrib["r"]}: {value}')
            vals[idx-1]=value
        rows[int(row.attrib['r'])]=vals
headers=rows[4][:18]
keys=['serial','photo','photo_file','name','source','period','material','H','W','D','h','loop_width','loop_type','B','h_B','h_DW','notes','url']
records=[]
for rn in range(5,78):
    vals=rows[rn]
    vals += [None]*(18-len(vals))
    r=dict(zip(keys,vals[:18])); r['serial']=int(r['serial']); records.append(r)
assert len(records)==73 and [r['serial'] for r in records]==list(range(1,74))

graph_names = {
 'full-dataset.html':'Bell_Loop_Dataset_73_Only(1).html',
 'full-with-hook.html':'Bell_Loop_Interactive_Graph_With_Measured_Hook(1).html',
 'filtered-dataset.html':'Bell_Loop_Dataset_73_Only_Outliers_Removed.html',
 'filtered-with-hook.html':'Bell_Loop_Outliers_Removed_With_Our_Hook.html'}
graph_data=[]
for dest,name in graph_names.items():
    content=(UPLOAD/name).read_text()
    decoded=html.unescape(content)
    data=json.loads(re.search(r'const data\s*=\s*(\[.*?\]);',decoded,re.S)[1])
    if graph_data: assert graph_data==data
    graph_data=data
    target=ROOT/'graphs'/dest; target.parent.mkdir(exist_ok=True)
    # Git normalizes CRLF in text files; exact uploaded bytes are retained in the ZIP below.
    target.write_text(content)
(ROOT/'downloads').mkdir(exist_ok=True)
with zipfile.ZipFile(ROOT/'downloads/Original_Graph_HTMLs.zip','w',zipfile.ZIP_DEFLATED) as z:
    for name in graph_names.values(): z.write(UPLOAD/name,name)

files={}
for p in sorted((SOURCE/'dataset').rglob('*')):
    if p.is_file(): files['collection/'+p.relative_to(SOURCE/'dataset').as_posix()]=p
for p in sorted((SOURCE/'cad').rglob('*')):
    if p.is_file(): files['cad/'+p.relative_to(SOURCE/'cad').as_posix()]=p
photos=[]
for i,p in enumerate(sorted((SOURCE/'photos').glob('*.jpeg')),1):
    logical=f'artefact/original-{i:02}.jpeg'; files[logical]=p
    photos.append({'path':logical,'original_name':p.name})
assert len(photos)==15
photo_for=lambda name:next(p['path'] for p in photos if p['original_name']==name)
dump('data/artefact-photos.json',photos)
dump('data/featured-photos.json',{
 'artefact':photo_for('WhatsApp Image 2026-08-31 at 11.11.23 AM.jpeg'),
 'ruler':photo_for('WhatsApp Image 2026-08-31 at 11.11.15 AM.jpeg'),
 'caliper':photo_for('WhatsApp Image 2026-08-31 at 11.11.13 AM.jpeg')})

for r,g in zip(records,graph_data):
    assert r['serial']==g['s']
    assert abs(r['loop_width']-g['x'])<=.005001, (r['serial'],r['loop_width'],g['x'])
    assert abs(r['h']-g['y'])<=.005001
    assert abs(r['B']-g['b'])<=.005001
    assert abs(r['H']-r['h']-r['B'])<0.011
    assert abs(r['h_B']-r['h']/r['B'])<0.00011
    assert abs(r['h_DW']-r['h']/(r['D'] or r['W']))<0.00011
    r.update(id=g['id'],x=g['x'],y=g['y'],region=g['site'])
    r['photo']='collection/01_Photos/'+r['photo_file']
    assert r['photo'] in files
    prefix=f"{r['serial']:03}_"
    for key,folder,suffix in [('evidence','02_Evidence','.pdf'),('excel','03_Excel_Data','.xlsx'),('report','04_Ruler_Reports','.pdf'),('ruler','04_Ruler_Reports','.png')]:
        matches=[n for n in files if n.startswith('collection/'+folder+'/') and Path(n).name.startswith(prefix) and n.endswith(suffix)]
        assert len(matches)==1,(key,prefix,matches)
        r[key]=matches[0]
    p=str(r['period'] or '')
    if re.search('reproduction|replica',p,re.I): era='Modern reproduction / reference'
    elif re.search(r'BCE|B\.C\.',p): era='BCE–CE range' if re.search(r'(?<!B)CE|A\.D\.',p) else 'BCE-dated'
    elif re.search(r'CE|A\.D\.|century|\d{4}',p,re.I): era='CE / century-dated'
    else: era='Other / no explicit era'
    r['era']=era
    mat=str(r['material']).lower()
    r['material_group']=next((label for term,label in [('bronze','Bronze'),('brass','Brass'),('copper','Copper / copper alloy'),('iron','Iron'),('gold','Gold'),('silver','Silver')] if term in mat),'Other / unspecified')
    r['distance']=math.hypot(r['x']-6.45,r['y']-8.16)

def bounds(key):
    a=sorted(r[key] for r in records)
    def q(p):
        idx=(len(a)-1)*p; lo=math.floor(idx); hi=math.ceil(idx)
        return a[lo]+(a[hi]-a[lo])*(idx-lo)
    q1,q3=q(.25),q(.75)
    return dict(q1=q1,q3=q3,low=q1-(q3-q1),high=q3+(q3-q1))
bx,by=bounds('x'),bounds('y')
for r in records:
    r['outlier']=not(bx['low']<=r['x']<=bx['high'] and by['low']<=r['y']<=by['high'])
    r['outside_frame']=not(0<=r['x']<=50 and 0<=r['y']<=50)
    r['filtered_visible']=not(r['outlier'] or r['outside_frame'])
nearest=sorted(records,key=lambda r:(r['distance'],r['serial']))[:15]
assert nearest[0]['serial']==48
stats={'total':73,'iqr_outliers':[r['serial'] for r in records if r['outlier']],
 'frame_excluded_after_iqr':[r['serial'] for r in records if not r['outlier'] and r['outside_frame']],
 'filtered_count':sum(r['filtered_visible'] for r in records),'x_bounds':bx,'y_bounds':by,
 'reference':{'x':6.45,'y':8.16,'height_basis':'whole component including surviving base; not ring-only height'},
 'nearest_serials':[r['serial'] for r in nearest]}
assert stats['filtered_count']==55 and len(stats['iqr_outliers'])==17
dump('data/records.json',records); dump('data/analysis.json',stats)
dump('data/columns.json',list(zip(keys,headers)))
dump('data/cad-dimensions.json',json.loads((SOURCE/'cad/CAD/Dimensions_and_Validation.json').read_text()))
for name,rs in [('Bell_73_Web_Data.csv',records),('Nearest_15.csv',nearest)]:
    with (ROOT/'downloads'/name).open('w',newline='') as f:
        cols=[k for k in records[0] if k!='photo']
        writer=csv.DictWriter(f,fieldnames=cols,extrasaction='ignore'); writer.writeheader(); writer.writerows(rs)

# Immutable byte packs keep duplicate 50 MB evidence documents from being uploaded twice.
# Individual source filenames and SHA256 remain visible in the manifest. No compression,
# resizing, recolouring, spreadsheet editing, or CAD rebuilding is performed.
pack_dir=ROOT/'assets/packs'; pack_dir.mkdir(parents=True,exist_ok=True)
pack_size=8_000_000; pack=bytearray(); pack_no=1; manifest={}; seen={}
def flush():
    global pack,pack_no
    (pack_dir/f'part-{pack_no:03}.bin').write_bytes(pack)
    pack=bytearray(); pack_no+=1
order=sorted(files,key=lambda n:(0 if n.startswith('artefact/') else 1 if '/01_Photos/' in n else 2 if n.startswith('cad/') else 3,n))
for logical in order:
    raw=files[logical].read_bytes(); sha=digest(raw)
    if sha in seen: segments=seen[sha]
    else:
        offset=0; segments=[]
        while offset<len(raw):
            take=min(pack_size-len(pack),len(raw)-offset)
            segments.append({'path':f'assets/packs/part-{pack_no:03}.bin','offset':len(pack),'length':take})
            pack.extend(raw[offset:offset+take]); offset+=take
            if len(pack)==pack_size: flush()
        seen[sha]=segments
    manifest[logical]={'bytes':len(raw),'sha256':sha,'segments':segments}
if pack:flush()
dump('data/assets.json',manifest)
report={'source_records':len(records),'photos':73,'evidence':73,'individual_excel':73,'ruler_png':73,'ruler_pdf':73,
 'original_artefact_photos':15,'source_excel_images':len([n for n in zipfile.ZipFile(book).namelist() if n.startswith('xl/media/')]),
 'all_graph_values_match_excel':True,'ratios_reconciled':True,'source_bytes_preserved':True,
 'unique_asset_bytes':sum(p.stat().st_size for p in pack_dir.glob('*.bin')),'analysis':stats}
dump('data/validation.json',report)
print(json.dumps(report,indent=2))
