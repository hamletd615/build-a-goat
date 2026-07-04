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

  renderPlayer({
   state: complete ? "complete" : "build",
   teamId: "",
   uniform: "default"
  });
  drawCallouts();
}
function drawCompleteCallouts(layer){
 const stage=document.getElementById("stage");
 const sr=stage.getBoundingClientRect();
 const w=layer.clientWidth||sr.width;
 const h=layer.clientHeight||sr.height;
 const anchors={
  iq:[.517,.263],
  shooting:[.432,.389],
  handling:[.376,.504],
  speed:[.439,.559],
  clutch:[.532,.377],
  leadership:[.481,.370],
  rebounding:[.568,.420],
  size:[.509,.442],
  defense:[.563,.551]
 };
 const side={
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
 const rowOffset={
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
 const pathFor=(key)=>{
  const card=document.querySelector(`.tc-${key}`);
  const a=anchors[key];
  if(!card||!a)return"";
  const cr=card.getBoundingClientRect();
  const fromLeft=side[key]==="left";
  const sx=(fromLeft?cr.right:cr.left)-sr.left;
  const sy=(cr.top-sr.top)+(cr.height*(rowOffset[key]||.5));
  const ex=a[0]*w;
  const ey=a[1]*h;
  const elbow=fromLeft?Math.min(sx+180,ex-28):Math.max(sx-180,ex+28);
  return `<path d="M${sx.toFixed(1)} ${sy.toFixed(1)} L${elbow.toFixed(1)} ${sy.toFixed(1)} L${ex.toFixed(1)} ${ey.toFixed(1)}"></path>`;
 };
 const circleFor=([x,y])=>`<circle cx="${(x*w).toFixed(1)}" cy="${(y*h).toFixed(1)}" r="5.5"></circle>`;
 const keys=["iq","shooting","handling","speed","clutch","leadership","rebounding","size","defense"];
 const seen=[];
 keys.forEach(k=>{
  const p=anchors[k];
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

 const red="#f97316";
 const green="#38bdf8";
 const line=(key)=>build[key]?green:red;
 const glow=(key)=>build[key]?"rgba(56,189,248,.35)":"rgba(249,115,22,.32)";
 const complete=document.getElementById("stage")?.classList.contains("complete");

  if(complete){
   drawCompleteCallouts(layer);
   return;
  }

 const paths={
  physical:`
   <path d="M33.1 70.8 L38.0 70.8 L42.1 64.3" style="stroke:${line("speed")}"></path>
   <circle cx="42.1" cy="64.3" r=".65" style="fill:${line("speed")};stroke:${glow("speed")}"></circle>

   <path d="M66.9 55.8 L57.5 55.8 L51.4 46.3" style="stroke:${line("size")}"></path>
   <circle cx="51.4" cy="46.3" r=".65" style="fill:${line("size")};stroke:${glow("size")}"></circle>

   <path d="M66.9 69.2 L61.5 69.2 L57.3 48.5" style="stroke:${line("defense")}"></path>
   <circle cx="57.3" cy="48.5" r=".65" style="fill:${line("defense")};stroke:${glow("defense")}"></circle>
  `,
     mental:`
   <path d="M33.1 33.2 L38.5 33.2 L52.4 29.2" style="stroke:${line("iq")}"></path>
   <circle cx="52.4" cy="29.2" r=".65" style="fill:${line("iq")};stroke:${glow("iq")}"></circle>

   <path d="M66.9 49.8 L58.0 49.8 L53.6 47.0 L53.6 40.0" style="stroke:${line("clutch")}"></path>
   <circle cx="53.6" cy="40.0" r=".65" style="fill:${line("clutch")};stroke:${glow("clutch")}"></circle>

   <path d="M33.1 49.8 L40.0 49.8 L48.5 40.5" style="stroke:${line("leadership")}"></path>
   <circle cx="48.5" cy="40.5" r=".65" style="fill:${line("leadership")};stroke:${glow("leadership")}"></circle>
  `,
  skill:`
   <path d="M33.1 33.2 L38.0 33.2 L43.6 40.5" style="stroke:${line("shooting")}"></path>
   <circle cx="43.6" cy="40.5" r=".65" style="fill:${line("shooting")};stroke:${glow("shooting")}"></circle>

   <path d="M33.1 49.8 L38.2 49.8" style="stroke:${line("handling")}"></path>
   <circle cx="38.2" cy="49.8" r=".65" style="fill:${line("handling")};stroke:${glow("handling")}"></circle>

      <path d="M66.9 69.2 L61.0 69.2 L57.6 64.0 L57.6 59.2" style="stroke:${line("rebounding")}"></path>
   <circle cx="57.6" cy="59.2" r=".65" style="fill:${line("rebounding")};stroke:${glow("rebounding")}"></circle>
  `
 };

 layer.innerHTML=`<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
  ${paths[activeStageTab]}
 </svg>`;
}

