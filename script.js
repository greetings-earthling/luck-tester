window.addEventListener("DOMContentLoaded", () => {

  const pick = arr => arr[Math.floor(Math.random()*arr.length)];
  const clamp = (n,a,b)=>Math.max(a,Math.min(b,n));

  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789⌁⟡⟢⌬⟣⟠⟟⟞⌇";

  function scrambleTo(el, finalText, ms=420){
    const target = String(finalText);
    const len = clamp(target.length, 4, 40);
    const steps = 14;
    let i=0;

function isLongText(t){
  const s = String(t || "");
  // long if it has spaces or is longer than a short label
  return s.length > 18 || /\s/.test(s);
}

function setRevealContent(btn, text){
  const t = String(text);
  // wrap for nicer max-width in CSS (revealInner)
  btn.innerHTML = `<span class="revealInner"></span>`;
  btn.querySelector(".revealInner").textContent = t;

  // mark long
  if (isLongText(t)) btn.classList.add("isLong");
  else btn.classList.remove("isLong");
}

function scrambleTo(el, finalText, ms=420){
  const target = String(finalText);
  const len = clamp(target.length, 4, 40);
  const steps = 14;
  let i=0;

  // ensure wrapper exists
  if (!el.querySelector(".revealInner")) {
    el.innerHTML = `<span class="revealInner"></span>`;
  }
  const inner = el.querySelector(".revealInner");

  // tag long/short up front so sizing is stable during scramble
  if (isLongText(target)) el.classList.add("isLong");
  else el.classList.remove("isLong");

  const timer = setInterval(()=>{
    i++;
    const lock = Math.floor((i/steps)*len);
    let out="";
    for(let k=0;k<len;k++){
      out += (k<lock) ? (target[k]||"") : GLYPHS[Math.floor(Math.random()*GLYPHS.length)];
    }
    inner.textContent = out;

    if(i>=steps){
      clearInterval(timer);
      inner.textContent = target;
    }
  }, ms/steps);
}
    
    const timer = setInterval(()=>{
      i++;
      const lock = Math.floor((i/steps)*len);
      let out="";
      for(let k=0;k<len;k++){
        out += (k<lock) ? (target[k]||"") : GLYPHS[Math.floor(Math.random()*GLYPHS.length)];
      }
      el.textContent = out;
      if(i>=steps){
        clearInterval(timer);
        el.textContent = target;
      }
    }, ms/steps);
  }

function markDone(btn){
  btn.classList.add("isDone");
  btn.disabled = true;
}

  function bind(id, mode, run){
    const btn = document.getElementById(id);
    if(!btn) return;

    btn.addEventListener("click", ()=>{
      if(mode==="oneshot" && btn.disabled) return;
      run(btn);
      if(mode==="oneshot") markDone(btn);
    });
  }

  /* DATA */

  const WISDOM=[
    "Proceed. But do not rush.",
    "Choose the calm option.",
    "One useful move is enough.",
    "Take the obvious win.",
    "Quiet beats loud today."
  ];

  const TAROT=[
    ["The Fool","Start. Learn by moving."],
    ["The Sun","Say yes to what is simple."],
    ["The Magician","Use what you have."],
    ["Wheel of Fortune","Timing matters."],
  ];

  const FACTS=[
    "Honey never spoils.",
    "Octopuses have three hearts.",
    "Bananas are berries."
  ];

  const JOKES=[
    "I tried to read a book on anti-gravity. Couldn’t put it down.",
    "I’m on a whiskey diet. I’ve lost three days."
  ];

  function rollAura(){
    const mean=70, sd=14;
    let u=0,v=0;
    while(u===0) u=Math.random();
    while(v===0) v=Math.random();
    const z=Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);
    return Math.round(clamp(mean+z*sd,0,100));
  }

  function auraLine(p){
    if(p<=45) return "Low luck. Proceed with caution.";
    if(p<=65) return "Neutral luck. You steer.";
    return "High luck. Take the easy wins.";
  }

  function rollNiceHex(){
    const h=Math.floor(Math.random()*360);
    const s=70,l=55;
    const a=s/100,l2=l/100;
    const c=(1-Math.abs(2*l2-1))*a;
    const x=c*(1-Math.abs((h/60)%2-1));
    const m=l2-c/2;
    let r=0,g=0,b=0;
    if(h<60){r=c;g=x;}
    else if(h<120){r=x;g=c;}
    else if(h<180){g=c;b=x;}
    else if(h<240){g=x;b=c;}
    else if(h<300){r=x;b=c;}
    else{r=c;b=x;}
    const toHex=v=>Math.round((v+m)*255).toString(16).padStart(2,"0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }

  /* WIDGETS */

  bind("reveal-number","oneshot",(btn)=>{
    const n=1+Math.floor(Math.random()*10);
    scrambleTo(btn,n);
    document.getElementById("after-number").hidden=false;
    document.getElementById("after-number").textContent="Notice it today.";
  });

  bind("reveal-letter","oneshot",(btn)=>{
    const l=String.fromCharCode(65+Math.floor(Math.random()*26));
    scrambleTo(btn,l);
    document.getElementById("after-letter").hidden=false;
    document.getElementById("after-letter").textContent="Watch for it.";
  });

  bind("reveal-colours","oneshot",(btn)=>{
    btn.classList.add("colours","isDone");
    btn.disabled = true;
    btn.innerHTML="";
    const a=rollNiceHex();
    let b=rollNiceHex();
    while(b===a) b=rollNiceHex();

    const box1=document.createElement("div");
    box1.className="colourBox";
    box1.style.background=a;
    box1.textContent=a;

    const box2=document.createElement("div");
    box2.className="colourBox";
    box2.style.background=b;
    box2.textContent=b;

    btn.appendChild(box1);
    btn.appendChild(box2);

    document.getElementById("after-colours").hidden=false;
    document.getElementById("after-colours").textContent="Use them for a choice.";
  });

  bind("reveal-aura","oneshot",(btn)=>{
    const p=rollAura();
    scrambleTo(btn,`${p}%`);
    document.getElementById("after-aura").hidden=false;
    document.getElementById("after-aura").textContent=auraLine(p);
  });

  bind("reveal-wisdom","oneshot",(btn)=>{
    const msg=pick(WISDOM);
    scrambleTo(btn,msg);
    document.getElementById("after-wisdom").hidden=false;
    document.getElementById("after-wisdom").textContent="One sentence. One move.";
  });

  bind("reveal-tarot","oneshot",(btn)=>{
    const [card,msg]=pick(TAROT);
    scrambleTo(btn,card);
    document.getElementById("after-tarot").hidden=false;
    document.getElementById("after-tarot").textContent=msg;
  });

bind("reveal-dinner","reroll",(btn)=>{
  const list = window.DINNERLIST || [];
  const text = list.length ? pick(list) : "Add dinnerlist.js";
  setRevealContent(btn, text);
  btn.classList.add("isDone");     // style it as revealed
  btn.disabled = false;            // but keep rerolls
});

bind("reveal-watch","reroll",(btn)=>{
  const list = window.WATCHLIST || [];
  const text = list.length ? (pick(list).title || "—") : "Add watchlist.js";
  setRevealContent(btn, text);
  btn.classList.add("isDone");
  btn.disabled = false;
});

bind("reveal-fact","oneshot",(btn)=>{
  scrambleTo(btn, pick(FACTS));
});

bind("reveal-joke","oneshot",(btn)=>{
  scrambleTo(btn, pick(JOKES));
});

});
