VIEWS.stats=function(){
  const app=document.getElementById('app');
  const S=Store.state,prof=S.profile;
  const ts=Store.todayStats();
  const week=Store.weekDays();
  const maxN=Math.max(1,...week.map(d=>d.n));
  let done=0,total=0,okN=0,badN=0;
  const hard=[];
  S.decks.forEach(d=>d.words.forEach(w=>{
    total++;if(SM2.isDone(w))done++;
    okN+=w.ok||0;badN+=w.bad||0;
    if((w.bad||0)>=2)hard.push(w);
  }));
  hard.sort((a,b)=>(b.bad-a.bad)||((b.lapses||0)-(a.lapses||0)));
  const acc=(okN+badN)?Math.round(100*okN/(okN+badN)):null;
  const totalReviews=Object.values(prof.days).reduce((a,d)=>a+d.reviews,0);

  app.innerHTML=`
  <div style="padding:8px 2px 14px">
    <div class="h1">Прогресс</div>
    <div class="sub">как идёт учёба</div>
  </div>
  <div class="card">
    <div class="h2 mb">Неделя</div>
    <div class="barchart">
      ${week.map(d=>'<div class="bar '+(d.today?'today':'')+'"><i style="height:'+Math.max(3,Math.round(100*d.n/maxN))+'%"></i><span>'+d.name+'</span></div>').join('')}
    </div>
    <div class="sub center" style="margin-top:8px">${ts.reviews} ${U.decl(ts.reviews,'слово','слова','слов')} сегодня · цель ${S.settings.dailyGoal}</div>
  </div>
  <div class="stat-grid four" style="margin-bottom:14px">
    <div class="stat"><span class="v v-red">${icon('fire',18)}${prof.streak}</span><span class="l">серия дней</span></div>
    <div class="stat"><span class="v v-gold">${icon('bolt',18)}${prof.xp}</span><span class="l">всего опыта</span></div>
    <div class="stat"><span class="v v-green">${icon('check',18)}${done}</span><span class="l">выучено</span></div>
    <div class="stat"><span class="v v-blue">${icon('books',18)}${total}</span><span class="l">слов всего</span></div>
    <div class="stat"><span class="v">${acc==null?'—':acc+'%'}</span><span class="l">точность</span></div>
    <div class="stat"><span class="v">${totalReviews}</span><span class="l">повторений</span></div>
  </div>
  <div class="card">
    <div class="h2 mb">Словари</div>
    ${S.decks.map(d=>{
      const s=Store.deckStats(d);
      const pct=s.total?Math.round(100*s.done/s.total):0;
      return '<div class="row mb" style="cursor:pointer" onclick="location.hash=\'#/words/'+d.id+'\'">'+
        '<div style="flex:1;min-width:0">'+
        '<div style="font-weight:900;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+U.esc(d.name)+'</div>'+
        '<div class="prog thin" style="margin-top:6px"><i style="width:'+pct+'%"></i></div></div>'+
        '<span class="sub" style="font-weight:900">'+s.done+'/'+s.total+'</span></div>';
    }).join('')||'<p class="sub">Словарей нет</p>'}
  </div>
  <div class="card">
    <div class="h2 mb">Проблемные слова</div>
    ${hard.length?hard.slice(0,10).map(w=>`
      <div class="list-item">
        <div class="li-main"><div class="li-w">${U.esc(w.w)}</div><div class="li-t">${U.esc(w.t)}</div></div>
        <span class="tag" style="background:var(--red-bg);color:var(--red-shadow)">${icon('wrong',14)} ${w.bad}</span>
      </div>`).join('')
    :'<p class="sub">Слов с ошибками нет — отличный результат!</p>'}
  </div>`;
};