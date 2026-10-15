"""官方 GVP WFS GeoJSON → 公开目录；使用标准库，保留未知值和海底负海拔。"""
import math
ZH={'283030':'富士山','211060':'埃特纳火山','211020':'维苏威火山','332010':'基拉韦厄火山','332020':'冒纳罗亚火山','321050':'圣海伦斯火山','282080':'姶良（樱岛）','282110':'阿苏山','263250':'默拉皮火山','262000':'喀拉喀托火山','223030':'尼拉贡戈火山','305060':'长白山','241070':'陶波火山','212040':'桑托里尼火山','211040':'斯特龙博利火山','264040':'坦博拉火山','341090':'波波卡特佩特火山','352050':'科托帕希火山','273083':'皮纳图博火山'}

def number(value, required=False):
    if value is None or value=='':
        if required:raise ValueError('坐标缺失')
        return None
    n=float(value)
    if not math.isfinite(n):raise ValueError('数值非有限')
    return n

def normalize_feature(feature):
    """使用 properties 的显式 Latitude/Longitude，避免 WFS 轴顺序陷阱。"""
    p=feature['properties'];vid=str(p['Volcano_Number'])
    lat=number(p.get('Latitude'),True);lon=number(p.get('Longitude'),True)
    if not (-90<=lat<=90 and -180<=lon<=180):raise ValueError('坐标越界')
    if len(vid)!=6 or not vid.isdigit():raise ValueError('GVP编号无效')
    year=number(p.get('Last_Eruption_Year'));year=int(year) if year is not None else None
    return {'id':vid,'nameEn':str(p['Volcano_Name']),'nameZh':ZH.get(vid),'latitude':lat,'longitude':lon,'elevationM':number(p.get('Elevation')),
      'countries':str(p.get('Country') or 'Unknown').split('-'),'landform':p.get('Volcanic_Landform') or 'Unknown','region':p.get('Subregion') or p.get('Region') or '',
      'lastEruptionYear':year,'lastEruptionText':'Unknown' if year is None else (f'{abs(year)} BCE' if year<0 else str(year)),
      'sourceUrl':f'https://volcano.si.edu/volcano.cfm?vn={vid}','tectonicSetting':p.get('Tectonic_Setting') or '',
      'evidence':p.get('Evidence_Category') or '','summary':p.get('Geological_Summary') or '',
      # 图库链接与署名不是再发布许可；照片仅来自另外审核的映射文件。
      'photos':[]}

def normalize_collection(data):
    features=data.get('features',[]);matched=data.get('numberMatched',data.get('totalFeatures'))
    if matched is None or int(matched)!=len(features):raise ValueError('目录截断或总量未知')
    items=[normalize_feature(f) for f in features]
    if len({v['id'] for v in items})!=len(items):raise ValueError('编号重复')
    return sorted(items,key=lambda v:v['id'])
