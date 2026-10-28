(function(){
  var $=function(s){return document.querySelector(s)},$$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s))};
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* Preloader – the one orchestrated entrance */
  var cnt=$('#cnt');
  function ready(){document.body.classList.remove('lock');document.body.classList.add('ready')}
  if(reduce){ready()}else{
    var t0=performance.now();
    (function tick(now){
      var p=Math.min((now-t0)/1500,1);
      cnt.textContent=Math.round(p*100);
      if(p<1)requestAnimationFrame(tick);else setTimeout(ready,250);
    })(t0);
  }

  /* Cursor + magnetic links */
  var cur=$('#cur'),cx=0,cy=0,px=0,py=0;
  if(fine){
    addEventListener('pointermove',function(e){px=e.clientX;py=e.clientY});
    $$('a,button,[data-tilt]').forEach(function(el){
      el.addEventListener('pointerenter',function(){cur.classList.add('big')});
      el.addEventListener('pointerleave',function(){cur.classList.remove('big')});
    });
    if(!reduce)$$('[data-mag]').forEach(function(el){
      el.addEventListener('pointermove',function(e){
        var r=el.getBoundingClientRect();
        el.style.transform='translate('+((e.clientX-r.left-r.width/2)*.25).toFixed(1)+'px,'+((e.clientY-r.top-r.height/2)*.35).toFixed(1)+'px)';
      });
      el.addEventListener('pointerleave',function(){el.style.transform=''});
    });
  }

  /* Project tilt + spotlight */
  $$('[data-tilt]').forEach(function(el){
    el.addEventListener('pointermove',function(e){
      var r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
      el.style.setProperty('--mx',(x*100)+'%');el.style.setProperty('--my',(y*100)+'%');
      if(!reduce)el.style.transform='rotateX('+((.5-y)*8).toFixed(2)+'deg) rotateY('+((x-.5)*10).toFixed(2)+'deg)';
    });
    el.addEventListener('pointerleave',function(){el.style.transform=''});
  });

  /* Experience accordion */
  $$('.row-h').forEach(function(b){
    b.addEventListener('click',function(){
      var row=b.parentNode,open=row.hasAttribute('data-open');
      $$('.row').forEach(function(r){r.removeAttribute('data-open');r.firstElementChild.setAttribute('aria-expanded','false')});
      if(!open){row.setAttribute('data-open','');b.setAttribute('aria-expanded','true')}
    });
  });

  /* Statement words light up with scroll */
  var st=$('#statement'),words=[];
  st.innerHTML=st.textContent.trim().split(/\s+/).map(function(w){return '<span class="w">'+w+'</span>'}).join(' ');
  words=$$('#statement .w');
  function lightWords(){
    var r=st.getBoundingClientRect(),h=innerHeight;
    var p=Math.min(Math.max((h*.85-r.top)/(r.height+h*.35),0),1)*words.length;
    words.forEach(function(w,i){w.style.opacity=reduce?1:(.16+.84*Math.min(Math.max(p-i,0),1)).toFixed(2)});
  }

  /* Marquee */
  var track=$('#track'),mx=0,half=0;
  track.innerHTML+=track.innerHTML;
  function measure(){half=track.scrollWidth/2+25}
  addEventListener('load',measure);addEventListener('resize',measure);measure();

  /* Local time */
  var clock=$('#clock');
  function tickClock(){
    clock.textContent='Hyderabad, '+new Intl.DateTimeFormat('en-IN',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',hour12:true}).format(new Date());
  }
  tickClock();setInterval(tickClock,30000);

  /* Scroll progress */
  var prog=$('#prog');
  function setProg(){var m=document.documentElement.scrollHeight-innerHeight;prog.style.transform='scaleX('+(m>0?scrollY/m:0)+')'}
  addEventListener('scroll',setProg,{passive:true});setProg();

  /* Count-up results */
  var pulse=0;
  addEventListener('pointerdown',function(){pulse=1});
  function setNum(el,v){el.textContent=v.toFixed(+el.dataset.dec)+el.dataset.suf}
  var io=new IntersectionObserver(function(es){es.forEach(function(en){
    if(!en.isIntersecting)return;io.unobserve(en.target);
    var el=en.target,to=+el.dataset.to,s=performance.now();
    if(reduce){setNum(el,to);return}
    (function step(n){var p=Math.min((n-s)/1700,1);setNum(el,to*(1-Math.pow(1-p,4)));if(p<1)requestAnimationFrame(step)})(s);
  })},{threshold:.6});
  $$('.n').forEach(function(el){io.observe(el)});

  /* Typed code window */
  var codeEl=$('#code');
  var src=['// Reads stay lean: no tracking, project early, page on the server.','public sealed class GetOrdersHandler','    : IRequestHandler<GetOrders, Page<OrderDto>>','{','    public async Task<Page<OrderDto>> Handle(','        GetOrders q, CancellationToken ct)','        => await _db.Orders','            .AsNoTracking()','            .Where(o => o.CustomerId == q.CustomerId)','            .OrderByDescending(o => o.CreatedAt)','            .Select(o => new OrderDto(o.Id, o.Total))','            .ToPageAsync(q.Page, ct);','}'].join('\n');
  function hl(s){
    return s.split('\n').map(function(l){
      var e=l.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      if(l.trim().indexOf('//')===0)return '<i class="c">'+e+'</i>';
      return e.replace(/\b(public|sealed|class|async|await|new)\b|\b([A-Z][A-Za-z]+)\b/g,function(m,k,t){return '<i class="'+(k?'k':'t')+'">'+m+'</i>'});
    }).join('\n');
  }
  function showCode(n){codeEl.innerHTML=hl(src.slice(0,n))}
  if(reduce){showCode(src.length)}else{
    var cio=new IntersectionObserver(function(es){if(!es[0].isIntersecting)return;cio.disconnect();
      var n=0;var iv=setInterval(function(){n+=2;showCode(n);if(n>=src.length)clearInterval(iv)},24);
    },{threshold:.4});cio.observe(codeEl);
  }

  /* Theme toggle */
  var root=document.documentElement,tg=$('#tg');
  function isLight(){return getComputedStyle(root).getPropertyValue('--mode').trim()==='light'}
  function syncTheme(){
    var l=isLight();lightT=l?1:0;tg.textContent=l?'Dark':'Light';
    if(dust)dust.material.color.set(l?0x0b0d12:0xe9ecf3);
  }
  tg.addEventListener('click',function(){root.setAttribute('data-theme',isLight()?'dark':'light');syncTheme()});

  /* WebGL: liquid glass sphere */
  var scene,camera,renderer,orb,dust,U;
  var light=getComputedStyle(document.documentElement).getPropertyValue('--mode').trim()==='light';
  var lightT=light?1:0,ok=!!window.THREE;
  if(ok){try{
    renderer=new THREE.WebGLRenderer({canvas:$('#gl'),antialias:true,alpha:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    scene=new THREE.Scene();
    camera=new THREE.PerspectiveCamera(38,1,.1,100);camera.position.z=7;
    U={uT:{value:0},uAmp:{value:.14},uLight:{value:light?1:0}};
    var vs='uniform float uT,uAmp;varying vec3 vN,vV;'+
    'float d(vec3 p){return (sin(p.x*1.7+uT*.8)*sin(p.y*2.1+uT*.6)*sin(p.z*1.9+uT*.7)+.35*sin(p.x*4.1+p.y*3.7+uT*1.3))*uAmp;}'+
    'void main(){vec3 p=position;vec3 n=normalize(p);float R=length(p);'+
    'vec3 t1=normalize(cross(n,vec3(.1,1.,.3)));vec3 t2=normalize(cross(n,t1));float e=.03;'+
    'vec3 p0=p+n*d(p);vec3 a=normalize(p+t1*e)*R;a+=normalize(a)*d(a);vec3 b=normalize(p+t2*e)*R;b+=normalize(b)*d(b);'+
    'vec3 nn=normalize(cross(a-p0,b-p0));if(dot(nn,n)<0.)nn=-nn;'+
    'vec4 mv=modelViewMatrix*vec4(p0,1.);vV=-mv.xyz;vN=normalMatrix*nn;gl_Position=projectionMatrix*mv;}';
    var fs='uniform float uT,uLight;varying vec3 vN,vV;'+
    'void main(){vec3 n=normalize(vN),v=normalize(vV);float f=pow(1.-max(dot(n,v),0.),2.2);vec3 r=reflect(-v,n);'+
    'float spec=smoothstep(.55,.95,r.y*.8+r.x*.4);'+
    'vec3 ir=.5+.5*cos(6.2831*(vec3(0.,.33,.67)+f*1.1+n.y*.35+uT*.04));ir=mix(vec3(dot(ir,vec3(.33))),ir,.75);'+
    'vec3 base=mix(vec3(.02,.025,.045),vec3(.82,.85,.9),uLight);'+
    'vec3 col=base+ir*f*mix(1.,.55,uLight)+spec*mix(.85,.3,uLight)+vec3(.9,.8,.62)*pow(max(dot(n,normalize(vec3(-.6,.5,.6))),0.),24.)*.5;'+
    'gl_FragColor=vec4(col,1.);}';
    orb=new THREE.Mesh(new THREE.IcosahedronGeometry(1.5,48),new THREE.ShaderMaterial({uniforms:U,vertexShader:vs,fragmentShader:fs}));
    scene.add(orb);
    var N=650,pos=new Float32Array(N*3);
    for(var i=0;i<N*3;i++)pos[i]=(Math.random()-.5)*(i%3===2?10:22);
    var g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
    dust=new THREE.Points(g,new THREE.PointsMaterial({size:.022,color:light?0x0b0d12:0xe9ecf3,transparent:true,opacity:.55}));
    scene.add(dust);
  }catch(e){ok=false}}

  syncTheme();
  function resize(){
    if(!ok)return;
    renderer.setSize(innerWidth,innerHeight,false);
    camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
  }
  resize();addEventListener('resize',resize);

  var nx=0,ny=0,tx=0,ty=0,sy=0,last=0,vel=0,clk=performance.now();
  addEventListener('pointermove',function(e){nx=e.clientX/innerWidth-.5;ny=e.clientY/innerHeight-.5});

  function frame(now){
    var t=(now-clk)/1000;
    sy=scrollY;vel+=(Math.abs(sy-last)-vel)*.1;last=sy;
    if(fine){cx+=(px-cx)*.18;cy+=(py-cy)*.18;cur.style.transform='translate('+cx+'px,'+cy+'px)'}
    if(!reduce){mx-=.5+vel*.18;if(mx<-half)mx+=half;track.style.transform='translateX('+mx+'px)'}
    lightWords();
    if(ok){
      tx+=(nx-tx)*.05;ty+=(ny-ty)*.05;
      var p=Math.min(sy/innerHeight,3),k=Math.min(p,1),e=k*k*(3-2*k),narrow=innerWidth<860;
      U.uT.value=t;U.uLight.value+=(lightT-U.uLight.value)*.08;pulse*=.95;U.uAmp.value+=((.14+Math.min(vel*.012,.28)+pulse*.4)-U.uAmp.value)*.08;
      orb.position.x=narrow?0:(1.9-4.1*e);
      orb.position.y=narrow?(.9-1.4*e):(-.1+.2*e);
      orb.scale.setScalar((narrow?.72:1.05)-.3*e);
      orb.rotation.y=t*.12+tx*1.2+p*1.6;orb.rotation.x=ty*.8+p*.5;
      dust.rotation.y=t*.01+tx*.05;dust.position.y=sy*.0016;
      renderer.render(scene,camera);
    }
    if(!reduce)requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  if(reduce)addEventListener('scroll',function(){requestAnimationFrame(frame)},{passive:true});
})();