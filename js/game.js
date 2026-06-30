// Core drafting flow, trait locking, overall calculation, and build completion state.
function setControls(){
 const done=Object.keys(build).length>=9;

 document.getElementById("spinBtn").disabled=isSpinning||!!current||done;
 document.getElementById("nextBtn").disabled=isSpinning||!!current||done;
 document.getElementById("respinBtn").disabled=isSpinning||!current||!lockedSpinTeam||respinsLeft<=0;
 document.getElementById("respinCount").textContent=`${respinsLeft} LEFT`;
 document.getElementById("spinStatus").textContent=`${respinsLeft} / 5`;
}
function spin(){
 if(isSpinning||current||Object.keys(build).length>=9)return;

 let abbr=rand(Object.keys(TEAMS)),name=weightedPlayerFromTeam(abbr);
 lockedSpinTeam=abbr;
 current=all.find(p=>p.abbr===abbr&&p.name===name);
 runSpin(abbr,name,false);
}
function runSpin(abbr,name,respin){
 isSpinning=true;
 setControls();

 const team=TEAMS[abbr];

 document.getElementById("teamPill").textContent=respin?team.name:"team wheel spinning...";
 document.getElementById("playerName").textContent="";
 document.getElementById("playerMeta").textContent=respin?"same-team respin":"watch the team wheel";

  const teamSpinMs=1900;
  const playerSpinMs=2200;
  animateTo("teamReel",Object.keys(TEAMS),abbr,teamDisplay,teamSpinMs,24,8);

  setTimeout(()=>{
   document.getElementById("teamPill").textContent=team.name;
   document.getElementById("playerMeta").textContent="team locked - player wheel spinning";

   animateTo("playerReel",uniquePlayerDisplayList(abbr,name),name,playerDisplay,playerSpinMs,34,8);

   setTimeout(()=>{
    isSpinning=false;
    showCurrent();
    setControls();
   },playerSpinMs+80);
  },teamSpinMs+80);
}

function respinPlayer(){
 if(isSpinning||!current||!lockedSpinTeam||respinsLeft<=0)return;

 let name=weightedPlayerFromTeam(lockedSpinTeam);
 while(name===current.name&&playerNames(lockedSpinTeam).length>1){
  name=weightedPlayerFromTeam(lockedSpinTeam);
 }

 current=all.find(p=>p.abbr===lockedSpinTeam&&p.name===name);
 respinsLeft--;
 isSpinning=true;
 setControls();

 document.getElementById("teamPill").textContent=TEAMS[lockedSpinTeam].name;
 document.getElementById("playerName").textContent="";
 document.getElementById("playerMeta").textContent="same-team respin - player wheel spinning";

 const playerSpinMs=2200;
 animateTo("playerReel",uniquePlayerDisplayList(lockedSpinTeam,name),name,playerDisplay,playerSpinMs,34,8);

 setTimeout(()=>{
  isSpinning=false;
  showCurrent();
  setControls();
 },playerSpinMs+80);
}function grade(n){
 return n>=99?"S":
        n>=96?"A+":
        n>=93?"A":
        n>=90?"A-":
        n>=87?"B+":
        n>=84?"B":
        n>=80?"B-":
        n>=76?"C+":
        n>=72?"C":
        n>=68?"C-":
        n>=64?"D+":
        "F";
}
function pickTrait(k){
 if(!current||build[k]||isSpinning)return;

 let trait=TRAITS.find(t=>t[0]===k);
 if(!trait)return;

 let label=trait[1];

 build[k]={
  player:current.name,
  team:current.abbr,
  rating:current.ratings[k],
  label,
  height:current.height,
  weight:current.weight,
  headshot:current.headshot||""
 };

 current=null;
 renderTraitMenu();
 lockedSpinTeam=null;
 resetIdleWheels();

 document.getElementById("teamPill").textContent="Trait locked";
 document.getElementById("playerName").textContent=label+" added";
 document.getElementById("playerMeta").textContent=Object.keys(build).length<9?"Spin for the next trait.":"Build complete.";

 render();
 setControls();

 if(Object.keys(build).length===9)unlockSim();
}function overall(){
  let w={
   iq:.145,
   shooting:.145,
   handling:.14,
   speed:.14,
   clutch:.12,
   defense:.115,
   rebounding:.105,
   size:.095,
   leadership:.095
  },t=0,u=0;

 Object.entries(w).forEach(([k,v])=>{
  if(build[k]){
   t+=build[k].rating*v;
   u+=v;
  }
 });

 return u?Math.round(t/u):0;
}

function bodyProfile(){
 const s=build.size;
 document.getElementById("heightVal").textContent=s?.height||"--";
 document.getElementById("weightVal").textContent=s?.weight||"--";
}

function isComplete(){
 return Object.keys(build).length>=9;
}

function unlockSim(){
  document.getElementById("stage").classList.add("complete");
  activeStageTab="physical";
  render();
  document.getElementById("nextBtn").disabled=false;
 document.getElementById("nextBtn").textContent="SIMULATE SEASON";
 document.getElementById("nextBtn").onclick=openSeasonMenu;
 toast("Build complete. Simulator unlocked.");
}
function previewCompleteBuild(){
 document.getElementById("home").classList.add("hidden");
 document.getElementById("app").classList.remove("hidden");
 build={};
 const demoNames={
  shooting:"Stephen Curry",
  handling:"Kyrie Irving",
  speed:"Anthony Edwards",
  iq:"Nikola Jokic",
  size:"Victor Wembanyama",
  defense:"Bam Adebayo",
  clutch:"Damian Lillard",
  leadership:"LeBron James",
  rebounding:"Rudy Gobert"
 };
 TRAITS.forEach(([key])=>{
  const name=demoNames[key];
  const p=all.find(x=>x.name===name)||all.find(x=>x.ratings?.[key]>=90)||all[0];
  if(!p)return;
  build[key]={player:p.name,team:p.abbr,headshot:p.headshot,rating:p.ratings[key]};
 });
 current=null;
 lockedSpinTeam=null;
 respinsLeft=0;
 document.getElementById("teamPill").textContent="Preview build";
 document.getElementById("playerName").textContent="Completed Build Preview";
 document.getElementById("playerMeta").textContent="Preview mode - no spins needed.";
 unlockSim();
 setTimeout(drawCallouts,80);
}
function archetype(){let b={};TRAITS.forEach(([k])=>b[k]=build[k]?.rating||0);if(b.defense>=94&&b.size>=90)return"Two-Way Anchor";if(b.defense>=92&&b.speed>=90)return"Two-Way Menace";if(b.shooting>=95&&b.handling>=94)return"Shot-Creating Supernova";if(b.iq>=96&&b.shooting>=92)return"Offensive Engine";if(b.size>=94&&b.speed>=92)return"Physical Mismatch";if(b.handling>=94&&b.speed>=94)return"Rim-Pressure Guard";return"Franchise Build"}
function impact(){let o=overall(),fit=((build.iq?.rating||80)*.28+(build.shooting?.rating||80)*.22+(build.handling?.rating||80)*.18+(build.speed?.rating||80)*.18+(build.defense?.rating||80)*.1+(build.size?.rating||80)*.04);return Math.max(6,Math.round((o-73)*.78+(fit-83)*.22+(o>=90?3:0)+(o>=94?3:0)))}
function randomTeamSim(){simTeam=rand(Object.keys(TEAMS));simulate(simTeam)}
function simSame(){if(!simTeam)randomTeamSim();else simulate(simTeam)}

