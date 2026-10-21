window.Store = (function(){
  const KEY='lexio_v1';
  let st=null;
  function defaults(){return{
    onboarded:false, theme:'light',
    settings:{dailyGoal:10, lessonSize:10, sound:true},
    profile:{xp:0,gems:0,streak:0,lastDay:null,days:{}},
    decks:[]
  };}
  function load(){
    try{
      const raw=localStorage.getItem(KEY);
      if(raw){const d=JSON.parse(raw); st=Object.assign(defaults(),d);
        st.settings=Object.assign(defaults().settings,d.settings||{});
        st.profile=Object.assign(defaults().profile,d.profile||{});
        st.profile.days=st.profile.days||{};
        return;}
    }catch(e){
      /* Битые данные больше не стираем молча: сохраняем копию в резервный ключ,
         чтобы при желании можно было вытащить слова вручную. */
      try{const raw=localStorage.getItem(KEY);if(raw)localStorage.setItem(KEY+'_corrupt',raw);}catch(_){}
      console.warn('Не удалось прочитать сохранённые данные — создан новый профиль. Копия старых: ключ '+KEY+'_corrupt',e);
    }
    st=defaults();
  }
  function save(){try{localStorage.setItem(KEY,JSON.stringify(st));}catch(e){console.warn('save fail',e);}}
  function createDeck(name,from,to){
    const d={id:U.uid(),name:name.trim(),from:from||'en-US',to:to||'ru-RU',words:[],created:U.todayISO()};
    st.decks.push(d);save();return d;
  }
  function deck(id){return st.decks.find(d=>d.id===id);}
  function deleteDeck(id){st.decks=st.decks.filter(d=>d.id!==id);save();}
  function renameDeck(id,name){const d=deck(id);if(d){d.name=name.trim();save();}}
  function newWord(w,t,ex){return{id:U.uid(),w:w.trim(),t:t.trim(),ex:(ex||'').trim(),ef:2.5,int:0,due:null,ok:0,bad:0,lapses:0,added:U.todayISO()};}
  function addWord(deckId,w,t,ex){
    const d=deck(deckId); if(!d)return false;
    if(d.words.some(x=>x.w.toLowerCase()===w.trim().toLowerCase()))return false;
    d.words.push(newWord(w,t,ex));save();return true;
  }
  function updateWord(deckId,id,patch){const d=deck(deckId);const w=d&&d.words.find(x=>x.id===id);if(w){Object.assign(w,patch);save();}}
  function deleteWord(deckId,id){const d=deck(deckId);if(d){d.words=d.words.filter(x=>x.id!==id);save();}}
  /* Парсер списка: слово - перевод - пример.
     Стратегия: находим САМЫЙ РАННИЙ разделитель в строке — он определяет формат,
     и дальше строка режется ТОЛЬКО им. Благодаря этому «12:30» внутри перевода
     или «mother-in-law» внутри слова не ломают разбор.
     Поддерживаемые разделители: дефис/тире (пробелы вокруг НЕ обязательны),
     таб (Excel), |, =, двоеточие, два пробела.
     Нумерация "1." и маркеры списка игнорируются. */
  function parseBulk(text){
    const SEPS=[
      {re:/\s+[-–—]\s+/g,join:' - '},
      {re:/\t/g,       join:' '},
      {re:/\s*\|\s*/g, join:' | '},
      {re:/\s+\/\s+/g, join:' / '},
      {re:/\s*=\s*/g,  join:' = '},
      {re:/:\s+/g,     join:': '},
      {re:/\s{2,}/g,   join:' '}
    ];
    const pairs=[],skipped=[];
    String(text).split(/\r?\n/).forEach(raw=>{
      let line=raw.trim();
      if(!line)return;
      line=line.replace(/^\d+[.)]\s+/,'').replace(/^\d+\s+[-–—]\s+/,'').replace(/^[-–—*•·]\s+/,'').trim();
      if(!line||/^[-–—_=*•·~|\s]+$/.test(line))return;
      let best=null;
      for(const s of SEPS){
        s.re.lastIndex=0;
        const m=s.re.exec(line);
        if(m&&(!best||m.index<best.index))best={s:s,index:m.index};
      }
      if(!best){
        /* Мягкий фолбэк: дефис/тире БЕЗ пробелов («apple-яблоко»),
           «house-дом-The house is big». Срабатывает только если строгий
           разделитель не нашёлся вообще, поэтому «mother-in-law - свекровь»
           по-прежнему разбирается строго и не рвётся по внутренним дефисам. */
        const loose=line.split(/[-–—]/).map(x=>x.trim());
        if(loose.length>=2&&loose[0]&&loose[1]){
          pairs.push([loose[0].replace(/\s+/g,' '),loose[1].replace(/\s+/g,' '),loose.slice(2).join(' - ').replace(/\s+/g,' ')]);
        }else skipped.push(line);
        return;
      }
      best.s.re.lastIndex=0;
      const parts=line.split(best.s.re).map(x=>x.trim()).filter(x=>x!=='');
      if(parts.length<2){skipped.push(line);return;}
      const word=parts[0].replace(/\s+/g,' ');
      const trans=parts[1].replace(/\s+/g,' ');
      const ex=parts.slice(2).join(best.s.join).replace(/\s+/g,' ').trim();
      if(word&&trans)pairs.push([word,trans,ex]);
      else skipped.push(line);
    });
    return{pairs,skipped};
  }
  function bulkAdd(deckId,text,swap){
    const d=deck(deckId); if(!d)return{added:0,updated:0,skipped:0};
    const {pairs,skipped}=parseBulk(text);
    let added=0,updated=0;
    pairs.forEach(p=>{
      let w=p[0],t=p[1],ex=p[2]||'';
      if(swap){const tmp=w;w=t;t=tmp;}
      const exi=d.words.findIndex(x=>x.w.toLowerCase()===w.toLowerCase());
      if(exi>=0){d.words[exi].t=t;if(ex)d.words[exi].ex=ex;updated++;}
      else{d.words.push(newWord(w,t,ex));added++;}
    });
    save();return{added,updated,skipped:skipped.length};
  }
  function deckStats(d){
    const total=d.words.length;
    let done=0,learn=0;
    d.words.forEach(w=>{if(SM2.isDone(w))done++;else if(w.ok||w.bad)learn++;});
    return{total,done,learning:learn,fresh:total-done-learn};
  }
  function dueList(){
    const t=U.todayISO(),out=[];
    st.decks.forEach(d=>d.words.forEach(w=>{
      if(w.due&&w.due<=t)out.push({deck:d,w:w});
    }));
    out.sort((a,b)=>a.w.due<b.w.due?-1:1);
    return out;
  }
  function newList(){
    const out=[];
    st.decks.forEach(d=>d.words.forEach(w=>{if(w.due==null)out.push({deck:d,w:w});}));
    return out;
  }
  function grade(deckId,wordId,q){
    const d=deck(deckId),w=d&&d.words.find(x=>x.id===wordId);
    if(!w)return 0;
    const r=SM2.grade(w,q,U.todayISO());save();return r.xp;
  }
  /* Прогресс пишется после КАЖДОГО ответа, а не в конце сессии:
     если пользователь уйдёт с урока через меню навигации,
     XP, серия и статистика дня не потеряются. */
  function recordAnswer(xp){
    const p=st.profile,t=U.todayISO();
    p.xp+=xp;p.gems+=1;
    const day=p.days[t]||(p.days[t]={reviews:0,xp:0});
    day.reviews+=1;day.xp+=xp;
    if(p.lastDay!==t){
      p.streak=(p.lastDay&&U.diffDays(p.lastDay,t)===1)?p.streak+1:1;
      p.lastDay=t;
    }
    save();
  }
  function todayStats(){
    const d=st.profile.days[U.todayISO()];
    return{reviews:d?d.reviews:0,xp:d?d.xp:0};
  }
  function weekDays(){
    const out=[],now=new Date();
    for(let i=6;i>=0;i--){
      const d=new Date(now);d.setDate(d.getDate()-i);
      const iso=U.todayISO(d);
      out.push({iso,name:['вс','пн','вт','ср','чт','пт','сб'][d.getDay()],day:d.getDate(),n:st.profile.days[iso]?st.profile.days[iso].reviews:0,today:i===0});
    }
    return out;
  }
  function resetProgress(){
    st.profile=defaults().profile;
    st.decks.forEach(d=>d.words.forEach(w=>{w.ok=0;w.bad=0;w.lapses=0;w.ef=2.5;w.int=0;w.due=null;}));
    save();
  }
  function wipe(){st=defaults();save();}
  load();
  return{get state(){return st;},save,createDeck,deck,deleteDeck,renameDeck,
    addWord,updateWord,deleteWord,parseBulk,bulkAdd,deckStats,dueList,newList,
    grade,recordAnswer,todayStats,weekDays,resetProgress,wipe};
})();
