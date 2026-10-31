import {clamp} from './data.js';
export const direction=team=>team===0?1:-1;
export function newDrive(team,spot){const dir=direction(team);return {offense:team,spot:clamp(spot,0,100),down:1,target:clamp(spot+dir*10,0,100)};}
export function resolvePlay(drive,ending){
 const d={...drive},dir=direction(d.offense),other=1-d.offense;
 const spot=clamp(ending.spot??d.spot,0,100);
 if(ending.type==='touchdown') return {drive:newDrive(other,other===0?20:80),points:7,scorer:d.offense,label:'TOUCHDOWN',detail:'Six on the board. Extra point is good.'};
 if(ending.type==='safety') return {drive:newDrive(other,other===0?35:65),points:2,scorer:other,label:'SAFETY',detail:'Flag pulled in the offense’s own end zone.'};
 if(ending.type==='interception') return {drive:newDrive(other,spot),points:0,label:'INTERCEPTED',detail:'Defense takes over at the catch.'};
 if(ending.type==='punt') return {drive:newDrive(other,dir===1?(spot+38>=100?80:spot+38):(spot-38<=0?20:spot-38)),points:0,label:'PUNT',detail:'A 38-yard punt, with end-zone touchbacks at the 20.'};
 const end=ending.type==='incomplete'?d.spot:spot,gain=(end-d.spot)*dir;
 if((end-d.target)*dir>=-.01) return {drive:newDrive(d.offense,end),points:0,label:'FIRST DOWN',detail:`${Math.round(gain)} yards. Keep the chains moving.`};
 if(d.down>=4) return {drive:newDrive(other,end),points:0,label:'TURNOVER ON DOWNS',detail:'Four chances used. The defense holds.'};
 return {drive:{...d,spot:end,down:d.down+1},points:0,label:ending.type==='incomplete'?'INCOMPLETE':ending.type==='out'?'OUT OF BOUNDS':'FLAG PULLED',detail:`${Math.round(gain)} yards · ${d.down+1}${['','st','nd','rd','th'][d.down+1]} & ${Math.ceil(Math.abs(d.target-end))}`};
}
