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

// Mobile callout tuning workflow:
// 1. Set MOBILE_CALLOUT_TUNING to true.
// 2. Open the mobile Build tab.
// 3. Drag cards into position.
// 4. Tap Export Layout.
// 5. Paste exported values into the mobile callout tuning section in css/styles.css.
// 6. Set MOBILE_CALLOUT_TUNING back to false before shipping.
const MOBILE_CALLOUT_TUNING=true;
const MOBILE_CALLOUT_TRAITS={
 basketballIQ:{selector:".tc-iq",css:"basketballIQ",label:"basketballIQ"},
 shooting:{selector:".tc-shooting",css:"shooting",label:"shooting"},
 handle:{selector:".tc-handling",css:"handle",label:"handle"},
 athleticism:{selector:".tc-speed",css:"athleticism",label:"athleticism"},
 size:{selector:".tc-size",css:"size",label:"size"},
 clutch:{selector:".tc-clutch",css:"clutch",label:"clutch"},
 leadership:{selector:".tc-leadership",css:"leadership",label:"leadership"},
 rebounding:{selector:".tc-rebounding",css:"rebounding",label:"rebounding"},
 defense:{selector:".tc-defense",css:"defense",label:"defense"}
};

let mobileTabObserverReady=false;
let mobileCompletionObserverReady=false;
let mobileNextTraitObserverReady=false;
let mobileCalloutObserverReady=false;
let mobileCompletionAutoSwitched=false;
let mobileCalloutDrag=null;
let mobileCalloutDrawQueued=false;

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
 syncMobileCalloutDebug();
}

function syncMobileCalloutDebug(){
 const active=mobileCalloutActive();
 if(!mobileCalloutObserverReady)initMobileCalloutObserver();
 document.body?.classList.toggle("mobile-callout-debug",active);
 syncMobileCalloutCards(active);
 syncMobileCalloutExportButton(active);
}

function mobileCalloutApp(){
 return document.getElementById("app");
}

function mobileCalloutCssVar(key,property){
 const entry=MOBILE_CALLOUT_TRAITS[key];
 return entry?`--mobile-callout-${entry.css}-${property}`:"";
}

function mobileCalloutNumber(app,key,property,fallback=0){
 const name=mobileCalloutCssVar(key,property);
 if(!name)return fallback;
 const inline=app?.style.getPropertyValue(name);
 const computed=app?getComputedStyle(app).getPropertyValue(name):"";
 const parsed=parseFloat(inline||computed);
 return Number.isFinite(parsed)?parsed:fallback;
}

function mobileCalloutCard(key){
 return document.querySelector(MOBILE_CALLOUT_TRAITS[key]?.selector||"");
}

function mobileCalloutActive(){
 const app=mobileCalloutApp();
 return MOBILE_CALLOUT_TUNING
  &&isMobileBuildViewport()
  &&app?.classList.contains("mobile-tab-build");
}

function queueMobileCalloutDraw(){
 if(mobileCalloutDrawQueued)return;
 mobileCalloutDrawQueued=true;
 requestAnimationFrame(()=>{
  mobileCalloutDrawQueued=false;
  if(typeof drawCallouts==="function")drawCallouts();
 });
}

function syncMobileCalloutCards(active=mobileCalloutActive()){
 Object.entries(MOBILE_CALLOUT_TRAITS).forEach(([key,entry])=>{
  const card=document.querySelector(entry.selector);
  if(!card)return;

  if(!active){
   card.removeAttribute("data-mobile-callout-label");
   return;
  }

  card.dataset.mobileCalloutKey=key;
  card.dataset.mobileCalloutLabel=entry.label;
  if(card.dataset.mobileCalloutDragBound==="true")return;

  card.addEventListener("pointerdown",startMobileCalloutDrag);
  card.dataset.mobileCalloutDragBound="true";
 });
}

function startMobileCalloutDrag(event){
 if(!mobileCalloutActive())return;
 const card=event.currentTarget;
 const key=card.dataset.mobileCalloutKey;
 const app=mobileCalloutApp();
 if(!key||!app)return;

 event.preventDefault();
 event.stopPropagation();

 mobileCalloutDrag={
  key,
  card,
  pointerId:event.pointerId,
  startClientX:event.clientX,
  startClientY:event.clientY,
  startX:mobileCalloutNumber(app,key,"x"),
  startY:mobileCalloutNumber(app,key,"y")
 };

 card.setPointerCapture?.(event.pointerId);
 document.body?.classList.add("mobile-callout-dragging");
 card.addEventListener("pointermove",moveMobileCalloutDrag);
 card.addEventListener("pointerup",endMobileCalloutDrag);
 card.addEventListener("pointercancel",endMobileCalloutDrag);
}

function moveMobileCalloutDrag(event){
 if(!mobileCalloutDrag||event.pointerId!==mobileCalloutDrag.pointerId)return;
 const app=mobileCalloutApp();
 if(!app)return;

 event.preventDefault();
 const nextX=Math.round(mobileCalloutDrag.startX+(event.clientX-mobileCalloutDrag.startClientX));
 const nextY=Math.round(mobileCalloutDrag.startY+(event.clientY-mobileCalloutDrag.startClientY));
 app.style.setProperty(mobileCalloutCssVar(mobileCalloutDrag.key,"x"),`${nextX}px`);
 app.style.setProperty(mobileCalloutCssVar(mobileCalloutDrag.key,"y"),`${nextY}px`);
 queueMobileCalloutDraw();
}

function endMobileCalloutDrag(event){
 if(!mobileCalloutDrag||event.pointerId!==mobileCalloutDrag.pointerId)return;
 const {card,pointerId}=mobileCalloutDrag;
 card.releasePointerCapture?.(pointerId);
 card.removeEventListener("pointermove",moveMobileCalloutDrag);
 card.removeEventListener("pointerup",endMobileCalloutDrag);
 card.removeEventListener("pointercancel",endMobileCalloutDrag);
 mobileCalloutDrag=null;
 document.body?.classList.remove("mobile-callout-dragging");
 if(typeof drawCallouts==="function")drawCallouts();
}

function syncMobileCalloutExportButton(active=mobileCalloutActive()){
 let button=document.getElementById("mobileCalloutExportBtn");
 if(!active){
  button?.remove();
  return;
 }

 if(button)return;
 button=document.createElement("button");
 button.id="mobileCalloutExportBtn";
 button.className="mobile-callout-export";
 button.type="button";
 button.textContent="Export Layout";
 button.addEventListener("click",exportMobileCalloutLayout);
 document.body.appendChild(button);
}

function mobileCalloutExportValue(app,key,property,fallback=0){
 const value=mobileCalloutNumber(app,key,property,fallback);
 return Number.isInteger(value)?value:Number(value.toFixed(2));
}

function mobileCalloutExportSize(app,key,property,card){
 const raw=mobileCalloutNumber(app,key,property,NaN);
 if(Number.isFinite(raw))return Math.round(raw);
 const computed=parseFloat(card?getComputedStyle(card)[property]:"");
 if(Number.isFinite(computed))return Math.round(computed);
 const fallbackVar=property==="width"?"--mobile-build-callout-width":"--mobile-build-callout-height";
 const fallback=parseFloat(app?getComputedStyle(app).getPropertyValue(fallbackVar):"");
 if(Number.isFinite(fallback))return Math.round(fallback);
 const rect=card?.getBoundingClientRect();
 return Math.round(property==="width"?(rect?.width||0):(rect?.height||0));
}

async function exportMobileCalloutLayout(){
 const app=mobileCalloutApp();
 if(!app)return;

 const lines=["const MOBILE_CALLOUT_LAYOUT = {"];
 Object.keys(MOBILE_CALLOUT_TRAITS).forEach(key=>{
  const card=mobileCalloutCard(key);
  const data={
   x:mobileCalloutExportValue(app,key,"x"),
   y:mobileCalloutExportValue(app,key,"y"),
   width:mobileCalloutExportSize(app,key,"width",card),
   height:mobileCalloutExportSize(app,key,"height",card),
   scale:mobileCalloutExportValue(app,key,"scale",1),
   z:mobileCalloutExportValue(app,key,"z",20)
  };
  lines.push(`  ${key}: { x: ${data.x}, y: ${data.y}, width: ${data.width}, height: ${data.height}, scale: ${data.scale}, z: ${data.z} },`);
 });
 lines.push("};");
 const output=lines.join("\n");
 console.log(output);

 try{
  await navigator.clipboard?.writeText(output);
  if(typeof toast==="function")toast("Mobile callout layout copied.");
 }catch(error){
  console.warn("Mobile callout layout copied to console only.",error);
  if(typeof toast==="function")toast("Layout printed to console.");
 }
}

function initMobileCalloutObserver(){
 if(mobileCalloutObserverReady)return;
 const layer=document.getElementById("traitCardLayer");
 if(!layer)return;

 const observer=new MutationObserver(syncMobileCalloutDebug);
 observer.observe(layer,{childList:true,subtree:true});
 mobileCalloutObserverReady=true;
 syncMobileCalloutDebug();
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

function initMobileNextTraitHandler(){
 if(mobileNextTraitObserverReady)return;
 const next=document.getElementById("nextBtn");
 if(!next)return;

 next.addEventListener("click",event=>{
  const app=document.getElementById("app");
  const shouldSwitchFirst=isMobileBuildViewport()
   &&app?.classList.contains("mobile-tab-build")
   &&typeof isComplete==="function"
   &&!isComplete()
   &&typeof current!=="undefined"
   &&!current
   &&typeof isSpinning!=="undefined"
   &&!isSpinning;

  if(!shouldSwitchFirst)return;

  event.preventDefault();
  event.stopImmediatePropagation();
  setMobileViewTab("spin");
  requestAnimationFrame(()=>{
   requestAnimationFrame(()=>{
    if(typeof spin==="function")spin();
   });
  });
 },true);

 mobileNextTraitObserverReady=true;
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
   syncMobileCalloutDebug();
  });
 }

 syncMobileTabVisibility();
 syncMobileTabControls();
}

window.setMobileViewTab=setMobileViewTab;
window.syncMobileTabControls=syncMobileTabControls;
window.syncMobileCompletionTab=syncMobileCompletionTab;
window.syncMobileCalloutDebug=syncMobileCalloutDebug;
document.addEventListener("DOMContentLoaded",initMobileTabObservers);
document.addEventListener("DOMContentLoaded",initMobileCompletionObserver);
document.addEventListener("DOMContentLoaded",initMobileNextTraitHandler);
document.addEventListener("DOMContentLoaded",initMobileCalloutObserver);
document.addEventListener("DOMContentLoaded",syncMobileTabControls);
document.addEventListener("DOMContentLoaded",syncMobileCalloutDebug);
requestAnimationFrame(initMobileTabObservers);
requestAnimationFrame(initMobileCompletionObserver);
requestAnimationFrame(initMobileNextTraitHandler);
requestAnimationFrame(initMobileCalloutObserver);
requestAnimationFrame(syncMobileTabControls);
requestAnimationFrame(syncMobileCalloutDebug);
