import test from 'node:test';
import assert from 'node:assert/strict';
import {filterVolcanoes, validateCatalog, formatYear} from '../src/domain/catalog.ts';
import {readAllPages} from '../server/pagination.ts';

const item = {id:'283030', nameEn:'Fujisan', nameZh:'富士山', latitude:35.361,
  longitude:138.728, elevationM:3776, countries:['Japan'], landform:'Composite',
  lastEruptionText:'1707', lastEruptionYear:1707, sourceUrl:'https://volcano.si.edu/volcano.cfm?vn=283030',
  region:'Japan', tectonicSetting:'Subduction', evidence:'Observed', summary:'', photos:[]};

test('中文和英文搜索均命中，国家和形态组合筛选',()=>{
  assert.equal(filterVolcanoes([item],{query:'富士',country:'Japan',landform:'Composite'}).length,1);
  assert.equal(filterVolcanoes([item],{query:'FUJI',country:'',landform:''}).length,1);
  assert.equal(filterVolcanoes([item],{query:'',country:'Italy',landform:''}).length,0);
});
test('空坐标和重复ID拒绝，负海拔有效',()=>{
  const catalog={metadata:{count:1,snapshotId:'a',retrievedAt:'2026-10-15',source:'GVP',sourceVersion:'5.4.0',sourceUrl:'https://volcano.si.edu'},items:[{...item,elevationM:-50}]};
  assert.equal(validateCatalog(catalog).items[0]?.elevationM,-50);
  assert.throws(()=>validateCatalog({...catalog,items:[{...item,latitude:null}]}));
  assert.throws(()=>validateCatalog({...catalog,metadata:{...catalog.metadata,count:2},items:[item,item]}));
  assert.throws(()=>validateCatalog({...catalog,metadata:{...catalog.metadata,count:2}}));
});
test('最近喷发未知及公元前原文可读，不构造假日期',()=>{
  assert.equal(formatYear(-8300),'公元前 8300 年');
  assert.equal(formatYear(null),'未知');
  assert.equal(formatYear(1707),'1707 年');
});
test('超过1000行时完整分页，按期望总量检查',async()=>{
  const rows=Array.from({length:1214},(_,i)=>i);
  assert.equal((await readAllPages((a,b)=>Promise.resolve(rows.slice(a,b+1)),1214)).length,1214);
  await assert.rejects(readAllPages(()=>Promise.resolve([]),1214),/完整/);
});
