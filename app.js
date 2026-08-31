(function(){
  const VERSION=window.BUILD_VERSION||'unknown',SAVE_KEY='one-building-game-v1';
  const SKILLS=['食品','物流','技术','艺术','服务','科研'];
  const NAMES={男:['林川','周野','陈星','陆远','许舟','顾安','沈一','江辰'],女:['林夏','周禾','陈月','陆晴','许宁','顾岚','沈秋','江棠']};
  const ROOMS={
    dorm:{name:'宿舍',category:'居住类',cost:600,icon:'▦',description:'最多可供 6 名居民入住。新建宿舍为空。'},
    garden:{name:'菜园',category:'食品类',cost:400,icon:'≋',description:'食品生产房间，后续可安排居民工作。'},
    park:{name:'花园',category:'满意类',cost:300,icon:'✿',description:'提高居民满意度的休闲设施。'},
    market:{name:'超市',category:'经济类',cost:500,icon:'▤',description:'经济设施，后续可提供商品与收入。'},
    school:{name:'社区学校',category:'技能类',cost:450,icon:'▧',description:'学习基础技能的教育房间。'}
  };
  const $=id=>document.getElementById(id),random=array=>array[Math.floor(Math.random()*array.length)],euro=n=>'€'+Math.round(n).toLocaleString('en-US');

  function createResident(index,used){
    const gender=Math.random()<.5?'男':'女',pool=NAMES[gender].filter(name=>!used.includes(name)),name=random(pool.length?pool:NAMES[gender]),talent=random(SKILLS);
    const matchingSprites=gender==='男'?[0,2,4,6]:[1,3,5,7];
    return{id:`p-${Date.now()}-${index}`,name,gender,age:20+Math.floor(Math.random()*16),talent,skills:Object.fromEntries(SKILLS.map(skill=>[skill,skill===talent?5:0])),sprite:matchingSprites[index%4]};
  }
  function freshGame(){const people=[];for(let i=0;i<4;i++)people.push(createResident(i,people.map(p=>p.name)));return{money:1000,people,floors:[{type:'dorm',residents:people.map(p=>p.id)}],createdAt:Date.now()}}
  function loadGame(){try{return JSON.parse(localStorage.getItem(SAVE_KEY))||freshGame()}catch{return freshGame()}}
  let state=loadGame();
  function save(){localStorage.setItem(SAVE_KEY,JSON.stringify(state))}
  function residentById(id){return state.people.find(person=>person.id===id)}
  function spritePosition(variant){const col=variant%4,row=Math.floor(variant/4);return`${col*(100/3)}% ${row*100}%`}
  function toast(message){$('toast').textContent=message;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),1600)}
  function showView(name){document.querySelectorAll('.view').forEach(view=>view.classList.toggle('active',view.id===`view-${name}`));document.querySelectorAll('nav button').forEach(button=>button.classList.toggle('active',button.dataset.view===name));window.scrollTo(0,0)}

  function buildRoom(type){const room=ROOMS[type];if(!room)return;if(state.money<room.cost)return toast('资金不足');state.money-=room.cost;state.floors.push({type,residents:[]});save();render();showView('building');toast(`F${state.floors.length} ${room.name}建造完成`)}
  function renderTower(){$('tower').innerHTML=state.floors.map((floor,index)=>{const room=ROOMS[floor.type],people=(floor.residents||[]).map(residentById).filter(Boolean);return`<article class="floor room-${floor.type}"><div class="floor-head"><b>F${index+1} · ${room.name}</b><span>${room.category}${floor.type==='dorm'?` · ${people.length}/6 人`:''}</span></div><div class="floor-body">${people.length?people.map(person=>`<button class="person" data-person="${person.id}" style="background-position:${spritePosition(person.sprite)}" aria-label="查看 ${person.name}"></button>`).join(''):'<span class="floor-empty">空房间</span>'}</div></article>`}).join('');document.querySelectorAll('[data-person]').forEach(button=>button.onclick=()=>openPerson(button.dataset.person))}
  function renderCatalog(){$('roomCatalog').innerHTML=Object.entries(ROOMS).map(([type,room])=>`<article class="room-card"><div class="room-thumb room-${type}" aria-hidden="true"></div><div><h3>${room.name} · ${room.category}</h3><p>${room.description}</p></div><button type="button" data-build="${type}" ${state.money<room.cost?'disabled':''}>${euro(room.cost)}</button></article>`).join('');document.querySelectorAll('[data-build]').forEach(button=>button.onclick=()=>buildRoom(button.dataset.build))}
  function renderTasks(){const dorms=state.floors.filter(f=>f.type==='dorm').length,facility=state.floors.some(f=>f.type!=='dorm'),tasks=[{name:'建造第二层',description:'让大楼拥有至少 2 层。',done:state.floors.length>=2,progress:`${Math.min(state.floors.length,2)}/2`},{name:'扩充住宿空间',description:'再建造一个空宿舍。',done:dorms>=2,progress:`${Math.min(dorms,2)}/2`},{name:'建设第一项设施',description:'建造任意一个非宿舍房间。',done:facility,progress:facility?'1/1':'0/1'}];$('taskList').innerHTML=tasks.map(task=>`<article class="task ${task.done?'done':''}"><div class="task-mark">${task.done?'✓':'·'}</div><div><h3>${task.name}</h3><p>${task.description}</p></div><strong>${task.progress}</strong></article>`).join('')}
  function renderOverview(){const beds=state.floors.filter(f=>f.type==='dorm').length*6,counts=Object.entries(ROOMS).map(([type,room])=>`${room.name} ${state.floors.filter(f=>f.type===type).length}`).join(' · ');$('overview').innerHTML=`<div class="overview-card"><span>当前资金</span><b>${euro(state.money)}</b></div><div class="overview-card"><span>大楼层数</span><b>${state.floors.length}</b></div><div class="overview-card"><span>居民人数</span><b>${state.people.length}</b></div><div class="overview-card"><span>床位总数</span><b>${beds}</b></div><div class="overview-card room-summary"><span>房间组成</span><b>${counts}</b></div>`}
  function render(){const beds=state.floors.filter(f=>f.type==='dorm').length*6;$('headerMoney').textContent=euro(state.money);$('floorCount').textContent=state.floors.length;$('populationCount').textContent=state.people.length;$('bedCount').textContent=Math.max(0,beds-state.people.length);$('shortVersion').textContent=VERSION.replace(/^v/,'').split('+')[0];$('currentVersion').textContent=VERSION;renderTower();renderCatalog();renderTasks();renderOverview()}

  function openPerson(id){const person=residentById(id);if(!person)return;$('sheetSprite').style.backgroundPosition=spritePosition(person.sprite);$('sheetName').textContent=person.name;$('sheetMeta').textContent=`${person.gender} · ${person.age} 岁 · 擅长${person.talent}`;$('sheetSkills').innerHTML=SKILLS.map(skill=>`<div class="skill-row"><span>${skill}</span><div class="skill-track"><i style="width:${person.skills[skill]*20}%"></i></div><b>${person.skills[skill]}</b></div>`).join('');$('personSheet').classList.add('show');$('backdrop').classList.add('show')}
  function closePerson(){$('personSheet').classList.remove('show');$('backdrop').classList.remove('show')}

  document.querySelectorAll('nav button').forEach(button=>button.onclick=()=>showView(button.dataset.view));$('goBuild').onclick=()=>showView('build');$('closeSheet').onclick=closePerson;$('backdrop').onclick=closePerson;
  $('resetGame').onclick=()=>{if(!confirm('确定要清空当前存档并重新开始吗？'))return;state=freshGame();save();render();showView('building');toast('新游戏已开始')};

  const acceptedKey='one-building-accepted-version',notice=$('updateNotice'),updateText=$('updateText'),updateButton=$('updateButton');let available=VERSION;
  function showUpdate(version,isRemote=false){available=version;updateText.textContent=isRemote?`发现新版本 ${version}`:`游戏更新到 ${version} 版本`;updateButton.textContent=isRemote?'立即更新':'知道了';notice.hidden=false}
  if(localStorage.getItem(acceptedKey)!==VERSION)showUpdate(VERSION);
  async function checkForUpdate(){try{const response=await fetch(`build-info.js?check=${Date.now()}`,{cache:'no-store'});if(!response.ok)throw Error(response.status);const match=(await response.text()).match(/BUILD_VERSION\s*=\s*['"]([^'"]+)/);if(match&&match[1]!==VERSION)showUpdate(match[1],true)}catch(error){console.debug('检查更新失败',error)}}
  updateButton.onclick=()=>{localStorage.setItem(acceptedKey,available);if(available===VERSION){notice.hidden=true;return}const url=new URL(location.href);url.searchParams.set('version',available);location.replace(url)};checkForUpdate();setInterval(checkForUpdate,20000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkForUpdate()});
  render();save();
})();
