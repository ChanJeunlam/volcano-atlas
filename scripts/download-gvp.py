"""离线刷新官方快照；校验失败时不覆盖原文件。"""
import argparse,datetime,hashlib,json,urllib.request,urllib.parse,uuid,tempfile,shutil
from pathlib import Path
from gvp_normalize import normalize_collection
from update_safety import check_refresh
ROOT=Path(__file__).resolve().parents[1]
URL='https://webservices.volcano.si.edu/geoserver/GVP-VOTW/ows?'+urllib.parse.urlencode({'service':'WFS','version':'1.0.0','request':'GetFeature','typeName':'GVP-VOTW:Smithsonian_VOTW_Holocene_Volcanoes','outputFormat':'application/json','maxFeatures':'5000'})
def main():
    parser=argparse.ArgumentParser();parser.add_argument('--source',help='已经下载的原始 JSON');parser.add_argument('--allow-large-drop',action='store_true',help='人工确认官方收录变化后才使用');args=parser.parse_args()
    raw=Path(args.source).read_bytes() if args.source else urllib.request.urlopen(URL,timeout=60).read()
    data=json.loads(raw);items=normalize_collection(data);digest=hashlib.sha256(raw).hexdigest()
    old_file=ROOT/'public/data/catalog.json';old=json.loads(old_file.read_text()) if old_file.exists() else None
    check_refresh(len(items),old['metadata']['count'] if old else 0,args.allow_large_drop)
    photo_file=ROOT/'data/curated-photos.json';photos=json.loads(photo_file.read_text()) if photo_file.exists() else {}
    for item in items:item['photos']=photos.get(item['id'],[])
    now=datetime.datetime.now(datetime.timezone.utc).isoformat()
    # 只在内容哈希与旧版一致时沿用已确认版本；新数据不伪称仍是 5.4.0。
    version=old['metadata']['sourceVersion'] if old and old['metadata'].get('sha256')==digest else f"WFS snapshot {now[:10]}"
    meta={'snapshotId':str(uuid.uuid5(uuid.NAMESPACE_URL,digest)),'count':len(items),'retrievedAt':now,'source':'Smithsonian GVP','sourceVersion':version,'sourceUrl':'https://volcano.si.edu/database/webservices.cfm','sha256':digest,'mode':'snapshot'}
    parent=ROOT/'public';parent.mkdir(parents=True,exist_ok=True)
    # 在隔离目录生成全部文件；所有 JSON 成功后才替换，避免混合旧/新分片。
    out=Path(tempfile.mkdtemp(prefix='gvp-',dir=parent))
    shards={}
    for item in items:shards.setdefault(item['id'][:3],{})[item['id']]=item
    (out/'details').mkdir(exist_ok=True)
    for prefix,shard in shards.items():(out/'details'/f'{prefix}.json').write_text(json.dumps(shard,ensure_ascii=False,separators=(',',':')))
    # 首屏地图只读轻量目录，地质长文按火山加载。
    light=[{**v,'summary':''} for v in items];tmp=out/'catalog.json.tmp';tmp.write_text(json.dumps({'metadata':meta,'items':light},ensure_ascii=False,separators=(',',':')));tmp.replace(out/'catalog.json')
    target=parent/'data';backup=parent/'data.previous'
    if backup.exists():shutil.rmtree(backup)
    if target.exists():target.rename(backup)
    try:out.rename(target)
    except Exception:
        if backup.exists():backup.rename(target)
        raise
    if backup.exists():shutil.rmtree(backup)
    report={'metadata':meta,'officialReturned':data.get('numberReturned'),'officialMatched':data.get('numberMatched'),'negativeElevations':sum(v['elevationM'] is not None and v['elevationM']<0 for v in items),'unknownEruptions':sum(v['lastEruptionYear'] is None for v in items),'requestUrl':URL}
    (ROOT/'data').mkdir(exist_ok=True);(ROOT/'data/import-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
