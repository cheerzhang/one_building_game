(async function(){
  let version='v0.3.0-local';
  try{
    const response=await fetch(`build-info.js?check=${Date.now()}`,{cache:'no-store'});
    if(!response.ok)throw Error(response.status);
    const match=(await response.text()).match(/BUILD_VERSION\s*=\s*['"]([^'"]+)/);
    if(match)version=match[1];
  }catch(error){console.debug('读取版本失败，使用本地版本',error)}
  window.BUILD_VERSION=version;
  document.querySelector('link[href="style.css"]')?.setAttribute('href',`style.css?v=${encodeURIComponent(version)}`);
  const game=document.createElement('script');
  game.src=`game.js?v=${encodeURIComponent(version)}`;
  document.body.appendChild(game);
})();
