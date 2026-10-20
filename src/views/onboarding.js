VIEWS.onboarding=function(){
  const app=document.getElementById('app');
  const slides=[
    {title:'Привет! Я Лекси.',html:`
      <div class="onb-body">
        <svg class="onb-illo mascot-bounce"><use href="#i-tiger"/></svg>
        <div class="onb-title">Привет! Я Лекси.</div>
        <div class="onb-text">Я тигр-наставник, и я помогу выучить ваши слова так, чтобы они не выветрились из головы через неделю. Будем возвращаться к каждому слову ровно тогда, когда вы вот-вот его забудете.</div>
      </div>`,btn:'Дальше'},
    {title:'Как это работает',html:`
      <div class="onb-body">
        <span class="chip">${icon('refresh',14)} интервальные повторения</span>
        <div class="onb-title" style="font-size:24px">Слова возвращаются вовремя</div>
        <div class="onb-text">Каждое слово показывается всё реже — но ровно перед тем, как память его теряет. Так знание переходит в долгую память.</div>
        <div class="int-steps">
          <div class="int-step"><b>1 день</b> первое повторение</div>
          <div class="int-step"><b>3 дня</b> слова закрепляются</div>
          <div class="int-step"><b>7 дней</b> переходим в долгую память</div>
          <div class="int-step"><b>3 недели</b> слово — ваше навсегда</div>
        </div>
      </div>`,btn:'Дальше'},
    {title:'Свои слова',html:`
      <div class="onb-body">
        <span class="chip">${icon('books',14)} ваши словари</span>
        <div class="onb-title" style="font-size:24px">Добавляйте списком</div>
        <div class="onb-text">Вставьте свои слова удобным для вас способом — по одному на строку:</div>
        <div class="mono" style="width:100%;max-width:340px;text-align:left">apple - яблоко - I eat an apple
house - дом
beautiful - красивый</div>
        <div class="onb-text" style="font-size:13.5px">Слово, дефис, перевод. Пример предложения — по желанию, третьим полем. Подойдёт и таб из Excel, и «|», и нумерация «1.»</div>
      </div>`,btn:'Дальше'},
    {title:'Главное правило',html:`
      <div class="onb-body">
        <span class="chip">${icon('fire',14)} ежедневность</span>
        <div class="onb-title" style="font-size:24px">Немного, но каждый день</div>
        <div class="onb-text">Пять минут каждый день лучше, чем час по воскресеньям. Держите серию — и словарь будет расти сам.</div>
        <div class="row wrap center" style="justify-content:center">
          <span class="pill pill-green">${icon('check',16)} короткие уроки</span>
          <span class="pill pill-blue">${icon('target',16)} цель на день</span>
          <span class="pill pill-gold">${icon('bolt',16)} опыт и серия</span>
        </div>
      </div>`,btn:'Начать учиться'}
  ];
  let i=0;
  function draw(){
    const s=slides[i];
    app.innerHTML=`
    <div class="onb">
      ${i<slides.length-1?'<button class="onb-skip" id="skip">Пропустить</button>':'<span></span>'}
      ${s.html}
      <div class="onb-nav">
        ${i>0?'<button class="btn btn-ghost btn-sm" id="back">Назад</button>':''}
        <div class="dots-nav">${slides.map((_,k)=>'<i class="'+(k===i?'on':'')+'"></i>').join('')}</div>
        <button class="btn btn-green" id="next" style="min-width:150px">${s.btn}</button>
      </div>
    </div>`;
    const q=id=>document.getElementById(id);
    if(q('skip'))q('skip').onclick=done;
    if(q('back'))q('back').onclick=()=>{i--;draw();};
    q('next').onclick=()=>{ if(i<slides.length-1){i++;draw();} else done(); };
  }
  function done(){Store.state.onboarded=true;Store.save();Router.go('#/home');}
  draw();
};