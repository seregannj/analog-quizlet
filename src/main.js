/* Точка входа: темы, глобальные хелперы, роутер */

function applyTheme(){
  const t=Store.state.theme||'light';
  const dark=t==='dark'||(t==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme=dark?'dark':'light';
  const m=document.querySelector('meta[name="theme-color"]');
  if(m)m.content=dark?'#0F1A20':'#58CC02';
}
window.applyTheme=applyTheme;

window.toast=function(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('show');
  clearTimeout(toast._t);
  toast._t=setTimeout(function(){t.classList.remove('show');},2400);
};

window.openModal=function(html){
  document.getElementById('modalBox').innerHTML=html;
  document.getElementById('overlay').classList.remove('hide');
};
window.closeModal=function(){document.getElementById('overlay').classList.add('hide');};

window.refreshTop=function(){
  const p=Store.state.profile;
  document.getElementById('pStreak').textContent=p.streak;
  document.getElementById('pXp').textContent=p.xp;
  document.getElementById('pGems').textContent=p.gems;
};

window.showFeedback=function(ok,title,sub,onNext){
  const fb=document.getElementById('fb');
  fb.className='feedback show '+(ok?'ok':'bad');
  document.getElementById('fbUse').setAttribute('href',ok?'#i-check':'#i-wrong');
  document.getElementById('fbTitle').textContent=title;
  document.getElementById('fbSub').textContent=sub||'';
  document.getElementById('fbBtn').onclick=function(){hideFeedback();if(onNext)onNext();};
};
window.hideFeedback=function(){document.getElementById('fb').className='feedback';};

/* клик по затемнению закрывает модал */
document.getElementById('overlay').addEventListener('click',function(e){
  if(e.target.id==='overlay')closeModal();
});

/* системная тема могла смениться */
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(){applyTheme();});}catch(e){}

applyTheme();
refreshTop();
Router.init();
if(!Store.state.onboarded&&location.hash!=='#/onboarding')location.hash='#/onboarding';