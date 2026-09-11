'use strict';
const assert=require('assert');
const fs=require('fs');
require('./game-rules.js');
require('./game-engine.js');

const rules=global.BuildingGameRules;
const engine=global.BuildingGameEngine;
const person=(skills={},extra={})=>({age:30,sick:false,deathPending:false,skills:{食品:1,物流:1,技术:1,艺术:1,服务:1,科研:1,...skills},...extra});

assert.equal(rules.roomCost('garden'),6);
assert.equal(rules.roomCost('market'),200);
assert.equal(rules.housingCapacity('oldApartment'),3);
assert.equal(rules.housingCapacity('apartment'),4);
assert.equal(rules.housingCapacity('villa'),6);

const cook=person({食品:10}),untrained=person(),doctor=person({服务:6,科研:10});
assert.equal(rules.canWork(cook,'garden'),true);
assert.equal(rules.canWork(untrained,'garden'),false);
assert.equal(rules.canWork(doctor,'clinic'),true);
assert.equal(rules.canWork(person({服务:6,科研:9}),'clinic'),false);

const emptyGarden=[{type:'garden',workerIds:[]}];
assert.equal(rules.canAddStaffedRoom('garden',emptyGarden,[cook],()=>false),false,'有空岗时不得重复造菜园');
const fullGarden=[{type:'garden',workerIds:[1,2]}];
assert.equal(rules.canAddStaffedRoom('garden',fullGarden,[untrained],()=>false),false,'没有合格空闲员工时不得扩建');
assert.equal(rules.canAddStaffedRoom('garden',fullGarden,[cook],()=>false),true,'现有满员且有人可入职时允许扩建');

const income=rules.cityHallIncome(6,50,true,1);
assert.deepEqual(income,{base:3,total:6,mayor:.6,building:5.4});

const father={id:'f',gender:'男',age:30,satisfaction:100,skills:{},spouseId:null},mother={id:'m',gender:'女',age:30,satisfaction:100,skills:{},spouseId:null};
const park={id:'park',type:'park',workerIds:['f','m']},familyState={people:[father,mother],floors:[park],money:0};
assert.equal(engine.canMarry(familyState,father,mother,park),true);
mother.parentIds=['f'];
assert.equal(engine.canMarry(familyState,father,mother,park),false,'真人与训练必须共用近亲婚配禁令');

const starving={id:'hungry',age:25,gender:'女',satiety:0,satietyZeroSince:0,sick:false,deathPending:false,skills:{}},timeline={createdAt:0,dayMs:100,daysPerYear:12,clinicMs:20,ageYear:0,lastSicknessDay:0,people:[starving],floors:[]};
engine.advanceTimeline(timeline,100,{rand:()=>1});
assert.equal(starving.sickCause,'starvation');
engine.advanceTimeline(timeline,300,{rand:()=>1});
assert.equal(starving.deathPending,true);
assert.equal(starving.deathCause,'饥饿');

const elder={id:'elder',age:99,gender:'男',satiety:100,sick:false,deathPending:false,skills:{}},aging={createdAt:0,dayMs:100,daysPerYear:12,ageYear:0,lastSicknessDay:0,people:[elder],floors:[]};
engine.advanceTimeline(aging,1200,{rand:()=>1});
assert.equal(elder.age,100);
assert.equal(elder.deathCause,'年老');
const cloned=engine.cloneState(aging);
assert.notEqual(cloned,aging);
assert.equal(engine.stateHash(cloned),engine.stateHash(aging),'相同状态必须产生相同哈希');
cloned.people[0].age=99;
assert.notEqual(engine.stateHash(cloned),engine.stateHash(aging),'任何状态差异都必须被一致性校验发现');

const parentA={id:'pa',age:35,money:8,satisfaction:80,skills:{}},parentB={id:'pb',age:35,money:4,satisfaction:80,skills:{}},child={id:'child',age:10,money:0,parentIds:['pa','pb'],satisfaction:80,skills:{}};
const economy={createdAt:0,dayMs:100,daysPerYear:12,lastPayrollDay:0,lastWellbeingDay:0,money:20,people:[parentA,parentB,child],floors:[{id:'rent',type:'rental',residents:['child'],workerIds:[]},{id:'clinic',type:'clinic',workerIds:['pa']}]};
assert.equal(engine.spendableMoney(economy,child),12,'未成年消费必须使用父母共同资产');
assert.equal(engine.charge(economy,child,9),true);
assert.equal(engine.spendableMoney(economy,child),3);
const economyA=engine.cloneState(economy),economyB=engine.cloneState(economy);
engine.advanceDaily(economyA,100);
engine.advanceDaily(economyB,100);
assert.equal(engine.stateHash(economyA),engine.stateHash(economyB),'真人与训练调用同一每日结算时必须得到相同状态');

const producer={id:'producer',age:30,money:0,satisfaction:50,skills:{食品:10,物流:10}},production={createdAt:0,dayMs:300000,money:0,people:[producer],floors:[{id:'hall',type:'cityhall',mayorId:null,workerIds:[],cycleStartedAt:1,stock:{}},{id:'garden',type:'garden',workerIds:['producer'],cycleStartedAt:1,stock:{vegetables:0},gardenDirectReserve:2,gardenMarketReserve:2,gardenMarketStock:0},{id:'market',type:'market',workerIds:['producer'],cycleStartedAt:1,stock:{cannedVegetables:0,cannedMeat:0},marketProduct:'cannedVegetables',marketVegetableReserve:3,marketMeatReserve:3,marketVegetableInputs:0,marketMeatInputs:0}]};
const productionA=engine.cloneState(production),productionB=engine.cloneState(production);
engine.advanceProduction(productionA,60001);
engine.advanceProduction(productionB,60001);
assert.equal(engine.stateHash(productionA),engine.stateHash(productionB),'房间生产链在页面与无界面运行中必须完全确定一致');
assert.ok(productionA.floors[2].stock.cannedVegetables>0,'超市必须使用菜园专供库存生产罐头');

const eater={id:'eater',age:30,money:2,satiety:40,satisfaction:50,foodPreference:'auto',lastMealSlot:0,skills:{}},foodState={money:0,people:[eater],floors:[{id:'food-market',type:'market',workerIds:[],stock:{cannedMeat:1,cannedVegetables:1},cannedMeatSources:[]}]};
const meal=engine.reserveMeal(foodState,eater,0);
assert.equal(meal.item,'cannedMeat','自动饮食必须优先选择肉罐头');
assert.equal(eater.satiety,30,'每次进食前必须先扣除10点饱腹');
engine.consumeReserved(foodState,meal);
assert.equal(eater.satiety,60,'肉罐头必须增加30点饱腹');
assert.equal(eater.money,1,'购买肉罐头必须扣除个人资产');

const customer={id:'customer',age:30,gender:'女',money:50,satisfaction:40,travelMonth:9,travelDestination:'cruise',lastTravelYear:0,skills:{}},staff={id:'staff',age:30,gender:'男',money:0,satisfaction:50,skills:{}},services={createdAt:0,dayMs:100,daysPerYear:12,money:0,people:[customer,staff],floors:[{id:'barber',type:'barber',barberId:'staff',barberQueue:[],currentClientId:'customer',barberStartedAt:1,workerIds:[]},{id:'game',type:'game',workerIds:['staff'],playerIds:['customer'],gameStartedAt:{customer:1}},{id:'tour',type:'tourism',workerIds:['staff']}]};
const serviceEvents=engine.advanceServices(services,20001);
assert.ok(serviceEvents.some(event=>event.type==='haircutComplete'));
assert.ok(serviceEvents.some(event=>event.type==='gameComplete'));
assert.ok(serviceEvents.some(event=>event.type==='travelComplete'));
assert.equal(customer.satisfaction,55,'理发与游戏房必须分别增加5和10满意度');

const rider={id:'rider',age:30,money:0,satiety:20,satisfaction:50,skills:{}},liftState={people:[rider],floors:[]},lift={floor:0,queue:[{personId:'rider',originFloor:0,foodFloor:2,item:'vegetables',kind:'meal',paidAmount:0,direct:false}],onboard:[],eating:[],direction:0,doorUntil:0,trip:null};
const liftStart=engine.advanceElevator(liftState,lift,0);
assert.ok(liftStart.some(event=>event.type==='elevatorMove'));
const liftArrival=engine.advanceElevator(liftState,lift,2000);
assert.ok(liftArrival.some(event=>event.type==='mealConsumed'));
assert.equal(rider.satiety,30,'电梯抵达用餐楼层后才增加饱腹');

const primaryTeacher={id:'pt',age:35,education:'社区学校',sick:false,skills:{食品:10,物流:10,技术:10,艺术:10,服务:10,科研:10}},pupil={id:'pupil',age:10,education:'无',certificates:[],skills:{食品:3,物流:4,技术:4,艺术:4,服务:4,科研:4}},educationState={people:[primaryTeacher,pupil],floors:[{id:'primary-room',type:'primary',teacherId:'pt',studentIds:['pupil'],taughtSkill:'食品',schoolStartedAt:1}]};
engine.advanceEducation(educationState,60001,{rand:()=>1});
assert.equal(pupil.skills['食品'],4);
assert.equal(pupil.education,'小学');
assert.ok(pupil.certificates.includes('小学'),'小学全科达到4后必须获得毕业证');
assert.equal(engine.canTeachUniversity({...primaryTeacher,skills:{...primaryTeacher.skills,艺术:12}},'食品'),true,'大学教师资格必须使用共享规则');

const owner={id:'owner',age:30,spouseId:'partner',satisfaction:50},partner={id:'partner',age:30,spouseId:'owner',satisfaction:50},minor={id:'minor',age:8,parentIds:['owner','partner'],satisfaction:50},adultChild={id:'adult-child',age:18,parentIds:['owner','partner'],satisfaction:50},home={id:'home',type:'apartment',ownerId:'owner',coOwnerIds:[],residents:['owner','minor','adult-child']},housingState={people:[owner,partner,minor,adultChild],floors:[home]};
engine.shareMarriageHomes(housingState,owner,partner);
assert.ok(home.coOwnerIds.includes('partner'),'结婚后伴侣必须成为共同产权人');
assert.equal(engine.canJoinHome(housingState,home,minor),true);
engine.sanitizePrivateHomes(housingState);
assert.ok(!home.residents.includes('adult-child'),'成年子女必须离开父母的私人住宅');

const birthFather={id:'bf',gender:'男',age:30,spouseId:'bm',satisfaction:100,skills:{}},birthMother={id:'bm',gender:'女',age:30,spouseId:'bf',satisfaction:100,skills:{}},birthDoctor={id:'doctor',gender:'女',age:35,satisfaction:80,skills:{服务:6,科研:10}},birthHome={id:'birth-home',type:'oldApartment',ownerId:'bf',coOwnerIds:['bm'],residents:['bf','bm']},birthPark={id:'birth-park',type:'park',workerIds:['bf','bm']},birthRoom={id:'birth-room',type:'maternity',workerIds:['doctor'],maternityFamilyIds:['bf','bm']},birthState={dayMs:100,pregnancyDays:9,people:[birthFather,birthMother,birthDoctor],floors:[birthHome,birthPark,birthRoom]};
assert.ok(engine.advanceRelationships(birthState,0).some(event=>event.type==='pregnant'));
birthMother.pregnancy.dueAt=0;
const born=engine.deliverBirths(birthState,0,()=>({id:'baby',age:0,parentIds:['bf','bm'],skills:{}}));
assert.ok(born.some(event=>event.type==='born'));
assert.ok(birthHome.residents.includes('baby'));

const liveSource=fs.readFileSync(require.resolve('./app.js'),'utf8');
assert.match(liveSource,/RULES\.canWork\(person,floor\.type/,'真实游戏必须使用共享入职规则');
assert.match(liveSource,/RULES\.cityHallIncome/,'真实游戏必须使用共享市政厅收入规则');
assert.match(liveSource,/ENGINE\.advanceTimeline\(state,Date\.now\(\)\)/,'真人时间线必须直接调用共享引擎');
assert.match(liveSource,/ENGINE\.advanceDaily\(state,now\)/,'真人每日经济结算必须直接调用共享引擎');
assert.match(liveSource,/ENGINE\.advanceProduction\(state,now\)/,'真人房间生产必须直接调用共享引擎');
assert.match(liveSource,/ENGINE\.reserveMeal\(state,person/,'真人饮食选择必须直接调用共享引擎');
assert.match(liveSource,/ENGINE\.advanceServices\(state,Date\.now\(\)\)/,'真人服务消费必须直接调用共享引擎');
assert.match(liveSource,/ENGINE\.advanceElevator\(state,elevator,now\)/,'真人电梯必须直接调用共享引擎');
assert.match(liveSource,/ENGINE\.advanceEducation\(state,Date\.now\(\)\)/,'真人教育进度必须直接调用共享引擎');
assert.match(liveSource,/ENGINE\.shareMarriageHomes\(state,first,second\)/,'真人共同产权必须直接调用共享引擎');
assert.match(liveSource,/ENGINE\.sanitizePrivateHomes\(state\)/,'真人住宅成员限制必须直接调用共享引擎');
assert.match(liveSource,/ENGINE\.advanceRelationships\(state,now\)/,'真人结婚与怀孕必须直接调用共享引擎');
assert.match(liveSource,/ENGINE\.deliverBirths\(state,now/,'真人生产必须直接调用共享引擎');
assert.doesNotMatch(liveSource,/aiSimulate|aiRunGeneration|aiRandomGenome|v24Evaluate/,'主程序不得残留旧AI模拟器');

console.log('shared rules regression: ok');
