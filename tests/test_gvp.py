import sys, unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]/'scripts'))
from gvp_normalize import normalize_feature, normalize_collection

class GvpTests(unittest.TestCase):
    def feature(self):
        return {'properties': {'Volcano_Number':283030,'Volcano_Name':'Fujisan','Latitude':35.361,'Longitude':138.728,'Elevation':-20,'Country':'Japan','Last_Eruption_Year':-1000},'geometry':{'coordinates':[138.728,35.361]}}
    def test_coordinate_order_and_negative_elevation(self):
        item=normalize_feature(self.feature())
        self.assertEqual(item['longitude'],138.728)
        self.assertEqual(item['elevationM'],-20)
        self.assertEqual(item['lastEruptionYear'],-1000)
    def test_missing_coordinate_rejected(self):
        f=self.feature();f['properties']['Latitude']=None
        with self.assertRaises(ValueError):normalize_feature(f)
    def test_truncated_collection_rejected(self):
        with self.assertRaises(ValueError):normalize_collection({'features':[self.feature()],'numberMatched':2})
    def test_duplicate_id_rejected(self):
        with self.assertRaises(ValueError):normalize_collection({'features':[self.feature(),self.feature()],'numberMatched':2})
    def test_changbaishan_not_misnamed_taupo(self):
        f=self.feature();f['properties'].update(Volcano_Number=305060,Volcano_Name='Changbaishan')
        self.assertEqual(normalize_feature(f)['nameZh'],'长白山')

if __name__=='__main__':unittest.main()
