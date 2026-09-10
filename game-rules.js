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
  global.BuildingGameRules={SKILLS,ROOMS,ECONOMY,skill,canWork,roomCost,roomCapacity,housingCapacity,canAffordFamily,canAddStaffedRoom,cityHallIncome,jobCategory};
})(globalThis);
