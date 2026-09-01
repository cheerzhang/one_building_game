(async function boot(){
  const bootUrl=new URL(location.href);
  if(bootUrl.searchParams.has('reset')){
    localStorage.removeItem('one-building-game-v1');
    bootUrl.searchParams.delete('reset');
    history.replaceState(null,'',bootUrl);
  }
  let version='v0.1.0-local';
  try{
    const response=await fetch(`build-info.js?check=${Date.now()}`,{cache:'no-store'});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const match=(await response.text()).match(/BUILD_VERSION\s*=\s*['"]([^'"]+)/);
    if(match)version=match[1];
  }catch(error){
    console.debug('版本文件暂时不可用，使用本地版本。',error);
  }

  window.BUILD_VERSION=version;
  const bootStamp=Date.now();
  const style=document.createElement('link');
  style.rel='stylesheet';
  style.href=`style.css?v=${encodeURIComponent(version)}&boot=${bootStamp}`;
  document.head.appendChild(style);

  const roomStyle=document.createElement('link');
  roomStyle.rel='stylesheet';
  roomStyle.href=`rooms.css?v=${encodeURIComponent(version)}&boot=${bootStamp}`;
  document.head.appendChild(roomStyle);

  const app=document.createElement('script');
  app.src=`app.js?v=${encodeURIComponent(version)}&boot=${bootStamp}`;
  document.body.appendChild(app);
})();
