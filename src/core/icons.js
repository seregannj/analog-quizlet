(function(){
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-owl" viewBox="0 0 120 120">
    <path d="M20 68c-8 10-10 24-7 34 5-7 11-11 18-13zM100 68c8 10 10 24 7 34-5-7-11-11-18-13z" fill="#46A302"/>
    <ellipse cx="60" cy="66" rx="40" ry="46" fill="#58CC02"/>
    <ellipse cx="60" cy="42" rx="34" ry="30" fill="#58CC02"/>
    <circle cx="44" cy="44" r="18" fill="#fff"/><circle cx="76" cy="44" r="18" fill="#fff"/>
    <circle cx="44" cy="44" r="7.5" fill="#3C3C3C"/><circle cx="76" cy="44" r="7.5" fill="#3C3C3C"/>
    <circle cx="46.5" cy="41.5" r="2.6" fill="#fff"/><circle cx="78.5" cy="41.5" r="2.6" fill="#fff"/>
    <path d="M54 58l6 9 6-9z" fill="#FFC800"/>
    <path d="M60 70c-8 0-14 6-14 13 0 9 7 16 14 16s14-7 14-16c0-7-6-13-14-13z" fill="#8EE000"/>
    <ellipse cx="48" cy="112" rx="8" ry="4.5" fill="#FFC800"/><ellipse cx="72" cy="112" rx="8" ry="4.5" fill="#FFC800"/>
  </symbol>
  <symbol id="i-home" viewBox="0 0 24 24"><path d="M3.5 11L12 4l8.5 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M6 10.5V20h12v-9.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 20v-5h4v5" fill="currentColor"/></symbol>
  <symbol id="i-books" viewBox="0 0 24 24"><rect x="3.5" y="5" width="4.6" height="15" rx="1.4" stroke="currentColor" stroke-width="2.2" fill="none"/><rect x="9.7" y="4" width="4.6" height="16" rx="1.4" stroke="currentColor" stroke-width="2.2" fill="none"/><path d="M16.6 5.6l3.9 1-3.7 14.2-3.8-1z" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linejoin="round"/></symbol>
  <symbol id="i-bolt" viewBox="0 0 24 24"><path d="M13 2L4.5 13.5H11L9.5 22 19 9.5h-6.5L13 2z" fill="currentColor"/></symbol>
  <symbol id="i-chart" viewBox="0 0 24 24"><path d="M4 20h16" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><rect x="5" y="12" width="3.4" height="6" rx="1.2" fill="currentColor"/><rect x="10.3" y="8" width="3.4" height="10" rx="1.2" fill="currentColor"/><rect x="15.6" y="4" width="3.4" height="14" rx="1.2" fill="currentColor"/></symbol>
  <symbol id="i-sliders" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="9" cy="7" r="2.4" fill="var(--card,#fff)" stroke="currentColor" stroke-width="2.2"/><circle cx="15" cy="12" r="2.4" fill="var(--card,#fff)" stroke="currentColor" stroke-width="2.2"/><circle cx="8" cy="17" r="2.4" fill="var(--card,#fff)" stroke="currentColor" stroke-width="2.2"/></symbol>
  <symbol id="i-fire" viewBox="0 0 24 24"><path d="M12 22c-4.1 0-7.2-2.8-7.2-6.7 0-2.4 1.2-4.2 2.5-5.6C8.6 8.3 9.9 7.2 9.7 5c2.1.8 3.5 2.3 3.8 4.3 1.1-.3 1.9-1.4 2.1-2.7 2.3 1.8 3.6 4.7 3.6 8.7 0 3.9-3.1 6.7-7.2 6.7z" fill="currentColor"/><path d="M12 20c-1.7 0-3-1.2-3-3 0-1.5 1-2.6 1.7-3.6.6.9 1.5 1.3 2.4 1.4.9 1 1.9 2 1.9 3.4 0 1.1-.6 1.8-3 1.8z" fill="#FFDF8F" opacity=".85"/></symbol>
  <symbol id="i-gem" viewBox="0 0 24 24"><path d="M6 3h12l4 6-10 12L2 9l4-6z" fill="currentColor"/><path d="M2 9h20M9.4 3l2.6 6 2.6-6M12 9v11.6" stroke="#fff" stroke-width="1.3" fill="none" opacity=".55"/></symbol>
  <symbol id="i-heart" viewBox="0 0 24 24"><path d="M12 21s-7.5-4.8-9.8-9C.7 8.9 1.6 5.3 4.5 4 6.9 2.9 9.5 3.7 11 5.7c.4.5.7.5 1 0 1.5-2 4.1-2.8 6.5-1.7 2.9 1.3 3.8 4.9 2.3 8-2.3 4.2-9.8 9-9.8 9z" fill="currentColor"/></symbol>
  <symbol id="i-speaker" viewBox="0 0 24 24"><path d="M4 9v6h4l6 4.5v-15L8 9H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"/></symbol>
  <symbol id="i-check" viewBox="0 0 24 24"><path d="M4.5 12.5l5 5L19.5 6.5" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/></symbol>
  <symbol id="i-wrong" viewBox="0 0 24 24"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" fill="none"/></symbol>
  <symbol id="i-close" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none"/></symbol>
  <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none"/></symbol>
  <symbol id="i-trash" viewBox="0 0 24 24"><path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M10 11v5M14 11v5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></symbol>
  <symbol id="i-edit" viewBox="0 0 24 24"><path d="M4 20l.8-4L16.4 4.4a2 2 0 0 1 2.8 0l.4.4a2 2 0 0 1 0 2.8L8 19.2 4 20z" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" fill="none"/><path d="M14.5 6.3l3.2 3.2" stroke="currentColor" stroke-width="2.2"/></symbol>
  <symbol id="i-search" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6" stroke="currentColor" stroke-width="2.4" fill="none"/><path d="M15.5 15.5L20 20" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></symbol>
  <symbol id="i-down" viewBox="0 0 24 24"><path d="M12 4v11M7.5 10.5L12 15l4.5-4.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M4 19h16" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></symbol>
  <symbol id="i-up" viewBox="0 0 24 24"><path d="M12 20V9M7.5 13.5L12 9l4.5 4.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M4 4h16" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></symbol>
  <symbol id="i-right" viewBox="0 0 24 24"><path d="M5 12h13M13 6.5L18.5 12 13 17.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/></symbol>
  <symbol id="i-target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="2.4" fill="none"/><circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="2.4" fill="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/></symbol>
  <symbol id="i-info" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.4" fill="none"/><path d="M12 11v6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="12" cy="7.6" r="1.5" fill="currentColor"/></symbol>
  <symbol id="i-skip" viewBox="0 0 24 24"><path d="M5 5l9 7-9 7V5z" fill="currentColor"/><rect x="16" y="5" width="3" height="14" rx="1.2" fill="currentColor"/></symbol>
  <symbol id="i-refresh" viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.5-5.8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"/><path d="M20 3v4.5h-4.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/></symbol>
  <symbol id="i-star" viewBox="0 0 24 24"><path d="M12 3l2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 16.9 6.4 20l1.3-6.2L3 9.5l6.3-.7L12 3z" fill="currentColor"/></symbol>
  <symbol id="i-book" viewBox="0 0 24 24"><path d="M5 4.5C7.5 3 10 3 12 4.5c2-1.5 4.5-1.5 7 0v14c-2.5-1.5-5-1.5-7 0-2-1.5-4.5-1.5-7 0v-14z" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round" fill="none"/><path d="M12 4.5v14" stroke="currentColor" stroke-width="2.3"/></symbol>
  </svg>`;
  document.body.insertAdjacentHTML('afterbegin', svg);
})();
function icon(name,size){return '<svg width="'+(size||20)+'" height="'+(size||20)+'"><use href="#i-'+name+'"/></svg>';}