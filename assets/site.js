/*
  공용 동작 — 페이지마다 window.SITE 로 모드를 지정합니다.
    { mode: "tabs" }                         → index.html: 자기소개 + CX/UX 탭
    { mode: "list", projects: ["grap", …] }  → apply.html: 탭 없이 지정한 프로젝트만 순서대로
*/
(function(){
  var DATA=window.PORTFOLIO,SITE=window.SITE||{mode:'tabs'},DIR='slides/',W=1920,H=1080;
  var pad=function(n){return (n<10?'0':'')+n};
  var esc=function(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
  var $=function(id){return document.getElementById(id)};
  var SPARK='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9zM19 14l.9 2.6 2.6.9-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9z"/></svg>';
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 메인 타이핑 모션: 단어를 차례로 타이핑 → 삭제, 마지막 단어는 남김 ---------- */
  (function(){
    var el=$('typed');if(!el)return;
    var words=['UX','Context','Portfolio','Jang Yuna'],LOOP=false;
    var box=el.parentNode;
    if(reduced){el.textContent=words[words.length-1];return}
    var w=0,c=0,del=false;
    function tick(){
      var word=words[w];
      box.classList.add('typing');
      if(!del){
        el.textContent=word.slice(0,++c);
        if(c<word.length)return setTimeout(tick,95);
        box.classList.remove('typing');
        if(w===words.length-1&&!LOOP)return;
        del=true;return setTimeout(tick,1000);
      }
      el.textContent=word.slice(0,--c);
      if(c>0)return setTimeout(tick,45);
      del=false;w=(w+1)%words.length;
      box.classList.remove('typing');
      setTimeout(tick,280);
    }
    setTimeout(tick,400);
  })();

  /* ---------- YouTube 영상 슬라이드: slides 에 ["yt:영상ID", 캡션] 으로 넣으면 누를 때 재생 ---------- */
  function ytId(slide){return typeof slide[0]==='string'&&slide[0].indexOf('yt:')===0?slide[0].slice(3):null}
  function ytThumb(id,big){return 'https://i.ytimg.com/vi/'+id+'/'+(big?'maxresdefault':'mqdefault')+'.jpg'}
  var PLAY='<svg viewBox="0 0 68 48" aria-hidden="true"><rect width="68" height="48" rx="14" fill="rgba(4,8,30,.72)"/><path d="M27 15l18 9-18 9z" fill="#fff"/></svg>';
  // box 를 재생 대기(▶) 상태로 — 누르면 youtube-nocookie 플레이어를 불러와 자동 재생
  function ytArm(box,id,title){
    box.hidden=false;box.classList.remove('playing');
    box.innerHTML='<button type="button" class="ytplay" aria-label="영상 재생: '+esc(title)+'">'+PLAY+'<span>눌러서 영상 재생</span></button>';
    box.querySelector('button').addEventListener('click',function(e){
      e.stopPropagation();box.classList.add('playing');
      box.innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id)+'?autoplay=1&rel=0&playsinline=1" title="'+esc(title)+'" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    });
  }
  function ytClear(box){if(box){box.innerHTML='';box.hidden=true;box.classList.remove('playing')}}

  /* ---------- 사진 슬라이드: ["img:경로(확장자 제외)", 캡션] → 경로.webp / 경로-s.webp / 경로-t.webp ---------- */
  function inl(p){return window.INLINE_IMG&&INLINE_IMG[p]||p}
  function imgRef(slide){return typeof slide[0]==='string'&&slide[0].indexOf('img:')===0?slide[0].slice(4):null}
  function thumbsHTML(list){
    return list.map(function(s,k){
      var y=ytId(s),r=imgRef(s),t=y?ytThumb(y):r?inl(r+'-t.webp'):DIR+pad(s[0])+'-t.webp';
      return '<button type="button" class="th'+(y?' yt':'')+'" data-i="'+k+'" aria-label="'+(k+1)+'번'+(y?' (영상)':'')+'"><img src="'+t+'" alt="" width="320" height="180" loading="lazy"></button>';
    }).join('');
  }

  /* ---------- render ---------- */
  function byTrack(t){return DATA.projects.filter(function(p){return p.track===t})}
  function byIds(ids){return ids.map(function(id){return DATA.projects.filter(function(p){return p.id===id})[0]}).filter(Boolean)}

  function metaValue(m){
    var v=m.v;
    if(v&&v.bars)return '<dd class="bars">'+v.bars.map(function(b){return '<span>'+esc(b[0])+'<i style="--v:'+b[1]+'%"></i><em>'+b[1]+'%</em></span>'}).join('')+'</dd>';
    if(Array.isArray(v))return '<dd><ul>'+v.map(function(x){return '<li'+(m.award?' class="award"':'')+'>'+esc(x)+'</li>'}).join('')+'</ul></dd>';
    return '<dd>'+esc(v)+'</dd>';
  }

  function indexHTML(list,href){
    return list.map(function(p,i){return '<a class="glass" href="'+href(p)+'" style="--c:'+p.color+'"><span class="tabrow"><span class="pill">P'+(i+1)+'</span><span class="tablabel">'+esc(p.period)+'</span></span><span class="t">'+esc(p.title)+'<i></i></span><small>'+esc(p.sub)+'</small></a>'}).join('');
  }

  function projectHTML(p,i){
    var no='P'+(i+1);
    var meta=p.meta.map(function(m,k){return '<div'+(m.ai?' data-ai="meta:'+k+'" tabindex="0"':'')+'><dt>'+esc(m.k)+'</dt>'+metaValue(m)+'</div>'}).join('');
    var thumbs=thumbsHTML(p.slides);
    var f0=p.slides[0],first=function(size){var r=imgRef(f0);return r?inl(r+size+'.webp'):DIR+pad(f0[0])+size+'.webp'};
    return '<article class="project wrap" id="'+p.id+'" style="--c:'+p.color+'">'+
      '<div class="phead"><div class="glass panel"><div class="tabrow"><span class="pill">'+no+'</span><span class="tablabel">'+esc(p.label)+'</span></div>'+
        '<h2>'+esc(p.title)+'</h2><p class="sub'+(p.subNowrap?' fit':'')+'">'+esc(p.sub)+'</p><p class="sum">'+esc(p.sum)+'</p></div>'+
        '<dl class="glass panel meta">'+meta+'</dl></div>'+
      '<div class="viewer glass">'+
        '<div class="aibar" hidden></div>'+
        '<div class="tabrow">'+(p.dc
          ?'<span class="settabs" role="tablist" aria-label="보기 전환"><button type="button" role="tab" data-set="slides" aria-selected="true">Slides</button><button type="button" role="tab" data-set="dc" aria-selected="false">DC</button></span>'
          :'<span class="pill">S</span><span class="tablabel">Slides</span>')+
          '<span class="count"><b class="cur">01</b> / <span class="tot">'+pad(p.slides.length)+'</span></span></div>'+
        '<div class="stage"><button type="button" class="frame" aria-label="다음 슬라이드로 넘기기"><img class="main" src="'+first('-s')+'" srcset="'+first('-s')+' 1200w, '+first('')+' 2400w" sizes="(min-width: 1180px) 1080px, 100vw" width="2400" height="1350" alt="'+esc(p.slides[0][1])+'"></button>'+
          (p.ai?'<div class="ailayer" hidden><svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" aria-hidden="true"><defs><mask id="m-'+p.id+'"><rect width="'+W+'" height="'+H+'" fill="#fff"/><g class="holes"></g></mask></defs><rect class="dim" width="'+W+'" height="'+H+'" fill="#000" fill-opacity=".7" mask="url(#m-'+p.id+')"/></svg><div class="spots"></div></div>':'')+
          (p.slides.some(ytId)?'<div class="ytbox" hidden></div>':'')+
          (SITE.aiPerPage?'<span class="aihint" hidden>현재 페이지에 AI를 활용한 부분이 있어요.</span>':'')+
        '</div>'+
        '<div class="ctrl"><button type="button" class="prev" aria-label="이전 슬라이드">←</button><p class="cap">'+esc(p.slides[0][1])+'</p>'+
          '<button type="button" class="aibtn'+(p.ai?'':' soon')+'" aria-pressed="false">'+SPARK+'<span>AI 활용 과정 보기</span></button>'+
          '<button type="button" class="full">크게 보기</button><button type="button" class="next" aria-label="다음 슬라이드">→</button></div>'+
        '<div class="thumbs" role="group" aria-label="슬라이드 목록">'+thumbs+'</div>'+
      '</div></article>';
  }

  /* ---------- 소개 문구 한 줄 맞춤 (subNowrap) ---------- */
  var FIT_MIN=14;
  function fitAll(){
    [].forEach.call(document.querySelectorAll('.sub.fit'),function(el){
      if(!el.clientWidth)return;
      el.classList.remove('wrapok');el.style.fontSize='';
      var fs=parseFloat(getComputedStyle(el).fontSize);
      while(el.scrollWidth>el.clientWidth&&fs>FIT_MIN){fs-=.5;el.style.fontSize=fs+'px'}
      if(el.scrollWidth>el.clientWidth)el.classList.add('wrapok'); // 아주 좁은 화면은 줄바꿈 허용
    });
  }
  var fitT;window.addEventListener('resize',function(){clearTimeout(fitT);fitT=setTimeout(fitAll,120)});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitAll);

  /* ---------- AI popup ---------- */
  var tip=$('aitip'),tipOwner=null,narrow=window.matchMedia('(max-width:640px)'),hoverable=window.matchMedia('(hover:hover)');
  function tipHTML(d){
    var h='<button type="button" class="x" aria-label="닫기">✕</button>';
    if(d.kicker)h+='<span class="k">'+esc(d.kicker)+'</span>';
    h+='<h4>'+esc(d.title)+'</h4>';
    if(d.body)h+='<p>'+esc(d.body)+'</p>';
    if(d.list)h+='<ul>'+d.list.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul>';
    if(d.img)h+='<img src="'+esc(inl(d.img))+'" alt="'+esc(d.imgAlt||'')+'">';
    if(d.note)h+='<p class="note">'+esc(d.note)+'</p>';
    if(d.tools)h+='<div class="tools">'+d.tools.map(function(x){return '<span>'+esc(x)+'</span>'}).join('')+'</div>';
    return h;
  }
  function place(x,y){
    if(narrow.matches)return;
    var r=tip.getBoundingClientRect(),vw=innerWidth,vh=innerHeight,g=18;
    var left=x+g,top=y+g;
    if(left+r.width>vw-12)left=Math.max(12,x-g-r.width);
    if(top+r.height>vh-12)top=Math.max(12,y-g-r.height);
    tip.style.left=left+'px';tip.style.top=top+'px';
  }
  function showTip(el,d,x,y){
    if(!el.closest('.ai-on'))return;
    if(tipOwner)tipOwner.classList.remove('on');
    tipOwner=el;el.classList.add('on');
    tip.innerHTML=tipHTML(d);tip.hidden=false;
    if(x==null){var r=el.getBoundingClientRect();x=r.left+Math.min(r.width,120);y=r.top+Math.min(r.height,60)}
    place(x,y);
    var im=tip.querySelector('img');if(im&&!im.complete)im.onload=function(){place(x,y)};
  }
  function hideTip(el){if(el&&el!==tipOwner)return;if(tipOwner)tipOwner.classList.remove('on');tipOwner=null;tip.hidden=true}
  tip.addEventListener('click',function(e){if(e.target.closest('.x'))hideTip()});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!tip.hidden)hideTip()});
  document.addEventListener('pointerdown',function(e){if(tipOwner&&!tipOwner.contains(e.target)&&!tip.contains(e.target))hideTip()});
  window.addEventListener('scroll',function(){if(!narrow.matches)hideTip()},{passive:true});

  function bindTip(el,d){
    el.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse')showTip(el,d,e.clientX,e.clientY)});
    // 스크롤로 영역이 커서 아래로 들어오면 pointerenter가 오지 않으므로 move에서도 열기
    el.addEventListener('pointermove',function(e){if(e.pointerType!=='mouse')return;if(tipOwner===el)place(e.clientX,e.clientY);else showTip(el,d,e.clientX,e.clientY)});
    el.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse')hideTip(el)});
    // 터치: 같은 영역을 다시 탭하면 닫힘 (pointerdown 시점에 열려 있었는지로 판단 — focus가 click보다 먼저 열기 때문)
    el.addEventListener('pointerdown',function(e){el._wasOpen=e.pointerType!=='mouse'&&tipOwner===el});
    el.addEventListener('focus',function(){showTip(el,d)});
    el.addEventListener('blur',function(){hideTip(el)});
    el.addEventListener('click',function(e){e.stopPropagation();if(el._wasOpen){el._wasOpen=false;hideTip()}else showTip(el,d,e.clientX||null,e.clientY||null)});
  }

  // 하이라이트 그리기 — 슬라이드 뷰어와 크게 보기가 함께 사용
  function paint(layer,list){
    var holes=layer.querySelector('.holes'),box=layer.querySelector('.spots');
    hideTip();
    holes.innerHTML=list.map(function(r){return '<rect x="'+r.x+'" y="'+r.y+'" width="'+r.w+'" height="'+r.h+'" rx="12" fill="#000"/>'}).join('');
    box.innerHTML='';
    list.forEach(function(r,k){
      var b=document.createElement('button');b.type='button';b.className='spot'+(r.y<40?' in':'');b.dataset.n='AI '+(k+1);
      b.style.cssText='left:'+(r.x/W*100)+'%;top:'+(r.y/H*100)+'%;width:'+(r.w/W*100)+'%;height:'+(r.h/H*100)+'%';
      b.setAttribute('aria-label','AI 활용 '+(k+1)+': '+r.title);
      bindTip(b,r);box.appendChild(b);
    });
  }

  /* ---------- viewer ---------- */
  var lb=$('lb'),lbimg=$('lbimg'),lbcap=$('lbcap'),lbcount=$('lbcount'),lbstage=$('lbstage');
  var active=null,lastFocus=null;

  function Viewer(art,p){
    var s=p.slides,i=0,self=this,el=art.querySelector('.viewer'),aiOn=false;
    var frame=el.querySelector('.frame'),img=frame.querySelector('img'),cur=el.querySelector('.cur'),cap=el.querySelector('.cap'),ths=[].slice.call(el.querySelectorAll('.th')),strip=el.querySelector('.thumbs');
    var layer=el.querySelector('.ailayer'),bar=el.querySelector('.aibar'),btn=el.querySelector('.aibtn');
    var spots=(p.ai&&p.ai.spots)||{};
    var aiSlides=s.map(function(x,k){return spots[x[0]]?k:-1}).filter(function(k){return k>=0});
    var total=aiSlides.reduce(function(n,k){return n+spots[s[k][0]].length},0);
    function bindThumbs(){
      ths=[].slice.call(strip.querySelectorAll('.th'));
      ths.forEach(function(t,j){
        if(spots[s[j][0]])t.classList.add('has-ai');
        t.setAttribute('aria-current',j===i?'true':'false');
        t.addEventListener('click',function(){self.go(j)});
      });
    }
    // Slides / DC 전환 (p.dc 가 있을 때)
    var sets={slides:p.slides,dc:p.dc},tot=el.querySelector('.tot');
    [].forEach.call(el.querySelectorAll('.settabs [data-set]'),function(b){
      b.addEventListener('click',function(){
        if(s===sets[b.dataset.set])return;
        s=sets[b.dataset.set];self.len=s.length;i=0;
        tot.textContent=pad(s.length);
        strip.innerHTML=thumbsHTML(s);bindThumbs();
        el.classList.toggle('set-dc',b.dataset.set==='dc');
        [].forEach.call(el.querySelectorAll('.settabs [data-set]'),function(o){o.setAttribute('aria-selected',o===b)});
        self.go(0);
      });
    });

    var ytbox=el.querySelector('.ytbox');
    function src(k,size){var y=ytId(s[k]),r=imgRef(s[k]);return y?ytThumb(y,true):r?inl(r+(size||'')+'.webp'):DIR+pad(s[k][0])+(size||'')+'.webp'}
    function preload(k){var q=new Image();q.src=src((k+s.length)%s.length,'-s')}
    function drawAI(){
      if(!layer)return;
      var list=spots[s[i][0]]||[],box=layer.querySelector('.spots');
      paint(layer,list);
      if(!list.length){
        var n=aiSlides.filter(function(k){return k>i})[0];if(n==null)n=aiSlides[0];
        var m=document.createElement('div');m.className='nospot';
        m.innerHTML='<span>이 페이지에는 AI 활용 내역이 없어요.</span><button type="button">AI 활용 페이지로 이동 →</button>';
        m.querySelector('button').onclick=function(){self.go(n)};
        box.appendChild(m);
      }
      var pos=aiSlides.indexOf(i);
      bar.innerHTML='<b>AI 활용 과정</b><span>하이라이트된 영역에 '+(hoverable.matches?'마우스를 올리면':'탭하면')+' AI를 어떻게 활용했는지 볼 수 있어요 · AI 활용 '+total+'곳 / '+aiSlides.length+'페이지'+(pos>=0?' (현재 '+(pos+1)+'번째)':'')+'</span>';
    }
    this.len=s.length;
    this.get=function(k){return [src(k),s[k][1]]};
    this.spotsAt=function(k){return spots[s[k][0]]||null};
    this.ytAt=function(k){return ytId(s[k])};
    this.stopVideo=function(){var y=ytId(s[i]);if(y)ytArm(ytbox,y,s[i][1])};
    this.isAI=function(){return aiOn};
    this.idx=function(){return i};
    this.go=function(k,fromLb){
      i=(k+s.length)%s.length;
      frame.classList.add('fade');
      var y=ytId(s[i]);
      var n=new Image();n.onload=n.onerror=function(){if(y)img.removeAttribute('srcset');else img.srcset=src(i,'-s')+' 1200w, '+src(i)+' 2400w';img.src=src(i,'-s');img.alt=s[i][1];frame.classList.remove('fade')};
      n.src=src(i,'-s');
      if(y)ytArm(ytbox,y,s[i][1]);else ytClear(ytbox);   // 다른 장으로 넘기면 재생 중지
      cur.textContent=pad(i+1);cap.textContent=s[i][1];
      ths.forEach(function(t,j){t.setAttribute('aria-current',j===i?'true':'false')});
      var t=ths[i];if(t&&strip){strip.scrollTo({left:t.offsetLeft-strip.clientWidth/2+t.clientWidth/2,behavior:'smooth'})}
      preload(i+1);
      sync();
      if(aiOn)drawAI();
      if(fromLb)lbShow();
    };
    // SITE.aiPerPage: AI 활용 내역이 있는 페이지에서만 버튼 활성화(빛남) + 안내 문구, 없는 페이지로 가면 AI 모드 해제
    var perPage=!!SITE.aiPerPage,hint=el.querySelector('.aihint');
    function sync(){
      if(!perPage)return;
      var has=!!spots[s[i][0]];
      if(!has&&aiOn)setAI(false);
      btn.disabled=!has;
      btn.classList.toggle('lit',has&&!aiOn);
      btn.title=has?'':'이 페이지에는 AI 활용 내역이 없어요';
      if(hint)hint.hidden=!has;
    }
    function setAI(on){
      aiOn=on;
      art.classList.toggle('ai-on',aiOn);
      btn.setAttribute('aria-pressed',aiOn);
      btn.querySelector('span').textContent=aiOn?'AI 활용 과정 닫기':'AI 활용 과정 보기';
      btn.classList.toggle('lit',perPage&&!aiOn&&!!spots[s[i][0]]);
      layer.hidden=bar.hidden=!aiOn;
      if(aiOn){drawAI();el.scrollIntoView({behavior:'smooth',block:'start'})}else hideTip();
    }
    frame.addEventListener('click',function(){self.go(i+1)});
    el.querySelector('.next').addEventListener('click',function(){self.go(i+1)});
    el.querySelector('.prev').addEventListener('click',function(){self.go(i-1)});
    el.querySelector('.full').addEventListener('click',function(){openLb(self)});
    bindThumbs();
    el.addEventListener('keydown',function(e){if(e.target.closest('.th,.spot'))return;if(e.key==='ArrowRight'){e.preventDefault();self.go(i+1)}else if(e.key==='ArrowLeft'){e.preventDefault();self.go(i-1)}});
    var x0=null;
    frame.addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});
    frame.addEventListener('touchend',function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)>40){e.preventDefault();self.go(dx<0?i+1:i-1)}});
    preload(1);

    // 'AI 활용 과정 보기' 버튼
    if(p.ai){
      p.meta.forEach(function(m,k){if(m.ai)bindTip(art.querySelector('[data-ai="meta:'+k+'"]'),m.ai)});
      btn.addEventListener('click',function(){setAI(!aiOn)});
    }else if(!perPage){
      btn.addEventListener('click',function(){
        if(btn.querySelector('.toast'))return;
        var t=document.createElement('span');t.className='toast';t.setAttribute('role','status');t.textContent='이 프로젝트의 AI 활용 과정은 준비 중이에요.';
        btn.appendChild(t);setTimeout(function(){t.remove()},2400);
      });
    }
    sync();
  }

  var lbyt=$('lbyt');
  function lbShow(){
    var k=active.idx(),s=active.get(k),y=active.ytAt(k);
    lb.classList.remove('big');$('lbzoom').textContent='확대';lbimg.src=s[0];lbimg.alt=s[1];lbcap.textContent=s[1];lbcount.textContent=pad(k+1)+' / '+pad(active.len);lbstage.scrollTo(0,0);lbFit();lbSync();
    if(lbyt){if(y)ytArm(lbyt,y,s[1]);else ytClear(lbyt)}
  }
  function openLb(v){active=v;lastFocus=document.activeElement;hideTip();v.stopVideo();lbAI=!!(lbbtn&&v.isAI());lb.hidden=false;lbShow();document.documentElement.style.overflow='hidden';$('lbclose').focus()}
  function closeLb(){hideTip();ytClear(lbyt);lb.hidden=true;document.documentElement.style.overflow='';if(lastFocus)lastFocus.focus()}

  // 크게 보기에서 AI 활용 보기 (SITE.aiLightbox — 페이지에 #lbai, #lbwrap 이 있을 때)
  var lbbtn=SITE.aiLightbox&&$('lbai'),lbwrap=$('lbwrap'),lblayer=$('lblayer'),lbhint=$('lbhint'),lbAI=false;
  function lbFit(){
    if(!lbwrap||lb.hidden)return;
    if(lb.classList.contains('big')){lbwrap.style.width='';return}
    var cs=getComputedStyle(lbstage),w=lbstage.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
    lbwrap.style.width=Math.max(0,Math.min(w,lbstage.clientHeight*W/H))+'px';
  }
  function lbSync(){
    if(!lbbtn)return;
    var list=active.spotsAt(active.idx()),has=!!list;
    if(!has)lbAI=false;
    lbbtn.disabled=!has;
    lbbtn.classList.toggle('lit',has&&!lbAI);
    lbbtn.setAttribute('aria-pressed',lbAI);
    lbbtn.querySelector('span').textContent=lbAI?'AI 활용 과정 닫기':'AI 활용 과정 보기';
    if(lbhint)lbhint.hidden=!has||lbAI;
    lb.classList.toggle('ai-on',lbAI);
    lblayer.hidden=!lbAI;
    if(lbAI)paint(lblayer,list);else hideTip();
  }
  if(lbbtn){
    lbbtn.hidden=false;
    lbbtn.addEventListener('click',function(){lbAI=!lbAI;lbSync()});
    window.addEventListener('resize',lbFit);
  }
  lbimg.addEventListener('click',function(){active.go(active.idx()+1,true)});
  $('lbnext').onclick=function(){active.go(active.idx()+1,true)};
  $('lbprev').onclick=function(){active.go(active.idx()-1,true)};
  $('lbclose').onclick=closeLb;
  $('lbzoom').onclick=function(){var b=lb.classList.toggle('big');this.textContent=b?'맞춤':'확대';lbFit()};
  lbstage.addEventListener('click',function(e){if(e.target===lbstage)closeLb()});
  document.addEventListener('keydown',function(e){if(lb.hidden)return;if(e.key==='Escape')closeLb();else if(e.key==='ArrowRight')active.go(active.idx()+1,true);else if(e.key==='ArrowLeft')active.go(active.idx()-1,true)});

  function mount(list,container){
    container.innerHTML=list.map(projectHTML).join('');
    list.forEach(function(p){new Viewer($(p.id),p)});
    fitAll();
  }

  /* ---------- list 모드 (apply.html): 탭 없이 한 페이지 ----------
     SITE.groups = [{ title, projects:[id…] }] 이면 목차·본문을 분류별로 나눠 섹션명을 표시 */
  if(SITE.mode==='list'){
    var groups=SITE.groups||[{title:'',projects:SITE.projects}],n=0,all=[];
    groups.forEach(function(g){g.list=byIds(g.projects);all=all.concat(g.list)});
    var toc='<h2 class="sec">목차</h2>',body='';
    groups.forEach(function(g,gi){
      var start=n;
      var cards=indexHTML(g.list,function(p){return '#'+p.id}).replace(/>P(\d+)</g,function(m,k){return '>P'+(start+ +k)+'<'});
      toc+=(g.title?'<h3 class="grp">'+esc(g.title)+'</h3>':'')+'<nav class="index two" aria-label="'+esc(g.title||'프로젝트 목록')+'">'+cards+'</nav>';
      body+='<section class="group" aria-label="'+esc(g.title)+'">'+(g.title?'<div class="sechead wrap"><span class="pill">'+pad(gi+1)+'</span><h2>'+esc(g.title)+'</h2></div>':'')+
        g.list.map(function(p){return projectHTML(p,n++)}).join('')+'</section>';
    });
    $('list-index').innerHTML=toc;
    $('list-projects').innerHTML=body;
    all.forEach(function(p){new Viewer($(p.id),p)});
    fitAll();
    if(location.hash){var t=$(location.hash.slice(1));if(t)t.scrollIntoView()}
    return;
  }

  /* ---------- tabs 모드 (index.html): #/ (자기소개) · #ux · #cx · #ux/grap ---------- */
  var ORDER=['ux','cx'];
  $('tracks').innerHTML=ORDER.map(function(t){
    var tr=DATA.tracks[t];
    return '<a class="glass track" href="#'+t+'"><span class="tabrow"><span class="pill">'+tr.label+'</span><span class="tablabel">'+byTrack(t).length+' Projects</span></span>'+
      '<span class="big">'+tr.label+'</span><h3>'+esc(tr.title)+'</h3>'+
      '<ul>'+byTrack(t).map(function(p){return '<li style="--c:'+p.color+'"><i></i>'+esc(p.title)+'</li>'}).join('')+'</ul>'+
      '<span class="go">프로젝트 보기 <span aria-hidden="true">→</span></span></a>';
  }).join('');

  var shown=null;
  function route(){
    var h=location.hash.replace(/^#\/?/,''),parts=h.split('/'),t=parts[0];
    hideTip();
    if(ORDER.indexOf(t)<0){
      shown=null;$('view-home').hidden=false;$('view-track').hidden=true;setNav('home');
      if(!h)window.scrollTo(0,0);
      return;
    }
    if(shown!==t){
      shown=t;var tr=DATA.tracks[t],list=byTrack(t);
      $('track-title').textContent=tr.label+' — '+tr.title;
      $('track-desc').textContent=tr.desc;
      $('track-index').innerHTML=indexHTML(list,function(p){return '#'+t+'/'+p.id});
      $('view-home').hidden=true;$('view-track').hidden=false;
      mount(list,$('track-projects'));
    }
    setNav(t);
    var target=parts[1]&&$(parts[1]);
    if(target)target.scrollIntoView();else window.scrollTo(0,0);
  }
  function setNav(r){[].forEach.call(document.querySelectorAll('[data-route]'),function(a){if(a.dataset.route===r)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')})}
  window.addEventListener('hashchange',route);
  route();
})();
