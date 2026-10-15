"""月更安全门：任何异常必须在触碰旧发布目录之前发现。"""
import sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from update_safety import check_refresh
class SafetyTests(unittest.TestCase):
 def test_reasonable_catalog_passes(self):
  check_refresh(1214,1214)
 def test_empty_or_large_drop_rejected(self):
  for count in [0,20,500]:
   with self.assertRaises(ValueError):check_refresh(count,1214)
 def test_override_still_rejects_empty(self):
  with self.assertRaises(ValueError):check_refresh(0,1214,True)
  check_refresh(500,1214,True)
if __name__=='__main__':unittest.main()
