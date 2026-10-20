VIEWS.settings=function(){
  const app=document.getElementById('app');
  draw();

  function draw(){
    const S=Store.state;
    app.innerHTML=`
    <div style="padding:8px 2px 14px"><div class="h1">Настройки</div><div class="sub">тема, учёба, данные</div></div>
    <div class="card">
      <div class="h2 mb">Оформление</div>
      <div class="field"><label>Тема</label>
        <div class="seg" id="sTheme">
          ${[['light','Светлая'],['dark','Тёмная'],['auto','Системная']].map(p=>'<button data-v="'+p[0]+'"'+(S.theme===p[0]?' class="on"':'')+'>'+p[1]+'</button>').join('')}
        </div></div>
      <div class="field"><label>Озвучка слов</label>
        <div class="seg" id="sSound">
          <button data-v="1" ${S.settings.sound?'class="on"':''}>Вкл</button>
          <button data-v="0" ${!S.settings.sound?'class="on"':''}>Выкл</button>
        </div></div>
      <button class="btn btn-ghost" id="tts">${icon('speaker',18)} Проверить голос</button>
    </div>
    <div class="card">
      <div class="h2 mb">Учёба</div>
      <div class="field"><label>Цель: слов в день</label>
        <div class="seg" id="sGoal">${[5,10,20,30].map(n=>'<button data-v="'+n+'"'+(n===S.settings.dailyGoal?' class="on"':'')+'>'+n+'</button>').join('')}</div></div>
      <div class="field"><label>Слов в уроке</label>
        <div class="seg" id="sSize">${[5,10,15,20].map(n=>'<button data-v="'+n+'"'+(n===(S.settings.lessonSize||10)?' class="on"':'')+'>'+n+'</button>').join('')}</div></div>
    </div>
    <div class="card">
      <div class="h2 mb">Данные</div>
      <p class="sub mb">Всё хранится локально в этом браузере. Архив содержит слова, прогресс и настройки — пригодится при переносе на другое устройство.</p>
      <div class="row wrap">
        <button class="btn btn-green" id="exp">${icon('down',18)} Резервная копия</button>
        <label class="btn btn-blue">${icon('up',18)} Восстановить<input type="file" id="impFile" accept=".zip,.json" hidden></label>
      </div>
      <div class="row wrap mt">
        <button class="btn btn-red btn-sm" id="reset">${icon('refresh',16)} Сбросить прогресс</button>
        <button class="btn btn-red btn-sm" id="wipe">${icon('trash',16)} Удалить всё</button>
      </div>
    </div>
    <div class="card">
      <div class="h2 mb">О приложении</div>
      <div class="sub">Лексио — личный тренажёр слов с интервальными повторениями (SM-2). Работает офлайн, без аккаунтов и серверов. Слова — ваши, данные — ваши.</div>
    </div>`;

    const g=id=>document.getElementById(id);
    g('sTheme').querySelectorAll('button').forEach(b=>b.onclick=()=>{S.theme=b.dataset.v;Store.save();applyTheme();draw();});
    g('sSound').querySelectorAll('button').forEach(b=>b.onclick=()=>{S.settings.sound=b.dataset.v==='1';Store.save();draw();});
    g('sGoal').querySelectorAll('button').forEach(b=>b.onclick=()=>{S.settings.dailyGoal=+b.dataset.v;Store.save();draw();});
    g('sSize').querySelectorAll('button').forEach(b=>b.onclick=()=>{S.settings.lessonSize=+b.dataset.v;Store.save();draw();});
    g('tts').onclick=()=>{const d=S.decks[0];if(d&&d.words[0])U.speak(d.words[0].w,d.from);else U.speak('Hello','en-US');};
    g('exp').onclick=doExport;
    g('impFile').onchange=e=>{if(e.target.files[0])doImport(e.target.files[0]);};
    g('reset').onclick=()=>{if(!confirm('Сбросить прогресс? Слова останутся, статистика обнулится.'))return;Store.resetProgress();refreshTop();draw();toast('Прогресс сброшен');};
    g('wipe').onclick=()=>{if(!confirm('УДАЛИТЬ ВСЁ: словари, слова, прогресс? Действие необратимо.'))return;Store.wipe();refreshTop();location.hash='#/onboarding';};
  }

  /* ── экспорт ZIP (STORE, собственная реализация) ── */
  function doExport(){
    const S=Store.state;
    const files=[
      {name:'lexio-backup.json',text:JSON.stringify(S)},
      {name:'README.txt',text:'Лексио — резервная копия от '+U.todayISO()+'\n\nlexio-backup.json — полный бэкап (слова, прогресс, настройки).\nПапка «словари» — списки в формате: слово - перевод - пример.\n\nВосстановление: Настройки → «Восстановить».'}
    ];
    S.decks.forEach((d,i)=>{
      const txt=d.words.map(w=>w.w+' - '+w.t+(w.ex?' - '+w.ex:'')).join('\n');
      const safe=d.name.replace(/[\\/:*?"<>|]/g,'_');
      files.push({name:'словари/'+(i+1)+' - '+safe+'.txt',text:txt});
    });
    try{
      const bytes=Zip.build(files);
      const a=document.createElement('a');
      a.href=URL.createObjectURL(new Blob([bytes],{type:'application/zip'}));
      a.download='lexio-backup-'+U.todayISO()+'.zip';
      a.click();
      setTimeout(()=>URL.revokeObjectURL(a.href),4000);
      toast('Архив сохранён');
    }catch(err){console.error(err);toast('Не удалось создать архив');}
  }

  /* ── импорт ZIP / JSON ── */
  function doImport(file){
    const r=new FileReader();
    r.onload=()=>{
      try{
        const u8=new Uint8Array(r.result);
        let json=null,txts=[];
        try{
          Zip.read(u8).forEach(e=>{
            const text=new TextDecoder().decode(e.data);
            if(e.name==='lexio-backup.json')json=JSON.parse(text);
            else if(/\.txt$/i.test(e.name))txts.push({name:e.name,text:text});
          });
        }catch(e){ json=JSON.parse(new TextDecoder().decode(u8)); }
        if(json){
          if(confirm('Найден полный бэкап.\nЗаменить текущие данные?\n(Отмена — добавить только новые колоды)')){
            Store.wipe();
            const s=Store.state;
            s.onboarded=json.onboarded!==false;
            s.theme=json.theme||'light';
            Object.assign(s.settings,json.settings||{});
            Object.assign(s.profile,json.profile||{});
            s.profile.days=s.profile.days||{};
            s.decks=(json.decks||[]).map(d=>({
              id:U.uid(),name:d.name||'Словарь',from:d.from||'en-US',to:d.to||'ru-RU',created:d.created||U.todayISO(),
              words:(d.words||[]).map(w=>({
                id:U.uid(),w:w.w||'',t:w.t||'',ex:w.ex||'',
                ef:w.ef||2.5,int:w.int||0,due:w.due||null,
                ok:w.ok||0,bad:w.bad||0,lapses:w.lapses||0,added:w.added||U.todayISO()
              }))
            }));
            Store.save();applyTheme();
            toast('Данные восстановлены');
          }else{
            let n=0;
            (json.decks||[]).forEach(d=>{
              const nd=Store.createDeck(d.name||'Словарь',d.from,d.to);
              (d.words||[]).forEach(w=>{if(Store.addWord(nd.id,w.w,w.t,w.ex))n++;});
            });
            toast('Добавлено колод: '+(json.decks||[]).length+' · слов: '+n);
          }
        }else if(txts.length){
          let n=0;
          txts.forEach(f=>{
            const name=f.name.replace(/^.*[\\/]/,'').replace(/\.txt$/i,'');
            const nd=Store.createDeck(name);
            n+=Store.bulkAdd(nd.id,f.text,false).added;
          });
          toast('Импортировано слов: '+n);
        }else{toast('В файле нет данных Лексио');return;}
        refreshTop();draw();
      }catch(err){console.error(err);toast('Не удалось прочитать файл');}
    };
    r.readAsArrayBuffer(file);
  }
};