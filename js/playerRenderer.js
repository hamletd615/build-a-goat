// Single player renderer for build, completed build, season, and results surfaces.
const PlayerRenderer = (() => {
 let basePlayerSrc = "";

 function baseImage(){
  if(basePlayerSrc)return basePlayerSrc;
  basePlayerSrc = document.getElementById("playerImg")?.getAttribute("src") || "";
  return basePlayerSrc;
 }

 function setImage(img, src, generated){
  if(!img)return;
  const nextSrc = src || baseImage();
  if(nextSrc && img.getAttribute("src") !== nextSrc)img.src = nextSrc;
  img.classList.toggle("generated-uniform", !!generated);
 }

 function renderBuildLike(state){
  const img = document.getElementById("playerImg");
  setImage(img, baseImage(), false);
  img?.setAttribute("data-render-state", state);
 }

 function renderSeasonPreview(team){
  const player = document.getElementById("seasonPlayer");
  const img = player?.querySelector("img.player-img");
  setImage(img, baseImage(), false);
  player?.setAttribute("data-render-state", "season");
  player?.style.setProperty("--season-team-color", team ? (TEAM_COLORS[team] || "#67f8dc") : "#67f8dc");
  player?.querySelector(".season-uniform-logo")?.remove();

  const logo = team ? teamLogo(team) : "";
  if(logo)player?.insertAdjacentHTML("beforeend", `<img class="season-uniform-logo" src="${logo}" alt="" referrerpolicy="no-referrer">`);
 }

 function renderSeasonDetail(team){
  const generated = team ? uniformImage(team) : "";
  const img = document.getElementById("seasonDetailImg");
  setImage(img, generated || baseImage(), !!generated);

  const player = document.getElementById("seasonDetailPlayer");
  player?.setAttribute("data-render-state", "season");
  player?.style.setProperty("--season-team-color", team ? (TEAM_COLORS[team] || "#67f8dc") : "#67f8dc");
  player?.style.setProperty("--season-team-dark", team ? shadeTeam(TEAM_COLORS[team] || "#67f8dc") : shadeTeam("#67f8dc"));
  player?.style.setProperty("--season-team-trim", team ? (TEAM_TRIMS[team] || "#f8fafc") : "#f8fafc");
  player?.querySelector(".season-detail-logo")?.remove();
  player?.querySelector(".season-uniform-layer")?.remove();
 }

 function renderResults(team){
  const generated = team ? uniformImage(team) : "";
  const img = document.getElementById("finalReportImg");
  setImage(img, generated || baseImage(), !!generated);
  document.getElementById("finalReportPlayer")?.setAttribute("data-render-state", "results");
 }

 function renderPlayer(state, options = {}){
  const team = options.team || options.abbr || "";
  if(state === "build" || state === "complete"){
   renderBuildLike(state);
   return;
  }
  if(state === "season-preview"){
   renderSeasonPreview(team);
   return;
  }
  if(state === "season"){
   renderSeasonDetail(team);
   return;
  }
  if(state === "results"){
   renderResults(team);
  }
 }

 return {render: renderPlayer, baseImage};
})();

function renderPlayer(state, options){
 return PlayerRenderer.render(state, options);
}
