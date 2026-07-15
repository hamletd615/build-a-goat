// Developer-only callout layout editor.
// Set CALLOUT_LAYOUT_EDITOR to true, tune a profile, export config, paste values
// back into CALLOUT_LAYOUTS, then set CALLOUT_LAYOUT_EDITOR to false before ship.
const CALLOUT_LAYOUT_EDITOR=true;

const CALLOUT_LAYOUT_TRAITS={
 iq:{label:"Basketball IQ"},
 shooting:{label:"Shooting"},
 handling:{label:"Handle"},
 speed:{label:"Athleticism"},
 clutch:{label:"Clutch"},
 leadership:{label:"Leadership"},
 rebounding:{label:"Rebounding"},
 size:{label:"Size"},
 defense:{label:"Defense"}
};

const DEFAULT_CALLOUT_VALUES={x:0,y:0,width:112,height:56,scale:1,z:20,nodeX:0,nodeY:0};
const CALLOUT_LAYOUT_STEPS={width:4,height:4,scale:.05,z:1,node:2};
const CALLOUT_PROFILE_NAMES=["desktop","mobilePortrait","mobileLandscape"];

// CALLOUT LAYOUT SOURCE OF TRUTH
// Edit or paste exported values here after tuning.
// Profiles are independent: desktop, mobilePortrait, and mobileLandscape never
// write into each other.
// x: positive moves the card right, negative moves left.
// y: positive moves the card down, negative moves up.
// width/height: card box size.
// scale: visual card size without changing the saved width/height numbers.
// z: stacking order when cards overlap.
// nodeX/nodeY: mobile/desktop presentation offsets added after bodyAnchorMap().
const CALLOUT_LAYOUT_SOURCE={
 desktop:{
  iq:{x:89,y:125,width:262,height:126,scale:1,z:20,nodeX:-22,nodeY:-126},
  shooting:{x:87,y:278,width:254,height:131,scale:1,z:20,nodeX:-56,nodeY:-67},
  handling:{x:89,y:434,width:249,height:141,scale:1,z:20,nodeX:-87,nodeY:-27},
  speed:{x:80,y:595,width:263,height:122,scale:1,z:20,nodeX:-21,nodeY:-26},
  clutch:{x:971,y:83,width:252,height:116,scale:1,z:20,nodeX:-3,nodeY:-108},
  leadership:{x:971,y:208,width:240,height:108,scale:1,z:20,nodeX:-46,nodeY:-107},
  rebounding:{x:971,y:323,width:216,height:92,scale:1,z:20,nodeX:-2,nodeY:-86},
  size:{x:973,y:425,width:255,height:108,scale:1,z:20,nodeX:-21,nodeY:-62},
  defense:{x:976,y:544,width:246,height:124,scale:1,z:20,nodeX:15,nodeY:18}
 },
 mobilePortrait:{
  iq:{x:3,y:132,width:117,height:59,scale:1,z:20,nodeX:-14,nodeY:-50},
  shooting:{x:0,y:207,width:120,height:56,scale:1,z:20,nodeX:-28,nodeY:-29},
  handling:{x:6,y:326,width:109,height:62,scale:1,z:20,nodeX:-38,nodeY:-14},
  speed:{x:128,y:367,width:106,height:56,scale:1,z:20,nodeX:-8,nodeY:-26},
  clutch:{x:262,y:129,width:106,height:56,scale:1,z:20,nodeX:1,nodeY:-40},
  leadership:{x:264,y:194,width:106,height:56,scale:1,z:20,nodeX:-20,nodeY:-43},
  rebounding:{x:266,y:316,width:106,height:56,scale:1,z:20,nodeX:-8,nodeY:-38},
  size:{x:264,y:254,width:106,height:56,scale:1,z:20,nodeX:-7,nodeY:-32},
  defense:{x:265,y:378,width:107,height:57,scale:1,z:20,nodeX:2,nodeY:7}
 },
 mobileLandscape:{
  iq:{x:146,y:48,width:131,height:50,scale:.92,z:20,nodeX:-18,nodeY:-49},
  shooting:{x:166,y:103,width:118,height:48,scale:.92,z:20,nodeX:3,nodeY:-31},
  handling:{x:107,y:208,width:120,height:46,scale:.92,z:20,nodeX:7,nodeY:-11},
  speed:{x:112,y:151,width:124,height:50,scale:.92,z:20,nodeX:22,nodeY:-16},
  clutch:{x:482,y:26,width:103,height:48,scale:.92,z:20,nodeX:-16,nodeY:-35},
  leadership:{x:479,y:75,width:120,height:46,scale:.92,z:20,nodeX:-10,nodeY:-36},
  rebounding:{x:486,y:173,width:109,height:43,scale:.92,z:20,nodeX:-28,nodeY:-29},
  size:{x:483,y:123,width:116,height:48,scale:.92,z:20,nodeX:-12,nodeY:-23},
  defense:{x:487,y:218,width:109,height:40,scale:.92,z:20,nodeX:-28,nodeY:6}
 }
};

function cloneCalloutValue(value={}){
 return {
  x:normalizedNumber(value.x,DEFAULT_CALLOUT_VALUES.x),
  y:normalizedNumber(value.y,DEFAULT_CALLOUT_VALUES.y),
  width:normalizedNumber(value.width,DEFAULT_CALLOUT_VALUES.width),
  height:normalizedNumber(value.height,DEFAULT_CALLOUT_VALUES.height),
  scale:normalizedNumber(value.scale,DEFAULT_CALLOUT_VALUES.scale),
  z:normalizedNumber(value.z,DEFAULT_CALLOUT_VALUES.z),
  nodeX:normalizedNumber(value.nodeX,DEFAULT_CALLOUT_VALUES.nodeX),
  nodeY:normalizedNumber(value.nodeY,DEFAULT_CALLOUT_VALUES.nodeY)
 };
}

function cloneCalloutProfile(profile={}){
 return Object.fromEntries(Object.keys(CALLOUT_LAYOUT_TRAITS).map(key=>[
  key,
  cloneCalloutValue({...DEFAULT_CALLOUT_VALUES,...(profile[key]||{})})
 ]));
}

function cloneCalloutLayouts(layouts={}){
 return Object.fromEntries(CALLOUT_PROFILE_NAMES.map(profile=>[
  profile,
  cloneCalloutProfile(layouts[profile])
 ]));
}

const CALLOUT_LAYOUTS=cloneCalloutLayouts(CALLOUT_LAYOUT_SOURCE);
const BASE_CALLOUT_LAYOUTS=cloneCalloutLayouts(CALLOUT_LAYOUT_SOURCE);

let activeCalloutEditorProfile="";
let selectedCalloutKey="iq";
let calloutDragState=null;
let calloutResizeState=null;
let calloutNodeDragState=null;
let calloutDrawQueued=false;
let calloutPanelCollapsed=false;
let calloutPanelDragState=null;

function calloutRuntimeProfile(){
 if(window.matchMedia?.("(orientation: landscape) and (max-height: 520px)")?.matches)return"mobileLandscape";
 if(window.matchMedia?.("(max-width: 768px)")?.matches)return"mobilePortrait";
 return"desktop";
}

function calloutActiveProfile(){
 return CALLOUT_LAYOUT_EDITOR&&(activeCalloutEditorProfile in CALLOUT_LAYOUTS)
  ?activeCalloutEditorProfile
  :calloutRuntimeProfile();
}

function calloutLayoutFor(profile=calloutActiveProfile()){
 if(!(profile in CALLOUT_LAYOUTS))profile="desktop";
 if(!CALLOUT_LAYOUTS[profile])CALLOUT_LAYOUTS[profile]=cloneCalloutProfile();
 return CALLOUT_LAYOUTS[profile];
}

function calloutValue(key,profile=calloutActiveProfile()){
 return cloneCalloutValue(calloutLayoutFor(profile)[key]);
}

function calloutCard(key){
 return document.querySelector(`#traitCardLayer .tc-${key}`);
}

function calloutStage(){
 return document.getElementById("stage");
}

function clamp(n,min,max){
 return Math.max(min,Math.min(max,n));
}

function normalizedNumber(value,fallback=0){
 const parsed=Number(value);
 return Number.isFinite(parsed)?parsed:fallback;
}

function safeSetPointerCapture(element,pointerId){
 if(!element?.setPointerCapture||!Number.isFinite(pointerId)||!element.isConnected)return false;
 try{
  element.setPointerCapture(pointerId);
  return true;
 }catch{
  return false;
 }
}

function safeReleasePointerCapture(element,pointerId){
 if(!element?.releasePointerCapture||!Number.isFinite(pointerId)||!element.isConnected)return false;
 try{
  if(element.hasPointerCapture&&!element.hasPointerCapture(pointerId))return false;
  element.releasePointerCapture(pointerId);
  return true;
 }catch{
  return false;
 }
}

function calloutEditorMobileViewport(){
 return !!(
  window.matchMedia?.("(max-width: 768px)")?.matches
  || window.matchMedia?.("(orientation: landscape) and (max-height: 520px)")?.matches
 );
}

function patchCalloutValue(key,patch,profile=calloutActiveProfile()){
 if(!CALLOUT_LAYOUT_TRAITS[key])return;
 const layout=calloutLayoutFor(profile);
 layout[key]=cloneCalloutValue({...layout[key],...patch});
}

function queueCalloutLayoutDraw(){
 if(calloutDrawQueued)return;
 calloutDrawQueued=true;
 requestAnimationFrame(()=>{
  calloutDrawQueued=false;
  if(typeof drawCallouts==="function")drawCallouts();
  syncCalloutEditorNodeLayer();
 });
}

function calloutLayoutNodeOffset(key){
 const value=calloutValue(key,calloutActiveProfile());
 return {x:value.nodeX||0,y:value.nodeY||0};
}

function applyCalloutLayout(){
 const layer=document.getElementById("traitCardLayer");
 const stage=calloutStage();
 if(!layer||!stage)return;

 const profile=calloutActiveProfile();
 document.body.classList.toggle("callout-layout-editor-active",!!CALLOUT_LAYOUT_EDITOR);
 document.body.dataset.calloutProfile=profile;

 Object.keys(CALLOUT_LAYOUT_TRAITS).forEach(key=>{
  const card=calloutCard(key);
  if(!card)return;
  const value=calloutValue(key,profile);
  const stageRect=stage.getBoundingClientRect();
  const stageWidth=stage.clientWidth||stageRect.width;
  const stageHeight=stage.clientHeight||stageRect.height;
  const maxX=Math.max(0,stageWidth-(value.width*value.scale));
  const maxY=Math.max(0,stageHeight-(value.height*value.scale));
  const renderX=stageWidth?Math.round(clamp(value.x,0,maxX)):value.x;
  const renderY=stageHeight?Math.round(clamp(value.y,0,maxY)):value.y;
  card.dataset.calloutKey=key;
  card.dataset.calloutLabel=CALLOUT_LAYOUT_TRAITS[key].label;
  card.classList.toggle("callout-layout-selected",CALLOUT_LAYOUT_EDITOR&&selectedCalloutKey===key);
  card.style.setProperty("position","absolute","important");
  card.style.setProperty("left",`${renderX}px`,"important");
  card.style.setProperty("right","auto","important");
  card.style.setProperty("top",`${renderY}px`,"important");
  card.style.setProperty("width",`${value.width}px`,"important");
  card.style.setProperty("max-width",`${value.width}px`,"important");
  card.style.setProperty("height",`${value.height}px`,"important");
  card.style.setProperty("min-height",`${value.height}px`,"important");
  card.style.setProperty("transform",`scale(${value.scale})`,"important");
  card.style.setProperty("transform-origin","left top","important");
  card.style.setProperty("z-index",value.z,"important");

  if(CALLOUT_LAYOUT_EDITOR)bindCalloutCard(card,key);
 });

 syncCalloutEditorPanel();
 syncCalloutEditorNodeLayer();
}

function bindCalloutCard(card,key){
 if(card.dataset.calloutEditorBound==="true")return;
 card.addEventListener("pointerdown",startCalloutCardDrag);
 card.dataset.calloutEditorBound="true";
}

function selectCallout(key){
 if(!CALLOUT_LAYOUT_TRAITS[key])return;
 selectedCalloutKey=key;
 applyCalloutLayout();
 queueCalloutLayoutDraw();
}

function markCalloutSelection(key){
 if(!CALLOUT_LAYOUT_TRAITS[key])return;
 selectedCalloutKey=key;
 document.querySelectorAll("#traitCardLayer .trait-card").forEach(card=>{
  card.classList.toggle("callout-layout-selected",card.dataset.calloutKey===key);
 });
 document.querySelectorAll(".callout-layout-node").forEach(node=>{
  node.classList.toggle("selected",node.dataset.calloutNode===key);
 });
 const label=document.querySelector(".callout-layout-selected-label");
 if(label)label.textContent=`Active: ${calloutActiveProfile()} / ${CALLOUT_LAYOUT_TRAITS[key]?.label||key}`;
}

function startCalloutCardDrag(event){
 if(!CALLOUT_LAYOUT_EDITOR||event.target.closest(".callout-resize-handle"))return;
 const key=event.currentTarget.dataset.calloutKey;
 if(!key)return;
 event.preventDefault();
 event.stopPropagation();
 selectCallout(key);
 const value=calloutValue(key);
 calloutDragState={key,pointerId:event.pointerId,startClientX:event.clientX,startClientY:event.clientY,startX:value.x,startY:value.y,card:event.currentTarget};
 safeSetPointerCapture(event.currentTarget,event.pointerId);
 document.body.classList.add("callout-layout-dragging");
 event.currentTarget.addEventListener("pointermove",moveCalloutCardDrag);
 event.currentTarget.addEventListener("pointerup",endCalloutCardDrag);
 event.currentTarget.addEventListener("pointercancel",endCalloutCardDrag);
}

function moveCalloutCardDrag(event){
 if(!calloutDragState||event.pointerId!==calloutDragState.pointerId)return;
 event.preventDefault();
 const stage=calloutStage();
 const value=calloutValue(calloutDragState.key);
 const maxX=Math.max(0,(stage?.clientWidth||0)-(value.width*value.scale));
 const maxY=Math.max(0,(stage?.clientHeight||0)-(value.height*value.scale));
 patchCalloutValue(calloutDragState.key,{
  x:Math.round(clamp(calloutDragState.startX+(event.clientX-calloutDragState.startClientX),0,maxX)),
  y:Math.round(clamp(calloutDragState.startY+(event.clientY-calloutDragState.startClientY),0,maxY))
 });
 applyCalloutLayout();
 queueCalloutLayoutDraw();
}

function endCalloutCardDrag(event){
 if(!calloutDragState||event.pointerId!==calloutDragState.pointerId)return;
 const {card,pointerId}=calloutDragState;
 safeReleasePointerCapture(card,pointerId);
 card.removeEventListener("pointermove",moveCalloutCardDrag);
 card.removeEventListener("pointerup",endCalloutCardDrag);
 card.removeEventListener("pointercancel",endCalloutCardDrag);
 calloutDragState=null;
 document.body.classList.remove("callout-layout-dragging");
 queueCalloutLayoutDraw();
}

function startCalloutResize(event){
 if(!CALLOUT_LAYOUT_EDITOR)return;
 const key=event.currentTarget.closest(".trait-card")?.dataset.calloutKey;
 if(!key)return;
 event.preventDefault();
 event.stopPropagation();
 selectCallout(key);
 const value=calloutValue(key);
 calloutResizeState={key,pointerId:event.pointerId,startClientX:event.clientX,startClientY:event.clientY,startWidth:value.width,startHeight:value.height,handle:event.currentTarget};
 safeSetPointerCapture(event.currentTarget,event.pointerId);
 document.body.classList.add("callout-layout-dragging");
 event.currentTarget.addEventListener("pointermove",moveCalloutResize);
 event.currentTarget.addEventListener("pointerup",endCalloutResize);
 event.currentTarget.addEventListener("pointercancel",endCalloutResize);
}

function moveCalloutResize(event){
 if(!calloutResizeState||event.pointerId!==calloutResizeState.pointerId)return;
 event.preventDefault();
 patchCalloutValue(calloutResizeState.key,{
  width:Math.round(Math.max(48,calloutResizeState.startWidth+(event.clientX-calloutResizeState.startClientX))),
  height:Math.round(Math.max(34,calloutResizeState.startHeight+(event.clientY-calloutResizeState.startClientY)))
 });
 applyCalloutLayout();
 queueCalloutLayoutDraw();
}

function endCalloutResize(event){
 if(!calloutResizeState||event.pointerId!==calloutResizeState.pointerId)return;
 const {handle,pointerId}=calloutResizeState;
 safeReleasePointerCapture(handle,pointerId);
 handle.removeEventListener("pointermove",moveCalloutResize);
 handle.removeEventListener("pointerup",endCalloutResize);
 handle.removeEventListener("pointercancel",endCalloutResize);
 calloutResizeState=null;
 document.body.classList.remove("callout-layout-dragging");
 queueCalloutLayoutDraw();
}

function calloutNodePoint(key){
 const stage=calloutStage();
 const layer=document.getElementById("traitCardLayer");
 const anchor=bodyAnchorMap?.()[key];
 const playerBox=getPlayerRenderBox?.(stage?.classList.contains("complete")?"complete":"build");
 if(!stage||!layer||!anchor||!playerBox)return null;
 const lr=layer.getBoundingClientRect();
 const offset=calloutLayoutNodeOffset(key);
 return {
  x:(playerBox.left-lr.left)+(anchor[0]*playerBox.width)+offset.x,
  y:(playerBox.top-lr.top)+(anchor[1]*playerBox.height)+offset.y
 };
}

function syncCalloutEditorNodeLayer(){
 let layer=document.getElementById("calloutLayoutNodeLayer");
 const cardLayer=document.getElementById("traitCardLayer");
 if(!CALLOUT_LAYOUT_EDITOR||!cardLayer){
  layer?.remove();
  return;
 }
 if(!layer){
  layer=document.createElement("div");
  layer.id="calloutLayoutNodeLayer";
  layer.className="callout-layout-node-layer";
  cardLayer.appendChild(layer);
 }
 layer.innerHTML=Object.keys(CALLOUT_LAYOUT_TRAITS).map(key=>{
  if(!calloutCard(key))return"";
  const point=calloutNodePoint(key);
  if(!point)return"";
  return `<button type="button" class="callout-layout-node${selectedCalloutKey===key?" selected":""}" data-callout-node="${key}" style="left:${point.x.toFixed(1)}px;top:${point.y.toFixed(1)}px" aria-label="${CALLOUT_LAYOUT_TRAITS[key].label} node"></button>`;
 }).join("");
 layer.querySelectorAll(".callout-layout-node").forEach(node=>{
  node.addEventListener("pointerdown",startCalloutNodeDrag);
 });
}

function startCalloutNodeDrag(event){
 if(!CALLOUT_LAYOUT_EDITOR)return;
 const key=event.currentTarget.dataset.calloutNode;
 if(!key)return;
 event.preventDefault();
 event.stopPropagation();
 markCalloutSelection(key);
 const value=calloutValue(key);
 calloutNodeDragState={key,pointerId:event.pointerId,startClientX:event.clientX,startClientY:event.clientY,startX:value.nodeX,startY:value.nodeY,node:event.currentTarget};
 safeSetPointerCapture(event.currentTarget,event.pointerId);
 document.body.classList.add("callout-layout-dragging");
 event.currentTarget.addEventListener("pointermove",moveCalloutNodeDrag);
 event.currentTarget.addEventListener("pointerup",endCalloutNodeDrag);
 event.currentTarget.addEventListener("pointercancel",endCalloutNodeDrag);
 document.addEventListener("pointermove",moveCalloutNodeDrag);
 document.addEventListener("pointerup",endCalloutNodeDrag);
 document.addEventListener("pointercancel",endCalloutNodeDrag);
}

function moveCalloutNodeDrag(event){
 if(!calloutNodeDragState||event.pointerId!==calloutNodeDragState.pointerId)return;
 event.preventDefault();
 patchCalloutValue(calloutNodeDragState.key,{
  nodeX:Math.round(calloutNodeDragState.startX+(event.clientX-calloutNodeDragState.startClientX)),
  nodeY:Math.round(calloutNodeDragState.startY+(event.clientY-calloutNodeDragState.startClientY))
 });
 queueCalloutLayoutDraw();
}

function endCalloutNodeDrag(event){
 if(!calloutNodeDragState||event.pointerId!==calloutNodeDragState.pointerId)return;
 const {node,pointerId}=calloutNodeDragState;
 safeReleasePointerCapture(node,pointerId);
 node.removeEventListener("pointermove",moveCalloutNodeDrag);
 node.removeEventListener("pointerup",endCalloutNodeDrag);
 node.removeEventListener("pointercancel",endCalloutNodeDrag);
 document.removeEventListener("pointermove",moveCalloutNodeDrag);
 document.removeEventListener("pointerup",endCalloutNodeDrag);
 document.removeEventListener("pointercancel",endCalloutNodeDrag);
 calloutNodeDragState=null;
 document.body.classList.remove("callout-layout-dragging");
 queueCalloutLayoutDraw();
}

function addResizeHandles(){
 if(!CALLOUT_LAYOUT_EDITOR)return;
 document.querySelectorAll("#traitCardLayer .trait-card").forEach(card=>{
  if(card.querySelector(".callout-resize-handle"))return;
  const handle=document.createElement("button");
  handle.type="button";
  handle.className="callout-resize-handle";
  handle.setAttribute("aria-label","Resize callout");
  handle.addEventListener("pointerdown",startCalloutResize);
  card.appendChild(handle);
 });
}

function syncCalloutEditorPanel(){
 let panel=document.getElementById("calloutLayoutEditorPanel");
 if(!CALLOUT_LAYOUT_EDITOR){
  panel?.remove();
  return;
 }
 if(!panel){
  panel=document.createElement("div");
  panel.id="calloutLayoutEditorPanel";
  panel.className="callout-layout-editor-panel";
  panel.innerHTML=`
   <div class="callout-layout-toolbar-head" data-editor-drag-handle="true">
    <div class="callout-layout-title">Layout Editor</div>
    <button type="button" class="callout-layout-collapse" data-action="toggleCollapse" aria-label="Collapse layout editor">-</button>
   </div>
   <div class="callout-layout-body">
   <label>Profile <select id="calloutProfileSelect">
    <option value="desktop">Desktop</option>
    <option value="mobilePortrait">Mobile Portrait</option>
    <option value="mobileLandscape">Mobile Landscape</option>
   </select></label>
   <div class="callout-layout-selected-label"></div>
   <div class="callout-layout-actions">
    <button type="button" data-adjust="width" data-delta="-1">Width -</button>
    <button type="button" data-adjust="width" data-delta="1">Width +</button>
    <button type="button" data-adjust="height" data-delta="-1">Height -</button>
    <button type="button" data-adjust="height" data-delta="1">Height +</button>
    <button type="button" data-adjust="scale" data-delta="-1">Scale -</button>
    <button type="button" data-adjust="scale" data-delta="1">Scale +</button>
    <button type="button" data-adjust="nodeX" data-delta="-1">Node X -</button>
    <button type="button" data-adjust="nodeX" data-delta="1">Node X +</button>
    <button type="button" data-adjust="nodeY" data-delta="-1">Node Y -</button>
    <button type="button" data-adjust="nodeY" data-delta="1">Node Y +</button>
    <button type="button" data-action="center">Center selected</button>
    <button type="button" data-action="resetSelected">Reset selected card</button>
    <button type="button" data-action="front">Bring to front</button>
    <button type="button" data-action="back">Send backward</button>
    <button type="button" data-action="resetProfile">Reset current layout profile</button>
    <button type="button" data-action="exportCurrent">Export Current Profile</button>
    <button type="button" data-action="exportAll">Export All Profiles</button>
    <button type="button" data-action="import">Import/Paste Layout</button>
   </div>
   </div>
  `;
  panel.addEventListener("click",handleEditorAction);
  panel.querySelector("[data-editor-drag-handle]").addEventListener("pointerdown",startCalloutPanelDrag);
  panel.querySelector("#calloutProfileSelect").addEventListener("change",event=>{
   activeCalloutEditorProfile=event.target.value;
   applyCalloutLayout();
   queueCalloutLayoutDraw();
  });
 document.body.appendChild(panel);
 }
 if(!activeCalloutEditorProfile)activeCalloutEditorProfile=calloutRuntimeProfile();
 panel.classList.toggle("collapsed",calloutPanelCollapsed);
 panel.querySelector(".callout-layout-collapse").textContent=calloutPanelCollapsed?"+":"-";
 panel.querySelector(".callout-layout-collapse").setAttribute("aria-label",calloutPanelCollapsed?"Expand layout editor":"Collapse layout editor");
 panel.querySelector("#calloutProfileSelect").value=activeCalloutEditorProfile;
 panel.querySelector(".callout-layout-selected-label").textContent=`Active: ${activeCalloutEditorProfile} / ${CALLOUT_LAYOUT_TRAITS[selectedCalloutKey]?.label||selectedCalloutKey}`;
 addResizeHandles();
}

function handleEditorAction(event){
 const adjustButton=event.target.closest("button[data-adjust]");
 if(adjustButton){
  adjustSelectedCallout(adjustButton.dataset.adjust,Number(adjustButton.dataset.delta)||0);
  return;
 }
 const button=event.target.closest("button[data-action]");
 if(!button)return;
 const action=button.dataset.action;
 if(action==="toggleCollapse")toggleCalloutPanelCollapsed();
 if(action==="center")centerSelectedCallout();
 if(action==="resetSelected")resetSelectedCallout();
 if(action==="front")bringSelectedCalloutForward(true);
 if(action==="back")bringSelectedCalloutForward(false);
 if(action==="resetProfile")resetCurrentCalloutProfile();
 if(action==="exportCurrent")exportCalloutLayout(false);
 if(action==="exportAll")exportCalloutLayout(true);
 if(action==="import")importCalloutLayout();
}

function toggleCalloutPanelCollapsed(){
 calloutPanelCollapsed=!calloutPanelCollapsed;
 syncCalloutEditorPanel();
}

function startCalloutPanelDrag(event){
 if(!CALLOUT_LAYOUT_EDITOR||!calloutEditorMobileViewport())return;
 if(event.target.closest("button,select"))return;
 const panel=document.getElementById("calloutLayoutEditorPanel");
 if(!panel)return;
 event.preventDefault();
 event.stopPropagation();
 const rect=panel.getBoundingClientRect();
 calloutPanelDragState={
  pointerId:event.pointerId,
  startClientX:event.clientX,
  startClientY:event.clientY,
  startLeft:rect.left,
  startTop:rect.top,
  panel,
  handle:event.currentTarget
 };
 safeSetPointerCapture(event.currentTarget,event.pointerId);
 document.body.classList.add("callout-layout-dragging");
 document.addEventListener("pointermove",moveCalloutPanelDrag);
 document.addEventListener("pointerup",endCalloutPanelDrag);
 document.addEventListener("pointercancel",endCalloutPanelDrag);
}

function moveCalloutPanelDrag(event){
 if(!calloutPanelDragState||event.pointerId!==calloutPanelDragState.pointerId)return;
 event.preventDefault();
 const {panel,startClientX,startClientY,startLeft,startTop}=calloutPanelDragState;
 const rect=panel.getBoundingClientRect();
 const margin=8;
 const maxLeft=Math.max(margin,window.innerWidth-rect.width-margin);
 const maxTop=Math.max(margin,window.innerHeight-rect.height-margin);
 const nextLeft=clamp(startLeft+(event.clientX-startClientX),margin,maxLeft);
 const nextTop=clamp(startTop+(event.clientY-startClientY),margin,maxTop);
 panel.style.left=`${Math.round(nextLeft)}px`;
 panel.style.top=`${Math.round(nextTop)}px`;
 panel.style.right="auto";
 panel.style.bottom="auto";
}

function endCalloutPanelDrag(event){
 if(!calloutPanelDragState||event.pointerId!==calloutPanelDragState.pointerId)return;
 safeReleasePointerCapture(calloutPanelDragState.handle,event.pointerId);
 document.removeEventListener("pointermove",moveCalloutPanelDrag);
 document.removeEventListener("pointerup",endCalloutPanelDrag);
 document.removeEventListener("pointercancel",endCalloutPanelDrag);
 calloutPanelDragState=null;
 document.body.classList.remove("callout-layout-dragging");
}

function adjustSelectedCallout(property,direction){
 if(!selectedCalloutKey||!direction)return;
 const value=calloutValue(selectedCalloutKey);
 if(property==="width"){
  patchCalloutValue(selectedCalloutKey,{width:Math.max(48,Math.round(value.width+(direction*CALLOUT_LAYOUT_STEPS.width)))});
 }else if(property==="height"){
  patchCalloutValue(selectedCalloutKey,{height:Math.max(34,Math.round(value.height+(direction*CALLOUT_LAYOUT_STEPS.height)))});
 }else if(property==="scale"){
  patchCalloutValue(selectedCalloutKey,{scale:Number(clamp(value.scale+(direction*CALLOUT_LAYOUT_STEPS.scale),.45,1.5).toFixed(2))});
 }else if(property==="nodeX"){
  patchCalloutValue(selectedCalloutKey,{nodeX:Math.round((value.nodeX||0)+(direction*CALLOUT_LAYOUT_STEPS.node))});
 }else if(property==="nodeY"){
  patchCalloutValue(selectedCalloutKey,{nodeY:Math.round((value.nodeY||0)+(direction*CALLOUT_LAYOUT_STEPS.node))});
 }
 applyCalloutLayout();
 queueCalloutLayoutDraw();
}

function centerSelectedCallout(){
 const stage=calloutStage();
 const value=calloutValue(selectedCalloutKey);
 if(!stage)return;
 patchCalloutValue(selectedCalloutKey,{
  x:Math.round(Math.max(0,(stage.clientWidth-(value.width*value.scale))/2)),
  y:Math.round(Math.max(0,(stage.clientHeight-(value.height*value.scale))/2))
 });
 applyCalloutLayout();
 queueCalloutLayoutDraw();
}

function resetSelectedCallout(){
 const profile=calloutActiveProfile();
 CALLOUT_LAYOUTS[profile][selectedCalloutKey]=cloneCalloutValue(BASE_CALLOUT_LAYOUTS[profile][selectedCalloutKey]);
 applyCalloutLayout();
 queueCalloutLayoutDraw();
}

function bringSelectedCalloutForward(front){
 const value=calloutValue(selectedCalloutKey);
 patchCalloutValue(selectedCalloutKey,{z:front?value.z+1:Math.max(1,value.z-1)});
 applyCalloutLayout();
 queueCalloutLayoutDraw();
}

function resetCurrentCalloutProfile(){
 const profile=calloutActiveProfile();
 CALLOUT_LAYOUTS[profile]=cloneCalloutProfile(BASE_CALLOUT_LAYOUTS[profile]);
 applyCalloutLayout();
 queueCalloutLayoutDraw();
}

function serializeCalloutLayout(profile){
 const body=Object.keys(CALLOUT_LAYOUT_TRAITS).map(key=>{
  const v=calloutValue(key,profile);
  return `    ${key}: { x: ${v.x}, y: ${v.y}, width: ${v.width}, height: ${v.height}, scale: ${v.scale}, z: ${v.z}, nodeX: ${v.nodeX}, nodeY: ${v.nodeY} }`;
 }).join(",\n");
 return `  ${profile}: {\n${body}\n  }`;
}

async function copyCalloutExport(output){
 console.log(output);
 try{
  await navigator.clipboard?.writeText(output);
  toast?.("Layout copied.");
 }catch(error){
  console.warn("Layout export printed to console only.",error);
  toast?.("Layout printed to console.");
 }
}

function exportCalloutLayout(all){
 const output=all
  ?`const CALLOUT_LAYOUTS = {\n${CALLOUT_PROFILE_NAMES.map(serializeCalloutLayout).join(",\n")}\n};`
  :`const CALLOUT_LAYOUTS = {\n${serializeCalloutLayout(calloutActiveProfile())}\n};`;
 copyCalloutExport(output);
}

function importCalloutLayout(){
 const pasted=prompt("Paste CALLOUT_LAYOUTS or a profile object:");
 if(!pasted)return;
 try{
  const parsed=Function(`"use strict"; return (${pasted.replace(/^const\s+CALLOUT_LAYOUTS\s*=\s*/,"").replace(/;\s*$/,"")});`)();
  if(parsed.desktop||parsed.mobilePortrait||parsed.mobileLandscape){
   CALLOUT_PROFILE_NAMES.forEach(profile=>{
    if(parsed[profile])CALLOUT_LAYOUTS[profile]=cloneCalloutProfile({...CALLOUT_LAYOUTS[profile],...parsed[profile]});
   });
  }else{
   const profile=calloutActiveProfile();
   CALLOUT_LAYOUTS[profile]=cloneCalloutProfile({...CALLOUT_LAYOUTS[profile],...parsed});
  }
  applyCalloutLayout();
  queueCalloutLayoutDraw();
 }catch(error){
  console.warn("Could not import layout.",error);
  toast?.("Layout import failed.");
 }
}

function initCalloutLayoutEditor(){
 activeCalloutEditorProfile=calloutRuntimeProfile();
 window.addEventListener("resize",()=>{
  if(!CALLOUT_LAYOUT_EDITOR)applyCalloutLayout();
  queueCalloutLayoutDraw();
 });
}

window.CALLOUT_LAYOUT_EDITOR=CALLOUT_LAYOUT_EDITOR;
window.CALLOUT_LAYOUTS=CALLOUT_LAYOUTS;
window.applyCalloutLayout=applyCalloutLayout;
window.calloutLayoutNodeOffset=calloutLayoutNodeOffset;
window.syncCalloutEditorNodeLayer=syncCalloutEditorNodeLayer;
document.addEventListener("DOMContentLoaded",initCalloutLayoutEditor);
