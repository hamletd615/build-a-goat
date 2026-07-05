// Single player renderer for every build, season, award, and results surface.
const PlayerRenderer = (() => {
 const PLAYER_ART_SRC = "./assets/player/base-player.png";
 const DEFAULT_UNIFORM = "default";
 const layoutSnapshots = {};
 const LAYOUT_EPSILON = 0.5;

 const surfaces = {
  home: {container: "homePlayer", state: "home", alt: "Build-A-GOAT player"},
  build: {img: "playerImg", state: "build", alt: "Build player"},
  complete: {img: "playerImg", state: "complete", alt: "Completed build player"},
  season: {img: "seasonDetailImg", container: "seasonDetailPlayer", state: "season", alt: "Season build player"},
  awards: {container: "awardPhoto", state: "awards", alt: "Award player"},
  results: {img: "finalReportImg", container: "finalReportPlayer", state: "results", alt: "Final report player"}
 };

 function normalizeConfig(config = {}){
  const state = config.state || "build";
  const teamId = config.teamId || "";
  return {
   state,
   teamId,
   uniform: config.uniform || (teamId ? "team" : DEFAULT_UNIFORM),
   surface: config.surface || ""
  };
 }

 function surfaceFor(config){
  if(config.surface === "award" || config.surface === "awards")return surfaces.awards;
  return surfaces[config.state] || surfaces.build;
 }

 function ensureContainerImage(container, alt){
  if(!container)return null;
  let img = container.querySelector("img.player-img");
  if(!img){
   img = document.createElement("img");
   img.className = "player-img";
   container.appendChild(img);
  }
  img.alt = alt;
  return img;
 }

 function ensureSprite(container, img){
  if(!container || !img)return null;
  let sprite = img.closest(".player-sprite");
  if(!sprite || sprite.parentElement !== container){
   sprite = document.createElement("div");
   sprite.className = "player-sprite";
   container.insertBefore(sprite, img);
   sprite.appendChild(img);
  }
  return sprite;
 }

 function uniformColors(config){
  const useTeam=config.uniform === "team" && config.teamId;
  const primary=(useTeam && TEAM_COLORS?.[config.teamId]) || "#2f3339";
  const trim=(useTeam && TEAM_TRIMS?.[config.teamId]) || (useTeam ? "#f8fafc" : "#5c6470");
  const number=contrastColor(primary,trim);
  return {primary, trim, number};
 }

 function contrastColor(primary,trim){
  const color=/^#[0-9a-f]{6}$/i.test(trim||"")?trim:"#ffffff";
  if(color.toLowerCase()==="#111827")return "#ffffff";
  return color;
 }

 function uniformActive(config){
  return config.uniform === "team" && !!config.teamId;
 }

 function makeUniformLayer(className){
  const layer=document.createElement("div");
  layer.className=`uniform-layer ${className}`;
  layer.setAttribute("aria-hidden","true");
  return layer;
 }

 function renderUniform(sprite,config){
  if(!sprite)return;
  sprite.querySelectorAll(".uniform-layer").forEach(layer=>layer.remove());
  if(!uniformActive(config))return;

  const logoUrl=typeof teamLogo==="function"?teamLogo(config.teamId):"";
  if(logoUrl){
   const logo=makeUniformLayer("player-uniform-logo");
   logo.style.backgroundImage=`url("${logoUrl}")`;
   sprite.appendChild(logo);
  }

  const number=makeUniformLayer("player-uniform-number");
  number.textContent="1";
  sprite.appendChild(number);
 }

 function targetImage(surface){
  const container = surface.container ? document.getElementById(surface.container) : null;
  const img = surface.img ? document.getElementById(surface.img) : ensureContainerImage(container, surface.alt);
  const host = container || img?.closest(".player-render-surface") || img?.parentElement || null;
  if(img && surface.alt)img.alt = surface.alt;
  return {container: host, img};
 }

 function applyRenderMetadata(el, config, renderState){
  if(!el)return;
  el.dataset.renderState = renderState;
  el.dataset.teamId = config.teamId;
  el.dataset.uniform = config.uniform;
 }

//////////////////////////////////////////////
// PLAYER LAYOUT CONTRACT
// DO NOT MODIFY WITHOUT UPDATING
// THE ANCHOR SYSTEM.
// Appearance changes ONLY.
// Layout changes require anchor recalibration.
//////////////////////////////////////////////
 function renderToSurface(config = {}){
  const normalized = normalizeConfig(config);
  const surface = surfaceFor(normalized);
  const awardContainer = surface === surfaces.awards ? document.getElementById(surface.container) : null;
  if(awardContainer && !awardContainer.querySelector(".player-sprite"))awardContainer.innerHTML = "";
  const {container, img} = targetImage(surface);
  if(!img)return;
  const sprite = ensureSprite(container, img);
  const colors=uniformColors(normalized);

  img.src = PLAYER_ART_SRC;
  img.classList.add("player-img", "player-layer", "player-base-layer");
  container?.classList.add("player-render-surface");
  sprite?.classList.add("player-sprite");
  sprite?.style.setProperty("--uniform-primary",colors.primary);
  sprite?.style.setProperty("--uniform-trim",colors.trim);
  sprite?.style.setProperty("--uniform-number",colors.number);
  renderUniform(sprite, normalized);
  applyRenderMetadata(img, normalized, surface.state);
  applyRenderMetadata(container, normalized, surface.state);
  applyRenderMetadata(sprite, normalized, surface.state);

  if(surface === surfaces.awards){
   container.classList.remove("cup-photo");
   container.classList.add("award-player-render");
  }
  assertPlayerLayoutStable(surface.state);
 }

//////////////////////////////////////////////
// PLAYER LAYOUT CONTRACT
// DO NOT MODIFY WITHOUT UPDATING
// THE ANCHOR SYSTEM.
// Appearance changes ONLY.
// Layout changes require anchor recalibration.
//////////////////////////////////////////////
 function getPlayerRenderBox(surfaceName = "build"){
  const surface = surfaces[surfaceName] || surfaces.build;
  const {container, img} = targetImage(surface);
  const sprite = container?.querySelector(".player-sprite") || img?.closest(".player-sprite") || img;
  const el = sprite || img || container;
  if(!el)return null;
  const rect = el.getBoundingClientRect();
  return {
   left: rect.left,
   top: rect.top,
   width: rect.width,
   height: rect.height,
   right: rect.right,
   bottom: rect.bottom
  };
 }

 function sameSize(a,b){
  return Math.abs(a.width-b.width)<=LAYOUT_EPSILON&&Math.abs(a.height-b.height)<=LAYOUT_EPSILON;
 }

 function sameBox(a,b){
  return sameSize(a,b)&&Math.abs(a.left-b.left)<=LAYOUT_EPSILON&&Math.abs(a.top-b.top)<=LAYOUT_EPSILON;
 }

 function snapshotBox(box){
  return box?{left:box.left,top:box.top,width:box.width,height:box.height}:null;
 }

 function warnLayout(message,detail){
  if(typeof console!=="undefined"&&console.warn)console.warn(`[Player Layout Contract] ${message}`,detail);
 }

 function assertPlayerLayoutStable(surfaceName){
  requestAnimationFrame(()=>{
   const box=getPlayerRenderBox(surfaceName);
   if(!box)return;
   const snapshot=snapshotBox(box);
   const previous=layoutSnapshots[surfaceName];
   if(!previous){
    layoutSnapshots[surfaceName]=snapshot;
    compareAnchorSurfaces();
    return;
   }
   if(!sameBox(previous,snapshot)){
    warnLayout(`${surfaceName} player render box changed after initial render`,{initial:previous,current:snapshot});
   }
   compareAnchorSurfaces();
  });
 }

 function compareAnchorSurfaces(){
  const build=layoutSnapshots.build;
  const complete=layoutSnapshots.complete;
  if(build&&complete&&!sameSize(build,complete)){
   warnLayout("build and complete anchor boxes differ; anchor recalibration may be required",{build,complete});
  }
 }

 return {render: renderToSurface, playerArtSrc: PLAYER_ART_SRC, getPlayerRenderBox};
})();

function renderPlayer(config){
 return PlayerRenderer.render(config);
}

function getPlayerRenderBox(surface){
 return PlayerRenderer.getPlayerRenderBox(surface);
}

window.getPlayerRenderBox = getPlayerRenderBox;
