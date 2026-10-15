/** 教学形态对照：按用户提供的 Table 10.2 整理，不替代 GVP 科学分类。 */
export type ProfileType='shield'|'composite'|'cinder';
export const volcanoProfiles:{key:ProfileType;label:string;english:string;color:string;slope:string;shape:string;composition:string;scale:string}[]=[
 {key:'shield',label:'盾状火山',english:'Shield volcano',color:'#f5c56d',slope:'通常约 2°–10°；图示约 4°',shape:'宽广、低缓，熔岩可流动较远，外形像平放的盾。',composition:'多为玄武岩，由多层凝固的熔岩流叠置而成。',scale:'原图以夏威夷为例，从海底起算可达约 10 km；不等于露出海面的高度。'},
 {key:'composite',label:'复合火山',english:'Composite volcano / Stratovolcano',color:'#ff8757',slope:'图表描述通常小于 33°；图示约 25°',shape:'高耸的锥形山体，通常比火山渣锥大；又称层状火山。',composition:'熔岩流与火山碎屑物交互成层，常见安山质组成。',scale:'原图标注典型高度约 1,000–4,000 m，为教学示例范围。'},
 {key:'cinder',label:'火山渣锥',english:'Cinder cone',color:'#d49b71',slope:'较陡，图示约 33°',shape:'通常较小，陡峭侧坡围绕顶部火山口；又称火山渣锥火山。',composition:'主要由火山碎屑堆积形成，成分可不同，玄武质最常见。',scale:'原图以不足 500 m 的小型锥体为例；不作为全球目录的分类阈值。'}
];
