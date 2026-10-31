import {TEAMS,clamp} from './data.js';
const KEY='flag-save-v1';
export const defaults=()=>({version:1,name:'Belton',number:16,venue:'night',camera:'broadcast',difficulty:'pro',duration:60,home:0,away:1,sound:false,season:null,stats:{played:0,wins:0,touchdowns:0}});
export function validate(raw){
 const d=defaults(); if(!raw||typeof raw!=='object')return d;
 for(const k of ['name'])if(typeof raw[k]==='string')d[k]=raw[k].replace(/[<>]/g,'').slice(0,18)||'Belton';
 for(const [k,values] of Object.entries({venue:['night','day','sunset'],camera:['broadcast','close','wide'],difficulty:['rookie','pro','elite']}))if(values.includes(raw[k]))d[k]=raw[k];
 for(const k of ['number','home','away'])if(Number.isFinite(raw[k]))d[k]=clamp(Math.round(raw[k]),0,k==='number'?99:7);
 if([30,60,120].includes(raw.duration))d.duration=raw.duration;
 d.sound=raw.sound===true;
 for(const k of Object.keys(d.stats))if(Number.isFinite(raw.stats?.[k]))d.stats[k]=clamp(Math.floor(raw.stats[k]),0,1e7);
 const s=raw.season;
 if(s&&Number.isInteger(s.team)&&s.team>=0&&s.team<8&&Array.isArray(s.results)&&s.results.length<=7&&s.results.every(round=>Array.isArray(round)&&round.length===4&&round.every(g=>Number.isInteger(g.a)&&Number.isInteger(g.b)&&g.a>=0&&g.a<8&&g.b>=0&&g.b<8&&g.a!==g.b&&Number.isInteger(g.sa)&&Number.isInteger(g.sb)&&g.sa>=0&&g.sb>=0&&g.sa<=999&&g.sb<=999)))d.season={team:s.team,results:s.results};
 return d;
}
export function loadSave(storage=globalThis.localStorage){try{return validate(JSON.parse(storage.getItem(KEY)));}catch{return defaults();}}
export function saveGame(data,storage=globalThis.localStorage){try{storage.setItem(KEY,JSON.stringify(validate(data)));return true;}catch{return false;}}
export function schedule(){let list=[0,1,2,3,4,5,6,7],rounds=[];for(let r=0;r<7;r++){rounds.push([0,1,2,3].map(i=>({a:list[i],b:list[7-i]})));list.splice(1,0,list.pop());}return rounds;}
export function standings(season){const rows=TEAMS.map((t,i)=>({id:i,name:t.name,w:0,l:0,t:0,pf:0,pa:0,pts:0}));for(const round of season.results)for(const g of round){const a=rows[g.a],b=rows[g.b];a.pf+=g.sa;a.pa+=g.sb;b.pf+=g.sb;b.pa+=g.sa;if(g.sa>g.sb){a.w++;b.l++;a.pts+=3;}else if(g.sb>g.sa){b.w++;a.l++;b.pts+=3;}else{a.t++;b.t++;a.pts++;b.pts++;}}return rows.sort((a,b)=>b.pts-a.pts||(b.pf-b.pa)-(a.pf-a.pa)||b.pf-a.pf||a.id-b.id);}
export function settleRound(season,homeScore,awayScore,rng=Math.random){if(season.results.length>=7)return false;const round=schedule()[season.results.length].map(g=>g.a===season.team?{...g,sa:homeScore,sb:awayScore}:g.b===season.team?{...g,sa:awayScore,sb:homeScore}:{...g,sa:7*Math.floor(rng()*6),sb:7*Math.floor(rng()*6)});season.results.push(round);return true;}
