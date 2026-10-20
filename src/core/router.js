window.Router = (function(){
  const VIEWS=window.VIEWS=window.VIEWS||{};
  const NAMES=['home','decks','train','stats','settings'];
  function parse(){
    const h=(location.hash||'#/home').replace(/^#\//,'');
    const [name,param]=h.split('/');
    return {name:VIEWS[name]?name:'home',param:param?decodeURIComponent(param):null};
  }
  function render(){
    const {name,param}=parse();
    document.querySelectorAll('[data-nav]').forEach(el=>el.classList.remove('on'));
    if(NAMES.indexOf(name)>=0){
      document.querySelectorAll('[data-nav="'+name+'"]').forEach(el=>el.classList.add('on'));
    }
    document.querySelector('.topbar').classList.toggle('hide',name==='onboarding');
    document.querySelector('.tabbar').classList.toggle('hide',name==='onboarding');
    document.querySelector('.rail').classList.toggle('hide',name==='onboarding');
    window.scrollTo(0,0);
    VIEWS[name](param);
  }
  function go(hash){location.hash=hash;}
  function init(){window.addEventListener('hashchange',render);render();}
  return{init,render,go,VIEWS};
})();