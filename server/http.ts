/** 公开只读 HTTP 约束；CORS 不是身份鉴权，数据库密钥始终只在服务端。 */
export function responseHeaders(origin:string|undefined,allowed:string[]):Record<string,string>{
 const h:Record<string,string>={'Content-Type':'application/json; charset=utf-8','Vary':'Origin','Access-Control-Allow-Methods':'GET, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Allow':'GET, OPTIONS','X-Content-Type-Options':'nosniff'};
 if(origin&&allowed.includes(origin))h['Access-Control-Allow-Origin']=origin;return h;
}
export function acceptMethod(method:string|undefined):number{return method==='GET'?200:method==='OPTIONS'?204:405}
export interface RequestLike {method?:string;headers:{origin?:string};query:Record<string,string|string[]|undefined>}
export interface ResponseLike {setHeader:(name:string,value:string)=>void;status:(code:number)=>ResponseLike;json:(data:unknown)=>void;end:()=>void}
/** 在每个函数入口调用；返回 false 表示预检/错误已经写完，不再执行查询。 */
export function prepare(req:RequestLike,res:ResponseLike):boolean{
 const allowed=(process.env.ALLOWED_ORIGINS||'https://chanjeunlam.github.io,http://localhost:5173').split(',').map(x=>x.trim());
 for(const [k,v] of Object.entries(responseHeaders(req.headers.origin,allowed)))res.setHeader(k,v);
 const status=acceptMethod(req.method);
 if(status===204){res.status(204).end();return false;}
 if(status===405){res.status(405).json({error:{code:'METHOD_NOT_ALLOWED',message:'仅支持 GET'}});return false;}
 return true;
}
