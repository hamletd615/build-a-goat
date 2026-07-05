// Local-only development helpers. These are inert on non-local hosts.
(function(){
 const DEV_HOSTS=new Set(["localhost","127.0.0.1","::1",""]);
 const CHICAGO_TEAM_ID="CHI";

 function isLocalDevMode(){
  return location.protocol==="file:"||DEV_HOSTS.has(location.hostname);
 }

 if(!isLocalDevMode())return;

 function forceChicagoSeasonTeam(){
  if(typeof TEAMS==="undefined"||!TEAMS[CHICAGO_TEAM_ID])return;

  selectedSeasonTeam=CHICAGO_TEAM_ID;
  selectedSeasonTeamId=CHICAGO_TEAM_ID;
  simTeam=CHICAGO_TEAM_ID;
  isSeasonSpinning=false;

  const seasonOverlay=document.getElementById("seasonOverlay");
  const seasonDetailOverlay=document.getElementById("seasonDetailOverlay");
  const spin=document.getElementById("seasonSpinBtn");
  const run=document.getElementById("seasonRunBtn");

  if(seasonOverlay?.classList.contains("open")&&typeof showSeasonTeam==="function"){
   showSeasonTeam(CHICAGO_TEAM_ID);
   if(spin){
    spin.disabled=false;
    spin.classList.add("hidden");
   }
   if(run)run.disabled=false;
  }else if(seasonDetailOverlay?.classList.contains("open")&&typeof openSeasonDetail==="function"){
   openSeasonDetail(CHICAGO_TEAM_ID);
  }else if(typeof render==="function"){
   render();
  }

  if(typeof toast==="function")toast("Dev: selected season team forced to CHI");
 }

 window.addEventListener("keydown",event=>{
  if(!event.ctrlKey||!event.shiftKey||event.code!=="KeyC")return;
  event.preventDefault();
  forceChicagoSeasonTeam();
 });

 window.devForceChicagoSeasonTeam=forceChicagoSeasonTeam;
})();
