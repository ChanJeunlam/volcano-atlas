"""离线刷新官方快照；校验失败时不覆盖原文件。"""
import argparse,datetime,hashlib,json,urllib.request,urllib.parse,uuid
from pathlib import Path
from gvp_normalize import normalize_collection
ROOT=Path(__file__).resolve().parents[1]
URL='https://webservices.volcano.si.edu/geoserver/GVP-VOTW/ows?'+urllib.parse.urlencode({'service':'WFS','version':'1.0.0','request':'GetFeature','typeName':'GVP-VOTW:Smithsonian_VOTW_Holocene_Volcanoes','outputFormat':'application/json','maxFeatures':'5000'})
def main():
    parser=argparse.ArgumentParser();parser.add_argument('--source',help='已经下载的原始 JSON');args=parser.parse_args()
    raw=Path(args.source).read_bytes() if args.source else urllib.request.urlopen(URL,timeout=60).read()
    data=json.loads(raw);items=normalize_collection(data);digest=hashlib.sha256(raw).hexdigest()
    photo_file=ROOT/'data/curated-photos.json';photos=json.loads(photo_file.read_text()) if photo_file.exists() else {}
    for item in items:item['photos']=photos.get(item['id'],[])
    meta={'snapshotId':str(uuid.uuid5(uuid.NAMESPACE_URL,digest)),'count':len(items),'retrievedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source':'Smithsonian GVP','sourceVersion':'5.4.0 (2026-08-07)','sourceUrl':'https://volcano.si.edu/database/webservices.cfm','sha256':digest,'mode':'snapshot'}
    out=ROOT/'public/data';out.mkdir(parents=True,exist_ok=True)
    shards={}
    for item in items:shards.setdefault(item['id'][:3],{})[item['id']]=item
    (out/'details').mkdir(exist_ok=True)
    for prefix,shard in shards.items():(out/'details'/f'{prefix}.json').write_text(json.dumps(shard,ensure_ascii=False,separators=(',',':')))
    # 首屏地图只读轻量目录，地质长文按火山加载。
    light=[{**v,'summary':''} for v in items];tmp=out/'catalog.json.tmp';tmp.write_text(json.dumps({'metadata':meta,'items':light},ensure_ascii=False,separators=(',',':')));tmp.replace(out/'catalog.json')
    report={'metadata':meta,'officialReturned':data.get('numberReturned'),'officialMatched':data.get('numberMatched'),'negativeElevations':sum(v['elevationM'] is not None and v['elevationM']<0 for v in items),'unknownEruptions':sum(v['lastEruptionYear'] is None for v in items),'requestUrl':URL}
    (ROOT/'data').mkdir(exist_ok=True);(ROOT/'data/import-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
