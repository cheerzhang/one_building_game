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

const liveSource=fs.readFileSync(require.resolve('./app.js'),'utf8');
assert.match(liveSource,/RULES\.canWork\(person,floor\.type/,'真实游戏必须使用共享入职规则');
assert.match(liveSource,/RULES\.cityHallIncome/,'真实游戏必须使用共享市政厅收入规则');
assert.match(liveSource,/ENGINE\.advanceTimeline\(state,Date\.now\(\)\)/,'真人时间线必须直接调用共享引擎');
assert.match(liveSource,/ENGINE\.canMarry\(state,person,wife,garden\)/,'真人婚姻判定必须直接调用共享引擎');
assert.doesNotMatch(liveSource,/aiSimulate|aiRunGeneration|aiRandomGenome|v24Evaluate/,'主程序不得残留旧AI模拟器');

console.log('shared rules regression: ok');
