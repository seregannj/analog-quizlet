VIEWS.words=function(deckId){
  const app=document.getElementById('app');
  const d=Store.deck(deckId);
  if(!d){Router.go('#/decks');return;}
  let query='',editOpen=false;
  function statusOf(w){return SM2.isDone(w)?'done':(w.ok||w.bad)?'learn':'new';}
  const TAG={done:['tag-done','выучено'],learn:['tag-learn','учится'],new:['tag-new','новое']};

  function draw(){
    const s=Store.deckStats(d);
    const words=d.words.filter(w=>{
      if(!query)return true;
      const qq=query.toLowerCase();
      return w.w.toLowerCase().includes(qq)||w.t.toLowerCase().includes(qq);
    });
    app.innerHTML=`
    <div class="row mb" style="padding:8px 2px">
      <button class="icon-btn" onclick="location.hash='#/decks'">${icon('right',18)}</button>
      <div style="flex:1;min-width:0">
        <div class="h1" style="font-size:22px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${U.esc(d.name)}</div>
        <div class="sub">${s.total} слов · выучено ${s.done}</div>
      </div>
      <button class="btn btn-green btn-sm" id="trainDeck">${icon('bolt',16)} Урок</button>
    </div>
    <div class="card">
      <div class="row mb"><div class="prog thin" style="flex:1"><i style="width:${s.total?Math.round(100*s.done/s.total):0}%"></i></div></div>
      <div class="row mb">
        <input class="inp" id="q" placeholder="Поиск..." value="${U.esc(query)}" style="flex:1">
        <button class="icon-btn" id="btnAdd">${icon('plus',20)}</button>
      </div>
      ${editOpen?oneForm():''}
      <div id="wlist">
        ${words.length?words.map(w=>{
          const tg=TAG[statusOf(w)];
          return `<div class="list-item">
            <div class="li-main">
              <div class="li-w">${U.esc(w.w)}</div>
              <div class="li-t">${U.esc(w.t)}</div>
              ${w.ex?'<div class="li-ex">'+U.esc(w.ex)+'</div>':''}
            </div>
            <span class="tag ${tg[0]}">${tg[1]}</span>
            <button class="icon-btn" data-say="${U.esc(w.w)}" title="Прослушать">${icon('speaker',18)}</button>
            <button class="icon-btn" data-edit="${w.id}" title="Изменить">${icon('edit',18)}</button>
            <button class="icon-btn danger" data-del="${w.id}" title="Удалить">${icon('trash',18)}</button>
          </div>`;}).join('')
        :'<div class="empty"><b>Слов пока нет</b>Нажмите «+» или импортируйте списком ниже</div>'}
      </div>
    </div>
    <div class="card">
      <div class="h2 mb">Импорт списком</div>
      <p class="sub mb">По одному слову на строку: <b>слово - перевод</b>, пример — третьим полем. Понимаются также таб (Excel), «|», «=», «:», нумерация «1.»</p>
      <textarea class="inp mono" id="bulk" placeholder="apple - яблоко - I eat an apple&#10;house - дом&#10;beautiful - красивый"></textarea>
      <label class="row" style="margin:10px 0;font-size:13.5px;font-weight:800;color:var(--muted)">
        <input type="checkbox" id="swap"> Наоборот: первое поле — это перевод
      </label>
      <div class="row wrap">
        <button class="btn btn-green" id="btnImport">${icon('up',18)} Импортировать</button>
        <button class="btn btn-ghost" id="btnPreview">Проверить</button>
      </div>
      <div id="preview" class="mt"></div>
    </div>`;
    bind();
  }

  function oneForm(){
    return `<div class="row wrap mb" style="background:var(--bg2);border-radius:14px;padding:12px">
      <input class="inp" id="nW" placeholder="Слово" style="flex:1;min-width:110px">
      <input class="inp" id="nT" placeholder="Перевод" style="flex:1;min-width:110px">
      <input class="inp" id="nEx" placeholder="Пример (необязательно)" style="flex:2;min-width:140px">
      <button class="btn btn-blue btn-sm" id="nSave">Dобавить</button>
    </div>`;
  }

  function bind(){
    const g=id=>document.getElementById(id);
    g('trainDeck').onclick=()=>{location.hash='#/train';};
    g('q').oninput=e=>{query=e.target.value;const pos=e.target.selectionStart;draw();const nq=g('q');nq.focus();nq.setSelectionRange(pos,pos);};
    g('btnAdd').onclick=()=>{editOpen=!editOpen;draw();if(editOpen)g('nW').focus();};
    if(g('nSave'))g('nSave').onclick=()=>{
      const w=g('nW').value.trim(),t=g('nT').value.trim(),ex=g('nEx').value.trim();
      if(!w||!t){toast('Заполните слово и перевод');return;}
      if(Store.addWord(d.id,w,t,ex)){toast('Добавлено');draw();}
      else toast('Такое слово уже есть');
    };
    g('btnImport').onclick=()=>imp(true);
    g('btnPreview').onclick=()=>imp(false);
    app.querySelectorAll('[data-say]').forEach(b=>b.onclick=()=>U.speak(b.dataset.say,d.from));
    app.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{
      const w=d.words.find(x=>x.id===b.dataset.edit);
      const a=prompt('Слово:',w.w);if(a===null)return;
      const t=prompt('Перевод:',w.t);if(t===null)return;
      const ex=prompt('Пример (можно оставить пустым):',w.ex||'');if(ex===null)return;
      Store.updateWord(d.id,w.id,{w:a.trim()||w.w,t:t.trim()||w.t,ex:ex.trim()});draw();
    });
    app.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{
      const w=d.words.find(x=>x.id===b.dataset.del);
      if(confirm('Удалить «'+w.w+'»?')){Store.deleteWord(d.id,w.id);draw();refreshTop();}
    });
  }

  function imp(commit){
    const text=document.getElementById('bulk').value;
    const {pairs,skipped}=Store.parseBulk(text);
    if(!pairs.length){document.getElementById('preview').innerHTML='<p class="sub">Не распознал ни одной строки. Нужен формат: <b>слово - перевод</b></p>';return;}
    const swap=document.getElementById('swap').checked;
    const list=swap?pairs.map(p=>[p[1],p[0],p[2]]):pairs;
    if(commit){
      const r=Store.bulkAdd(d.id,text,swap);
      document.getElementById('bulk').value='';
      document.getElementById('preview').innerHTML='';
      toast('Добавлено: '+r.added+(r.updated?' · обновлено: '+r.updated:'')+(r.skipped?' · пропущено: '+r.skipped:''));
      draw();refreshTop();
    }else{
      document.getElementById('preview').innerHTML=
        '<p class="sub mb">Распознано: <b>'+pairs.length+'</b>'+(skipped?' · пропущено: '+skipped:'')+'</p>'+
        list.slice(0,5).map(p=>'<div class="list-item"><div class="li-main"><div class="li-w">'+U.esc(p[0])+'</div><div class="li-t">'+U.esc(p[1])+(p[2]?' · '+U.esc(p[2]):'')+'</div></div></div>').join('')+
        (pairs.length>5?'<p class="sub" style="margin-top:8px">…и ещё '+(pairs.length-5)+'</p>':'');
    }
  }

  draw();
};