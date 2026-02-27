window.addEventListener("DOMContentLoaded", () => {

  const FX_SRC = "./ads/Smoke.mp4";   // your file
  const SMOKE_ONLY_MS = 1500;         // 0–1.5s smoke only
  const TOTAL_REVEAL_MS = 3500;       // full sequence length
  const SMOKE_FADE_MS = 800;          // fade duration

  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789⌁⟡⟢⌬⟣⟠⟟⟞⌇";
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];

  function ensureInner(btn){
    if(!btn.querySelector(".revealInner")){
      btn.innerHTML = `<span class="revealInner">TAP TO REVEAL</span>`;
    }
    return btn.querySelector(".revealInner");
  }

  function isLongText(t){
    const s = String(t || "");
    return s.length > 18 || /\s/.test(s);
  }

  function randomSubtleTint(){
    const h = Math.floor(Math.random()*360);
    return `hsl(${h}, 50%, 45%)`;
  }

  function ensureFX(btn){
    let video = btn.querySelector(".fxVideo");
    if(!video){
      video = document.createElement("video");
      video.className = "fxVideo";
      video.src = FX_SRC;
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      btn.insertBefore(video, btn.firstChild);
    }

    let tint = btn.querySelector(".fxTint");
    if(!tint){
      tint = document.createElement("div");
      tint.className = "fxTint";
      btn.insertBefore(tint, video.nextSibling);
    }

    return {video, tint};
  }

function scrambleTo(btn, finalText, ms=1800){

  const target = String(finalText);
  const inner = ensureInner(btn);

  if(isLongText(target)) btn.classList.add("isLong");
  else btn.classList.remove("isLong");

  const steps = 24;
  let i = 0;

  inner.style.opacity = "0";

  const timer = setInterval(()=>{
    i++;

    const lock = Math.floor((i/steps) * target.length);
    let out = "";

    for(let k=0; k < target.length; k++){
      out += (k < lock)
        ? target[k]
        : GLYPHS[Math.floor(Math.random()*GLYPHS.length)];
    }

    inner.textContent = out;

    // Gradual fade-in during scramble
    inner.style.opacity = Math.min(i/steps, 1);

    if(i >= steps){
      clearInterval(timer);
      inner.textContent = target;
      inner.style.opacity = "1";
    }

  }, ms/steps);
}

 function startSequence(btn, revealLogic){

  const {video, tint} = ensureFX(btn);
  ensureInner(btn);

  btn.classList.add("isRevealing");
   const inner = ensureInner(btn);
inner.textContent = "";   // remove TAP TO REVEAL immediately
inner.style.opacity = "0";

  // Immediately go black under smoke
  btn.style.background = "#0b0d12";

  // Reset video
  video.pause();
  video.currentTime = 0;
  video.style.opacity = "1";

  // Random subtle tint
  tint.style.background = randomSubtleTint();
  tint.style.opacity = ".45";

  video.play().catch(()=>{});

  // Start scramble while smoke still visible
  setTimeout(()=>{
    revealLogic();
  }, 1400);

  // Fade smoke + tint
  setTimeout(()=>{
    video.style.transition = "opacity 800ms ease";
    tint.style.transition  = "opacity 800ms ease";
    video.style.opacity = "0";
    tint.style.opacity  = "0";
  }, 1500);

}

  /* ---------------- DATA ---------------- */

  const WISDOM=[
    "Proceed. But do not rush.",
    "Choose the calm option.",
    "One useful move is enough.",
    "Take the obvious win.",
    "Quiet beats loud today."
  ];

  const JOKES=[
    "Parallel lines have so much in common. It’s a shame they’ll never meet.",
    "I tried to read a book on anti-gravity. Couldn’t put it down."
  ];

  const FACTS=[
    "Honey never spoils.",
    "Octopuses have three hearts."
  ];

  const TAROT=[
    ["The Fool","Start. Learn by moving."],
    ["The Sun","Say yes to what is simple."]
  ];

  const METER=[
    {t:"Low luck. Keep it simple. Avoid big swings.", w:6},
    {t:"Neutral day. You steer. Consistency wins.", w:14},
    {t:"Good luck day. Momentum is real. Use it.", w:9}
  ];

  function weightedPick(items){
    const total = items.reduce((s,x)=>s+x.w,0);
    let r=Math.random()*total;
    for(const it of items){
      r-=it.w;
      if(r<=0) return it;
    }
    return items[items.length-1];
  }

  /* ---------------- BINDS ---------------- */

function bind(id, mode, logic){
  const btn = document.getElementById(id);
  if(!btn) return;

  ensureInner(btn);
  ensureFX(btn);

  btn.addEventListener("click", ()=>{
    if(mode==="oneshot" && btn.classList.contains("isDone")) return;
    startSequence(btn, ()=> logic(btn));
  });
}
  
  bind("reveal-meter","oneshot",(btn)=>{
    scrambleTo(btn, weightedPick(METER).t);
  });

  bind("reveal-wisdom","oneshot",(btn)=>{
    scrambleTo(btn, pick(WISDOM));
  });

  bind("reveal-number","oneshot",(btn)=>{
    scrambleTo(btn, 1 + Math.floor(Math.random()*10));
  });

  bind("reveal-joke","oneshot",(btn)=>{
    scrambleTo(btn, pick(JOKES));
  });

  bind("reveal-tarot","oneshot",(btn)=>{
    const [card,msg]=pick(TAROT);
    scrambleTo(btn, `${card} — ${msg}`);
  });

  bind("reveal-fact","oneshot",(btn)=>{
    scrambleTo(btn, pick(FACTS));
  });

});
