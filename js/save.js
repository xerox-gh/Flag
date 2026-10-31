import {OFFENSE,DEFENSE} from './positions.js';
import {freshProgress,validateProgress} from './progression.js';
export {schedule,standings,settleRound} from './league.js';
import {TEAMS,clamp} from './data.js';
const KEY='flag-save-v1';
export const defaults=()=>({version:2,offensePosition:'QB',defensePosition:'MLB',progress:freshProgress(),name:'Belton',number:16,venue:'night',camera:'broadcast',difficulty:'pro',duration:60,home:0,away:1,sound:false,season:null,stats:{played:0,wins:0,touchdowns:0}});
export function validate(raw){
 const d=defaults(); if(!raw||typeof raw!=='object')return d;
 for(const k of ['name'])if(typeof raw[k]==='string')d[k]=raw[k].replace(/[<>]/g,'').slice(0,18)||'Belton';
 for(const [k,values] of Object.entries({venue:['night','day','sunset'],camera:['broadcast','close','wide'],difficulty:['rookie','pro','elite']}))if(values.includes(raw[k]))d[k]=raw[k];
 for(const k of ['number','home','away'])if(Number.isFinite(raw[k]))d[k]=clamp(Math.round(raw[k]),0,k==='number'?99:7);
 if([30,60,120].includes(raw.duration))d.duration=raw.duration;
 for(const [key,unit] of [['offensePosition',OFFENSE],['defensePosition',DEFENSE]])if(raw[key]===''||unit.includes(raw[key]))d[key]=raw[key];
 d.sound=raw.sound===true;
 for(const k of Object.keys(d.stats))if(Number.isFinite(raw.stats?.[k]))d.stats[k]=clamp(Math.floor(raw.stats[k]),0,1e7);
 d.progress=validateProgress(raw.progress);
 const s=raw.season;
 if(s&&Number.isInteger(s.team)&&s.team>=0&&s.team<8&&Array.isArray(s.results)&&s.results.length<=7&&s.results.every(round=>Array.isArray(round)&&round.length===4&&round.every(g=>Number.isInteger(g.a)&&Number.isInteger(g.b)&&g.a>=0&&g.a<8&&g.b>=0&&g.b<8&&g.a!==g.b&&Number.isInteger(g.sa)&&Number.isInteger(g.sb)&&g.sa>=0&&g.sb>=0&&g.sa<=999&&g.sb<=999)))d.season={team:s.team,results:s.results};
 return d;
}
export function loadSave(storage=globalThis.localStorage){try{return validate(JSON.parse(storage.getItem(KEY)));}catch{return defaults();}}
export function saveGame(data,storage=globalThis.localStorage){try{storage.setItem(KEY,JSON.stringify(validate(data)));return true;}catch{return false;}}
