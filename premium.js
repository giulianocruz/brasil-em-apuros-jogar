'use strict';
(() => {
  const groups = {
    '13': [
      {src:'./media/game13_lula.png',alt:'Lula atravessando uma fase de Brasília na edição 13',caption:'CAPÍTULO 1 — BRASÍLIA'},
      {src:'./media/game13_alckmin.png',alt:'Alckmin no cenário de plataforma da edição 13',caption:'ALCKMIN — EM AÇÃO'},
      {src:'./media/game13_boss.png',alt:'Encontro com o chefe em Brasil em Apuros 13',caption:'ENFRENTE O GUARDIÃO'},
      {src:'./media/game13_resgate.png',alt:'Portão aberto na área de resgate da edição 13',caption:'A MISSÃO DE RESGATE'}
    ],
    '22': [
      {src:'./media/game22_flavio.png',alt:'Flávio atravessando o cenário de Brasília na edição 22',caption:'CAPÍTULO 1 — BRASÍLIA'},
      {src:'./media/game22_eduardo.png',alt:'Eduardo durante uma fase da edição 22',caption:'EDUARDO — EM AÇÃO'},
      {src:'./media/game22_castelo.png',alt:'Castelo e prisão na edição 22',caption:'O CASTELO DA CONFUSÃO'},
      {src:'./media/game22_resgate.png',alt:'Área de resgate no castelo da edição 22',caption:'OS TRÊS SELOS E O RESGATE'}
    ]
  };
  let edition = '13';
  const indexes = {'13':0,'22':0};
  const tabs = [...document.querySelectorAll('[role="tab"][data-target]')];
  const dialog = document.getElementById('lightbox');
  const dialogImage = document.getElementById('lightbox-image');
  const dialogCaption = document.getElementById('lightbox-caption');

  function chooseImage(version, index) {
    const photos=groups[version];
    if(!photos) return;
    const target=((index%photos.length)+photos.length)%photos.length;
    indexes[version]=target;
    const info=photos[target];
    const img=document.getElementById('main'+version);
    if(img){img.src=info.src;img.alt=info.alt;}
    const cap=document.getElementById('caption'+version);
    const desc=document.getElementById('description'+version);
    if(cap)cap.textContent=String(target+1).padStart(2,'0')+' / '+String(photos.length).padStart(2,'0');
    if(desc)desc.textContent=info.caption;
    document.querySelectorAll('[data-gallery="'+version+'"] button').forEach((button,n)=>{
      button.classList.toggle('active',n===target);
      button.setAttribute('aria-pressed',String(n===target));
    });
  }

  function chooseEdition(version, focus=false) {
    if(!groups[version])return;
    edition=version;
    tabs.forEach(tab=>{
      const active=tab.dataset.target===version;
      tab.setAttribute('aria-selected',String(active));
      tab.tabIndex=active?0:-1;
      if(active&&focus)tab.focus();
    });
    Object.keys(groups).forEach(key=>{
      const pane=document.getElementById('gallery'+key);
      if(pane)pane.hidden=key!==version;
    });
  }

  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>chooseEdition(tab.dataset.target));
    tab.addEventListener('keydown',e=>{
      if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;
      e.preventDefault();
      const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
      chooseEdition(tabs[next].dataset.target,true);
    });
  });

  document.querySelectorAll('[data-gallery] button[data-index]').forEach(b=>{
    b.addEventListener('click',()=>chooseImage(b.closest('[data-gallery]').dataset.gallery,Number(b.dataset.index)));
  });
  document.querySelectorAll('.gallery-arrow').forEach(b=>{
    b.addEventListener('click',()=>chooseImage(edition,indexes[edition]+Number(b.dataset.dir)));
  });
  document.querySelectorAll('[data-open-gallery]').forEach(b=>{
    b.addEventListener('click',()=>{
      const version=b.dataset.openGallery;
      const selected=groups[version][indexes[version]];
      if(!selected||typeof dialog?.showModal!=='function')return;
      dialogImage.src=selected.src;
      dialogImage.alt=selected.alt;
      dialogCaption.textContent=selected.caption;
      dialog.showModal();
    });
  });
  document.querySelector('.lightbox-close')?.addEventListener('click',()=>dialog?.close());
  dialog?.addEventListener('click',event=>{
    if(event.target===dialog)dialog.close();
  });

  const header=document.querySelector('.site-header');
  const checkScroll=()=>header?.classList.toggle('is-scrolled',window.scrollY>60);
  window.addEventListener('scroll',checkScroll,{passive:true});
  checkScroll();

  if('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    const observer = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },{threshold:.08,rootMargin:'0px 0px -18px 0px'});
    document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
    document.documentElement.classList.add('has-motion');
  }
})();
