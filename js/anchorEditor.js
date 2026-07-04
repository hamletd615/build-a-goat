const ANCHOR_STORAGE_KEY = "buildAGoat.bodyAnchorMap";

const DEFAULT_BODY_ANCHORS = {
 iq:[.524,.292],
 shooting:[.436,.405],
 handling:[.382,.498],
 speed:[.421,.643],
 clutch:[.536,.400],
 leadership:[.485,.405],
 rebounding:[.576,.592],
 size:[.514,.463],
 defense:[.573,.485]
};

const TRAIT_CARD_SIDES = {
 iq:"left",
 shooting:"left",
 handling:"left",
 speed:"left",
 clutch:"right",
 leadership:"right",
 rebounding:"right",
 size:"right",
 defense:"right"
};

const TRAIT_CARD_ROW_OFFSET = {
 iq:.58,
 shooting:.58,
 handling:.58,
 speed:.58,
 clutch:.58,
 leadership:.58,
 rebounding:.58,
 size:.42,
 defense:.42
};

const TAB_TRAITS = {
 physical:["size","speed","defense"],
 mental:["iq","clutch","leadership"],
 skill:["shooting","handling","rebounding"]
};

let bodyAnchorState = loadBodyAnchorMap();
window.isAnchorDragging = false;

function loadBodyAnchorMap(){
 try{
  const saved=JSON.parse(localStorage.getItem(ANCHOR_STORAGE_KEY)||"{}");
  return Object.fromEntries(Object.entries(DEFAULT_BODY_ANCHORS).map(([key,value])=>{
   const candidate=saved[key];
   return [key,Array.isArray(candidate)&&candidate.length===2?candidate:value];
  }));
 }catch{
  return {...DEFAULT_BODY_ANCHORS};
 }
}

function saveBodyAnchorMap(){
 localStorage.setItem(ANCHOR_STORAGE_KEY,JSON.stringify(bodyAnchorState));
}

function bodyAnchorMap(){
 return bodyAnchorState;
}

function resetBodyAnchorMap(){
 bodyAnchorState={...DEFAULT_BODY_ANCHORS};
 saveBodyAnchorMap();
 drawCallouts();
 renderAnchorEditor();
}

function visibleAnchorKeys(){
 const complete=document.getElementById("stage")?.classList.contains("complete");
 return complete?Object.keys(DEFAULT_BODY_ANCHORS):(TAB_TRAITS[activeStageTab]||TAB_TRAITS.physical);
}

function ensureAnchorEditor(){
 if(document.getElementById("anchorEditor"))return;
 const editor=document.createElement("div");
 editor.id="anchorEditor";
 editor.className="anchor-editor";
 editor.innerHTML=`
  <div class="anchor-editor-head">
   <b>Anchors</b>
   <button type="button" id="anchorEditorToggle">Edit</button>
  </div>
  <div class="anchor-editor-body">
   <div class="anchor-editor-help">Drag points on the player. Values save automatically.</div>
   <div id="anchorEditorList"></div>
   <button type="button" id="anchorEditorReset">Reset Anchors</button>
  </div>
 `;
 document.body.appendChild(editor);
 document.getElementById("anchorEditorToggle").addEventListener("click",()=>{
  editor.classList.toggle("editing");
  renderAnchorEditor();
 });
 document.getElementById("anchorEditorReset").addEventListener("click",resetBodyAnchorMap);
}

function renderAnchorEditor(){
 ensureAnchorEditor();
 const list=document.getElementById("anchorEditorList");
 if(!list)return;
 list.innerHTML=visibleAnchorKeys().map(key=>{
  const p=bodyAnchorState[key]||DEFAULT_BODY_ANCHORS[key];
  return `<div class="anchor-editor-row" data-trait="${key}"><span>${key}</span><code>${p[0].toFixed(3)}, ${p[1].toFixed(3)}</code></div>`;
 }).join("");
 renderAnchorHandles();
}

function updateAnchorEditorRow(key){
 const row=document.querySelector(`#anchorEditorList .anchor-editor-row[data-trait="${key}"] code`);
 const p=bodyAnchorState[key];
 if(row&&p)row.textContent=`${p[0].toFixed(3)}, ${p[1].toFixed(3)}`;
}

function renderAnchorHandles(){
 const stage=document.getElementById("stage");
 if(!stage)return;
 let layer=document.getElementById("anchorHandles");
 if(!layer){
  layer=document.createElement("div");
  layer.id="anchorHandles";
  layer.className="anchor-handles";
  stage.appendChild(layer);
 }
 const editing=document.getElementById("anchorEditor")?.classList.contains("editing");
 layer.classList.toggle("editing",!!editing);
 layer.innerHTML=visibleAnchorKeys().map(key=>{
  const p=bodyAnchorState[key]||DEFAULT_BODY_ANCHORS[key];
  return `<button type="button" class="anchor-handle" data-trait="${key}" style="left:${(p[0]*100).toFixed(3)}%;top:${(p[1]*100).toFixed(3)}%" title="${key}"></button>`;
 }).join("");
 if(!editing)return;
 layer.querySelectorAll(".anchor-handle").forEach(handle=>{
  handle.addEventListener("pointerdown",startAnchorDrag);
 });
}

function startAnchorDrag(event){
 event.preventDefault();
 const handle=event.currentTarget;
 const key=handle.dataset.trait;
 const stage=document.getElementById("stage");
 if(!key||!stage)return;
 handle.setPointerCapture(event.pointerId);
 window.isAnchorDragging = true;
 const updateFromPointer=(e)=>{
  const rect=stage.getBoundingClientRect();
  const x=Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width));
  const y=Math.max(0,Math.min(1,(e.clientY-rect.top)/rect.height));
  bodyAnchorState[key]=[x,y];
  handle.style.left=`${(x*100).toFixed(3)}%`;
  handle.style.top=`${(y*100).toFixed(3)}%`;
  saveBodyAnchorMap();
  drawCallouts();
  updateAnchorEditorRow(key);
 };
 const move=(e)=>{
  updateFromPointer(e);
 };
 const stop=()=>{
  window.isAnchorDragging = false;
  handle.removeEventListener("pointermove",move);
  handle.removeEventListener("pointerup",stop);
  handle.removeEventListener("pointercancel",stop);
  renderAnchorEditor();
 };
 updateFromPointer(event);
 handle.addEventListener("pointermove",move);
 handle.addEventListener("pointerup",stop);
 handle.addEventListener("pointercancel",stop);
}

window.addEventListener("DOMContentLoaded",ensureAnchorEditor);
window.bodyAnchorMap = bodyAnchorMap;
window.renderAnchorEditor = renderAnchorEditor;
window.resetBodyAnchorMap = resetBodyAnchorMap;
