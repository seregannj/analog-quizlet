VIEWS.home=function(){
  const app=document.getElementById('app');
  const S=Store.state, prof=S.profile, ts=Store.todayStats();
  const goal=S.settings.dailyGoal||10;
  const due=Store.dueList(), fresh=Store.newList();
  const pct=Math.min(100,Math.round(100*ts.reviews/goal));
  const R=44, C=2*Math.PI*R, off=C*(1-pct/100);
  const week=Store.weekDays();
  const totalWords=S.decks.reduce((a,d)=>a+d.words.length,0);

  if(totalWords===0){
    app.innerHTML=topRow()+`
    <div class="card center" style="padding:34px 20px">
      <svg class="onb-illo owl-bounce" style="width:110px;height:110px"><use href="#i-owl"/></svg>
      <div class="h1" style="margin-top:8px">Пусто и уютно</div>
      <p class="sub" style="margin:6px 0 18px">Создайте первый словарь и вставьте свои слова списком — Лекси сразу составит расписание повторений.</p>
      <div class="row wrap" style="justify-content:center">
        <button class="btn btn-green" onclick="location.hash='#/decks'">${icon('plus',18)} Создать словарь</button>
      </div>
    </div>`+quickLinks();
    return;
  }

  let sub;
  if(due.length>0){
    sub=U.decl(due.length,'ждёт','ждут','ждёт')+' '+due.length+' '+U.decl(due.length,'слово','слова','слов')+' из ваших словарей';
  }else if(fresh.length>0){
    sub='Новые слова готовы к первому знакомству';
  }else{
    sub='Всё повторено — можно закрепить вперёд';
  }

  app.innerHTML=topRow()+`
  <div class="card card-hover" style="display:flex;gap:16px;align-items:center;cursor:pointer" onclick="location.hash='#/train'">
    <svg style="width:86px;height:86px;flex:none" class="owl-bounce"><use href="#i-owl"/></svg>
    <div style="flex:1;min-width:0">
      <div class="h2">${due.length>0?'Пора повторить':'Урок дня'}</div>
      <div class="sub">${sub}</div>
      <button class="btn btn-green btn-sm mt" style="pointer-events:none">${icon('bolt',16)} Начать урок</button>
    </div>
  </div>
  <div class="card">
    <div class="row mb"><span class="chip">${icon('target',14)} цель дня</span><span class="spacer"></span><span class="sub">${ts.reviews} / ${goal}</span></div>
    <div class="row" style="gap:20px">
      <div class="ring-wrap" style="flex:none">
        <svg class="ring" width="110" height="110" viewBox="0 0 110 110">
          <circle class="track" cx="55" cy="55" r="${R}" fill="none" stroke-width="12"/>
          <circle class="val" cx="55" cy="55" r="${R}" fill="none" stroke-width="12"
            stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"/>
        </svg>
        <div class="ring-num"><b>${pct}%</b><span>выполнено</span></div>
      </div>
      <div style="flex:1;min-width:0">
        <div class="sub" style="margin-bottom:8px">На этой неделе:</div>
        <div class="week">${week.map(d=>`
          <div class="d"><span class="dot ${d.n>0?'on':''} ${d.today?'today':''}">${d.n>0?d.n:''}</span>${d.name}</div>`).join('')}
        </div>
      </div>
    </div>
  </div>
  <div class="stat-grid" style="margin-bottom:14px">
    <div class="stat"><span class="v v-red">${icon('fire',18)}${prof.streak}</span><span class="l">дней серия</span></div>
    <div class="stat"><span class="v v-gold">${icon('bolt',18)}${prof.xp}</span><span class="l">всего опыта</span></div>
    <div class="stat"><span class="v v-blue">${icon('books',18)}${totalWords}</span><span class="l">слов</span></div>
  </div>`+quickLinks();

  function topRow(){
    return `<div style="padding:8px 2px 14px">
      <div class="h1">${U.greeting()}.</div>
      <div class="sub">${new Date().toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long'})}</div>
    </div>`;
  }
  function quickLinks(){
    return `<div class="row wrap">
      <button class="btn btn-ghost" onclick="location.hash='#/decks'">${icon('plus',16)} Словари</button>
      <button class="btn btn-ghost" onclick="location.hash='#/stats'">${icon('chart',16)} Прогресс</button>
      <button class="btn btn-ghost" onclick="location.hash='#/settings'">${icon('sliders',16)} Настройки</button>
    </div>`;
  }
};