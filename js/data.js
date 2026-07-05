// Build-A-GOAT data, roster helpers, rating helpers, and shared state.
const TEAMS={ATL:{name:"Atlanta Hawks",conf:"East",base:39,players:["Trae Young","Jalen Johnson","Dyson Daniels","Onyeka Okongwu","Zaccharie Risacher"]},BOS:{name:"Boston Celtics",conf:"East",base:56,players:["Jayson Tatum","Jaylen Brown","Derrick White","Jrue Holiday","Kristaps Porzingis"]},BKN:{name:"Brooklyn Nets",conf:"East",base:26,players:["Cam Thomas","Nic Claxton","Cameron Johnson","Noah Clowney","Day'Ron Sharpe"]},CHA:{name:"Charlotte Hornets",conf:"East",base:23,players:["LaMelo Ball","Brandon Miller","Miles Bridges","Mark Williams","Tre Mann"]},CHI:{name:"Chicago Bulls",conf:"East",base:35,players:["Coby White","Zach LaVine","Nikola Vucevic","Josh Giddey","Patrick Williams"]},CLE:{name:"Cleveland Cavaliers",conf:"East",base:53,players:["Donovan Mitchell","Evan Mobley","Darius Garland","Jarrett Allen","Max Strus"]},DAL:{name:"Dallas Mavericks",conf:"West",base:50,players:["Luka Doncic","Kyrie Irving","Anthony Davis","Klay Thompson","Dereck Lively II"]},DEN:{name:"Denver Nuggets",conf:"West",base:52,players:["Nikola Jokic","Jamal Murray","Aaron Gordon","Michael Porter Jr.","Christian Braun"]},DET:{name:"Detroit Pistons",conf:"East",base:31,players:["Cade Cunningham","Jaden Ivey","Ausar Thompson","Jalen Duren","Tobias Harris"]},GSW:{name:"Golden State Warriors",conf:"West",base:45,players:["Stephen Curry","Draymond Green","Jimmy Butler","Jonathan Kuminga","Brandin Podziemski"]},HOU:{name:"Houston Rockets",conf:"West",base:47,players:["Kevin Durant","Alperen Sengun","Amen Thompson","Jalen Green","Fred VanVleet"]},IND:{name:"Indiana Pacers",conf:"East",base:48,players:["Tyrese Haliburton","Pascal Siakam","Bennedict Mathurin","Myles Turner","Andrew Nembhard"]},LAC:{name:"LA Clippers",conf:"West",base:44,players:["Kawhi Leonard","James Harden","Ivica Zubac","Norman Powell","Derrick Jones Jr."]},LAL:{name:"Los Angeles Lakers",conf:"West",base:49,players:["LeBron James","Luka Doncic","Austin Reaves","Rui Hachimura","Jarred Vanderbilt"]},MEM:{name:"Memphis Grizzlies",conf:"West",base:43,players:["Ja Morant","Jaren Jackson Jr.","Desmond Bane","Marcus Smart","Zach Edey"]},MIA:{name:"Miami Heat",conf:"East",base:42,players:["Bam Adebayo","Tyler Herro","Jimmy Butler","Terry Rozier","Jaime Jaquez Jr."]},MIL:{name:"Milwaukee Bucks",conf:"East",base:47,players:["Giannis Antetokounmpo","Damian Lillard","Khris Middleton","Brook Lopez","Bobby Portis"]},MIN:{name:"Minnesota Timberwolves",conf:"West",base:51,players:["Anthony Edwards","Julius Randle","Rudy Gobert","Jaden McDaniels","Mike Conley"]},NOP:{name:"New Orleans Pelicans",conf:"West",base:34,players:["Zion Williamson","Brandon Ingram","CJ McCollum","Dejounte Murray","Trey Murphy III"]},NYK:{name:"New York Knicks",conf:"East",base:54,players:["Jalen Brunson","Karl-Anthony Towns","OG Anunoby","Mikal Bridges","Josh Hart"]},OKC:{name:"Oklahoma City Thunder",conf:"West",base:60,players:["Shai Gilgeous-Alexander","Chet Holmgren","Jalen Williams","Luguentz Dort","Isaiah Hartenstein"]},ORL:{name:"Orlando Magic",conf:"East",base:46,players:["Paolo Banchero","Franz Wagner","Jalen Suggs","Wendell Carter Jr.","Cole Anthony"]},PHI:{name:"Philadelphia 76ers",conf:"East",base:42,players:["Joel Embiid","Tyrese Maxey","Paul George","Jared McCain","Kelly Oubre Jr."]},PHX:{name:"Phoenix Suns",conf:"West",base:41,players:["Devin Booker","Bradley Beal","Kevin Durant","Tyus Jones","Jusuf Nurkic"]},POR:{name:"Portland Trail Blazers",conf:"West",base:25,players:["Scoot Henderson","Shaedon Sharpe","Anfernee Simons","Deni Avdija","Deandre Ayton"]},SAC:{name:"Sacramento Kings",conf:"West",base:40,players:["Domantas Sabonis","DeMar DeRozan","Zach LaVine","Keegan Murray","Malik Monk"]},SAS:{name:"San Antonio Spurs",conf:"West",base:39,players:["Victor Wembanyama","De'Aaron Fox","Stephon Castle","Devin Vassell","Keldon Johnson"]},TOR:{name:"Toronto Raptors",conf:"East",base:32,players:["Scottie Barnes","RJ Barrett","Immanuel Quickley","Brandon Ingram","Jakob Poeltl"]},UTA:{name:"Utah Jazz",conf:"West",base:24,players:["Lauri Markkanen","Collin Sexton","Keyonte George","Walker Kessler","John Collins"]},WAS:{name:"Washington Wizards",conf:"East",base:19,players:["Jordan Poole","Kyle Kuzma","Alex Sarr","Bilal Coulibaly","Malcolm Brogdon"]}};
const TRAITS=[
 ["shooting","Shooting","Shooting","Elite shot making, range, and off-ball scoring.","box"],
 ["handling","Handling","Handle","Ball control, space creation, and pressure relief.","box"],
 ["speed","Athleticism","Athleticism","Speed, vertical pop, change of direction, burst, and open-floor movement.","box"],
 ["iq","Basketball IQ","IQ","Processing speed, reads, and decision making.","box"],
 ["size","Size","Size","Frame, strength, length, and physical mismatch value.","box"],
 ["defense","Defense","Defense","Point-of-attack pressure, contests, steals, blocks, and versatility.","box"],
 ["clutch","Clutch","Clutch","Late-game shot making, poise, and pressure moments.","menu"],
 ["leadership","Leadership","Leadership","Floor command, energy, chemistry, and winning presence.","menu"],
 ["rebounding","Rebounding","Rebounding","Glass work, positioning, box outs, and second chances.","menu"]
];
const TIER={mvp:96,superstar:93,allnba:90,allstar:86,elite:82,starter:77,rotation:71,bench:66};
const PLAYER_TIER={"Nikola Jokic":"mvp","Luka Doncic":"mvp","Shai Gilgeous-Alexander":"mvp","Giannis Antetokounmpo":"mvp","Victor Wembanyama":"superstar","Stephen Curry":"superstar","LeBron James":"superstar","Kevin Durant":"superstar","Jayson Tatum":"superstar","Anthony Edwards":"superstar","Joel Embiid":"superstar","Jalen Brunson":"allnba","Anthony Davis":"allnba","Kyrie Irving":"allnba","Donovan Mitchell":"allnba","Tyrese Haliburton":"allnba","Devin Booker":"allnba","Ja Morant":"allnba","Paolo Banchero":"allnba","Bam Adebayo":"allstar","Trae Young":"allstar","Cade Cunningham":"allstar","Zion Williamson":"allstar","Damian Lillard":"allstar","Jimmy Butler":"allstar","Kawhi Leonard":"allstar","James Harden":"allstar","Karl-Anthony Towns":"allstar","Chet Holmgren":"allstar","Jaylen Brown":"allstar","Jalen Williams":"allstar","Derrick White":"elite","Jrue Holiday":"elite","Evan Mobley":"elite","Darius Garland":"elite","Jarrett Allen":"elite","Pascal Siakam":"elite","Jamal Murray":"elite","Aaron Gordon":"elite","Mikal Bridges":"elite","OG Anunoby":"elite","Franz Wagner":"elite","Scottie Barnes":"elite","Alperen Sengun":"elite","Domantas Sabonis":"elite","De'Aaron Fox":"elite","Lauri Markkanen":"elite","Jaren Jackson Jr.":"elite","Desmond Bane":"elite"};
const ESPN_IDS={ATL:"atl",BOS:"bos",BKN:"bkn",CHA:"cha",CHI:"chi",CLE:"cle",DAL:"dal",DEN:"den",DET:"det",GSW:"gs",HOU:"hou",IND:"ind",LAC:"lac",LAL:"lal",MEM:"mem",MIA:"mia",MIL:"mil",MIN:"min",NOP:"no",NYK:"ny",OKC:"okc",ORL:"orl",PHI:"phi",PHX:"phx",POR:"por",SAC:"sac",SAS:"sa",TOR:"tor",UTA:"utah",WAS:"wsh"};
const TEAM_COLORS={ATL:"#e03a3e",BOS:"#007a33",BKN:"#f5f5f5",CHA:"#1d1160",CHI:"#ce1141",CLE:"#860038",DAL:"#00538c",DEN:"#0e2240",DET:"#c8102e",GSW:"#1d428a",HOU:"#ce1141",IND:"#002d62",LAC:"#c8102e",LAL:"#552583",MEM:"#5d76a9",MIA:"#98002e",MIL:"#00471b",MIN:"#0c2340",NOP:"#0c2340",NYK:"#f58426",OKC:"#007ac1",ORL:"#0077c0",PHI:"#006bb6",PHX:"#e56020",POR:"#e03a3e",SAC:"#5a2d81",SAS:"#c4ced4",TOR:"#ce1141",UTA:"#002b5c",WAS:"#002b5c"};
const TEAM_TRIMS={ATL:"#fdb927",BOS:"#f8fafc",BKN:"#111827",CHA:"#00788c",CHI:"#111827",CLE:"#fdbb30",DAL:"#b8c4ca",DEN:"#fec524",DET:"#1d42ba",GSW:"#ffc72c",HOU:"#f8fafc",IND:"#fdbb30",LAC:"#1d428a",LAL:"#fdb927",MEM:"#12173f",MIA:"#f9a01b",MIL:"#eee1c6",MIN:"#78be20",NOP:"#c8102e",NYK:"#006bb6",OKC:"#ef3b24",ORL:"#111827",PHI:"#ed174c",PHX:"#1d1160",POR:"#111827",SAC:"#63727a",SAS:"#111827",TOR:"#111827",UTA:"#f9a01b",WAS:"#e31837"};
const TEAM_STATS_2026={OKC:{w:64,l:18,ppg:119.5,rpg:44.2,apg:27.4,ortg:121.2,drtg:108.2,note:"64-win title-level profile"},SAS:{w:62,l:20,ppg:118.7,rpg:45.1,apg:28.1,ortg:119.1,drtg:109.4,note:"62-win Wemby-led leap"},DET:{w:60,l:22,ppg:116.4,rpg:45.7,apg:26.2,ortg:117.3,drtg:110.1,note:"60-win defensive jump"},BOS:{w:58,l:24,ppg:117.1,rpg:44.8,apg:26.8,ortg:119.0,drtg:111.0,note:"elite two-way contender"},NYK:{w:57,l:25,ppg:115.8,rpg:43.8,apg:25.7,ortg:118.4,drtg:111.7,note:"championship-level record bump"},CLE:{w:55,l:27,ppg:115.1,rpg:43.4,apg:27.1,ortg:117.5,drtg:111.5,note:"balanced playoff team"},DEN:{w:54,l:28,ppg:116.9,rpg:44.0,apg:29.2,ortg:119.4,drtg:113.2,note:"elite offense"},MIN:{w:52,l:30,ppg:113.5,rpg:44.6,apg:25.2,ortg:115.1,drtg:110.6,note:"defense-first contender"},LAL:{w:51,l:31,ppg:115.9,rpg:42.5,apg:27.2,ortg:117.8,drtg:114.1,note:"star offense"},HOU:{w:50,l:32,ppg:113.7,rpg:45.8,apg:24.9,ortg:114.9,drtg:111.4,note:"strong defense and rebounding"},ORL:{w:48,l:34,ppg:111.2,rpg:43.7,apg:24.5,ortg:112.1,drtg:110.8,note:"defense carries the floor"},TOR:{w:46,l:36,ppg:113.1,rpg:43.9,apg:27.8,ortg:114.2,drtg:113.8,note:"solid developing team"},ATL:{w:46,l:36,ppg:116.2,rpg:42.4,apg:28.0,ortg:116.9,drtg:116.1,note:"offense-heavy playoff team"},PHI:{w:45,l:37,ppg:112.8,rpg:41.9,apg:25.0,ortg:114.8,drtg:114.3,note:"middle playoff profile"},PHX:{w:45,l:37,ppg:114.2,rpg:42.1,apg:26.0,ortg:116.1,drtg:115.2,note:"shot-making team"},CHA:{w:44,l:38,ppg:112.4,rpg:43.0,apg:25.8,ortg:113.2,drtg:113.9,note:"young team climb"},MIA:{w:43,l:39,ppg:111.0,rpg:42.5,apg:25.2,ortg:112.7,drtg:112.8,note:"scheme floor"},POR:{w:42,l:40,ppg:111.6,rpg:43.5,apg:24.6,ortg:112.5,drtg:113.7,note:"play-in level"},LAC:{w:42,l:40,ppg:112.5,rpg:42.0,apg:25.4,ortg:114.0,drtg:114.6,note:"steady veteran team"},MIL:{w:39,l:43,ppg:113.6,rpg:42.2,apg:25.8,ortg:115.2,drtg:116.7,note:"below-.500 veteran year"},GSW:{w:37,l:45,ppg:112.9,rpg:43.1,apg:28.5,ortg:114.6,drtg:116.4,note:"aging offense-heavy profile"},DAL:{w:35,l:47,ppg:111.8,rpg:42.8,apg:24.8,ortg:113.0,drtg:116.5,note:"down season"},CHI:{w:31,l:51,ppg:110.7,rpg:42.9,apg:25.1,ortg:111.4,drtg:117.1,note:"lottery profile"},NOP:{w:29,l:53,ppg:109.9,rpg:42.6,apg:24.4,ortg:110.6,drtg:117.6,note:"injury-hit year"},MEM:{w:25,l:57,ppg:108.8,rpg:42.7,apg:24.9,ortg:109.8,drtg:118.5,note:"rebuild lottery season"},SAC:{w:22,l:60,ppg:108.5,rpg:41.9,apg:24.2,ortg:109.2,drtg:119.0,note:"deep lottery season"},UTA:{w:22,l:60,ppg:109.0,rpg:43.3,apg:24.8,ortg:109.5,drtg:119.4,note:"retooling roster"},BKN:{w:20,l:62,ppg:107.4,rpg:41.8,apg:23.9,ortg:108.4,drtg:119.6,note:"deep rebuild"},IND:{w:19,l:63,ppg:107.8,rpg:41.7,apg:25.4,ortg:108.7,drtg:120.0,note:"19-win injury-crash season"},WAS:{w:17,l:65,ppg:106.9,rpg:41.5,apg:24.1,ortg:107.9,drtg:120.4,note:"league-worst record"}};
function clampTeam(n){return Math.max(58,Math.min(99,Math.round(n)))}
const TEAM_REPORT=Object.fromEntries(Object.entries(TEAM_STATS_2026).map(([abbr,s])=>{
 const record=55+(s.w/82)*45;
 const off=clampTeam(68+(s.ortg-107)*2.15+(s.ppg-110)*.28+(s.apg-25)*.55);
 const def=clampTeam(98-(s.drtg-106)*2.1+(s.rpg-42)*.35);
 const score=clampTeam(record*.55+off*.23+def*.22);
 return [abbr,{score,off,def,note:s.note,w:s.w,l:s.l,ppg:s.ppg,rpg:s.rpg,apg:s.apg,ortg:s.ortg,drtg:s.drtg}];
}));
let all=[],current=null,build={},lockedSpinTeam=null,respinsLeft=5,isSpinning=false,simTeam=null,activeStageTab="physical",selectedSeasonTeam=null,selectedSeasonTeamId=null,isSeasonSpinning=false,lastRegularSeason=null,lastPlayoffRun=null,playoffTimer=null,awardCards=[],awardIndex=0,recentAwardWinners={};

function selectedBuildTeamId(){
 return lastRegularSeason?.team || selectedSeasonTeamId || selectedSeasonTeam || simTeam || "";
}

function hash(s){let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))%9973;return h}
function rand(a){return a[Math.floor(Math.random()*a.length)]}
function clampRating(n){return Math.max(50,Math.min(99,Math.round(n)))}
const ATHLETICISM_OVERRIDE={
 "Ja Morant":99,
 "Amen Thompson":98,
 "Anthony Edwards":98,
 "Giannis Antetokounmpo":98,
 "De'Aaron Fox":97,
 "Ausar Thompson":97,
 "Zion Williamson":96,
 "Jalen Green":96,
 "Shaedon Sharpe":96,
 "Shai Gilgeous-Alexander":95,
 "LeBron James":94,
 "Donovan Mitchell":94,
 "Jaylen Brown":94,
 "Jaden Ivey":94,
 "Scoot Henderson":94,
 "Derrick Jones Jr.":94,
 "Jonathan Kuminga":93,
 "Jalen Johnson":93,
 "Bilal Coulibaly":93,
 "Kyrie Irving":92,
 "Dejounte Murray":92,
 "Victor Wembanyama":92,
 "Anthony Davis":90,
 "Mikal Bridges":89,
 "Bam Adebayo":88,
 "Evan Mobley":88,
 "Stephen Curry":86,
 "Luka Doncic":82,
 "James Harden":80,
 "Nikola Jokic":76,
 "Rudy Gobert":70,
 "Brook Lopez":62,
 "Zach Edey":58
};
const DEFENSE_OVERRIDE={
 "Victor Wembanyama":99,"Anthony Davis":97,"Rudy Gobert":97,"Jrue Holiday":96,"Derrick White":95,"Alex Caruso":95,
 "OG Anunoby":95,"Bam Adebayo":95,"Kawhi Leonard":95,"Evan Mobley":96,"Chet Holmgren":96,"Jaren Jackson Jr.":96,
 "Draymond Green":94,"Ausar Thompson":93,"Amen Thompson":92,"Mikal Bridges":92,"Herb Jones":94,"Dyson Daniels":94,
 "Lu Dort":93,"Luguentz Dort":93,"Jaden McDaniels":93,"Jimmy Butler":92,"Jaylen Brown":91,"Jayson Tatum":91,
 "Giannis Antetokounmpo":96,"Anthony Edwards":90,"Donovan Mitchell":82,"Shai Gilgeous-Alexander":88,
 "Stephen Curry":75,"Luka Doncic":74,"Nikola Jokic":78,"Domantas Sabonis":72,"Alperen Sengun":74,
 "Karl-Anthony Towns":72,"Trae Young":58,"Damian Lillard":60,"James Harden":70,"Tyrese Haliburton":72,
 "Jalen Brunson":73,"Kyrie Irving":75,"Devin Booker":78,"LaMelo Ball":66,"Zach LaVine":70,"Jordan Poole":56
};
function initials(name){return name.split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase()}
function teamLogo(abbr){
 const id=ESPN_IDS[abbr];
 return id?`https://a.espncdn.com/i/teamlogos/nba/500/${id}.png`:"";
}
function playerHeadshot(name,abbr,src){
 if(src)return src;
 const exact=all.find(p=>p.name===name&&(abbr?p.abbr===abbr:true));
 if(exact?.headshot)return exact.headshot;
 const any=all.find(p=>p.name===name&&p.headshot);
 return any?.headshot||"";
}
function photoLayers(src,name,abbr){
 src=playerHeadshot(name,abbr,src);
 const fallback=initials(name||"NBA");
 const logo=teamLogo(abbr);
 const logoImg=logo?`<img class="photo-logo" src="${logo}" alt="" referrerpolicy="no-referrer">`:"";
 if(!src)return `${logoImg}<span class="photo-initials">${fallback}</span>`;
 return `${logoImg}<img class="photo-player" src="${src}" alt="${name} headshot" referrerpolicy="no-referrer" onerror="this.outerHTML='<span class=&quot;photo-initials&quot;>${fallback}</span>'">`;
}
function photoMarkup(src,name,cls,abbr){
 return `<div class="${cls}">${photoLayers(src,name,abbr)}</div>`;
}

function formatHeight(v){
 if(!v)return"--";
 if(typeof v==="string"&&v.includes("'"))return v;
 let n=Number(v);
 if(!Number.isFinite(n))return String(v);
 return `${Math.floor(n/12)}'${n%12}`;
}
function heightInches(v){
 if(!v||v==="--")return null;
 if(typeof v==="number")return v;
 const s=String(v);
 const feet=s.match(/(\d+)'(\d+)/);
 if(feet)return Number(feet[1])*12+Number(feet[2]);
 const n=Number(s);
 return Number.isFinite(n)?n:null;
}
function sizeRating(height,weight,name){
 const inches=heightInches(height);
 const pounds=Number(weight);
 if(!inches)return null;
 let score;
 if(inches<=67)score=50;
 else if(inches<=69)score=55;
 else if(inches<=71)score=60;
 else if(inches<=73)score=66;
 else if(inches<=75)score=72;
 else if(inches<=77)score=78;
 else if(inches<=79)score=84;
 else if(inches<=81)score=90;
 else if(inches<=83)score=94;
 else score=98;
 if(Number.isFinite(pounds)){
  if(pounds<165)score-=6;
  else if(pounds<180)score-=3;
  else if(pounds>=275)score+=5;
  else if(pounds>=250)score+=4;
  else if(pounds>=230)score+=2;
 }
 if(/Wembanyama|Bol|Porzingis|Holmgren/.test(name))score=Math.max(score,95);
 return clampRating(score);
}
function athleticismRating(name,base,j,guard,wing,big){
 if(ATHLETICISM_OVERRIDE[name]!=null)return ATHLETICISM_OVERRIDE[name];
 return clampRating(base+j+(guard?5:wing?4:big?-2:0));
}
function defenseRating(name,base,j,guard,wing,big,tier){
 if(DEFENSE_OVERRIDE[name]!=null)return DEFENSE_OVERRIDE[name];
 const tierLift=tier==="mvp"?1:tier==="superstar"?2:tier==="allnba"?1:tier==="allstar"?0:tier==="elite"?1:0;
 const roleLift=wing?2:guard?1:big?1:0;
 return clampRating(base+j+roleLift+tierLift);
}

function inferRosterTier(name,index){
 if(PLAYER_TIER[name])return PLAYER_TIER[name];
 return index<5?"starter":index<10?"rotation":"bench";
}

function normalizeEspnAthlete(a,index=0){
 const name=a.displayName||a.fullName||a.name;
 if(!name)return null;
 const headshot=(a.headshot&&a.headshot.href)||a.headshot||a.photo||"";
 return {name,height:formatHeight(a.height),weight:a.weight?String(a.weight):"--",tier:inferRosterTier(name,index),headshot};
}

function extractEspnRoster(data){
 const groups=Array.isArray(data.athletes)?data.athletes:[];
 const raw=[];
 groups.forEach(g=>Array.isArray(g.items)?raw.push(...g.items):raw.push(g));
 return raw.map((a,index)=>normalizeEspnAthlete(a,index)).filter(Boolean);
}

async function hydrateRostersFromESPN(){
const cacheKey="buildAGoatBetaRostersFullEspnHeadshotsV2";
 const cached=localStorage.getItem(cacheKey);
 if(cached){
  try{
   const parsed=JSON.parse(cached);
   Object.keys(parsed).forEach(k=>{if(TEAMS[k])TEAMS[k].players=parsed[k]});
   return true;
  }catch(e){}
 }

 const loaded={};
 await Promise.all(Object.entries(ESPN_IDS).map(async([abbr,id])=>{
  try{
   const url=`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${id}/roster`;
   const res=await fetch(url);
   if(!res.ok)throw new Error("bad roster");
   const roster=extractEspnRoster(await res.json());
   if(roster.length>=8)loaded[abbr]=roster;
  }catch(e){}
 }));

 if(Object.keys(loaded).length){
  Object.keys(loaded).forEach(k=>{if(TEAMS[k])TEAMS[k].players=loaded[k]});
  localStorage.setItem(cacheKey,JSON.stringify(loaded));
  return true;
 }
 return false;
}

function playerNames(abbr){
 return [...new Set(TEAMS[abbr].players.map(p=>typeof p==="string"?p:p.name))];
}

function playerObj(abbr,p){
 if(typeof p==="string")return {name:p,height:"--",weight:"--",tier:PLAYER_TIER[p]||"rotation",headshot:""};
 return {name:p.name,height:p.height||"--",weight:p.weight||"--",tier:PLAYER_TIER[p.name]||p.tier||"rotation",headshot:p.headshot||""};
}

function weightedPlayerFromTeam(abbr){
 const players=TEAMS[abbr].players.map(p=>playerObj(abbr,p));
 const weights=players.map(p=>{
  const tier=p.tier||"rotation";

  return tier==="mvp"?40:
         tier==="superstar"?34:
         tier==="allnba"?28:
         tier==="allstar"?21:
         tier==="elite"?16:
         tier==="starter"?10:
         tier==="rotation"?4:
         .65;
 });

 let total=weights.reduce((a,b)=>a+b,0),roll=Math.random()*total;

 for(let i=0;i<players.length;i++){
  roll-=weights[i];
  if(roll<=0)return players[i].name;
 }

 return players[players.length-1].name;
}function ratings(name,tierOverride,height,weight){
 const tier=tierOverride||PLAYER_TIER[name]||"starter";
 const baseMap={mvp:95,superstar:92,allnba:89,allstar:86,elite:83,starter:79,rotation:74,bench:69};
 const base=baseMap[tier]||76;
 const h=hash(name),j=(h%7)-3;

 const guard=/Young|Curry|Irving|Brunson|Maxey|Haliburton|Morant|Lillard|Booker|Poole|Garland|White|Holiday|Conley|Fox|Sexton|Quickley|Harden|Reaves|Murray|LaVine|Gilgeous|Doncic|Ivey|Scoot|Simons|Monk|Herro|Rozier|McCollum|VanVleet|Ball|Payton|Caruso/.test(name);
 const big=/Jokic|Embiid|Wembanyama|Davis|Gobert|Adebayo|Sengun|Sabonis|Towns|Ayton|Allen|Mobley|Giannis|Zion|Chet|Turner|Porzingis|Lopez|Lively|Kessler|Duren|Claxton|Okongwu|Williams|Poeltl|Nurkic|Edey|Hartenstein|Capela|Valanciunas|Robinson|Richards|Plumlee|Zubac/.test(name);
 const wing=/Tatum|Brown|Edwards|Durant|LeBron|Butler|George|Leonard|Banchero|Barnes|Ingram|Mikal|OG|Jalen Johnson|Franz|Cunningham|Kuzma|DeRozan|Markkanen|Bridges|Miller|Risacher|Thompson|Randle|Wagner|Hart|McDaniels|Murphy|Avdija|Anunoby|Porter|Kuminga|Wiggins/.test(name);

 let r={
  shooting:base+j+(guard?4:wing?3:big?-6:0),
  handling:base+j+(guard?6:wing?1:big?-13:0),
  rebounding:base+j+(big?8:wing?2:guard?-8:0),
  iq:base+j+(tier==="mvp"?4:tier==="superstar"?3:tier==="allnba"?2:0),
  clutch:base+j+(guard?4:wing?3:0)+(tier==="mvp"?4:tier==="superstar"?3:tier==="allnba"?2:0),
  leadership:base+j+(tier==="mvp"?5:tier==="superstar"?4:tier==="allnba"?3:tier==="allstar"?2:0),
  size:sizeRating(height,weight,name)??(base+j+(big?9:wing?3:guard?-7:0)),
   speed:athleticismRating(name,base,j,guard,wing,big),
   defense:defenseRating(name,base,j,guard,wing,big,tier)
 };

 function set(vals){
  Object.entries(vals).forEach(([k,v])=>r[k]=v);
 }

 set({
  shooting:r.shooting,
  handling:r.handling,
  rebounding:r.rebounding,
  iq:r.iq,
  clutch:r.clutch,
  leadership:r.leadership,
  size:r.size,
  speed:r.speed,
  defense:r.defense
 });

 const elite={
  "Stephen Curry":{shooting:99,handling:99,clutch:98,iq:96,leadership:95},
  "Kyrie Irving":{handling:99,shooting:94,clutch:97,speed:92},
  "Victor Wembanyama":{defense:99,size:99,rebounding:96,speed:92,iq:91},
  "Nikola Jokic":{iq:99,handling:94,rebounding:96,size:94,leadership:96,clutch:94,defense:82},
  "Luka Doncic":{handling:98,iq:98,clutch:97,size:92,shooting:92},
  "Shai Gilgeous-Alexander":{handling:98,iq:96,clutch:96,speed:95,shooting:91},
  "Giannis Antetokounmpo":{size:99,speed:98,defense:96,rebounding:95,leadership:94},
  "LeBron James":{iq:99,leadership:99,size:95,clutch:96,handling:92,speed:94},
  "Kevin Durant":{shooting:98,clutch:97,size:94,iq:93},
  "Anthony Edwards":{speed:98,clutch:94,shooting:91,handling:92,defense:90},
  "Joel Embiid":{size:98,defense:94,rebounding:94,shooting:90,clutch:91},
  "Jayson Tatum":{shooting:94,size:92,defense:91,clutch:93,leadership:92},
  "Jaylen Brown":{speed:94,defense:91,shooting:90,handling:88,size:91},
  "Donovan Mitchell":{handling:95,clutch:95,speed:94,shooting:92},
  "Jalen Brunson":{handling:96,clutch:95,iq:94,shooting:91},
  "Tyrese Haliburton":{iq:97,handling:94,leadership:93,shooting:90},
  "Ja Morant":{speed:99,handling:95,clutch:92,size:82},
  "Damian Lillard":{shooting:96,clutch:98,handling:94,leadership:92},
  "Devin Booker":{shooting:95,clutch:95,handling:92,iq:91},
  "Anthony Davis":{defense:97,size:96,rebounding:95,speed:90},
  "Rudy Gobert":{defense:97,rebounding:99,size:95,handling:58,shooting:55},
  "Bam Adebayo":{defense:95,rebounding:91,iq:90,speed:88,size:91},
  "Chet Holmgren":{defense:96,size:95,shooting:88,rebounding:90},
  "Evan Mobley":{defense:96,size:94,rebounding:91,speed:88},
  "Jrue Holiday":{defense:96,leadership:94,iq:92,handling:90},
  "Kawhi Leonard":{defense:95,clutch:94,shooting:92,size:92},
  "Jimmy Butler":{clutch:96,leadership:95,defense:92,iq:93},
  "Draymond Green":{defense:94,iq:96,leadership:92,shooting:70},
  "OG Anunoby":{defense:95,size:90,shooting:86},
  "Mikal Bridges":{defense:92,shooting:88,speed:89},
  "Lauri Markkanen":{shooting:93,size:92,rebounding:88},
  "Domantas Sabonis":{rebounding:97,iq:94,size:92,handling:88},
  "Alperen Sengun":{iq:93,handling:88,rebounding:91,size:90},
  "De'Aaron Fox":{speed:97,clutch:94,handling:93},
  "Zion Williamson":{size:97,speed:96,handling:88,rebounding:88},
  "Amen Thompson":{speed:98,defense:92,rebounding:88,handling:86},
  "Ausar Thompson":{speed:97,defense:93,rebounding:88},
  "Jalen Green":{speed:96,handling:90,shooting:86},
  "Shaedon Sharpe":{speed:96,shooting:86,clutch:84}
 };

 if(elite[name])set(elite[name]);
 if(DEFENSE_OVERRIDE[name]!=null)r.defense=DEFENSE_OVERRIDE[name];

 Object.keys(r).forEach(k=>r[k]=clampRating(r[k]));
 return r;
}
async function init(){
 all=[];
 await hydrateRostersFromESPN();
 Object.entries(TEAMS).forEach(([abbr,t])=>t.players.forEach(p=>{
  const obj=playerObj(abbr,p);
  all.push({abbr,team:t.name,conf:t.conf,name:obj.name,height:obj.height,weight:obj.weight,tier:obj.tier,headshot:obj.headshot,ratings:ratings(obj.name,obj.tier,obj.height,obj.weight)});
 }));
 resetIdleWheels();
 renderPlayer({
  state: "home",
  teamId: "",
  uniform: "default"
 });
 render();
 setControls();
 drawCallouts();
 if(new URLSearchParams(location.search).get("preview")==="complete")previewCompleteBuild();
}

function teamDisplay(a){return `<div>${a}<small>${TEAMS[a].name.split(" ").slice(-1)[0]}</small></div>`}
function playerDisplay(n){let p=n.split(" ");return p.length>1?`<div>${p[0]}<small>${p.slice(1).join(" ")}</small></div>`:`<div>${n}</div>`}
function teamGrade(score){if(score>=96)return"A+";if(score>=92)return"A";if(score>=88)return"A-";if(score>=84)return"B+";if(score>=80)return"B";if(score>=76)return"B-";if(score>=72)return"C+";if(score>=68)return"C";return"C-"}
function shadeTeam(hex,amount=68){
 if(!/^#[0-9a-f]{6}$/i.test(hex||""))return "#07111b";
 const n=parseInt(hex.slice(1),16),r=Math.max(0,((n>>16)&255)-amount),g=Math.max(0,((n>>8)&255)-amount),b=Math.max(0,(n&255)-amount);
 return `rgb(${r},${g},${b})`;
}
function seasonTeamDisplay(a){return `<div><b>${a}</b><small>${TEAMS[a].name.split(" ").slice(-1)[0]}</small></div>`}
function uniquePlayerDisplayList(abbr,pick){
 const base=playerNames(abbr).filter(n=>n!==pick);
 let list=[];

 for(let i=0;i<10;i++){
  let shuffled=[...base].sort(()=>Math.random()-.5);
  shuffled.forEach(name=>{
   if(list[list.length-1]!==name)list.push(name);
  });
 }

 while(list.length&&list[list.length-1]===pick)list.pop();
 list.push(pick);

 return list;
}

function setIdle(id,items,display){
 let reel=document.getElementById(id),long=[],seen=new Set();
 const unique=items.filter(x=>{
  const name=wheelName(x);
  if(seen.has(name))return false;
  seen.add(name);
  return true;
 });
 for(let i=0;i<12;i++){
  [...unique].sort(()=>Math.random()-.5).forEach(x=>{
    const name=typeof x==="string"?x:x.name;
   const recent=long.slice(-4).map(wheelName);
   if(!recent.includes(name))long.push(x);
  });
 }
 reel.className="reel idle";
 reel.innerHTML=long.map(x=>`<div class="item">${display(x)}</div>`).join("");
 reel.style.transition="none";
 reel.style.transform="translateY(0)";
}

function resetIdleWheels(){
 setIdle("teamReel",Object.keys(TEAMS),teamDisplay);
 setIdle("playerReel",all.map(p=>p.name),playerDisplay);
}

function wheelName(x){
 return typeof x==="string"?x:x.name;
}

