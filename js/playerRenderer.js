// Single player renderer for every build, season, award, and results surface.
const PlayerRenderer = (() => {
 const PLAYER_ART_SRC = "./assets/player/base-player.png";
 const TEAM_PLAYER_ASSET_ROOT = "./assets/teamPlayers";
 // Team-player assets must be transparent PNGs with the same canvas as base-player.png.
 // CSS cannot safely remove a baked white background without damaging the player image.
 const TEAM_PLAYER_ASSETS = new Set(["CHI"]);
 const TEAM_PLAYER_ASSET_STATUS = {};
 const TEAM_PLAYER_ASSET_WAITERS = {};
 const UNIFORM_ASSET_ROOT = "./assets/uniforms";
 const DEFAULT_UNIFORM = "default";
 const POST_BUILD_UNIFORM_STATES = new Set(["complete", "season", "awards", "results"]);
 const UNIFORM_VISUALS_ENABLED = false;
 const layoutSnapshots = {};
 const LAYOUT_EPSILON = 0.5;
 const TEAM_PLAYER_ASSET_WARNINGS = {};

 const surfaces = {
  home: {container: "homePlayer", state: "home", alt: "Build-A-GOAT player"},
  build: {img: "playerImg", state: "build", alt: "Build player"},
  complete: {img: "playerImg", state: "complete", alt: "Completed build player"},
  seasonStart: {container: "seasonPlayer", state: "season", alt: "Season start build player"},
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
  if(config.surface && surfaces[config.surface])return surfaces[config.surface];
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

 function normalizedTeamId(teamId){
  const id=String(teamId||"").trim().toUpperCase();
  return /^[A-Z]{2,3}$/.test(id)?id:"";
 }

 function getTeamPlayerAsset(teamId){
  const id=normalizedTeamId(teamId);
  if(!id || !TEAM_PLAYER_ASSETS.has(id) || TEAM_PLAYER_ASSET_STATUS[id] !== "loaded")return PLAYER_ART_SRC;
  return `${TEAM_PLAYER_ASSET_ROOT}/${id}.png`;
 }

 function teamPlayerAssetPath(teamId){
  const id=normalizedTeamId(teamId);
  return id && TEAM_PLAYER_ASSETS.has(id) ? `${TEAM_PLAYER_ASSET_ROOT}/${id}.png` : "";
 }

 function loadTeamPlayerAsset(teamId,onReady){
  const id=normalizedTeamId(teamId);
  const src=teamPlayerAssetPath(id);
  if(!src)return;
 if(TEAM_PLAYER_ASSET_STATUS[id] === "loaded"){
  onReady(src);
  return;
 }
 if(TEAM_PLAYER_ASSET_STATUS[id] === "loading"){
  TEAM_PLAYER_ASSET_WAITERS[id].push(onReady);
  return;
 }
 if(TEAM_PLAYER_ASSET_STATUS[id] === "missing")return;
  TEAM_PLAYER_ASSET_STATUS[id] = "loading";
  TEAM_PLAYER_ASSET_WAITERS[id] = [onReady];
  const testImage = new Image();
  testImage.onload = () => {
   TEAM_PLAYER_ASSET_STATUS[id] = "loaded";
   warnIfTeamPlayerAssetNeedsExport(id,testImage);
   const waiters=TEAM_PLAYER_ASSET_WAITERS[id]||[];
   delete TEAM_PLAYER_ASSET_WAITERS[id];
   waiters.forEach(callback=>callback(src));
  };
  testImage.onerror = () => {
   TEAM_PLAYER_ASSET_STATUS[id] = "missing";
   delete TEAM_PLAYER_ASSET_WAITERS[id];
  };
  testImage.src = src;
 }

 function warnIfTeamPlayerAssetNeedsExport(teamId,img){
  if(TEAM_PLAYER_ASSET_WARNINGS[teamId])return;
  TEAM_PLAYER_ASSET_WARNINGS[teamId]=true;
  const base=new Image();
  base.onload=()=>{
   if(img.naturalWidth!==base.naturalWidth||img.naturalHeight!==base.naturalHeight){
    warnLayout(`${teamId} team-player asset canvas differs from base-player.png; export a transparent PNG on the base canvas`,{
     teamAsset:{width:img.naturalWidth,height:img.naturalHeight},
     baseAsset:{width:base.naturalWidth,height:base.naturalHeight}
    });
   }
  };
  base.src=PLAYER_ART_SRC;
 }

 function shouldUseTeamPlayerAsset(config){
  return config.uniform === "team" && !!config.teamId && POST_BUILD_UNIFORM_STATES.has(config.state);
 }

 function playerImageSource(config){
  return shouldUseTeamPlayerAsset(config)?getTeamPlayerAsset(config.teamId):PLAYER_ART_SRC;
 }

 function applyPlayerImageSource(img,config){
  const initialSrc=playerImageSource(config);
  img.src = initialSrc;
  if(initialSrc !== PLAYER_ART_SRC || !shouldUseTeamPlayerAsset(config))return;
  loadTeamPlayerAsset(config.teamId,src => {
   if(img.dataset.renderState !== config.state)return;
   if(img.dataset.teamId !== config.teamId)return;
   if(img.dataset.uniform !== config.uniform)return;
   img.src = src;
  });
 }

 function uniformActive(config){
  return config.uniform === "team" && !!config.teamId && POST_BUILD_UNIFORM_STATES.has(config.state);
 }

 function contrastColor(primary,trim){
  const color=/^#[0-9a-f]{6}$/i.test(trim||"")?trim:"#ffffff";
  if(color.toLowerCase()==="#111827")return "#ffffff";
  return color;
 }

 function uniformAssetPath(teamId,piece){
  return `${UNIFORM_ASSET_ROOT}/${teamId}/${piece}.png`;
 }

 function makeUniformLayer(piece,teamId){
  const layer=document.createElement("img");
  layer.className=`uniform-layer player-layer player-uniform-layer player-${piece}-layer`;
  layer.src=uniformAssetPath(teamId,piece);
  layer.alt="";
  layer.decoding="async";
  layer.draggable=false;
  layer.setAttribute("aria-hidden","true");
  return layer;
 }

 function renderUniform(sprite,config){
  if(!sprite)return;
  sprite.querySelectorAll(".uniform-layer").forEach(layer=>layer.remove());
  // Future uniform system:
  // Use finished transparent full-player PNGs instead of rough jersey/shorts overlays.
  // Example target paths:
  // assets/teamPlayers/CHI.png
  // assets/teamPlayers/LAL.png
  // assets/teamPlayers/BOS.png
  // The renderer should swap the full player image by selected team after build completion.
  if(!UNIFORM_VISUALS_ENABLED)return;
  if(!uniformActive(config))return;

  sprite.appendChild(makeUniformLayer("shorts",config.teamId));
  sprite.appendChild(makeUniformLayer("jersey",config.teamId));
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
  applyPlayerImageSource(img, normalized);

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

 return {render: renderToSurface, playerArtSrc: PLAYER_ART_SRC, getPlayerRenderBox, getTeamPlayerAsset};
})();

function renderPlayer(config){
 return PlayerRenderer.render(config);
}

function getPlayerRenderBox(surface){
 return PlayerRenderer.getPlayerRenderBox(surface);
}

function getTeamPlayerAsset(teamId){
 return PlayerRenderer.getTeamPlayerAsset(teamId);
}

window.getPlayerRenderBox = getPlayerRenderBox;
window.getTeamPlayerAsset = getTeamPlayerAsset;
