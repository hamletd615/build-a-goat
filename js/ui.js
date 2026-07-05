// Rendering for trait menus, current picks, completed-build cards, callouts, and build overview.
function renderTraitMenu(){
 const menu=document.getElementById("traitMenu");
 const avatar=document.getElementById("playerAvatar");
 if(!menu)return;

 if(!current){
  if(avatar)avatar.innerHTML="NBA";
  menu.innerHTML="";
  return;
 }

 if(avatar){
  avatar.innerHTML=photoLayers(current.headshot,current.name,current.abbr);
 }

 const groups=[
  ["Physical",[["size","Size"],["speed","Athleticism"],["defense","Defense"]]],
  ["Mental",[["iq","Basketball IQ"],["clutch","Clutch"],["leadership","Leadership"]]],
  ["Skill",[["shooting","Shooting"],["handling","Handling"],["rebounding","Rebounding"]]]
 ];

 menu.innerHTML=groups.map(([section,items])=>{
  const available=items.filter(([key])=>!build[key]);
  if(!available.length)return "";

  return `<div class="trait-section">${section}</div>`+available.map(([key,label])=>{
   const val=current.ratings[key];
   const kind=section.toLowerCase();

   return `<button class="trait-choice ${kind}" onclick="pickTrait('${key}')">
    ${photoMarkup(current.headshot,current.name,"choice-photo",current.abbr)}
    <div>${label}</div>
    <span>${grade(val)}</span>
   </button>`;
  }).join("");
 }).join("");
}
function showCurrent(){
 document.getElementById("teamPill").textContent=current.team;
 document.getElementById("playerName").textContent=current.name;
 document.getElementById("playerMeta").textContent=current.abbr+" - choose one trait or use a same-team respin";
 render();
 renderTraitMenu();
}

function playerPhoto(name){
  const p=all.find(x=>x.name===name);
  return p && p.headshot ? p.headshot : "";
}

function playerIcon(name){
  const src=playerPhoto(name);
  if(src)return `<img src="${src}" alt="${name} headshot" referrerpolicy="no-referrer">`;
  return initials(name);
}

function buildName(){
  const o=overall();
  const r={};
  TRAITS.forEach(([k])=>r[k]=build[k]?.rating||0);

  if(r.shooting>=96 && r.handling>=94)return "Shot-Creating System";
  if(r.defense>=96 && r.size>=94)return "Two-Way Alien";
  if(r.iq>=96 && r.leadership>=92)return "Floor General";
  if(r.speed>=96 && r.clutch>=90)return "Explosive Closer";
  if(r.rebounding>=94 && r.defense>=90)return "Glass-Cleaning Anchor";
  if(o>=92)return "Franchise Build";
  if(o>=84)return "Winning Starter";
  return "Boom or Bust";
}function setStageTab(tab){
 activeStageTab=tab;

 

 document.getElementById("tabPhysical").classList.toggle("active",tab==="physical");
 document.getElementById("tabMental").classList.toggle("active",tab==="mental");
 document.getElementById("tabSkill").classList.toggle("active",tab==="skill");

 render();
 renderAnchorEditor?.();
}
function traitCards(){
 const stageTraits={
  physical:[
   ["size","SIZE"],
   ["speed","ATHLETICISM"],
   ["defense","DEFENSE"]
  ],
  mental:[
   ["iq","BASKETBALL IQ"],
   ["clutch","CLUTCH"],
   ["leadership","LEADERSHIP"]
  ],
  skill:[
   ["shooting","SHOOTING"],
   ["handling","HANDLE"],
   ["rebounding","REBOUNDING"]
  ]
 };

 const completeTraits=[
  ["iq","BASKETBALL IQ"],
  ["shooting","SHOOTING"],
  ["handling","HANDLE"],
  ["speed","ATHLETICISM"],
  ["clutch","CLUTCH"],
  ["leadership","LEADERSHIP"],
  ["rebounding","REBOUNDING"],
  ["size","SIZE"],
  ["defense","DEFENSE"]
 ];

 const list=isComplete()?completeTraits:stageTraits[activeStageTab];

 return list.map(([key,label])=>{
  const picked=build[key];
  const filled=picked ? " filled" : "";
  return `
   <div class="trait-card tc-${key}${filled}" data-trait="${key}">
    <div class="head">${label}</div>
    <div class="body">
     ${picked?photoMarkup(picked.headshot,picked.player,"trait-photo",picked.team):""}
     <div>
      <div class="rating">${picked?grade(picked.rating):"--"}</div>
      <div class="from">${picked?picked.player:"--"}</div>
     </div>
    </div>
   </div>
  `;
 }).join("");
}
function buildList(){
 let colors={
  shooting:"#f97316",
  handling:"#38bdf8",
  speed:"#22c55e",
  iq:"#a78bfa",
  size:"#facc15",
  defense:"#fb923c",
  clutch:"#e879f9",
  leadership:"#c084fc",
  rebounding:"#14b8a6"
 };

  document.getElementById("buildList").innerHTML=TRAITS.map(([k,label])=>{
   let s=build[k];
   let picked=s?" picked":" empty";
   return `<div class="li${picked}">
    <div class="dot" style="background:${colors[k]}"></div>
    ${s?photoMarkup(s.headshot,s.player,"mini-photo",s.team):`<div class="mini-photo"></div>`}
    <div><div class="lt">${label}</div><div class="lv">${s?s.player:"-"}</div></div>
    <div class="grade-badge" style="background:${colors[k]}">${s?grade(s.rating):""}</div>
   </div>`;
  }).join("");
}function render(){
  const ovrValue=overall()||0;
  document.getElementById("ovr").innerHTML=ovrValue+"<small>OVR</small>";
  document.querySelector(".ovr-card")?.style.setProperty("--ovr-pct",ovrValue);
  const complete=Object.keys(build).length===TRAITS.length;
  const buildName=document.getElementById("buildName");
  const shareBuildBtn=document.getElementById("shareBuildBtn");
  if(buildName)buildName.textContent=complete?archetype():"";
  if(shareBuildBtn)shareBuildBtn.disabled=!complete;

  traitCards();
  buildList();
  bodyProfile();

  let traitLayer=document.getElementById("traitCardLayer");
  if(!traitLayer){
    traitLayer=document.createElement("div");
    traitLayer.id="traitCardLayer";

    const middle=document.querySelector(".middle") || document.querySelector(".court") || document.querySelector(".stage") || document.querySelector("main");
    middle.appendChild(traitLayer);
  }

  traitLayer.innerHTML=traitCards();

  const renderTeamId=selectedBuildTeamId();
  renderPlayer({
   state: complete ? "complete" : "build",
   teamId: complete ? renderTeamId : "",
   uniform: complete && renderTeamId ? "team" : "default"
  });
  drawCallouts();
  renderAnchorEditor?.();
}
//////////////////////////////////////////////
// PLAYER LAYOUT CONTRACT
// DO NOT MODIFY WITHOUT UPDATING
// THE ANCHOR SYSTEM.
// Appearance changes ONLY.
// Layout changes require anchor recalibration.
//////////////////////////////////////////////
function drawAnchoredCallouts(layer){
 const stage=document.getElementById("stage");
 const sr=stage.getBoundingClientRect();
 const lr=layer.getBoundingClientRect();
 const playerBox=getPlayerRenderBox?.(stage?.classList.contains("complete")?"complete":"build");
 const w=layer.clientWidth||sr.width;
 const h=layer.clientHeight||sr.height;
 const anchors=bodyAnchorMap();
 const complete=stage?.classList.contains("complete");
 const keys=complete?Object.keys(anchors):(TAB_TRAITS[activeStageTab]||TAB_TRAITS.physical);
 const pathFor=(key)=>{
  const card=document.querySelector(`.tc-${key}`);
  const a=anchors[key];
  if(!card||!a)return"";
  const cr=card.getBoundingClientRect();
  const fromLeft=TRAIT_CARD_SIDES[key]==="left";
  const sx=(fromLeft?cr.right:cr.left)-sr.left;
  const sy=(cr.top-sr.top)+(cr.height*(TRAIT_CARD_ROW_OFFSET[key]||.5));
  const ex=playerBox?((playerBox.left-lr.left)+(a[0]*playerBox.width)):(a[0]*w);
  const ey=playerBox?((playerBox.top-lr.top)+(a[1]*playerBox.height)):(a[1]*h);
  const elbow=fromLeft?Math.min(sx+180,ex-28):Math.max(sx-180,ex+28);
  return `<path d="M${sx.toFixed(1)} ${sy.toFixed(1)} L${elbow.toFixed(1)} ${sy.toFixed(1)} L${ex.toFixed(1)} ${ey.toFixed(1)}"></path>`;
 };
 const circleFor=([x,y])=>{
  const cx=playerBox?((playerBox.left-lr.left)+(x*playerBox.width)):(x*w);
  const cy=playerBox?((playerBox.top-lr.top)+(y*playerBox.height)):(y*h);
  return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="5.5"></circle>`;
 };
 const seen=[];
 keys.forEach(k=>{
  const p=anchors[k];
  if(!p)return;
  if(!seen.some(q=>Math.abs(q[0]-p[0])<.001&&Math.abs(q[1]-p[1])<.001))seen.push(p);
 });
 layer.innerHTML=`<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
  ${keys.map(pathFor).join("")}
  ${seen.map(circleFor).join("")}
 </svg>`;
}
function drawCallouts(){
 const layer=document.getElementById("callouts");
 if(!layer)return;
 drawAnchoredCallouts(layer);
 if(!window.isAnchorDragging)renderAnchorEditor?.();
}

