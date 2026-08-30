(function(){
  const current=window.BUILD_VERSION||'unknown';
  const banner=document.createElement('aside');
  banner.className='update-banner';banner.hidden=true;
  banner.innerHTML='<span>新版本 <b></b> 已发布</span><button type="button">点击更新</button>';
  document.body.appendChild(banner);
  let available='';
  async function check(){
    try{
      const text=await fetch(`build-info.js?check=${Date.now()}`,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error(r.status);return r.text()});
      const match=text.match(/BUILD_VERSION\s*=\s*['"]([^'"]+)/);
      if(match&&match[1]!==current){available=match[1];banner.querySelector('b').textContent=available;banner.hidden=false}
    }catch(error){console.debug('版本检查暂不可用',error)}
  }
  banner.querySelector('button').onclick=()=>{const url=new URL(location.href);url.searchParams.set('update',available||Date.now());location.replace(url)};
  check();setInterval(check,30000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});
})();
