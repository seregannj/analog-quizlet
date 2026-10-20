window.U = {
  esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));},
  uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8);},
  todayISO(d){d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');},
  addDaysISO(iso,n){const d=new Date(iso+'T12:00:00');d.setDate(d.getDate()+n);return U.todayISO(d);},
  diffDays(a,b){return Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/864e5);},
  fmtDate(iso){return new Date(iso+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'short'});},
  shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;},
  speak(text,lang){
    if(!Store.state.settings.sound)return;
    try{
      const u=new SpeechSynthesisUtterance(text);
      u.lang=lang||'en-US';u.rate=.9;
      speechSynthesis.cancel();speechSynthesis.speak(u);
    }catch(e){}
  },
  greeting(){const h=new Date().getHours();return h<6?'Доброй ночи':h<12?'Доброе утро':h<18?'Добрый день':'Добрый вечер';},
  decl(n,one,few,many){const m10=n%10,m100=n%100;if(m10===1&&m100!==11)return one;if(m10>=2&&m10<=4&&(m100<10||m100>=20))return few;return many;}
};