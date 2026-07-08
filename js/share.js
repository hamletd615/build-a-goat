// Share menu, copy-link behavior, and restart/home actions.
function shareText(){return "Build-A-GOAT Beta Test\n"+TRAITS.map(([k,l])=>`${l}: ${build[k]?build[k].player+" ("+build[k].rating+")":"-"}`).join("\n")+`\nOVR: ${overall()}\nRespins left: ${respinsLeft}\nArchetype: ${Object.keys(build).length===9?archetype():"Incomplete"}`}
function copyBuild(){navigator.clipboard?.writeText(shareText());toast("Copied build")}
function shareUrl(){return location.href.split("#")[0]}
function shareLine(){
 const o=overall()||0;
 const name=Object.keys(build).length===TRAITS.length?archetype():"Build-A-GOAT";
 return `I made a ${o} overall ${name}, think you can do better?`;
}
function shareBuildAction(){
 const overlay=document.getElementById("shareOverlay");
 const line=shareLine();
 document.getElementById("shareQuote").textContent=`"${line}"`;
 document.getElementById("shareCardTitle").textContent=`${overall()||0} OVR - ${Object.keys(build).length===TRAITS.length?archetype():"Build-A-GOAT"}`;
 document.getElementById("shareCardCopy").textContent=line;
 overlay.classList.add("open");
}
function closeShareMenu(){
 document.getElementById("shareOverlay")?.classList.remove("open");
}
function shareTo(kind){
 const url=encodeURIComponent(shareUrl());
 const text=encodeURIComponent(shareLine());
 const title=encodeURIComponent(`Build-A-GOAT ${overall()||0} OVR`);
 const links={
  x:`https://twitter.com/intent/tweet?text=${text}&url=${url}`,
  facebook:`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
  reddit:`https://www.reddit.com/submit?url=${url}&title=${title}%20-%20${text}`
 };
 window.open(links[kind],"_blank","noopener,noreferrer,width=720,height=640");
 closeShareMenu();
}
async function copyShareLink(){
 try{
  await navigator.clipboard?.writeText(shareLine()+"\n"+shareUrl());
  toast("Build link copied");
  closeShareMenu();
 }catch(e){
  toast("Copy blocked by browser");
 }
}
function goHome(){
 document.getElementById("app").classList.add("hidden");
 document.getElementById("home").classList.remove("hidden");
}function newBuild(){
 build={};
 current=null;
 lockedSpinTeam=null;
 respinsLeft=5;
 isSpinning=false;
 simTeam=null;
 selectedSeasonTeam=null;
 selectedSeasonTeamId=null;
 lastRegularSeason=null;
 lastPlayoffRun=null;

  resetIdleWheels();

  document.getElementById("teamPill").textContent="No team selected";
  document.getElementById("playerName").textContent="Ready?";
  document.getElementById("playerMeta").textContent="Spin reveals one random team and one weighted random player. Respins stay on that team.";
  document.getElementById("finalReportOverlay")?.classList.remove("open");
  document.getElementById("regularSeasonOverlay")?.classList.remove("open");
  document.getElementById("playoffOverlay")?.classList.remove("open");
  document.getElementById("awardsOverlay")?.classList.remove("open");
  document.getElementById("seasonDetailOverlay")?.classList.remove("open");
  document.getElementById("seasonOverlay")?.classList.remove("open");
  document.getElementById("app")?.classList.remove("hidden");
  document.getElementById("home")?.classList.add("hidden");
  if(typeof setMobileViewTab==="function")setMobileViewTab("spin");

  const next=document.getElementById("nextBtn");
  next.textContent="NEXT TRAIT";
 next.onclick=spin;

 document.getElementById("stage").classList.remove("complete");
 document.querySelector(".side").classList.remove("complete");

 renderTraitMenu();
 render();
 setControls();
}
function toast(m){let t=document.getElementById("toast");t.textContent=m;t.style.display="block";setTimeout(()=>t.style.display="none",1400)}
function startDrafting(){
 document.getElementById("home").classList.add("hidden");
 document.getElementById("app").classList.remove("hidden");
 if(typeof setMobileViewTab==="function")setMobileViewTab("spin");
 window.scrollTo(0,0);
 setTimeout(drawCallouts,100);
}
const startBtn=document.getElementById("startBtn");
if(startBtn){
 startBtn.addEventListener("click",startDrafting);
 startBtn.addEventListener("pointerup",e=>{e.preventDefault();startDrafting()});
 startBtn.addEventListener("touchend",e=>{e.preventDefault();startDrafting()},{passive:false});
}
window.addEventListener("resize",drawCallouts);
window.addEventListener("keydown",e=>{if(e.key==="Escape")closeShareMenu()});
document.getElementById("playerImg").addEventListener("load",drawCallouts);

