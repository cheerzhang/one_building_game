'use strict';
const assert=require('assert');
const fs=require('fs');
require('./game-rules.js');
require('./game-engine.js');
require('./learning-ai.js');

const rules=global.BuildingGameRules,ai=global.BuildingLearningAI;
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

const state={people:[cook,doctor],money:10,food:5,satisfaction:50,mayorId:1};
const gardenVector=ai.vector(state,cook,null,{roomType:'garden',job:'garden'});
const marketVector=ai.vector(state,cook,null,{roomType:'market',job:'market'});
const mayorVector=ai.vector(state,cook,null,{roomType:'cityhall'});
const familyVector=ai.vector(state,{...cook,gender:'女'}, {...doctor,gender:'男',money:250},{familyChildren:2,homeSpace:.5,related:false});
assert.equal(gardenVector.length,ai.FEATURES);
assert.equal(familyVector.length,48);
assert.notDeepEqual(gardenVector,marketVector,'网络必须能区分菜园与超市岗位');
assert.notDeepEqual(gardenVector,mayorVector,'网络必须能区分岗位与市长动作');
assert.equal(ai.WEIGHTS,1447);

const father={id:'f',gender:'男',age:30,satisfaction:100,skills:{},spouseId:null},mother={id:'m',gender:'女',age:30,satisfaction:100,skills:{},spouseId:null};
const park={id:'park',type:'park',workerIds:['f','m']},familyState={people:[father,mother],floors:[park],money:0};
assert.equal(engine.canMarry(familyState,father,mother,park),true);
mother.parentIds=['f'];
assert.equal(engine.canMarry(familyState,father,mother,park),false,'真人与训练必须共用近亲婚配禁令');

const liveSource=fs.readFileSync(require.resolve('./app.js'),'utf8');
assert.match(liveSource,/RULES\.canWork\(person,floor\.type/,'真实游戏必须使用共享入职规则');
assert.match(liveSource,/RULES\.cityHallIncome/,'真实游戏必须使用共享市政厅收入规则');
assert.match(liveSource,/canUseAnotherRoom\(type\)/,'AI接管必须执行有员工才扩建的合法动作遮罩');
assert.match(liveSource,/roomType:floor\.type,job:floor\.type/,'真实接管网络必须看见岗位类型');

console.log('shared rules regression: ok');
