// Season, NBA Cup, playoffs, awards, and final report simulation flow.
function openSeasonMenu(){
 selectedSeasonTeam=null;
 isSeasonSpinning=false;
 const overlay=document.getElementById("seasonOverlay");
 const reel=document.getElementById("seasonTeamReel");
 const result=document.getElementById("seasonResult");
 const run=document.getElementById("seasonRunBtn");
 const spin=document.getElementById("seasonSpinBtn");
 renderPlayer("season-preview");
 result.classList.remove("show");
 result.innerHTML="";
 run.disabled=true;
 spin.disabled=false;
 spin.classList.remove("hidden");
  reel.className="season-reel";
  reel.innerHTML=Object.keys(TEAMS).map(a=>`<div class="item">${seasonTeamDisplay(a)}</div>`).join("");
  reel.style.transition="none";
  reel.style.transform=`translateY(${reelCenterOffset(reel)}px)`;
 document.getElementById("seasonBuildList").innerHTML=TRAITS.map(([k,label])=>{
  const s=build[k];
  return `<div class="season-build-row">${s?photoMarkup(s.headshot,s.player,"mini-photo",s.team):`<div></div>`}<div><b>${label}</b><span>${s?s.player:"-"}</span></div><div class="grade-badge">${s?grade(s.rating):"-"}</div></div>`;
 }).join("");
 overlay.classList.add("open");
}
function spinSeasonTeam(){
 if(isSeasonSpinning)return;
 isSeasonSpinning=true;
 selectedSeasonTeam=rand(Object.keys(TEAMS));
 document.getElementById("seasonSpinBtn").disabled=true;
 document.getElementById("seasonRunBtn").disabled=true;
 document.getElementById("seasonResult").classList.remove("show");
 animateTo("seasonTeamReel",Object.keys(TEAMS),selectedSeasonTeam,seasonTeamDisplay,1900,24,8);
 setTimeout(()=>{
  isSeasonSpinning=false;
  showSeasonTeam(selectedSeasonTeam);
  document.getElementById("seasonSpinBtn").classList.add("hidden");
  document.getElementById("seasonRunBtn").disabled=false;
   setTimeout(()=>openSeasonDetail(selectedSeasonTeam),2800);
 },1980);
}
function showSeasonTeam(abbr){
 const t=TEAMS[abbr],r=TEAM_REPORT[abbr]||{score:t.base+40,off:t.base+38,def:t.base+38,note:"season profile"};
 const logo=teamLogo(abbr);
 renderPlayer("season-preview",{team:abbr});
 const el=document.getElementById("seasonResult");
 el.innerHTML=`${logo?`<img class="season-logo" src="${logo}" alt="${t.name} logo" referrerpolicy="no-referrer">`:`<div class="season-logo"></div>`}<div class="season-team">${t.name}</div><div class="season-meta">${abbr}</div>`;
 el.classList.add("show");
}
function openSeasonDetail(abbr){
 if(!abbr)return;
 const t=TEAMS[abbr],r=TEAM_REPORT[abbr]||{score:t.base+40,off:t.base+38,def:t.base+38,note:"season profile"};
 const logo=teamLogo(abbr);
 const primary=TEAM_COLORS[abbr]||"#67f8dc";
 const trim=TEAM_TRIMS[abbr]||"#f8fafc";
 document.getElementById("seasonOverlay").classList.remove("open");
 document.getElementById("seasonDetailOverlay").classList.add("open");
 document.getElementById("seasonDetailOverlay").scrollTop=0;
 document.getElementById("seasonDetailOverlay").style.setProperty("--season-team-color",primary);
 document.getElementById("seasonDetailOverlay").style.setProperty("--season-team-dark",shadeTeam(primary));
 document.getElementById("seasonDetailOverlay").style.setProperty("--season-team-trim",trim);
 document.getElementById("seasonDetailTeam").innerHTML=`${logo?`<img src="${logo}" alt="${t.name} logo" referrerpolicy="no-referrer">`:""}<div class="season-detail-team">${t.name}</div><div class="season-bars"><div class="season-bar"><span>OFF</span><span class="season-bar-line"><i style="width:${r.off}%"></i></span><span class="season-bar-grade">${teamGrade(r.off)}</span></div><div class="season-bar"><span>DEF</span><span class="season-bar-line"><i style="width:${r.def}%"></i></span><span class="season-bar-grade">${teamGrade(r.def)}</span></div></div>`;
 document.getElementById("seasonDetailOvr").innerHTML=`${overall()||0}<small>OVR</small>`;
 document.getElementById("seasonDetailArch").textContent=archetype();
 renderPlayer("season",{team:abbr});
 document.getElementById("seasonDetailTraits").innerHTML=TRAITS.map(([k,label])=>{
  const s=build[k];
  return `<div class="season-detail-row">${s?photoMarkup(s.headshot,s.player,"mini-photo",s.team):`<div></div>`}<div><b>${label}</b><span>${s?s.player:"-"}</span></div><div class="grade-badge">${s?grade(s.rating):"-"}</div></div>`;
 }).join("");
}
function runSelectedSeason(){
 if(!selectedSeasonTeam||isSeasonSpinning)return;
 document.getElementById("seasonOverlay").classList.remove("open");
 document.getElementById("seasonDetailOverlay")?.classList.remove("open");
 simTeam=selectedSeasonTeam;
 renderRegularSeason(selectedSeasonTeam);
}
function backToSeasonReview(){
 document.getElementById("regularSeasonOverlay")?.classList.remove("open");
 if(selectedSeasonTeam)openSeasonDetail(selectedSeasonTeam);
}
function backToRegularSeason(){
 if(playoffTimer)clearTimeout(playoffTimer);
 playoffTimer=null;
 document.getElementById("playoffOverlay")?.classList.remove("open");
 document.getElementById("regularSeasonOverlay")?.classList.add("open");
}
function playoffOpponent(add,round){
 const myConf=TEAMS[add]?.conf;
 const pool=Object.keys(TEAMS).filter(a=>{
  if(a===add)return false;
  return round<3?TEAMS[a]?.conf===myConf:TEAMS[a]?.conf!==myConf;
 });
 const ranked=pool.sort((a,b)=>(TEAM_REPORT[b]?.score||75)-(TEAM_REPORT[a]?.score||75));
 const start=round<3?round*3:0;
 return ranked[start+Math.floor(Math.random()*Math.min(3,Math.max(1,ranked.length-start)))]||rand(ranked);
}
function simSeries(add,opp,round){
  const o=overall()||80;
  const mine=(TEAM_REPORT[add]?.score||78)+impact()*.42+(o-80)*.28+(o>=90?5:0)+(o>=94?4:0);
  const theirs=(TEAM_REPORT[opp]?.score||78)+round*1.5;
  const chance=Math.max(.3,Math.min(.9,.54+(mine-theirs)/50));
  let myWins=0,oppWins=0,games=[];
  while(myWins<4&&oppWins<4){
   const win=Math.random()<chance;
   win?myWins++:oppWins++;
   games.push({win,myWins,oppWins});
  }
  return {opp,won:myWins===4,games,myWins,oppWins,revealed:0};
}
function enterPlayoffs(){
 if(playoffTimer)clearTimeout(playoffTimer);
 playoffTimer=null;
  if(!lastRegularSeason?.playoffBound){
   lastPlayoffRun={team:lastRegularSeason?.team||selectedSeasonTeam,rounds:[],champion:false,missed:true};
    openAwards();
   return;
 }
 const add=lastRegularSeason.team,roundNames=["First Round","Conference Semifinals","Conference Finals","NBA Finals"],rounds=[];
 let alive=true;
 for(let i=0;i<roundNames.length&&alive;i++){
  const result=simSeries(add,playoffOpponent(add,i),i);
  result.round=roundNames[i];
  rounds.push(result);
  alive=result.won;
 }
  const champion=rounds.length===4&&rounds[3].won;
  lastPlayoffRun={team:add,rounds,champion,live:{roundIndex:0,done:false}};
  document.getElementById("regularSeasonOverlay")?.classList.remove("open");
  document.getElementById("playoffOverlay")?.classList.add("open");
  document.getElementById("playoffOverlay").scrollTop=0;
  const t=TEAMS[add],r=TEAM_REPORT[add]||{off:80,def:80},logo=teamLogo(add);
  document.getElementById("playoffTeam").innerHTML=`${logo?`<img src="${logo}" alt="${t.name} logo" referrerpolicy="no-referrer">`:""}<div class="season-detail-team">${t.name}</div><div class="season-bars"><div class="season-bar"><span>OFF</span><span class="season-bar-line"><i style="width:${r.off}%"></i></span><span class="season-bar-grade">${teamGrade(r.off)}</span></div><div class="season-bar"><span>DEF</span><span class="season-bar-line"><i style="width:${r.def}%"></i></span><span class="season-bar-grade">${teamGrade(r.def)}</span></div></div>`;
  document.getElementById("continueAwardsBtn").disabled=true;
  document.getElementById("continueAwardsBtn").textContent="Simulating Playoffs...";
  renderPlayoffTracker();
  playoffTimer=setTimeout(stepPlayoffGame,850);
}
function renderPlayoffTracker(){
 if(!lastPlayoffRun)return;
 const add=lastPlayoffRun.team,live=lastPlayoffRun.live||{roundIndex:lastPlayoffRun.rounds.length-1,done:true};
 const visible=lastPlayoffRun.rounds.slice(0,Math.min(lastPlayoffRun.rounds.length,live.roundIndex+1));
 document.getElementById("playoffRounds").innerHTML=visible.map((x,i)=>{
  const games=x.games||[],shown=games.slice(0,x.revealed||0),mw=shown.at(-1)?.myWins||0,ow=shown.at(-1)?.oppWins||0,complete=(x.revealed||0)>=games.length;
  const status=complete?(x.won?"Advanced":"Eliminated"):"Live";
  const gameDots=[0,1,2,3,4,5,6].map(g=>`<div class="playoff-game ${shown[g]?shown[g].win?"win":"loss":""}">G${g+1}</div>`).join("");
  return `<div class="playoff-card ${complete?(x.won?"win":"loss"):""}"><div class="round-top"><div class="round-label">${x.round}</div><div class="round-status">${status}</div></div><div class="round-matchup">${teamLogo(x.opp)?`<img src="${teamLogo(x.opp)}" alt="${TEAMS[x.opp].name} logo" referrerpolicy="no-referrer">`:"<div></div>"}<div class="round-vs">vs ${TEAMS[x.opp].name}<br><small>${add} ${mw} - ${ow} ${x.opp}</small></div><div class="round-games">${shown.length||1}<span>Game</span></div></div><div class="playoff-games">${gameDots}</div>${!complete&&i===live.roundIndex?`<div class="live-note">Simulating ${x.round}...</div>`:""}</div>`;
 }).join("");
 const summary=document.getElementById("playoffSummary");
 if(!live.done){
  summary.className="playoff-summary";
  summary.textContent="Playoff run in progress";
 }else{
  summary.className=`playoff-summary ${lastPlayoffRun.champion?"champ":"out"}`;
  const last=lastPlayoffRun.rounds[Math.min(live.roundIndex,lastPlayoffRun.rounds.length-1)];
  summary.textContent=lastPlayoffRun.champion?"NBA Champions":`Season ended in the ${last?.round||"Playoffs"}`;
 }
}
function stepPlayoffGame(){
 const run=lastPlayoffRun,live=run?.live;
 if(!run||!live||live.done)return;
 const round=run.rounds[live.roundIndex];
 if(!round){live.done=true;return;}
 round.revealed=Math.min((round.revealed||0)+1,round.games.length);
 const complete=round.revealed>=round.games.length;
 renderPlayoffTracker();
 if(complete){
  if(round.won&&live.roundIndex<run.rounds.length-1){
   live.roundIndex++;
   playoffTimer=setTimeout(stepPlayoffGame,1100);
   return;
  }
  live.done=true;
  document.getElementById("continueAwardsBtn").disabled=false;
  document.getElementById("continueAwardsBtn").textContent="Continue to Awards";
  renderPlayoffTracker();
  return;
 }
 playoffTimer=setTimeout(stepPlayoffGame,900);
}
function awardPhotoFor(name){
  const p=all.find(x=>x.name===name)||all.find(x=>x.player===name);
  return p?.headshot||"";
}
function buildAwardPhoto(){
 const pick=build.shooting||build.handling||build.iq||build.speed||Object.values(build)[0];
 return pick?.headshot||"";
}
function awardCard(type,title,name,abbr,stats,photo){
  return {type,title,name,abbr,stats,photo:photo||awardPhotoFor(name)};
}
function awardRand(type,items){
 const recent=recentAwardWinners[type]||[];
 const pool=items.filter(x=>!recent.includes(x.name));
 const pick=rand(pool.length?pool:items);
 recentAwardWinners[type]=[pick.name,...recent].slice(0,3);
 return pick;
}
function cupChampionArt(abbr){
 const name=TEAMS[abbr]?.name||abbr;
 return `<div class="cup-art"><svg viewBox="0 0 120 94" aria-hidden="true"><path d="M31 9h58v10c0 26-8 43-22 50v9h19v8H34v-8h19v-9C39 62 31 45 31 19V9Z" fill="#facc15"/><path d="M39 17h42v3c0 22-5 36-21 43-16-7-21-21-21-43v-3Z" fill="#f59e0b"/><path d="M31 20H14c1 18 10 29 25 32" fill="none" stroke="#fde68a" stroke-width="8" stroke-linecap="round"/><path d="M89 20h17c-1 18-10 29-25 32" fill="none" stroke="#fde68a" stroke-width="8" stroke-linecap="round"/><path d="M47 28h26M44 42h32" stroke="#7c2d12" stroke-width="5" stroke-linecap="round"/><path d="M48 78h24v8H48z" fill="#facc15"/></svg><div class="cup-art-name">${name}</div></div>`;
}
function buildAwards(){
 const add=lastRegularSeason?.team||selectedSeasonTeam||"BOS",tot=lastRegularSeason?.total||{pts:0,reb:0,ast:0,stl:0,blk:0},p=lastRegularSeason?.profile||buildStatProfile(),o=overall()||80;
 const ppg=tot.pts/82,rpg=tot.reb/82,apg=tot.ast/82,spg=tot.stl/82,bpg=tot.blk/82,wins=lastRegularSeason?.wins||0;
 const buildName=archetype(),team=TEAMS[add]?.name||add,buildStats={
  Record:`${lastRegularSeason?.wins||0}-${lastRegularSeason?.losses||0}`,
  Points:`${ppg.toFixed(1)} PPG`,
  Rebounds:`${rpg.toFixed(1)} RPG`,
  Assists:`${apg.toFixed(1)} APG`,
  "FG %":`${p.fg}%`,
  "3PT %":`${p.three}%`
 };
 const mvpFallback=[
  awardCard("NBA Regular Season","MVP Award","Shai Gilgeous-Alexander","OKC",{Record:"60-22",Points:"30.1 PPG",Rebounds:"5.3 RPG",Assists:"6.8 APG","FG %":"52%","3PT %":"38%"}),
  awardCard("NBA Regular Season","MVP Award","Luka Doncic","LAL",{Record:"53-29",Points:"29.4 PPG",Rebounds:"8.8 RPG",Assists:"9.5 APG","FG %":"49%","3PT %":"38%"}),
  awardCard("NBA Regular Season","MVP Award","Giannis Antetokounmpo","MIL",{Record:"51-31",Points:"30.7 PPG",Rebounds:"11.8 RPG",Assists:"6.1 APG","FG %":"61%","3PT %":"24%"}),
  awardCard("NBA Regular Season","MVP Award","Jayson Tatum","BOS",{Record:"58-24",Points:"27.0 PPG",Rebounds:"8.4 RPG",Assists:"5.5 APG","FG %":"47%","3PT %":"38%"}),
  awardCard("NBA Regular Season","MVP Award","Anthony Edwards","MIN",{Record:"55-27",Points:"28.1 PPG",Rebounds:"5.8 RPG",Assists:"5.1 APG","FG %":"47%","3PT %":"39%"}),
  awardCard("NBA Regular Season","MVP Award","Nikola Jokic","DEN",{Record:"54-28",Points:"26.8 PPG",Rebounds:"12.2 RPG",Assists:"9.4 APG","FG %":"58%","3PT %":"41%"}),
  awardCard("NBA Regular Season","MVP Award","Stephen Curry","GSW",{Record:"50-32",Points:"28.6 PPG",Rebounds:"4.6 RPG",Assists:"6.3 APG","FG %":"48%","3PT %":"42%"}),
  awardCard("NBA Regular Season","MVP Award","Jalen Brunson","NYK",{Record:"57-25",Points:"28.2 PPG",Rebounds:"3.4 RPG",Assists:"7.2 APG","FG %":"49%","3PT %":"40%"}),
  awardCard("NBA Regular Season","MVP Award","Kevin Durant","PHX",{Record:"49-33",Points:"27.8 PPG",Rebounds:"6.7 RPG",Assists:"5.1 APG","FG %":"52%","3PT %":"41%"}),
  awardCard("NBA Regular Season","MVP Award","Donovan Mitchell","CLE",{Record:"56-26",Points:"27.5 PPG",Rebounds:"4.7 RPG",Assists:"5.9 APG","FG %":"48%","3PT %":"39%"}),
  awardCard("NBA Regular Season","MVP Award","Tyrese Haliburton","IND",{Record:"52-30",Points:"22.9 PPG",Rebounds:"3.9 RPG",Assists:"11.2 APG","FG %":"49%","3PT %":"40%"}),
  awardCard("NBA Regular Season","MVP Award","Cade Cunningham","DET",{Record:"47-35",Points:"26.1 PPG",Rebounds:"6.1 RPG",Assists:"8.3 APG","FG %":"47%","3PT %":"37%"})
 ];
 const cupFallback=[
  awardCard("NBA Cup","NBA Cup MVP","Jalen Brunson","NYK",{Champion:"New York Knicks",Points:"28.4 PPG",Rebounds:"3.7 RPG",Assists:"7.1 APG","FG %":"49%"}),
  awardCard("NBA Cup","NBA Cup MVP","Shai Gilgeous-Alexander","OKC",{Champion:"Oklahoma City Thunder",Points:"30.8 PPG",Rebounds:"5.1 RPG",Assists:"6.5 APG","FG %":"53%"}),
  awardCard("NBA Cup","NBA Cup MVP","Anthony Edwards","MIN",{Champion:"Minnesota Timberwolves",Points:"29.2 PPG",Rebounds:"6.0 RPG",Assists:"4.8 APG","FG %":"48%"}),
  awardCard("NBA Cup","NBA Cup MVP","Luka Doncic","LAL",{Champion:"Los Angeles Lakers",Points:"29.9 PPG",Rebounds:"8.2 RPG",Assists:"9.1 APG","FG %":"49%"})
 ];
 const dpoyFallback=[
  awardCard("NBA Regular Season","DPOY Award","Victor Wembanyama","SAS",{Record:"42-40",Steals:"1.4 SPG",Blocks:"3.8 BPG",Rebounds:"11.2 RPG","DEF Grade":"S"}),
  awardCard("NBA Regular Season","DPOY Award","Anthony Davis","DAL",{Record:"50-32",Steals:"1.2 SPG",Blocks:"2.5 BPG",Rebounds:"11.5 RPG","DEF Grade":"S"}),
  awardCard("NBA Regular Season","DPOY Award","Bam Adebayo","MIA",{Record:"47-35",Steals:"1.1 SPG",Blocks:"1.3 BPG",Rebounds:"10.4 RPG","DEF Grade":"A+"}),
  awardCard("NBA Regular Season","DPOY Award","Jaren Jackson Jr.","MEM",{Record:"49-33",Steals:"1.1 SPG",Blocks:"2.2 BPG",Rebounds:"6.3 RPG","DEF Grade":"A+"}),
  awardCard("NBA Regular Season","DPOY Award","Evan Mobley","CLE",{Record:"55-27",Steals:"1.0 SPG",Blocks:"1.6 BPG",Rebounds:"9.3 RPG","DEF Grade":"A+"}),
  awardCard("NBA Regular Season","DPOY Award","Rudy Gobert","MIN",{Record:"53-29",Steals:"0.8 SPG",Blocks:"2.1 BPG",Rebounds:"12.0 RPG","DEF Grade":"A+"}),
  awardCard("NBA Regular Season","DPOY Award","Jrue Holiday","BOS",{Record:"56-26",Steals:"1.4 SPG",Blocks:"0.6 BPG",Rebounds:"5.3 RPG","DEF Grade":"A+"}),
  awardCard("NBA Regular Season","DPOY Award","OG Anunoby","NYK",{Record:"55-27",Steals:"1.6 SPG",Blocks:"0.9 BPG",Rebounds:"5.6 RPG","DEF Grade":"A+"}),
  awardCard("NBA Regular Season","DPOY Award","Chet Holmgren","OKC",{Record:"61-21",Steals:"0.9 SPG",Blocks:"2.4 BPG",Rebounds:"8.7 RPG","DEF Grade":"A+"}),
  awardCard("NBA Regular Season","DPOY Award","Dyson Daniels","ATL",{Record:"44-38",Steals:"2.5 SPG",Blocks:"0.7 BPG",Rebounds:"5.2 RPG","DEF Grade":"A"}),
  awardCard("NBA Regular Season","DPOY Award","Herb Jones","NOP",{Record:"45-37",Steals:"1.7 SPG",Blocks:"0.8 BPG",Rebounds:"4.1 RPG","DEF Grade":"A"}),
  awardCard("NBA Regular Season","DPOY Award","Derrick White","BOS",{Record:"57-25",Steals:"1.1 SPG",Blocks:"1.2 BPG",Rebounds:"4.4 RPG","DEF Grade":"A"})
 ];
 const mvpBuild=o>=94||(o>=90&&ppg>=23&&wins>=38&&Math.random()<.62)||(ppg>=27&&wins>=42);
 const dpoyBuild=(build.defense?.rating||0)>=92&&wins>=36&&Math.random()<.7;
 const cards=[];
 if(lastRegularSeason?.cup?.champion){
  cards.push(awardCard("NBA Cup","NBA Cup Champion",team,add,{Result:`Beat ${TEAMS[lastRegularSeason.cup.opp]?.name||lastRegularSeason.cup.opp}`,"Cup Record":"7-0","Build OVR":overall()},cupChampionArt(add)));
  cards.push(awardCard("NBA Cup","NBA Cup MVP",buildName,add,{Points:`${Math.max(18,ppg+2).toFixed(1)} PPG`,Rebounds:`${(rpg+.7).toFixed(1)} RPG`,Assists:`${(apg+.8).toFixed(1)} APG`,"FG %":`${Math.min(66,p.fg+2)}%`},teamLogo(add)));
 }else{
  cards.push(awardRand("cup",cupFallback));
 }
 cards.push(mvpBuild?awardCard("NBA Regular Season","MVP Award",buildName,add,buildStats,buildAwardPhoto()):awardRand("mvp",mvpFallback));
 cards.push(dpoyBuild?awardCard("NBA Regular Season","DPOY Award",buildName,add,{Record:`${wins}-${lastRegularSeason?.losses||0}`,Steals:`${spg.toFixed(1)} SPG`,Blocks:`${bpg.toFixed(1)} BPG`,Rebounds:`${rpg.toFixed(1)} RPG`,"DEF Grade":grade(build.defense?.rating||80)},buildAwardPhoto()):awardRand("dpoy",dpoyFallback));
 if(lastPlayoffRun?.champion){
  cards.push(awardCard("NBA Finals","Champion",team,add,{Record:`${lastRegularSeason?.wins||0}-${lastRegularSeason?.losses||0}`,"Playoff Result":"Won NBA Finals","Series Wins":"4","Build OVR":overall()},teamLogo(add)));
  cards.push(awardCard("NBA Finals","Finals MVP",buildName,add,{Points:`${Math.max(22,(tot.pts/82)+3).toFixed(1)} PPG`,Rebounds:`${(tot.reb/82).toFixed(1)} RPG`,Assists:`${(tot.ast/82).toFixed(1)} APG`,"FG %":`${Math.min(65,p.fg+2)}%`},buildAwardPhoto()));
 }
 return cards;
}
function openAwards(){
 awardCards=buildAwards();
 awardIndex=0;
 document.getElementById("regularSeasonOverlay")?.classList.remove("open");
 document.getElementById("playoffOverlay")?.classList.remove("open");
 document.getElementById("finalReportOverlay")?.classList.remove("open");
 document.getElementById("awardsOverlay")?.classList.add("open");
 renderAward();
}
function renderAward(){
 const card=awardCards[awardIndex]||awardCards[0];
 if(!card)return;
 document.getElementById("awardKicker").textContent=card.type;
 document.getElementById("awardTitle").textContent=card.title;
 const awardPhoto=document.getElementById("awardPhoto");
 const custom=typeof card.photo==="string"&&card.photo.trim().startsWith("<");
 awardPhoto.classList.toggle("cup-photo",custom);
 awardPhoto.innerHTML=custom?card.photo:photoLayers(card.photo,card.name,card.abbr);
 document.getElementById("awardPlayer").textContent=card.name;
 document.getElementById("awardTeam").textContent=card.abbr;
 document.getElementById("awardStats").innerHTML=Object.entries(card.stats).map(([k,v])=>`<div class="award-stat"><span>${k}</span><b>${v}</b></div>`).join("");
 document.getElementById("awardNextBtn").textContent=awardIndex>=awardCards.length-1?"Final Report":"Next Award";
}
function nextAward(){
 if(awardIndex<awardCards.length-1){awardIndex++;renderAward();return;}
 openFinalReport();
}
function prevAward(){
 awardIndex=Math.max(0,awardIndex-1);
 renderAward();
}
function closeFinalReport(){
 document.getElementById("finalReportOverlay")?.classList.remove("open");
 document.getElementById("app")?.classList.remove("hidden");
 setResultButton();
 window.scrollTo(0,0);
}
function backToCompletedBuild(){
 closeFinalReport();
}
function setResultButton(){
 const next=document.getElementById("nextBtn");
 if(!next||Object.keys(build).length<TRAITS.length||!lastRegularSeason)return;
 next.disabled=false;
 next.textContent="VIEW RESULTS";
 next.onclick=openFinalReport;
}
function finalReportStatus(){
  if(lastPlayoffRun?.champion)return "NBA Champions";
  const cup=lastRegularSeason?.cup?.champion?"NBA Cup Champions - ":"";
  if(lastPlayoffRun?.rounds?.length)return `${cup}Eliminated - ${lastPlayoffRun.rounds[lastPlayoffRun.rounds.length-1].round}`;
  return `${cup}Season Complete - Missed Playoffs`;
}
function traitRows(){
 return TRAITS.map(([k,label])=>{
  const s=build[k];
  return `<div class="season-detail-row">${s?photoMarkup(s.headshot,s.player,"mini-photo",s.team):`<div></div>`}<div><b>${label}</b><span>${s?s.player:"-"}</span></div><div class="grade-badge">${s?grade(s.rating):"-"}</div></div>`;
 }).join("");
}
function openFinalReport(){
 if(!lastRegularSeason)return;
 const add=lastRegularSeason.team,t=TEAMS[add],r=TEAM_REPORT[add]||{off:80,def:80},logo=teamLogo(add),tot=lastRegularSeason.total,profile=lastRegularSeason.profile;
 document.getElementById("regularSeasonOverlay")?.classList.remove("open");
 document.getElementById("playoffOverlay")?.classList.remove("open");
 document.getElementById("awardsOverlay")?.classList.remove("open");
 document.getElementById("seasonDetailOverlay")?.classList.remove("open");
 document.getElementById("finalReportOverlay")?.classList.add("open");
 document.getElementById("finalReportOverlay").scrollTop=0;
 document.getElementById("finalReportTeam").innerHTML=`${logo?`<img src="${logo}" alt="${t.name} logo" referrerpolicy="no-referrer">`:""}<div class="season-detail-team">${t.name}</div><div class="season-bars"><div class="season-bar"><span>OFF</span><span class="season-bar-line"><i style="width:${r.off}%"></i></span><span class="season-bar-grade">${teamGrade(r.off)}</span></div><div class="season-bar"><span>DEF</span><span class="season-bar-line"><i style="width:${r.def}%"></i></span><span class="season-bar-grade">${teamGrade(r.def)}</span></div></div>`;
 document.getElementById("finalReportBanner").innerHTML=`<b>${finalReportStatus()}</b><span>${lastRegularSeason.wins}-${lastRegularSeason.losses} Season - OVR ${overall()||0}</span>`;
 renderPlayer("results",{team:add});
 document.getElementById("finalReportProduction").innerHTML=`<div class="production-card"><b>${(tot.pts/82).toFixed(1)}</b><span>Points</span></div><div class="production-card"><b>${(tot.reb/82).toFixed(1)}</b><span>Rebounds</span></div><div class="production-card"><b>${(tot.ast/82).toFixed(1)}</b><span>Assists</span></div><div class="production-card"><b>${(tot.stl/82).toFixed(1)}</b><span>Steals</span></div><div class="production-card"><b>${(tot.blk/82).toFixed(1)}</b><span>Blocks</span></div><div class="production-card"><b>${profile.fg}%</b><span>FG%</span></div><div class="production-card"><b>${profile.three}%</b><span>3PT%</span></div><div class="production-card"><b>${profile.ft}%</b><span>FT%</span></div>`;
 document.getElementById("finalReportTraits").innerHTML=traitRows();
 const best=[...(lastRegularSeason.games||[])].sort((a,b)=>(b.stats.pts+b.stats.reb+b.stats.ast)-(a.stats.pts+a.stats.reb+a.stats.ast))[0];
 document.getElementById("finalReportBest").innerHTML=best?`<b>Best Game</b><div class="best-title">GM ${best.week} ${best.home?"vs":"@"} ${TEAMS[best.opp].name}</div><div class="best-line">${best.stats.pts} PTS - ${best.stats.reb} REB - ${best.stats.ast} AST</div>`:"";
 setResultButton();
}
function buildStatProfile(){
 const o=overall()||80,shoot=build.shooting?.rating||75,handle=build.handling?.rating||75,ath=build.speed?.rating||75,iq=build.iq?.rating||75,size=build.size?.rating||75,def=build.defense?.rating||75,reb=build.rebounding?.rating||75,star=Math.max(0,o-82),elite=Math.max(0,o-90);
 return {
  pts:Math.max(8,Math.round(10+(shoot-65)*.26+(handle-70)*.12+(o-75)*.18+star*.32+elite*.55)),
  reb:Math.max(2,Math.round(2+(reb-65)*.14+(size-70)*.09+star*.05)),
  ast:Math.max(2,Math.round(2+(handle-65)*.14+(iq-70)*.12+star*.06)),
  stl:Math.max(.4,((def-65)*.018+(ath-70)*.01+0.7)),
  blk:Math.max(.2,((def-65)*.014+(size-70)*.018+0.35)),
  fg:Math.min(62,Math.max(40,Math.round(43+(shoot-72)*.1+(size-75)*.05+(iq-75)*.04))),
  three:Math.min(46,Math.max(27,Math.round(31+(shoot-72)*.16+(handle-75)*.04))),
  ft:Math.min(94,Math.max(62,Math.round(72+(shoot-70)*.13+(iq-75)*.04)))
 };
}
function gameStatLine(profile,win){
 const swing=()=>Math.random()*2.2-1.1,boost=win?1.04:.96;
 return {
  pts:Math.max(4,Math.round((profile.pts+swing()*4)*boost)),
  reb:Math.max(0,Math.round(profile.reb+swing()*2)),
  ast:Math.max(0,Math.round(profile.ast+swing()*2)),
  stl:Math.max(0,Math.round(profile.stl+swing())),
  blk:Math.max(0,Math.round(profile.blk+swing()))
 };
}
function makeSeasonGames(add,wins){
  const abbrs=Object.keys(TEAMS).filter(a=>a!==add),profile=buildStatProfile(),games=[];
  let results=[...Array(wins).fill(true),...Array(82-wins).fill(false)].sort(()=>Math.random()-.5);
 for(let i=0;i<82;i++){
  const opp=abbrs[i%abbrs.length],home=Math.random()>.5,win=results[i],teamScore=Math.round(101+Math.random()*25+(win?5:-4)),oppScore=Math.round(teamScore+(win?-(1+Math.random()*16):(1+Math.random()*16))),s=gameStatLine(profile,win);
  games.push({week:i+1,opp,home,win,score:`${teamScore}-${oppScore}`,stats:s});
  }
  return {games,profile};
}
function simulateNBACup(add,wins){
 const o=overall()||80,r=TEAM_REPORT[add]||{score:78},pool=Object.keys(TEAMS).filter(a=>a!==add);
 const opp=rand(pool.sort((a,b)=>(TEAM_REPORT[b]?.score||75)-(TEAM_REPORT[a]?.score||75)).slice(0,12));
 const chance=Math.max(.1,Math.min(.66,.16+(r.score-75)*.013+(o-80)*.02+wins*.003));
 const champion=Math.random()<chance;
 const reachedFinal=champion||Math.random()<Math.min(.46,chance+.18);
 return {champion,reachedFinal,opp};
}
function tagCupGames(season,cup){
 const games=season.games||[];
 const cupCount=cup?.champion?7:cup?.reachedFinal?6:4;
 const start=3+Math.floor(Math.random()*4),step=3+Math.floor(Math.random()*2);
 for(let i=0;i<cupCount;i++){
  const g=games[Math.min(games.length-1,start+i*step)];
  if(!g)continue;
  g.cup=true;
  if(cup?.champion)g.win=true;
  else if(cup?.reachedFinal)g.win=i<cupCount-1;
  else if(i===cupCount-1)g.win=false;
  const teamScore=Math.round(106+Math.random()*22+(g.win?6:-4));
  const oppScore=Math.round(teamScore+(g.win?-(2+Math.random()*13):(2+Math.random()*13)));
  g.score=`${teamScore}-${oppScore}`;
  g.stats=gameStatLine(season.profile,g.win);
 }
 return season;
}
function renderRegularSeason(add){
  const o=overall()||80,t=TEAMS[add],r=TEAM_REPORT[add]||{score:t.base+40,off:t.base+38,def:t.base+38,note:"season profile"},imp=impact(),logo=teamLogo(add),starLift=Math.max(0,o-84)*.55+Math.max(0,o-92)*.75,target=Math.round(Math.max(20,Math.min(72,19+(r.score-66)*1.05+imp*.58+(o-80)*.26+starLift+(Math.random()*8-2))));
  const cup=simulateNBACup(add,target);
  const season=tagCupGames(makeSeasonGames(add,target),cup),wins=season.games.filter(g=>g.win).length,losses=82-wins,playoffBound=wins>=42,tot=season.games.reduce((a,g)=>{a.pts+=g.stats.pts;a.reb+=g.stats.reb;a.ast+=g.stats.ast;a.stl+=g.stats.stl;a.blk+=g.stats.blk;return a},{pts:0,reb:0,ast:0,stl:0,blk:0});
  lastRegularSeason={team:add,wins,losses,playoffBound,total:tot,profile:season.profile,games:season.games,cup};
 document.getElementById("regularSeasonOverlay").classList.add("open");
 document.getElementById("regularSeasonOverlay").scrollTop=0;
 document.getElementById("regularSeasonTeam").innerHTML=`${logo?`<img src="${logo}" alt="${t.name} logo" referrerpolicy="no-referrer">`:""}<div class="season-detail-team">${t.name}</div><div class="season-bars"><div class="season-bar"><span>OFF</span><span class="season-bar-line"><i style="width:${r.off}%"></i></span><span class="season-bar-grade">${teamGrade(r.off)}</span></div><div class="season-bar"><span>DEF</span><span class="season-bar-line"><i style="width:${r.def}%"></i></span><span class="season-bar-grade">${teamGrade(r.def)}</span></div></div>`;
 document.getElementById("regularSeasonRecord").innerHTML=`<div class="record-win"><span class="record-num">${wins}</span><span class="record-label">Wins</span></div><div class="record-sep">-</div><div class="record-loss"><span class="record-num">${losses}</span><span class="record-label">Losses</span></div>`;
  document.getElementById("regularSeasonStatus").textContent=`${playoffBound?"Playoff Bound":"Missed Playoffs"}${cup.champion?" - NBA Cup Champs":cup.reachedFinal?" - NBA Cup Finalist":""}`;
 document.getElementById("regularSeasonGames").innerHTML=season.games.map(g=>`<div class="game-row ${g.win?"win":"loss"} ${g.cup?"cup "+(g.win?"cup-win":"cup-loss"):""}"><div class="game-num">${g.cup?"Cup":`GM ${g.week}`}</div><div class="game-result">${g.win?"W":"L"}</div><div>${g.home?"vs":"@"} ${TEAMS[g.opp].name}${g.cup?` <span class="cup-tag">NBA Cup</span>`:""}</div><div class="game-score">${g.score}</div><div class="game-stat">${g.stats.pts} PTS ${g.stats.reb} REB ${g.stats.ast} AST</div></div>`).join("");
 document.getElementById("regularSeasonProduction").innerHTML=`<div class="production-card"><b>${(tot.pts/82).toFixed(1)}</b><span>Points</span></div><div class="production-card"><b>${(tot.reb/82).toFixed(1)}</b><span>Rebounds</span></div><div class="production-card"><b>${(tot.ast/82).toFixed(1)}</b><span>Assists</span></div><div class="production-card"><b>${(tot.stl/82).toFixed(1)}</b><span>Steals</span></div><div class="production-card"><b>${(tot.blk/82).toFixed(1)}</b><span>Blocks</span></div><div class="production-card"><b>${season.profile.fg}%</b><span>FG%</span></div><div class="production-card"><b>${season.profile.three}%</b><span>3PT%</span></div><div class="production-card"><b>${season.profile.ft}%</b><span>FT%</span></div>`;
 const btn=document.getElementById("enterPlayoffsBtn");
 btn.disabled=false;
 btn.textContent=playoffBound?"Enter Playoffs":"Season Complete";
}
function simulate(add){let imp=impact(),rows=[];Object.entries(TEAMS).forEach(([a,t])=>{let power=t.base+(a===add?imp:0),wins=Math.round(Math.max(12,Math.min(70,power+(Math.random()*10-5))));rows.push({abbr:a,name:t.name,conf:t.conf,w:wins,l:82-wins,rating:power})});let east=rows.filter(x=>x.conf==="East").sort((a,b)=>b.w-a.w).slice(0,8),west=rows.filter(x=>x.conf==="West").sort((a,b)=>b.w-a.w).slice(0,8),log=[],ec=play(east,log,"East"),wc=play(west,log,"West"),champ=series(ec,wc,log,"NBA Finals");renderSim(rows,log,champ,add,imp)}
function prob(a,b){return Math.max(.16,Math.min(.84,.5+(a.rating-b.rating)/62+(Math.random()-.5)*.05))}
function series(a,b,log,r){let aw=0,bw=0;while(aw<4&&bw<4){Math.random()<prob(a,b)?aw++:bw++}let win=aw>bw?a:b;log.push(`${r}: ${a.abbr} ${aw} - ${bw} ${b.abbr} -> ${win.abbr}`);return win}
function play(s,log,c){let r1=[series(s[0],s[7],log,c+" R1"),series(s[3],s[4],log,c+" R1"),series(s[1],s[6],log,c+" R1"),series(s[2],s[5],log,c+" R1")],r2=[series(r1[0],r1[1],log,c+" Semis"),series(r1[2],r1[3],log,c+" Semis")];return series(r2[0],r2[1],log,c+" Finals")}
function table(rows,conf,add){return `<table><tr><th>#</th><th>Team</th><th>W-L</th></tr>${rows.filter(x=>x.conf===conf).sort((a,b)=>b.w-a.w).map((x,i)=>`<tr class="${x.abbr===add?'hi':''}"><td>${i+1}</td><td>${x.abbr} ${x.name}</td><td>${x.w}-${x.l}</td></tr>`).join("")}</table>`}
function renderSim(rows,log,champ,add,imp){let awards=[];if(overall()>=95)awards.push("MVP finalist","All-NBA First Team");else if(overall()>=90)awards.push("All-NBA candidate");if((build.defense?.rating||0)>=94)awards.push("All-Defense candidate");if(champ.abbr===add)awards.push("Finals MVP favorite");document.getElementById("simNote").innerHTML=`Your ${overall()} OVR ${archetype()} was added to <b>${TEAMS[add].name}</b>. Estimated impact: <b>+${imp} wins</b>.`;document.getElementById("simResult").innerHTML=`<div class="sim-grid"><div><b>East Standings</b>${table(rows,"East",add)}</div><div><b>West Standings</b>${table(rows,"West",add)}</div></div><div class="sim-grid"><div><b>Playoffs</b>${log.map(x=>`<div class="series">${x}</div>`).join("")}<div class="champ">Champion: ${champ.name}</div></div><div><b>Player Story</b><div class="series">${awards.length?awards.join("<br>"):"Strong starter. No major awards this sim."}</div><div class="series">Build archetype: <b>${archetype()}</b><br>Regular season impact: <b>+${imp} wins</b></div></div></div>`}

