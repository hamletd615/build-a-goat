// Single player renderer for every build, season, award, and results surface.
const PlayerRenderer = (() => {
 const PLAYER_ART_SRC = "./assets/player/base-player.png";
 const DEFAULT_UNIFORM = "default";

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
  const secondary=useTeam ? trim : "#242830";
  return {primary, secondary, trim};
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
  sprite?.querySelectorAll(".uniform-layer").forEach(layer=>layer.remove());
  container?.classList.add("player-render-surface");
  sprite?.classList.add("player-sprite");
  sprite?.style.setProperty("--uniform-primary",colors.primary);
  sprite?.style.setProperty("--uniform-secondary",colors.secondary);
  sprite?.style.setProperty("--uniform-trim",colors.trim);
  applyRenderMetadata(img, normalized, surface.state);
  applyRenderMetadata(container, normalized, surface.state);
  applyRenderMetadata(sprite, normalized, surface.state);

  if(surface === surfaces.awards){
   container.classList.remove("cup-photo");
   container.classList.add("award-player-render");
  }
 }

 return {render: renderToSurface, playerArtSrc: PLAYER_ART_SRC};
})();

function renderPlayer(config){
 return PlayerRenderer.render(config);
}
