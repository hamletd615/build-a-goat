// Developer-only callout layout editor.
// Set CALLOUT_LAYOUT_EDITOR to true, tune a profile, export config, paste values
// back into CALLOUT_LAYOUTS, then set CALLOUT_LAYOUT_EDITOR to false before ship.
const CALLOUT_LAYOUT_EDITOR=false;

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
const CALLOUT_LAYOUTS={
 desktop:{
  iq:{x:148,y:120,width:216,height:92,scale:1,z:20,nodeX:0,nodeY:0},
  shooting:{x:148,y:242,width:216,height:92,scale:1,z:20,nodeX:0,nodeY:0},
  handling:{x:148,y:364,width:216,height:92,scale:1,z:20,nodeX:0,nodeY:0},
  speed:{x:148,y:486,width:216,height:92,scale:1,z:20,nodeX:0,nodeY:0},
  clutch:{x:990,y:100,width:216,height:92,scale:1,z:20,nodeX:0,nodeY:0},
  leadership:{x:990,y:222,width:216,height:92,scale:1,z:20,nodeX:0,nodeY:0},
  rebounding:{x:990,y:342,width:216,height:92,scale:1,z:20,nodeX:0,nodeY:0},
  size:{x:990,y:464,width:216,height:92,scale:1,z:20,nodeX:0,nodeY:0},
  defense:{x:990,y:586,width:216,height:92,scale:1,z:20,nodeX:0,nodeY:0}
 },
 mobilePortrait:{
  iq:{x:6,y:110,width:106,height:56,scale:1,z:20,nodeX:0,nodeY:0},
  shooting:{x:6,y:176,width:106,height:56,scale:1,z:20,nodeX:0,nodeY:0},
  handling:{x:6,y:242,width:106,height:56,scale:1,z:20,nodeX:0,nodeY:0},
  speed:{x:6,y:308,width:106,height:56,scale:1,z:20,nodeX:0,nodeY:0},
  size:{x:6,y:374,width:106,height:56,scale:1,z:20,nodeX:0,nodeY:0},
  clutch:{x:262,y:144,width:106,height:56,scale:1,z:20,nodeX:0,nodeY:0},
  leadership:{x:262,y:210,width:106,height:56,scale:1,z:20,nodeX:0,nodeY:0},
  rebounding:{x:262,y:276,width:106,height:56,scale:1,z:20,nodeX:0,nodeY:0},
  defense:{x:262,y:342,width:106,height:56,scale:1,z:20,nodeX:0,nodeY:0}
 },
 mobileLandscape:{
  iq:{x:6,y:48,width:92,height:42,scale:.92,z:20,nodeX:0,nodeY:0},
  shooting:{x:6,y:90,width:92,height:42,scale:.92,z:20,nodeX:0,nodeY:0},
  handling:{x:6,y:132,width:92,height:42,scale:.92,z:20,nodeX:0,nodeY:0},
  speed:{x:6,y:174,width:92,height:42,scale:.92,z:20,nodeX:0,nodeY:0},
  size:{x:6,y:216,width:92,height:42,scale:.92,z:20,nodeX:0,nodeY:0},
  clutch:{x:510,y:58,width:92,height:42,scale:.92,z:20,nodeX:0,nodeY:0},
  leadership:{x:510,y:100,width:92,height:42,scale:.92,z:20,nodeX:0,nodeY:0},
  rebounding:{x:510,y:142,width:92,height:42,scale:.92,z:20,nodeX:0,nodeY:0},
  defense:{x:510,y:184,width:92,height:42,scale:.92,z:20,nodeX:0,nodeY:0}
 }
};
const BASE_CALLOUT_LAYOUTS=JSON.parse(JSON.stringify(CALLOUT_LAYOUTS));

let activeCalloutEditorProfile="";
let selectedCalloutKey="iq";
let calloutDragState=null;
let calloutResizeState=null;
let calloutNodeDragState=null;
let calloutDrawQueued=false;

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
 return CALLOUT_LAYOUTS[profile]||CALLOUT_LAYOUTS.desktop;
}

function calloutValue(key,profile=calloutActiveProfile()){
 return {...DEFAULT_CALLOUT_VALUES,...(calloutLayoutFor(profile)[key]||{})};
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

function patchCalloutValue(key,patch,profile=calloutActiveProfile()){
 const layout=calloutLayoutFor(profile);
 layout[key]={...DEFAULT_CALLOUT_VALUES,...layout[key],...patch};
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
 const value=calloutValue(key);
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

function startCalloutCardDrag(event){
 if(!CALLOUT_LAYOUT_EDITOR||event.target.closest(".callout-resize-handle"))return;
 const key=event.currentTarget.dataset.calloutKey;
 if(!key)return;
 event.preventDefault();
 event.stopPropagation();
 selectCallout(key);
 const value=calloutValue(key);
 calloutDragState={key,pointerId:event.pointerId,startClientX:event.clientX,startClientY:event.clientY,startX:value.x,startY:value.y,card:event.currentTarget};
 event.currentTarget.setPointerCapture?.(event.pointerId);
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
 card.releasePointerCapture?.(pointerId);
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
 event.currentTarget.setPointerCapture?.(event.pointerId);
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
 handle.releasePointerCapture?.(pointerId);
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
 selectCallout(key);
 const value=calloutValue(key);
 calloutNodeDragState={key,pointerId:event.pointerId,startClientX:event.clientX,startClientY:event.clientY,startX:value.nodeX,startY:value.nodeY,node:event.currentTarget};
 event.currentTarget.setPointerCapture?.(event.pointerId);
 document.body.classList.add("callout-layout-dragging");
 event.currentTarget.addEventListener("pointermove",moveCalloutNodeDrag);
 event.currentTarget.addEventListener("pointerup",endCalloutNodeDrag);
 event.currentTarget.addEventListener("pointercancel",endCalloutNodeDrag);
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
 node.releasePointerCapture?.(pointerId);
 node.removeEventListener("pointermove",moveCalloutNodeDrag);
 node.removeEventListener("pointerup",endCalloutNodeDrag);
 node.removeEventListener("pointercancel",endCalloutNodeDrag);
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
   <div class="callout-layout-title">Layout Editor</div>
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
  `;
  panel.addEventListener("click",handleEditorAction);
  panel.querySelector("#calloutProfileSelect").addEventListener("change",event=>{
   activeCalloutEditorProfile=event.target.value;
   applyCalloutLayout();
   queueCalloutLayoutDraw();
  });
  document.body.appendChild(panel);
 }
 if(!activeCalloutEditorProfile)activeCalloutEditorProfile=calloutRuntimeProfile();
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
 if(action==="center")centerSelectedCallout();
 if(action==="resetSelected")resetSelectedCallout();
 if(action==="front")bringSelectedCalloutForward(true);
 if(action==="back")bringSelectedCalloutForward(false);
 if(action==="resetProfile")resetCurrentCalloutProfile();
 if(action==="exportCurrent")exportCalloutLayout(false);
 if(action==="exportAll")exportCalloutLayout(true);
 if(action==="import")importCalloutLayout();
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
 CALLOUT_LAYOUTS[profile][selectedCalloutKey]={...DEFAULT_CALLOUT_VALUES,...BASE_CALLOUT_LAYOUTS[profile][selectedCalloutKey]};
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
 Object.keys(CALLOUT_LAYOUT_TRAITS).forEach(key=>{
  CALLOUT_LAYOUTS[profile][key]={...DEFAULT_CALLOUT_VALUES,...BASE_CALLOUT_LAYOUTS[profile][key]};
 });
 applyCalloutLayout();
 queueCalloutLayoutDraw();
}

function serializeCalloutLayout(profile){
 const body=Object.entries(calloutLayoutFor(profile)).map(([key,value])=>{
  const v={...DEFAULT_CALLOUT_VALUES,...value};
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
  ?`const CALLOUT_LAYOUTS = {\n${["desktop","mobilePortrait","mobileLandscape"].map(serializeCalloutLayout).join(",\n")}\n};`
  :`const CALLOUT_LAYOUTS = {\n${serializeCalloutLayout(calloutActiveProfile())}\n};`;
 copyCalloutExport(output);
}

function importCalloutLayout(){
 const pasted=prompt("Paste CALLOUT_LAYOUTS or a profile object:");
 if(!pasted)return;
 try{
  const parsed=Function(`"use strict"; return (${pasted.replace(/^const\s+CALLOUT_LAYOUTS\s*=\s*/,"").replace(/;\s*$/,"")});`)();
  if(parsed.desktop||parsed.mobilePortrait||parsed.mobileLandscape){
   ["desktop","mobilePortrait","mobileLandscape"].forEach(profile=>{
    if(parsed[profile])CALLOUT_LAYOUTS[profile]={...CALLOUT_LAYOUTS[profile],...parsed[profile]};
   });
  }else{
   CALLOUT_LAYOUTS[calloutActiveProfile()]={...CALLOUT_LAYOUTS[calloutActiveProfile()],...parsed};
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
