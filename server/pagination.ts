/** 固定快照、稳定排序后分批读取，避免 Supabase 默认上限截断目录。 */
export async function readAllPages<T>(read:(from:number,to:number)=>Promise<T[]>,expected:number):Promise<T[]>{
 if(!Number.isSafeInteger(expected)||expected<0||expected>10000)throw new Error('快照数量无效');
 const result:T[]=[];const size=500;
 while(result.length<expected){const page=await read(result.length,Math.min(expected-1,result.length+size-1));if(!page.length||page.length>size)throw new Error('目录不完整');result.push(...page)}
 if(result.length!==expected)throw new Error('目录不完整');return result;
}
