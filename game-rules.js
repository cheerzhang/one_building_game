(function(global){
  'use strict';
  const SKILLS=['食品','物流','技术','艺术','服务','科研'];
  const ROOMS={
    cityhall:{cost:0,capacity:1,staffed:false},oldApartment:{cost:200,capacity:3,privateHome:true,staffed:false},apartment:{cost:300,capacity:4,privateHome:true,staffed:false},villa:{cost:600,capacity:6,privateHome:true,staffed:false},rental:{cost:1000,capacity:6,staffed:false},
    garden:{cost:6,capacity:2,staffed:true,productionPerWorkerDay:20},farm:{cost:15,capacity:2,staffed:true,productionPerWorkerDay:15},market:{cost:200,capacity:2,staffed:true,productionPerWorkerDay:15},park:{cost:300,capacity:4,staffed:false},
    game:{cost:250,capacity:1,staffed:true},craft:{cost:180,capacity:1,staffed:true},tourism:{cost:400,capacity:2,staffed:true},clinic:{cost:250,capacity:2,staffed:true,dailyWage:10},maternity:{cost:350,capacity:2,staffed:true,dailyWage:15},
    clothing:{cost:200,capacity:2,staffed:true,productionPerWorkerDay:5},bookstore:{cost:500,capacity:2,staffed:true,productionPerWorkerDay:1},school:{cost:100,capacity:3,staffed:true},primary:{cost:180,capacity:4,staffed:true},middle:{cost:160,capacity:4,staffed:true},university:{cost:300,capacity:4,staffed:true},barber:{cost:100,capacity:1,staffed:true}
  };
  const ECONOMY={vegetablePrice:.1,meatPrice:.3,milkPrice:1,cannedVegetablePrice:.5,cannedMeatPrice:1,clothingPrice:10,bookPrice:100,rentPerDay:3,gamePrice:20,cityCyclesPerDay:10,taxRate:.5};
  const TRAVEL={europe:{name:'欧美',price:100,satisfaction:10},asia:{name:'东南亚',price:80,satisfaction:8},africa:{name:'非洲',price:50,satisfaction:5},cruise:{name:'邮轮巡航',price:20,satisfaction:0}};
  const NAMES={surnames:['林','周','陈','陆','许','顾','沈','江','苏','叶','唐','程','赵','钱','孙','李','吴','郑','王','冯','韩','秦','白','宋','季','乔','段','袁','徐','陶','姜','谢','邵','余','杜','罗','高','梁','夏','魏'],given:{男:['川','野','远','舟','安','一','辰','泽','然','航','昊','宇','轩','朗','越','嘉','墨','言','景','修','鸣','屿','青','柏','星河','晨宇','子安','景川','云舟','明远','知行','亦辰','嘉树','望舒','清和'],女:['夏','禾','月','晴','宁','岚','秋','棠','悦','念','瑶','露','音','雪','竹','萤','微','舒','简','遥','芷','晚','溪','星','安然','星月','清欢','知夏','若宁','云舒','南枝','雨棠','书瑶','静姝','初晴']}};
  const skill=(person,name)=>Number(person?.skills?.[name]||0);
  function canWork(person,type){
    if(!person||person.age<=16||person.sick||person.deathPending)return false;
    if(type==='garden'||type==='farm')return skill(person,'食品')>=6;
    if(type==='market')return skill(person,'物流')>=6;
    if(type==='clinic'||type==='maternity')return skill(person,'服务')>=6&&skill(person,'科研')>=10;
    if(type==='clothing'||type==='barber')return skill(person,'服务')>=6;
    if(type==='bookstore')return skill(person,'服务')>=6&&skill(person,'科研')>=8;
    if(type==='game')return skill(person,'服务')>=6&&skill(person,'技术')>=6;
    if(type==='tourism')return skill(person,'艺术')>=6&&skill(person,'服务')>=8;
    if(type==='craft')return skill(person,'艺术')>=8&&skill(person,'技术')>=8;
    return true;
  }
  function roomCost(type){return ROOMS[type]?.cost??Infinity}
  function roomCapacity(type){return ROOMS[type]?.capacity||2}
  function housingCapacity(type){return ROOMS[type]?.privateHome||type==='rental'?roomCapacity(type):0}
  function canAffordFamily(first,second,amount){return Math.max(0,first?.money||0)+Math.max(0,second?.money||0)>=amount}
  function canAddStaffedRoom(type,rooms,people,isAssigned){
    if(!ROOMS[type]?.staffed)return true;
    const same=(rooms||[]).filter(room=>room.type===type);
    if(same.some(room=>(room.workerIds||[]).length<roomCapacity(type)))return false;
    return (people||[]).some(person=>!isAssigned(person)&&canWork(person,type));
  }
  function cityHallIncome(population,averageSatisfaction,hasMayor,cycles=ECONOMY.cityCyclesPerDay){
    const base=Math.max(0,population||0)*Math.max(0,averageSatisfaction||0)/100*Math.max(0,cycles||0);
    const total=base*(hasMayor?2:1),mayor=hasMayor?Math.min(1000,total/10):0;
    return{base,total,mayor,building:total-mayor};
  }
  function jobCategory(type){
    if(type==='garden'||type==='farm'||type==='market')return'food';
    if(type==='clinic'||type==='maternity')return'medical';
    if(type==='primary'||type==='middle'||type==='school'||type==='university')return'education';
    if(type==='clothing'||type==='barber'||type==='game'||type==='craft'||type==='tourism'||type==='bookstore')return'service';
    if(type==='cityhall')return'government';
    return'other';
  }
  global.BuildingGameRules={SKILLS,ROOMS,ECONOMY,TRAVEL,NAMES,skill,canWork,roomCost,roomCapacity,housingCapacity,canAffordFamily,canAddStaffedRoom,cityHallIncome,jobCategory};
})(globalThis);
