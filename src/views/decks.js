VIEWS.decks=function(){
  const app=document.getElementById('app');
  const S=Store.state;
  draw();

  function draw(){
    const cards=S.decks.map(d=>{
      const s=Store.deckStats(d);
      const pct=s.total?Math.round(100*s.done/s.total):0;
      return `<div class="card card-hover" style="cursor:pointer" onclick="location.hash='#/words/${d.id}'">
        <div class="row mb">
          <div style="flex:1;min-width:0">
            <div class="h2" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${U.esc(d.name)}</div>
            <div class="sub">${d.from.split('-')[0]} → ${d.to.split('-')[0]} · ${s.total} ${U.decl(s.total,'слово','слова','слов')}</div>
          </div>
          <button class="icon-btn" data-edit="${d.id}" title="Переименовать">${icon('edit',18)}</button>
          <button class="icon-btn danger" data-del="${d.id}" title="Удалить">${icon('trash',18)}</button>
        </div>
        <div class="row" style="gap:10px">
          <div class="prog thin" style="flex:1"><i style="width:${pct}%"></i></div>
          <span class="sub" style="font-weight:900">${s.done}/${s.total}</span>
        </div>
        <div class="row" style="gap:6px;margin-top:10px">
          <span class="tag tag-done">выучено ${s.done}</span>
          <span class="tag tag-learn">учится ${s.learning}</span>
          <span class="tag tag-new">новых ${s.fresh}</span>
        </div>
      </div>`;
    }).join('');

    app.innerHTML=`
    <div class="row mb" style="padding:8px 2px">
      <div><div class="h1">Словари</div><div class="sub">${S.decks.length? U.decl(S.decks.length,'колода','колоды','колод') : 'пока ни одного'}</div></div>
      <span class="spacer"></span>
      <button class="btn btn-green" id="newDeck">${icon('plus',18)} Создать</button>
    </div>
    ${cards||emptyState()}`;

    document.getElementById('newDeck').onclick=()=>createModal();
    app.querySelectorAll('[data-edit]').forEach(b=>b.onclick=e=>{
      e.stopPropagation();const d=Store.deck(b.dataset.edit);
      const n=prompt('Название словаря:',d.name);if(n&&n.trim()){Store.renameDeck(d.id,n);draw();}
    });
    app.querySelectorAll('[data-del]').forEach(b=>b.onclick=e=>{
      e.stopPropagation();const d=Store.deck(b.dataset.del);
      if(confirm('Удалить словарь «'+d.name+'» и все его слова?')){Store.deleteDeck(d.id);draw();refreshTop();}
    });
  }

  function emptyState(){
    return `<div class="card empty">
      <svg class="big-ico"><use href="#i-books"/></svg>
      <b>Словарей пока нет</b>
      Создайте первый — например, «Английский: топ-500»
    </div>`;
  }

  function createModal(){
    openModal(`
      <h3>Новый словарь</h3>
      <div class="field"><label>Название</label><input class="inp" id="mName" placeholder="Например: Английский — работа"></div>
      <div class="row" style="gap:10px">
        <div class="field" style="flex:1"><label>Язык слова</label>
          <select class="inp" id="mFrom">${langOpts('en-US')}</select></div>
        <div class="field" style="flex:1"><label>Язык перевода</label>
          <select class="inp" id="mTo">${langOpts('ru-RU')}</select></div>
      </div>
      <button class="btn btn-green btn-block" id="mOk">Создать</button>
    `);
    document.getElementById('mOk').onclick=()=>{
      const n=document.getElementById('mName').value.trim();
      if(!n){toast('Введите название');return;}
      const d=Store.createDeck(n,document.getElementById('mFrom').value,document.getElementById('mTo').value);
      closeModal();refreshTop();Router.go('#/words/'+d.id);
    };
  }
};

function langOpts(sel){
  const L=[['en-US','Английский'],['ru-RU','Русский'],['es-ES','Испанский'],['de-DE','Немецкий'],['fr-FR','Французский'],['it-IT','Итальянский'],['pt-BR','Португальский'],['pl-PL','Польский'],['tr-TR','Турецкий'],['ja-JP','Японский'],['zh-CN','Китайский'],['ko-KR','Корейский']];
  return L.map(function(c){return '<option value="'+c[0]+'"'+(c[0]===sel?' selected':'')+'>'+c[1]+'</option>';}).join('');
}