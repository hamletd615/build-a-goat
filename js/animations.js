// Wheel animation and reel timing helpers.
function makeWheelStrip(items,pick,beforeCount=9,afterCount=5){
 let clean=[],seen=new Set();

 items.forEach(x=>{
  let name=wheelName(x);
  if(name!==pick&&!seen.has(name)){
   clean.push(x);
   seen.add(name);
  }
 });

 clean=[...clean].sort(()=>Math.random()-.5);

 function takeSpaced(count,seed=[]){
  let out=[],pool=[...clean],recent=seed.map(wheelName).slice(-4);
  while(out.length<count&&pool.length){
   let idx=pool.findIndex(x=>!recent.includes(wheelName(x)));
   if(idx<0)idx=0;
   let next=pool.splice(idx,1)[0];
   out.push(next);
   recent.push(wheelName(next));
   recent=recent.slice(-4);
  }
  return out;
 }

 let before=takeSpaced(beforeCount);
 let after=takeSpaced(afterCount,[...before,pick]);

 let strip=[...before,pick,...after];
 let selectedIndex=before.length;

 return {strip,selectedIndex};
}

function reelCenterOffset(reel){
 const box=reel?.parentElement;
 const h=box?.clientHeight||246;
 return Math.round(h/2-22);
}
function animateTo(id,items,pick,display,duration=2600,beforeCount=9,afterCount=5){
  let reel=document.getElementById(id);
  let made=makeWheelStrip(items,pick,beforeCount,afterCount);
  let spin=made.strip;
  let selectedIndex=made.selectedIndex;
  let finalY=-(selectedIndex*44)+reelCenterOffset(reel);
  if(reel._lockTimer)clearTimeout(reel._lockTimer);

  reel.className=id==="seasonTeamReel"?"season-reel spinning":"reel spinning";
 reel.innerHTML=spin.map((x,i)=>{
  let cls=i===selectedIndex?"selected":Math.abs(i-selectedIndex)<=2?"near":"";
  return `<div class="item ${cls}">${display(x)}</div>`;
 }).join("");

 reel.style.transition="none";
 reel.style.transform="translateY(0)";
 reel.offsetHeight;

 reel.style.transition=`transform ${duration}ms cubic-bezier(.1,.74,.16,1)`;
 reel.style.transform=`translateY(${finalY}px)`;
}

