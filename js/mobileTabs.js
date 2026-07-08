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
// 3. Drag and resize cards.
// 4. Move nodes/dots.
// 5. Tap Export Layout.
// 6. Paste exported values into the mobile layout config.
// 7. Set MOBILE_CALLOUT_TUNING back to false.
// 8. Commit the locked values.
const MOBILE_CALLOUT_TUNING=true;
const MOBILE_CALLOUT_TRAITS={
 basketballIQ:{selector:".tc-iq",css:"basketballIQ",label:"basketballIQ",anchor:"iq"},
 shooting:{selector:".tc-shooting",css:"shooting",label:"shooting",anchor:"shooting"},
 handle:{selector:".tc-handling",css:"handle",label:"handle",anchor:"handling"},
 athleticism:{selector:".tc-speed",css:"athleticism",label:"athleticism",anchor:"speed"},
 size:{selector:".tc-size",css:"size",label:"size",anchor:"size"},
 clutch:{selector:".tc-clutch",css:"clutch",label:"clutch",anchor:"clutch"},
 leadership:{selector:".tc-leadership",css:"leadership",label:"leadership",anchor:"leadership"},
 rebounding:{selector:".tc-rebounding",css:"rebounding",label:"rebounding",anchor:"rebounding"},
 defense:{selector:".tc-defense",css:"defense",label:"defense",anchor:"defense"}
};
const MOBILE_CALLOUT_BY_ANCHOR=Object.fromEntries(
 Object.entries(MOBILE_CALLOUT_TRAITS).map(([key,entry])=>[entry.anchor,key])
);
const MOBILE_CALLOUT_SIZE_STEPS={width:4,height:4,scale:.05,z:1,node:2};

let mobileTabObserverReady=false;
let mobileCompletionObserverReady=false;
let mobileNextTraitObserverReady=false;
let mobileCalloutObserverReady=false;
let mobileCompletionAutoSwitched=false;
let mobileCalloutDrag=null;
let mobileNodeDrag=null;
let mobileCalloutDrawQueued=false;
let selectedMobileCalloutKey="basketballIQ";

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
 syncMobileCalloutControls(active);
 syncMobileNodeLayer(active);
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

function mobileCalloutPresentationActive(){
 const app=mobileCalloutApp();
 return isMobileBuildViewport()&&app?.classList.contains("mobile-tab-build");
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
   card.classList.remove("mobile-callout-selected");
   return;
  }

  card.dataset.mobileCalloutKey=key;
  card.dataset.mobileCalloutLabel=entry.label;
  card.classList.toggle("mobile-callout-selected",selectedMobileCalloutKey===key);
  if(card.dataset.mobileCalloutDragBound==="true")return;

  card.addEventListener("pointerdown",startMobileCalloutDrag);
  card.dataset.mobileCalloutDragBound="true";
 });
}

function selectMobileCallout(key){
 if(!MOBILE_CALLOUT_TRAITS[key])return;
 selectedMobileCalloutKey=key;
 syncMobileCalloutCards();
 syncMobileCalloutControls();
 syncMobileNodeLayer();
}

function startMobileCalloutDrag(event){
 if(!mobileCalloutActive())return;
 const card=event.currentTarget;
 const key=card.dataset.mobileCalloutKey;
 const app=mobileCalloutApp();
 if(!key||!app)return;
 if(event.target.closest?.(".mobile-callout-resize-grip"))return;

 event.preventDefault();
 event.stopPropagation();
 selectMobileCallout(key);

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

function syncMobileCalloutControls(active=mobileCalloutActive()){
 let panel=document.getElementById("mobileCalloutEditorPanel");
 if(!active){
  panel?.remove();
  return;
 }

 if(!panel){
  panel=document.createElement("div");
  panel.id="mobileCalloutEditorPanel";
  panel.className="mobile-callout-editor";
  panel.innerHTML=`
   <div class="mobile-callout-editor-title"></div>
   <div class="mobile-callout-editor-grid">
    <button type="button" data-adjust="width" data-delta="-1">Width -</button>
    <button type="button" data-adjust="width" data-delta="1">Width +</button>
    <button type="button" data-adjust="height" data-delta="-1">Height -</button>
    <button type="button" data-adjust="height" data-delta="1">Height +</button>
    <button type="button" data-adjust="scale" data-delta="-1">Scale -</button>
    <button type="button" data-adjust="scale" data-delta="1">Scale +</button>
    <button type="button" data-adjust="z" data-delta="-1">Z -</button>
    <button type="button" data-adjust="z" data-delta="1">Z +</button>
    <button type="button" data-adjust="nodeX" data-delta="-1">Node X -</button>
    <button type="button" data-adjust="nodeX" data-delta="1">Node X +</button>
    <button type="button" data-adjust="nodeY" data-delta="-1">Node Y -</button>
    <button type="button" data-adjust="nodeY" data-delta="1">Node Y +</button>
   </div>
  `;
  panel.addEventListener("click",event=>{
   const button=event.target.closest("button[data-adjust]");
   if(!button)return;
   adjustSelectedMobileCallout(button.dataset.adjust,Number(button.dataset.delta)||0);
  });
  document.body.appendChild(panel);
 }

 const title=panel.querySelector(".mobile-callout-editor-title");
 if(title)title.textContent=`Editing ${MOBILE_CALLOUT_TRAITS[selectedMobileCalloutKey]?.label||"callout"}`;
}

function adjustSelectedMobileCallout(property,direction){
 const key=selectedMobileCalloutKey;
 const app=mobileCalloutApp();
 if(!key||!app||!direction)return;

 if(property==="width"||property==="height"){
  const current=mobileCalloutExportSize(app,key,property,mobileCalloutCard(key));
  const next=Math.max(48,current+(direction*MOBILE_CALLOUT_SIZE_STEPS[property]));
  app.style.setProperty(mobileCalloutCssVar(key,property),`${Math.round(next)}px`);
 }else if(property==="scale"){
  const current=mobileCalloutNumber(app,key,"scale",1);
  const next=Math.max(.45,Math.min(1.5,current+(direction*MOBILE_CALLOUT_SIZE_STEPS.scale)));
  app.style.setProperty(mobileCalloutCssVar(key,"scale"),Number(next.toFixed(2)));
 }else if(property==="z"){
  const current=mobileCalloutNumber(app,key,"z",20);
  app.style.setProperty(mobileCalloutCssVar(key,"z"),Math.max(1,Math.round(current+(direction*MOBILE_CALLOUT_SIZE_STEPS.z))));
 }else if(property==="nodeX"||property==="nodeY"){
  const cssProperty=property==="nodeX"?"node-x":"node-y";
  const current=mobileCalloutNumber(app,key,cssProperty,0);
  app.style.setProperty(mobileCalloutCssVar(key,cssProperty),`${Math.round(current+(direction*MOBILE_CALLOUT_SIZE_STEPS.node))}px`);
 }

 syncMobileCalloutCards();
 syncMobileNodeLayer();
 queueMobileCalloutDraw();
}

function mobileCalloutNodeOffset(anchorKey){
 if(!mobileCalloutPresentationActive())return {x:0,y:0};
 const key=MOBILE_CALLOUT_BY_ANCHOR[anchorKey];
 const app=mobileCalloutApp();
 if(!key||!app)return {x:0,y:0};
 return {
  x:mobileCalloutNumber(app,key,"node-x",0),
  y:mobileCalloutNumber(app,key,"node-y",0)
 };
}

function mobileCalloutNodePosition(key){
 const entry=MOBILE_CALLOUT_TRAITS[key];
 const stage=document.getElementById("stage");
 const layer=document.getElementById("traitCardLayer");
 if(!entry||!stage||!layer||typeof bodyAnchorMap!=="function")return null;
 const anchors=bodyAnchorMap();
 const anchor=anchors[entry.anchor];
 const playerBox=getPlayerRenderBox?.(stage.classList.contains("complete")?"complete":"build");
 if(!anchor||!playerBox)return null;
 const lr=layer.getBoundingClientRect();
 const offset=mobileCalloutNodeOffset(entry.anchor);
 return {
  x:(playerBox.left-lr.left)+(anchor[0]*playerBox.width)+offset.x,
  y:(playerBox.top-lr.top)+(anchor[1]*playerBox.height)+offset.y
 };
}

function syncMobileNodeLayer(active=mobileCalloutActive()){
 let nodeLayer=document.getElementById("mobileCalloutNodeLayer");
 if(!active){
  nodeLayer?.remove();
  return;
 }

 const cardLayer=document.getElementById("traitCardLayer");
 if(!cardLayer)return;
 if(!nodeLayer){
  nodeLayer=document.createElement("div");
  nodeLayer.id="mobileCalloutNodeLayer";
  nodeLayer.className="mobile-callout-node-layer";
  cardLayer.appendChild(nodeLayer);
 }

 nodeLayer.innerHTML=Object.entries(MOBILE_CALLOUT_TRAITS).map(([key,entry])=>{
  if(!mobileCalloutCard(key))return "";
  const point=mobileCalloutNodePosition(key);
  if(!point)return "";
  const selected=selectedMobileCalloutKey===key?" selected":"";
  return `<button type="button" class="mobile-callout-node${selected}" data-mobile-callout-node="${key}" style="left:${point.x.toFixed(1)}px;top:${point.y.toFixed(1)}px" aria-label="${entry.label} node"></button>`;
 }).join("");

 nodeLayer.querySelectorAll(".mobile-callout-node").forEach(node=>{
  if(node.dataset.mobileNodeDragBound==="true")return;
  node.addEventListener("pointerdown",startMobileNodeDrag);
  node.dataset.mobileNodeDragBound="true";
 });
}

function startMobileNodeDrag(event){
 if(!mobileCalloutActive())return;
 const key=event.currentTarget.dataset.mobileCalloutNode;
 const app=mobileCalloutApp();
 if(!key||!app)return;

 event.preventDefault();
 event.stopPropagation();
 selectMobileCallout(key);

 mobileNodeDrag={
  key,
  node:event.currentTarget,
  pointerId:event.pointerId,
  startClientX:event.clientX,
  startClientY:event.clientY,
  startX:mobileCalloutNumber(app,key,"node-x"),
  startY:mobileCalloutNumber(app,key,"node-y")
 };

 event.currentTarget.setPointerCapture?.(event.pointerId);
 document.body?.classList.add("mobile-callout-dragging");
 event.currentTarget.addEventListener("pointermove",moveMobileNodeDrag);
 event.currentTarget.addEventListener("pointerup",endMobileNodeDrag);
 event.currentTarget.addEventListener("pointercancel",endMobileNodeDrag);
}

function moveMobileNodeDrag(event){
 if(!mobileNodeDrag||event.pointerId!==mobileNodeDrag.pointerId)return;
 const app=mobileCalloutApp();
 if(!app)return;

 event.preventDefault();
 const nextX=Math.round(mobileNodeDrag.startX+(event.clientX-mobileNodeDrag.startClientX));
 const nextY=Math.round(mobileNodeDrag.startY+(event.clientY-mobileNodeDrag.startClientY));
 app.style.setProperty(mobileCalloutCssVar(mobileNodeDrag.key,"node-x"),`${nextX}px`);
 app.style.setProperty(mobileCalloutCssVar(mobileNodeDrag.key,"node-y"),`${nextY}px`);
 const point=mobileCalloutNodePosition(mobileNodeDrag.key);
 if(point){
  mobileNodeDrag.node.style.left=`${point.x.toFixed(1)}px`;
  mobileNodeDrag.node.style.top=`${point.y.toFixed(1)}px`;
 }
 queueMobileCalloutDraw();
}

function endMobileNodeDrag(event){
 if(!mobileNodeDrag||event.pointerId!==mobileNodeDrag.pointerId)return;
 const {node,pointerId}=mobileNodeDrag;
 node.releasePointerCapture?.(pointerId);
 node.removeEventListener("pointermove",moveMobileNodeDrag);
 node.removeEventListener("pointerup",endMobileNodeDrag);
 node.removeEventListener("pointercancel",endMobileNodeDrag);
 mobileNodeDrag=null;
 document.body?.classList.remove("mobile-callout-dragging");
 syncMobileNodeLayer();
 if(typeof drawCallouts==="function")drawCallouts();
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
   z:mobileCalloutExportValue(app,key,"z",20),
   nodeX:mobileCalloutExportValue(app,key,"node-x",0),
   nodeY:mobileCalloutExportValue(app,key,"node-y",0)
  };
  lines.push(`  ${key}: { x: ${data.x}, y: ${data.y}, width: ${data.width}, height: ${data.height}, scale: ${data.scale}, z: ${data.z}, nodeX: ${data.nodeX}, nodeY: ${data.nodeY} },`);
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

 const observer=new MutationObserver(records=>{
  const editorOnly=records.every(record=>
   [...record.addedNodes,...record.removedNodes].every(node=>
    node.id==="mobileCalloutNodeLayer"
    || node.classList?.contains("mobile-callout-node")
   )
  );
  if(editorOnly)return;
  syncMobileCalloutDebug();
 });
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
   syncMobileNodeLayer();
  });
 }

 syncMobileTabVisibility();
 syncMobileTabControls();
}

window.setMobileViewTab=setMobileViewTab;
window.syncMobileTabControls=syncMobileTabControls;
window.syncMobileCompletionTab=syncMobileCompletionTab;
window.syncMobileCalloutDebug=syncMobileCalloutDebug;
window.mobileCalloutNodeOffset=mobileCalloutNodeOffset;
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
