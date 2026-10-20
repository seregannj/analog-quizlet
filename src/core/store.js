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
    try{const raw=localStorage.getItem(KEY); if(raw){const d=JSON.parse(raw); st=Object.assign(defaults(),d);
      st.settings=Object.assign(defaults().settings,d.settings||{});
      st.profile=Object.assign(defaults().profile,d.profile||{});
      st.profile.days=st.profile.days||{};
      return;}}catch(e){}
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
  /* Парсер списка: слово - перевод - пример
     Поддерживает разделители: дефис, тире, таб (Excel), |, =, :, два пробела, /
     Игнорирует нумерацию "1." и маркеры списка. */
  function parseBulk(text){
    const pairs=[],skipped=[];
    String(text).split(/\r?\n/).forEach(raw=>{
      let line=raw.trim();
      if(!line)return;
      line=line.replace(/^\d+[.)]\s+/,'').replace(/^\d+\s+[-–—]\s+/,'').replace(/^[-–—*•·]\s+/,'').trim();
      if(!line||/^[-–—_=*•·~|\s]+$/.test(line))return;
      const seps=[/\s+[-–—]\s+/g,/\t/g,/\s*\|\s*/g,/\s+\/\s+/g,/\s*=\s*/g,/:\s+/g,/\s{2,}/g];
      let marks=[];
      seps.forEach(re=>{let m;re.lastIndex=0;while((m=re.exec(line)))marks.push({s:m.index,e:m.index+m[0].length});});
      marks.sort((a,b)=>a.s-b.s);
      marks=marks.filter((m,i,arr)=>i===0||m.s>=arr[i-1].e);
      if(!marks.length){skipped.push(line);return;}
      const parts=[];let prev=0;
      marks.forEach(m=>{parts.push(line.slice(prev,m.s).trim());prev=m.e;});
      parts.push(line.slice(prev).trim());
      parts[0]=parts[0].replace(/\s+/g,' ');
      if(parts[0]&&parts[1]){
        const ex=parts.slice(2).filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
        pairs.push([parts[0],parts[1].replace(/\t+/g,' ').replace(/\s+/g,' '),ex]);
      }else skipped.push(line);
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
      if(w.due&&w.due<=t)out.push({deck:d,w});
    }));
    out.sort((a,b)=>a.w.due<b.w.due?-1:1);
    return out;
  }
  function newList(){
    const out=[];
    st.decks.forEach(d=>d.words.forEach(w=>{if(w.due==null)out.push({deck:d,w});}));
    return out;
  }
  function grade(deckId,wordId,q){
    const d=deck(deckId),w=d&&d.words.find(x=>x.id===wordId);
    if(!w)return 0;
    const r=SM2.grade(w,q,U.todayISO());save();return r.xp;
  }
  function recordSession(xp,reviews){
    const p=st.profile,t=U.todayISO();
    p.xp+=xp;p.gems+=2;
    const day=p.days[t]||(p.days[t]={reviews:0,xp:0});
    day.reviews+=reviews;day.xp+=xp;
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
    grade,recordSession,todayStats,weekDays,resetProgress,wipe};
})();