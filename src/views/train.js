/* Сессия урока объявлена ЯВНО: раньше переменная создавалась неявно при старте
   урока, и глобальный обработчик клавиш внизу файла падал с ReferenceError
   при любом нажатии клавиши до первого урока. */
var ses=null;

VIEWS.train=function(){
  const app=document.getElementById('app');

  /* ═════════ экран настройки ═════════ */
  function setup(){
    const S=Store.state;
    if(!S.decks.length){
      app.innerHTML=`
      <div style="padding:8px 2px 14px"><div class="h1">Урок</div><div class="sub">нет словарей</div></div>
      <div class="card empty">
        <svg class="big-ico"><use href="#i-books"/></svg>
        <b>Сначала создайте словарь</b>
        Добавьте слова — и урок появится сам
        <div class="mt"><button class="btn btn-green" onclick="location.hash='#/decks'">${icon('plus',18)} К словарям</button></div>
      </div>`;
      return;
    }
    const due=Store.dueList(),fresh=Store.newList();
    let sub;
    if(due.length)sub='к повторению: '+due.length;
    else if(fresh.length)sub='новых слов: '+fresh.length;
    else sub='всё повторено — закрепим вперёд';
    app.innerHTML=`
    <div style="padding:8px 2px 14px">
      <div class="h1">Урок</div>
      <div class="sub">${sub}</div>
    </div>
    <div class="card">
      <div class="field"><label>Словарь</label>
        <select class="inp" id="tDeck">
          <option value="">Все словари</option>
          ${S.decks.map(d=>'<option value="'+d.id+'">'+U.esc(d.name)+'</option>').join('')}
        </select></div>
      <div class="field"><label>Режим</label>
        <div class="seg" id="tMode">
          <button data-v="choice" class="on">Выбор варианта</button>
          <button data-v="cards">Карточки SM-2</button>
          <button data-v="examples">Примеры</button>
        </div></div>
      <div class="field"><label>Слов в уроке</label>
        <div class="seg" id="tSize">${[5,10,15,20].map(n=>'<button data-v="'+n+'"'+(n===(S.settings.lessonSize||10)?' class="on"':'')+'>'+n+'</button>').join('')}</div></div>
      <button class="btn btn-green btn-block" id="tStart">${icon('bolt',20)} Начать урок</button>
    </div>
    <div class="card">
      <div class="sub"><b>Карточки SM-2</b> — самый честный режим: вы сами оцениваете, насколько вспомнили, и оценка задаёт интервал следующего показа. <b>Примеры</b> — предложение с пропуском; работает для слов с примером (третье поле при импорте). Если примеров мало, вопросы дополнятся обычными.</div>
    </div>`;
    seg('tMode');seg('tSize');
    document.getElementById('tStart').onclick=start;
  }
  function seg(id){
    const box=document.getElementById(id);
    box.querySelectorAll('button').forEach(b=>b.onclick=()=>{
      box.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on');
    });
  }
  function segVal(id){return document.getElementById(id).querySelector('.on').dataset.v;}

  /* ═════════ сборка сессии ═════════ */
  function start(){
    /* tDeck — это <select>, берём value напрямую (segVal тут не подходит) */
    const deckId=document.getElementById('tDeck').value;
    const mode=segVal('tMode'),size=+segVal('tSize');
    const today=U.todayISO();
    let overdue=[],fresh=[],all=[];
    Store.state.decks.forEach(d=>{
      if(deckId&&d.id!==deckId)return;
      d.words.forEach(w=>{
        if(w.due&&w.due<=today)overdue.push({deck:d,w:w});
        else if(w.due==null)fresh.push({deck:d,w:w});
        all.push({deck:d,w:w});
      });
    });
    overdue.sort((a,b)=>a.w.due<b.w.due?-1:1);
    let items=overdue.concat(fresh).slice(0,size);
    let forward=false;
    if(!items.length){
      items=U.shuffle(all).slice(0,size);forward=true;
      if(!items.length){toast('Сначала добавьте слова в словарь');Router.go('#/decks');return;}
    }
    Store.state.settings.lessonSize=size;Store.save();
    ses={items:items,i:0,res:[],mode:mode,xp:0,forward:forward};
    hideFeedback();
    drawLesson();renderQ();
  }

  function drawLesson(){
    app.innerHTML=`
    <div class="row" style="padding:8px 0 16px">
      <button class="icon-btn" id="quit" title="Выйти">${icon('close',20)}</button>
      <div class="prog"><i id="bar"></i></div>
      <span class="sub" id="cnt" style="font-weight:900"></span>
    </div>
    <div id="qBody"></div>`;
    document.getElementById('quit').onclick=quit;
  }

  /* Поиск целого слова в примере: без учёта регистра, по границам слова, любой алфавит.
     Старая версия строила RegExp без границ — «cat» находилась внутри «category». */
  function findWordIn(ex,word){
    if(!ex||!word)return -1;
    const isL=ch=>/[\p{L}\p{N}]/u.test(ch);
    const low=ex.toLowerCase(),t=word.toLowerCase();
    let i=low.indexOf(t);
    while(i>=0){
      const b=i>0?low[i-1]:' ',a=i+t.length<low.length?low[i+t.length]:' ';
      if(!isL(b)&&!isL(a))return i;
      i=low.indexOf(t,i+1);
    }
    return -1;
  }

  /* ═════════ один вопрос ═════════ */
  function renderQ(){
    if(!ses)return;
    if(ses.i>=ses.items.length)return finish();
    const it=ses.items[ses.i];
    const w=it.w,deck=it.deck;
    const total=ses.items.length;
    document.getElementById('bar').style.width=(100*ses.i/total).toFixed(1)+'%';
    document.getElementById('cnt').textContent=(ses.i+1)+' / '+total;

    /* пример с пропуском: ищем целое слово; если не нашли,
       но в примере уже есть «___» — используем готовый пропуск */
    let exUse=null,exFilled=null;
    if(w.ex){
      const idx=findWordIn(w.ex,w.w);
      if(idx>=0){
        exUse=w.ex.slice(0,idx)+'________'+w.ex.slice(idx+w.w.length);
        exFilled=w.ex;
      }else if(/_{3,}/.test(w.ex)){
        exUse=w.ex.replace(/_{3,}/,'________');
        exFilled=w.ex.replace(/_{3,}/,w.w);
      }
    }
    const mode=(ses.mode==='examples'&&!exUse)?'choice':ses.mode;
    const body=document.getElementById('qBody');

    if(mode==='cards'){
      body.innerHTML=`
      <div class="qcard">
        <span class="chip">${icon('book',14)} ${U.esc(deck.name)}</span>
        <div class="qword">${U.esc(w.w)}</div>
        <button class="speak" id="say">${icon('speaker',26)}</button>
      </div>
      <div id="reveal" class="hide" style="margin-top:-4px">
        <div class="qword" style="color:var(--green-dark);font-size:clamp(24px,7vw,32px)">${U.esc(w.t)}</div>
      </div>
      <button class="btn btn-blue btn-block" id="show" style="margin-top:12px">Показать перевод</button>
      <div id="grades" class="hide" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px">
        <button class="btn btn-red" data-q="0">1 · Забыл</button>
        <button class="btn btn-gray" data-q="1">2 · Трудно</button>
        <button class="btn btn-green" data-q="2">3 · Знал</button>
        <button class="btn btn-blue" data-q="3">4 · Легко</button>
      </div>`;
      document.getElementById('say').onclick=()=>U.speak(w.w,deck.from);
      document.getElementById('show').onclick=()=>{
        document.getElementById('reveal').classList.remove('hide');
        document.getElementById('show').classList.add('hide');
        document.getElementById('grades').classList.remove('hide');
        U.speak(w.w,deck.from);
      };
      document.querySelectorAll('#grades [data-q]').forEach(b=>b.onclick=()=>{
        const q=+b.dataset.q;
        apply(it,q);
        const ok=q>=1;
        const titles=['Забыли','Трудно','Знали!','Легко!'];
        showFeedback(ok,titles[q],'Правильно: '+w.w+' — '+w.t+' · следующий показ: '+U.fmtDate(w.due),next);
      });
    }

    if(mode==='choice'){
      const opts=buildOptions(it,'t');
      body.innerHTML=`
      <div class="qcard">
        <span class="chip">${icon('book',14)} ${U.esc(deck.name)}</span>
        <div class="qword">${U.esc(w.w)}</div>
        <button class="speak" id="say">${icon('speaker',26)}</button>
      </div>
      <div class="opts${opts.length<2?' one':''}" id="opts">
        ${opts.map((o,i)=>'<button class="tile" data-ok="'+(o===w.t?1:0)+'"><span class="num">'+(i+1)+'</span>'+U.esc(o)+'</button>').join('')}
      </div>
      <div class="row" style="margin-top:16px">
        <button class="btn btn-ghost" id="skip">${icon('skip',18)} Пропустить</button>
        <span class="spacer"></span>
        <button class="btn btn-gray" id="check" disabled>Проверить</button>
      </div>`;
      document.getElementById('say').onclick=()=>U.speak(w.w,deck.from);
      let sel=null,locked=false;
      document.querySelectorAll('#opts .tile').forEach(t=>t.onclick=()=>{
        if(locked)return;
        document.querySelectorAll('#opts .tile').forEach(x=>x.classList.remove('selected'));
        t.classList.add('selected');sel=t;
        const c=document.getElementById('check');c.disabled=false;c.className='btn btn-green';
      });
      document.getElementById('check').onclick=()=>{
        if(locked||!sel)return;
        locked=true;
        const ok=sel.dataset.ok==='1';
        apply(it,ok?2:0);
        document.querySelectorAll('#opts .tile').forEach(t=>{t.disabled=true;if(t.dataset.ok==='1')t.classList.add('correct');});
        if(!ok)sel.classList.add('wrong');
        showFeedback(ok,ok?'Верно!':'Ой!',(ok?'':'Правильный ответ: ')+w.t+' · следующий показ: '+U.fmtDate(w.due),next);
      };
      document.getElementById('skip').onclick=()=>{
        if(locked)return;
        locked=true;apply(it,0);
        document.querySelectorAll('#opts .tile').forEach(t=>{t.disabled=true;if(t.dataset.ok==='1')t.classList.add('correct');});
        showFeedback(false,'Пропущено','Правильный ответ: '+w.t,next);
      };
    }

    if(mode==='examples'){
      const opts=buildOptions(it,'w');
      body.innerHTML=`
      <div class="qcard">
        <span class="chip">${icon('book',14)} ${U.esc(deck.name)} · пример</span>
        <div class="qex" style="font-size:20px;color:var(--ink);font-weight:800;font-style:normal;line-height:1.6">${U.esc(exUse)}</div>
        <div class="qsub">выберите пропущенное слово</div>
        <button class="speak" id="say">${icon('speaker',26)}</button>
      </div>
      <div class="opts${opts.length<2?' one':''}" id="opts">
        ${opts.map((o,i)=>'<button class="tile" data-ok="'+(o===w.w?1:0)+'"><span class="num">'+(i+1)+'</span>'+U.esc(o)+'</button>').join('')}
      </div>
      <div class="row" style="margin-top:16px">
        <span class="spacer"></span>
        <button class="btn btn-gray" id="check" disabled>Проверить</button>
      </div>`;
      /* озвучиваем пример С пропущенным словом на своём месте */
      document.getElementById('say').onclick=()=>U.speak(exFilled||w.ex,deck.from);
      let sel=null,locked=false;
      document.querySelectorAll('#opts .tile').forEach(t=>t.onclick=()=>{
        if(locked)return;
        document.querySelectorAll('#opts .tile').forEach(x=>x.classList.remove('selected'));
        t.classList.add('selected');sel=t;
        const c=document.getElementById('check');c.disabled=false;c.className='btn btn-green';
      });
      document.getElementById('check').onclick=()=>{
        if(locked||!sel)return;
        locked=true;
        const ok=sel.dataset.ok==='1';
        apply(it,ok?2:0);
        document.querySelectorAll('#opts .tile').forEach(t=>{t.disabled=true;if(t.dataset.ok==='1')t.classList.add('correct');});
        if(!ok)sel.classList.add('wrong');
        showFeedback(ok,ok?'Верно!':'Ой!',(ok?'':'Пропущено слово: ')+w.w+' — '+w.t,next);
      };
    }
  }

  /* 3 случайных дистрактора с той же стороны слова */
  function buildOptions(it,side){
    const right=it.w[side];
    let pool=[...new Set(it.deck.words.filter(w=>w.id!==it.w.id&&w[side]).map(w=>w[side]))].filter(x=>x!==right);
    if(pool.length<3){
      Store.state.decks.forEach(d=>d.words.forEach(w=>{
        if(w[side]&&w.id!==it.w.id)pool.push(w[side]);
      }));
      pool=[...new Set(pool)].filter(x=>x!==right);
    }
    return U.shuffle([right].concat(U.shuffle(pool).slice(0,3)));
  }

  /* Оценка применяется сразу, XP/серия пишутся сразу (Store.recordAnswer) */
  function apply(it,q){
    const xp=Store.grade(it.deck.id,it.w.id,q);
    Store.recordAnswer(xp);
    ses.xp+=xp;ses.res.push({ok:q>=2});refreshTop();
  }
  function next(){ses.i++;renderQ();}
  function quit(){
    ses=null;hideFeedback();Router.go('#/home');
  }

  /* ═════════ финиш ═════════ */
  function finish(){
    refreshTop();
    const good=ses.res.filter(r=>r.ok).length;
    const acc=Math.round(100*good/ses.items.length);
    const prof=Store.state.profile;
    const msg=ses.forward?'Закрепили материал вперёд — отличная работа!':'Все запланированные слова повторены';
    app.innerHTML=`
    <div class="card center" style="padding:30px 20px">
      <svg class="onb-illo mascot-bounce" style="width:110px;height:110px"><use href="#i-tiger"/></svg>
      <div class="h1" style="color:var(--gold-text);margin-top:6px">Урок завершён!</div>
      <p class="sub">${msg}</p>
      <div class="stat-grid mt mb">
        <div class="stat"><span class="v v-gold">${icon('bolt',18)}+${ses.xp}</span><span class="l">опыт</span></div>
        <div class="stat"><span class="v v-green">${good}/${ses.items.length}</span><span class="l">верно</span></div>
        <div class="stat"><span class="v v-blue">${acc}%</span><span class="l">точность</span></div>
      </div>
      <div class="row wrap" style="justify-content:center;margin-bottom:16px">
        <span class="pill pill-red">${icon('fire',18)}${prof.streak}</span>
        <span class="pill pill-blue">${icon('gem',18)}${prof.gems}</span>
      </div>
      <div class="row wrap" style="justify-content:center">
        <button class="btn btn-green" id="again">${icon('refresh',18)} Ещё урок</button>
        <button class="btn btn-ghost" id="toHome">На главную</button>
      </div>
    </div>`;
    ses=null;
    document.getElementById('again').onclick=()=>setup();
    document.getElementById('toHome').onclick=()=>Router.go('#/home');
  }

  setup();
};

/* горячие клавиши: 1–4 — выбор варианта или оценка карточки,
   Enter / Пробел — проверить · показать перевод · продолжить.
   Проверка полей ввода идёт ПЕРВОЙ, чтобы хоткеи не срабатывали при наборе текста. */
document.addEventListener('keydown',e=>{
  const tag=(e.target&&e.target.tagName)||'';
  if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT')return;
  const fb=document.getElementById('fb');
  if(fb&&fb.classList.contains('show')){
    if(e.key==='Enter'||e.key===' '){e.preventDefault();document.getElementById('fbBtn').click();}
    return;
  }
  if(!ses)return;
  if(['1','2','3','4'].indexOf(e.key)>=0){
    /* режим карточек: после раскрытия 1–4 оценивают ответ */
    const grades=document.getElementById('grades');
    if(grades&&!grades.classList.contains('hide')){
      const b=grades.querySelector('[data-q="'+({'1':'0','2':'1','3':'2','4':'3'}[e.key])+'"]');
      if(b){e.preventDefault();b.click();}
      return;
    }
    const tiles=document.querySelectorAll('#opts .tile');
    if(tiles[+e.key-1]){e.preventDefault();tiles[+e.key-1].click();}
    return;
  }
  if(e.key==='Enter'||e.key===' '){
    const c=document.getElementById('check');
    if(c&&!c.disabled){e.preventDefault();c.click();return;}
    const s=document.getElementById('show');
    if(s&&!s.classList.contains('hide')){e.preventDefault();s.click();}
  }
});
