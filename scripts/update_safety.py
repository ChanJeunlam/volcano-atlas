"""月更校验：数量突降可能意味着上游截断，须人工复核后显式放行。"""
def check_refresh(new_count,old_count,allow_large_drop=False):
    if new_count<1:raise ValueError('新目录为空，停止更新')
    if old_count and new_count<old_count*0.9 and not allow_large_drop:
        raise ValueError(f'目录数量下降超过10%（{old_count}→{new_count}），停止更新并保留旧数据')
