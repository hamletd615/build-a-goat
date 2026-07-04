// Single player renderer for every build, season, award, and results surface.
const PlayerRenderer = (() => {
 const PLAYER_ART_SRC = "./assets/player/base-player.png";
 const DEFAULT_UNIFORM = "default";

 const surfaces = {
  home: {container: "homePlayer", state: "home", alt: "Build-A-GOAT player"},
  build: {img: "playerImg", state: "build", alt: "Build player"},
  complete: {img: "playerImg", state: "complete", alt: "Completed build player"},
  "season-preview": {container: "seasonPlayer", state: "season", alt: "Season preview player"},
  season: {img: "seasonDetailImg", container: "seasonDetailPlayer", state: "season", alt: "Season build player"},
  awards: {container: "awardPhoto", state: "awards", alt: "Award player"},
  results: {img: "finalReportImg", container: "finalReportPlayer", state: "results", alt: "Final report player"}
 };

 function normalizeConfig(config = {}){
  const state = config.state || "build";
  return {
   state,
   teamId: config.teamId || "",
   uniform: config.uniform || DEFAULT_UNIFORM,
   surface: config.surface || ""
  };
 }

 function surfaceFor(config){
  if(config.surface === "award" || config.surface === "awards")return surfaces.awards;
  return surfaces[config.state] || surfaces.build;
 }

 function ensureContainerImage(container, alt){
  if(!container)return null;
  let img = container.querySelector(":scope > img.player-img");
  if(!img){
   img = document.createElement("img");
   img.className = "player-img";
   container.appendChild(img);
  }
  img.alt = alt;
  return img;
 }

 function targetImage(surface){
  const container = surface.container ? document.getElementById(surface.container) : null;
  const img = surface.img ? document.getElementById(surface.img) : ensureContainerImage(container, surface.alt);
  if(img && surface.alt)img.alt = surface.alt;
  return {container, img};
 }

 function applyRenderMetadata(el, config, renderState){
  if(!el)return;
  el.dataset.renderState = renderState;
  el.dataset.teamId = config.teamId;
  el.dataset.uniform = config.uniform;
 }

 function renderToSurface(config = {}){
  const normalized = normalizeConfig(config);
  const surface = surfaceFor(normalized);
  const {container, img} = targetImage(surface);
  if(!img)return;

  img.src = PLAYER_ART_SRC;
  img.classList.add("player-img");
  applyRenderMetadata(img, normalized, surface.state);
  applyRenderMetadata(container, normalized, surface.state);

  if(surface === surfaces.awards){
   container.classList.remove("cup-photo");
   container.classList.add("award-player-render");
   container.innerHTML = "";
   container.appendChild(img);
  }
 }

 return {render: renderToSurface, playerArtSrc: PLAYER_ART_SRC};
})();

function renderPlayer(config){
 return PlayerRenderer.render(config);
}
