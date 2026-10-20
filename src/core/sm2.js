window.SM2 = {
  grade(w,q,todayISO){
    w.ef = Math.min(2.8, Math.max(1.3, w.ef==null?2.5:w.ef));
    if(q<=0){
      w.bad=(w.bad||0)+1; w.ok=0; w.lapses=(w.lapses||0)+1;
      w.int=0; w.due=U.addDaysISO(todayISO,1);
      return {xp:2};
    }
    if(q>=2) w.ok=(w.ok||0)+1;
    if(w.int==null||w.int===0){
      w.int = q===3?3:1;
    }else if(q===1){ w.int=Math.max(1,Math.round(w.int/2)); }
    else if(q===2){ w.int=Math.max(1,Math.ceil(w.int*w.ef)); }
    else { w.int=Math.max(1,Math.ceil(w.int*w.ef*1.3)); }
    w.ef = Math.min(2.8, Math.max(1.3, w.ef + [0,-0.15,0,0.1][q]));
    w.due = U.addDaysISO(todayISO, w.int);
    return {xp: q===3?12: q===2?10:5};
  },
  isDone(w){return (w.ok||0)>=3 && (w.int||0)>=3;}
};