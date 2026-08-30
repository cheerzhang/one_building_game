const VERSION=window.BUILD_VERSION||'v0.1.0-local';
let aiWeights=null;
const ROOM_TYPES={
  housing:{name:'住宿层',icon:'🛏️',cat:'生活',cost:3000,unlock:0,skills:[],effect:'容纳 6 人'},
  garden:{name:'室内菜园',icon:'🥬',cat:'食物',cost:2400,unlock:0,skills:[],effect:'每月 +20 食物'},
  ranch:{name:'室内牧场',icon:'🐄',cat:'食物',cost:3600,unlock:0,skills:['农业'],effect:'每月 +28 食物'},
  market:{name:'超市',icon:'🛒',cat:'服务',cost:5000,unlock:500,skills:['物流','食品'],effect:'满意度与消费'},
  salon:{name:'理发店',icon:'✂️',cat:'服务',cost:3800,unlock:400,skills:['服务'],effect:'满意度 +4'},
  gym:{name:'健身房',icon:'🏋️',cat:'服务',cost:6500,unlock:800,skills:['医疗'],science:5,effect:'降低生病率'},
  hospital:{name:'医院',icon:'🏥',cat:'服务',cost:12000,unlock:1500,skills:['医疗'],science:12,effect:'允许生育、治疗'},
  elevator:{name:'电梯井',icon:'↕️',cat:'设施',cost:8000,unlock:800,skills:['工程'],science:8,effect:'超过 8 层必需'},
  garment:{name:'服装工坊',icon:'🧥',cat:'经济',cost:5500,unlock:700,skills:['设计'],effect:'每月 +¥900'},
  electronics:{name:'电子工坊',icon:'🔌',cat:'经济',cost:9500,unlock:1200,skills:['电子'],science:10,effect:'每月 +¥1,600'},
  restaurant:{name:'饭店',icon:'🍜',cat:'经济',cost:6800,unlock:600,skills:['食品'],effect:'食物换收入'},
  cinema:{name:'电影院',icon:'🎞️',cat:'经济',cost:11000,unlock:1400,skills:['艺术'],science:8,effect:'收入与满意度'},
  school:{name:'社区学校',icon:'📚',cat:'教育',cost:4500,unlock:300,skills:['教育'],effect:'居民学习技能'},
  university:{name:'大学',icon:'🎓',cat:'教育',cost:14000,unlock:1800,skills:['教育'],science:15,effect:'培养高级技能'},
  lab:{name:'科研室',icon:'🔬',cat:'科研',cost:9000,unlock:1000,skills:['科研'],effect:'每月 +2 科研'},
  institute:{name:'研究院',icon:'🧬',cat:'科研',cost:22000,unlock:2500,skills:['科研'],science:25,effect:'每月 +6 科研'}
};
const NAMES=['林夏','程野','周岚','许星','顾川','叶青','沈禾','陆遥','苏木','乔安'];
const initialPeople=[
  {name:'林夏',gender:'女',age:20,skill:'食品',degree:'社区学校',health:100,morale:72},
  {name:'程野',gender:'男',age:20,skill:'物流',degree:'社区学校',health:100,morale:68},
  {name:'周岚',gender:'女',age:20,skill:'教育',degree:'大学',health:100,morale:75},
  {name:'许星',gender:'男',age:20,skill:'科研',degree:'研究院',health:100,morale:70}
];
const fresh=()=>({version:VERSION,months:0,money:8000,food:120,science:0,morale:70,speed:1,mode:'player',activeCat:'全部',weather:'snow',people:structuredClone(initialPeople),floors:[{type:'housing',level:1,workers:1},{type:'garden',level:1,workers:1},{type:'ranch',level:1,workers:1}],unlocked:['housing','garden','ranch'],research:[],logs:['第 1 代四位居民进入大楼。','室内菜园与牧场开始运转。']});
let state=load()||fresh(); let timer=null;
const $=id=>document.getElementById(id); const money=n=>'¥'+Math.round(n).toLocaleString('zh-CN');
function skillCount(skill){return state.people.filter(p=>p.skill===skill&&p.health>0).length}
function unlockable(key){const r=ROOM_TYPES[key];return state.money>=r.unlock&&(r.science||0)<=state.science&&r.skills.every(s=>skillCount(s)>0)}
function canBuild(key){const r=ROOM_TYPES[key];return state.unlocked.includes(key)&&state.money>=r.cost&&(state.floors.length<8||state.floors.some(f=>f.type==='elevator'))}
function log(msg){state.logs.unshift(msg);state.logs=state.logs.slice(0,30)}
function toast(msg){$('toast').textContent=msg;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),1800)}
function roomAction(key){const r=ROOM_TYPES[key];if(!state.unlocked.includes(key)){if(!unlockable(key)){toast(`尚未满足：${unlockText(r)}`);return}state.money-=r.unlock;state.unlocked.push(key);log(`解锁了「${r.name}」。`);toast('房间已解锁');render();return}if(!canBuild(key)){toast(state.floors.length>=8&&!state.floors.some(f=>f.type==='elevator')?'8 层以上需要电梯':'资金不足');return}state.money-=r.cost;state.floors.push({type:key,level:1,workers:1});log(`建成第 ${state.floors.length} 层：${r.name}。`);render()}
function unlockText(r){let a=[money(r.unlock)];if(r.skills.length)a.push(r.skills.map(x=>x+'人才').join('+'));if(r.science)a.push(r.science+' 科研');return a.join(' · ')}
function tick(){
  state.months++; const count=state.people.length; const rooms=t=>state.floors.filter(f=>f.type===t).length;
  let produce=rooms('garden')*20+rooms('ranch')*28; let consume=count*5*(state.weather==='snow'?1.1:1);state.food+=produce-consume;
  state.money+=rooms('garment')*900+rooms('electronics')*1600+rooms('restaurant')*1000+rooms('cinema')*1300- state.floors.length*95;
  state.science+=rooms('lab')*2+rooms('institute')*6;
  state.people.forEach(p=>{p.age+=1/12;if(state.food<0){p.health-=8;p.morale-=7}else{p.health=Math.min(100,p.health+.3);p.morale=Math.min(100,p.morale+.25)}if(Math.random()<.006&&!rooms('gym'))p.health-=12;if(rooms('hospital'))p.health=Math.min(100,p.health+1)});
  state.people=state.people.filter(p=>{if(p.age>=100||p.health<=0){log(`${p.name} 去世，享年 ${Math.floor(p.age)} 岁。`);return false}return true});
  state.food=Math.max(-100,state.food);state.morale=state.people.length?state.people.reduce((a,p)=>a+p.morale,0)/state.people.length:0;
  if(state.months%12===0){eventYear();weatherRoll()} if(state.mode==='ai')aiStep(); if(state.people.length===0){clearInterval(timer);log(`文明在第 ${(state.months/12).toFixed(1)} 年终结。`)} render();
}
function eventYear(){const hosp=state.floors.some(f=>f.type==='hospital'),beds=state.floors.filter(f=>f.type==='housing').length*6;if(hosp&&state.people.length<beds&&state.morale>80){const women=state.people.filter(p=>p.gender==='女'&&p.age>=22&&p.age<45);if(women.length&&Math.random()<.38){const n=NAMES.find(x=>!state.people.some(p=>p.name===x))||`新生儿${state.months}`;state.people.push({name:n,gender:Math.random()<.5?'男':'女',age:0,skill:'无',degree:'未入学',health:100,morale:90});log(`${n} 在医院出生，大楼迎来新生命。`)}}}
function weatherRoll(){const arr=[['snow','极寒风雪','食物消耗 +10%','❄'],['flood','冰川洪水','维护费增加','≋'],['meteor','陨石雨','外墙承压','☄']];const w=arr[Math.floor(Math.random()*arr.length)];state.weather=w[0];log(`外界灾害变化：${w[1]}。`)}
function aiStep(){let key;const w=aiWeights?.weights||{};if(state.food<state.people.length*(18+8*(w.food_safety||0)))key='garden';else if(!state.unlocked.includes('lab')&&unlockable('lab'))key='lab';else if(state.science>=12&&!state.unlocked.includes('hospital')&&unlockable('hospital'))key='hospital';else if(state.money<10000+4000*(w.income_growth||0))key=['garment','restaurant'].find(k=>state.unlocked.includes(k)||unlockable(k));else key=Object.keys(ROOM_TYPES).filter(k=>unlockable(k)||canBuild(k)).sort((a,b)=>ROOM_TYPES[a].cost-ROOM_TYPES[b].cost)[0];if(key)roomAction(key)}
function research(key){const costs={agri:10,medicine:20,automation:35};const c=costs[key];if(state.research.includes(key))return;if(state.science<c)return toast(`需要 ${c} 科研点`);state.science-=c;state.research.push(key);log(`科研完成：${{agri:'立体农业',medicine:'预防医学',automation:'楼宇自动化'}[key]}。`);render()}
function render(){
  $('version').textContent=VERSION;$('years').textContent=(state.months/12).toFixed(1)+' 年';$('population').textContent=state.people.length;$('money').textContent=money(state.money);$('food').textContent=Math.round(state.food);$('science').textContent=Math.floor(state.science);$('morale').textContent=Math.round(state.morale)+'%';
  const cats=['全部',...new Set(Object.values(ROOM_TYPES).map(r=>r.cat))];$('categoryTabs').innerHTML=cats.map(c=>`<button class="${c===state.activeCat?'active':''}" data-cat="${c}">${c}</button>`).join('');
  $('roomCatalog').innerHTML=Object.entries(ROOM_TYPES).filter(([,r])=>state.activeCat==='全部'||r.cat===state.activeCat).map(([k,r])=>{const u=state.unlocked.includes(k);return `<div class="room-card ${u?'':'locked'}" data-room="${k}"><div class="room-icon">${r.icon}</div><div><b>${r.name} ${u?'':'🔒'}</b><small>${u?r.effect:'解锁：'+unlockText(r)}</small></div><span class="cost">${u?money(r.cost):money(r.unlock)}</span></div>`}).join('');
  $('building').innerHTML=state.floors.map((f,i)=>{const r=ROOM_TYPES[f.type];return `<div class="floor"><span class="floor-num">F${i+1}</span><div class="floor-info"><span>${r.icon}</span><b>${r.name} Lv.${f.level}</b></div><span class="workers">👤 ${f.workers}</span></div>`}).join('');
  $('peopleList').innerHTML=state.people.map(p=>`<div class="person"><div class="avatar">${p.gender==='女'?'👩':'👨'}</div><div><b>${p.name} · ${p.skill}</b><small>${p.degree}${p.age>=80?' · 仅知识/艺术':p.age>=60?' · 已退休':''}</small><div class="healthbar"><i style="width:${Math.max(0,p.health)}%"></i></div></div><span class="age">${Math.floor(p.age)}岁</span></div>`).join('')||'<div class="ai-status">没有幸存者</div>';
  const nodes=[['agri','立体农业','菜园效率升级',10],['medicine','预防医学','降低生病概率',20],['automation','楼宇自动化','减少岗位需求',35]];$('researchTree').innerHTML=nodes.map(n=>`<div class="research-node ${state.research.includes(n[0])?'unlocked':''}"><b>${state.research.includes(n[0])?'✓ ':''}${n[1]}</b><small>${n[2]} · ${n[3]} 点</small><button data-research="${n[0]}">${state.research.includes(n[0])?'已完成':'开始研究'}</button></div>`).join('');
  $('eventLog').innerHTML=state.logs.map((l,i)=>`<p><em>${i===0?'现在':'记录'}</em>　${l}</p>`).join('');$('modeButton').textContent=state.mode==='ai'?'AI 自动经营':'玩家模式';$('modeButton').classList.toggle('active',state.mode==='ai');$('aiStatus').classList.toggle('hidden',state.mode!=='ai');$('aiStatus').textContent=`AI 策略 ${aiWeights?.version||'内置'}：优先食物 → 科研室 → 医院 → 盈利房间`;$('speedButton').textContent='速度 ×'+state.speed;
  document.querySelectorAll('[data-room]').forEach(x=>x.onclick=()=>roomAction(x.dataset.room));document.querySelectorAll('[data-cat]').forEach(x=>x.onclick=()=>{state.activeCat=x.dataset.cat;render()});document.querySelectorAll('[data-research]').forEach(x=>x.onclick=()=>research(x.dataset.research));
}
function save(){localStorage.setItem('one-building-save',JSON.stringify(state));toast('已保存到本机')}
function load(){try{return JSON.parse(localStorage.getItem('one-building-save'))}catch{return null}}
$('saveButton').onclick=save;$('modeButton').onclick=()=>{state.mode=state.mode==='player'?'ai':'player';log(`切换为${state.mode==='ai'?' AI 自动经营':'玩家经营'}。`);render()};$('speedButton').onclick=()=>{state.speed=state.speed===1?2:state.speed===2?4:1;start();render()};function start(){clearInterval(timer);timer=setInterval(tick,3000/state.speed)}fetch('ai/weights.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(w=>{aiWeights=w;render()}).catch(()=>{});render();start();
