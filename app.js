(function(){
  const current=window.BUILD_VERSION||'unknown';
  const acceptedKey='one-building-accepted-version';
  const versionNode=document.getElementById('currentVersion');
  const notice=document.getElementById('updateNotice');
  const text=document.getElementById('updateText');
  const button=document.getElementById('updateButton');
  let available=current;

  versionNode.textContent=current;

  function showUpdate(version,isRemote=false){
    available=version;
    text.textContent=isRemote?`发现新版本 ${version}`:`游戏更新到 ${version} 版本`;
    button.textContent=isRemote?'立即更新':'知道了';
    notice.hidden=false;
  }

  if(localStorage.getItem(acceptedKey)!==current)showUpdate(current);

  async function checkForUpdate(){
    try{
      const response=await fetch(`build-info.js?check=${Date.now()}`,{cache:'no-store'});
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const match=(await response.text()).match(/BUILD_VERSION\s*=\s*['"]([^'"]+)/);
      if(match&&match[1]!==current)showUpdate(match[1],true);
    }catch(error){
      console.debug('检查更新失败，将稍后重试。',error);
    }
  }

  button.addEventListener('click',()=>{
    localStorage.setItem(acceptedKey,available);
    if(available===current){notice.hidden=true;return}
    const url=new URL(location.href);
    url.searchParams.set('version',available);
    location.replace(url);
  });

  checkForUpdate();
  setInterval(checkForUpdate,20000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkForUpdate()});
})();
