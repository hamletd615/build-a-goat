// Mobile-only screen organization. This does not mutate build, spin, or renderer state.
const MOBILE_TAB_BLOCKING_OVERLAYS=[
 "seasonOverlay",
 "seasonDetailOverlay",
 "regularSeasonOverlay",
 "playoffOverlay",
 "awardsOverlay",
 "finalReportOverlay",
 "shareOverlay"
];

let mobileTabObserverReady=false;
let mobileCompletionObserverReady=false;
let mobileCompletionAutoSwitched=false;

function mobileBlockingOverlayOpen(){
 return MOBILE_TAB_BLOCKING_OVERLAYS.some(id=>document.getElementById(id)?.classList.contains("open"));
}

function syncMobileTabVisibility(){
 const app=document.getElementById("app");
 if(!app)return;
 app.classList.toggle("mobile-tabs-suppressed",mobileBlockingOverlayOpen());
}

function isMobileBuildViewport(){
 return window.matchMedia?.("(max-width: 768px)")?.matches;
}

function mobileTabSwitchLocked(){
 return isMobileBuildViewport()&&typeof isSpinning!=="undefined"&&isSpinning;
}

function mobileBuildProgressCount(){
 return typeof build==="object"&&build ? Math.min(Object.keys(build).length,9) : 0;
}

function syncMobileBuildProgress(){
 const buildTab=document.getElementById("mobileBuildTab");
 if(!buildTab)return;
 buildTab.dataset.progress=`${mobileBuildProgressCount()}/9`;
}

function syncMobileTabControls(){
 const spin=document.getElementById("mobileSpinTab");
 const build=document.getElementById("mobileBuildTab");
 const locked=mobileTabSwitchLocked();

 [spin,build].forEach(button=>{
  if(!button)return;
  button.disabled=locked;
  button.setAttribute("aria-disabled",locked?"true":"false");
 });

 syncMobileBuildProgress();
}

function syncMobileCompletionTab(){
 const stage=document.getElementById("stage");
 if(!stage)return;

 if(!stage.classList.contains("complete")){
  mobileCompletionAutoSwitched=false;
  return;
 }

 if(mobileCompletionAutoSwitched||!isMobileBuildViewport())return;

 mobileCompletionAutoSwitched=true;
 setMobileViewTab("build");
}

function initMobileTabObservers(){
 if(mobileTabObserverReady)return;
 const overlays=MOBILE_TAB_BLOCKING_OVERLAYS
  .map(id=>document.getElementById(id))
  .filter(Boolean);
 if(!overlays.length)return;

 const observer=new MutationObserver(syncMobileTabVisibility);
 overlays.forEach(overlay=>observer.observe(overlay,{attributes:true,attributeFilter:["class"]}));
 mobileTabObserverReady=true;
 syncMobileTabVisibility();
}

function initMobileCompletionObserver(){
 if(mobileCompletionObserverReady)return;
 const stage=document.getElementById("stage");
 if(!stage)return;

 const observer=new MutationObserver(syncMobileCompletionTab);
 observer.observe(stage,{attributes:true,attributeFilter:["class"]});
 mobileCompletionObserverReady=true;
 syncMobileCompletionTab();
}

function setMobileViewTab(tab){
 const app=document.getElementById("app");
 const spin=document.getElementById("mobileSpinTab");
 const build=document.getElementById("mobileBuildTab");
 const next=tab==="build"?"build":"spin";
 if(!app)return;
 if(mobileTabSwitchLocked()&&!app.classList.contains(`mobile-tab-${next}`)){
  syncMobileTabControls();
  return;
 }

 app.classList.toggle("mobile-tab-spin",next==="spin");
 app.classList.toggle("mobile-tab-build",next==="build");

 if(spin){
  spin.classList.toggle("active",next==="spin");
  spin.setAttribute("aria-pressed",next==="spin"?"true":"false");
 }

 if(build){
  build.classList.toggle("active",next==="build");
  build.setAttribute("aria-pressed",next==="build"?"true":"false");
 }

 if(next==="build"){
  requestAnimationFrame(()=>{
   if(typeof drawCallouts==="function")drawCallouts();
  });
 }

 syncMobileTabVisibility();
 syncMobileTabControls();
}

window.setMobileViewTab=setMobileViewTab;
window.syncMobileTabControls=syncMobileTabControls;
window.syncMobileCompletionTab=syncMobileCompletionTab;
document.addEventListener("DOMContentLoaded",initMobileTabObservers);
document.addEventListener("DOMContentLoaded",initMobileCompletionObserver);
document.addEventListener("DOMContentLoaded",syncMobileTabControls);
requestAnimationFrame(initMobileTabObservers);
requestAnimationFrame(initMobileCompletionObserver);
requestAnimationFrame(syncMobileTabControls);
