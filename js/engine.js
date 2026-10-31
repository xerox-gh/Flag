import {TEAM_SIZE,OFFENSE,DEFENSE,RECEIVERS,LINEMEN,roleSlot} from './positions.js';
import {PLAYS,DEFENSES,NAMES,clamp} from './data.js';
import {direction,newDrive,resolvePlay} from './rules.js';
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export class Match{
 constructor(options={}){this.options=options;this.rng=options.rng||Math.random;this.score=[0,0];this.quarter=1;this.duration=options.duration||60;this.time=this.duration;this.drive=newDrive(0,20);this.phase='pre';this.players=[];this.controlled=0;this.play='slants';this.defense='man';this.cpuDefense='zone';this.ball=null;this.timer=0;this.playTime=0;this.passed=false;this.events=[];this.stats={yards:0,passes:0,completions:0,touchdowns:0,interceptions:0};this.jukeCooldown=0;this.pullCooldown=0;this.setup();}
 get activePosition(){const key=this.drive.offense===0?'offensePosition':'defensePosition';return Object.hasOwn(this.options,key)?this.options[key]||null:this.options.playerPosition;}
 setPosition(role){if(this.phase!=='pre')return false;const unit=this.drive.offense===0?OFFENSE:DEFENSE;if(role&&!unit.includes(role))return false;this.options[this.drive.offense===0?'offensePosition':'defensePosition']=role||null;this.onField=true;this.controlled=role?unit.indexOf(role):this.drive.offense===0?0:5;return true;}
 get defensiveCall(){return DEFENSES.find(p=>p.id===(this.drive.offense===1?this.defense:this.cpuDefense))||DEFENSES[0];}
 selectPlay(id){if(this.phase!=='pre')return false;const plays=this.drive.offense===0?PLAYS:DEFENSES;if(!plays.some(p=>p.id===id))return false;if(this.drive.offense===0)this.play=id;else this.defense=id;this.setup();return true;}
 emit(type,data={}){this.events.push({type,...data});}
 setup(){
  if(this.drive.offense===0)this.cpuDefense=DEFENSES[Math.floor(this.rng()*DEFENSES.length)].id;
  this.visualDrive={...this.drive};this.lastEnding=null;const {offense,spot}=this.drive,dir=direction(offense);this.players=[];
  const ox=[0,-21,20,-3,10,-6,-3,0,3,6,-13],oz=[-5,0,0,-7,0,0,0,0,0,0,-1];
  const dx=[-7,-2,2,7,-10,0,10,-21,20,-10,10],dz=[1.6,1.6,1.6,1.6,6,6,6,4,4,17,17];
  for(let team=0;team<2;team++)for(let i=0;i<TEAM_SIZE;i++){
   const attacking=team===offense,card=team===0?this.options.roster?.[attacking?i:11+i]:null,x=attacking?ox[i]:clamp(dx[i]*this.defensiveCall.width,-24,24),z=clamp(spot+(attacking?oz[i]:i>=9?this.defensiveCall.depth:i>=4?Math.min(dz[i],this.defensiveCall.depth||2):dz[i])*dir,-8,108);
   this.players.push({id:team*11+i,team,slot:i,role:(attacking?OFFENSE:DEFENSE)[i],attributes:card?.stats||null,name:card?.name||(i===0&&team===0?this.options.name||'Belton':NAMES[(i+team*3)%NAMES.length]),x,z,startX:x,startZ:z,vx:0,vz:0,stamina:1,juke:0,stun:0,routeStep:0,angle:attacking?0:Math.PI,gait:0,blocking:false});
  }
  this.onField=!this.activePosition||(OFFENSE.includes(this.activePosition)?offense===0:offense===1);
  this.controlled=this.activePosition&&this.onField?roleSlot(this.activePosition)%11:offense===0?0:5;
  this.carrier=offense*11;this.ball=null;this.passed=false;this.handedOff=false;this.callTarget=null;this.playTime=0;this.jukeCooldown=0;this.pullCooldown=0;this.phase='pre';this.emit('setup');

 }
 snap(){if(this.phase!=='pre')return;this.phase='live';this.playTime=0;this.play= this.drive.offense===0?this.play:PLAYS[Math.floor(this.rng()*PLAYS.length)].id;this.emit('snap');}
 switchPlayer(){if(this.activePosition)return;if(this.drive.offense===0||this.phase!=='live')return;const target=this.ball?.to||this.players[this.carrier];const sorted=this.players.filter(p=>p.team===0&&(p.id!==this.controlled||!this.onField)).sort((a,b)=>dist(a,target)-dist(b,target));if(sorted[0])this.controlled=sorted[0].id;}
 juke(){const p=this.players[this.controlled];if(this.phase==='live'&&this.carrier===p.id&&this.jukeCooldown<=0&&p.stamina>.15){p.juke=.52;p.stamina-=.17;this.jukeCooldown=2.4;this.emit('juke');}}
 pull(){if(!this.onField)return;if(this.phase!=='live'||this.drive.offense===0||this.ball||this.pullCooldown>0)return;this.pullCooldown=.65;const p=this.players[this.controlled],carrier=this.players[this.carrier];if(dist(p,carrier)<(p.attributes?2+p.attributes.defense/55:3.2)&&carrier.juke<=0)this.end({type:carrier.z>=100?'safety':'flag',spot:carrier.z});else{p.stun=.22;this.emit('miss');}}
 throwTo(slot){
  if(this.phase!=='live'||this.ball||this.passed||this.carrier!==this.drive.offense*11)return false;
  const qb=this.players[this.carrier],dir=direction(this.drive.offense);if((qb.z-this.drive.spot)*dir>.25){if(this.drive.offense===0)this.emit('notice',{text:'Past the line — keep running!'});return false;}
  const receiver=this.players[this.drive.offense*11+slot];if(!receiver||!RECEIVERS.includes(slot))return false;
  const arm=qb.attributes?(0.8+qb.attributes.throw/350):1;const duration=clamp(dist(qb,receiver)/(26*arm),.4,1.3);
  const to={x:clamp(receiver.x+receiver.vx*duration*.7,-24,24),z:clamp(receiver.z+receiver.vz*duration*.7,-6,106)};
  if(qb.attributes){const error=(100-qb.attributes.throw)/35;to.x=clamp(to.x+(this.rng()-.5)*error,-24,24);to.z=clamp(to.z+(this.rng()-.5)*error,-6,106);}
  this.ball={from:{x:qb.x,z:qb.z},to,x:qb.x,z:qb.z,y:1.8,t:0,duration,receiver:receiver.id};this.passed=true;this.carrier=-1;if(this.drive.offense===0)this.stats.passes++;this.emit('throw');return true;
 }
 action(){if(this.phase!=='live'||!this.onField)return;if(this.drive.offense!==0){this.pull();return;}const p=this.players[this.controlled];if(p.slot===0){this.handoff();return;}if(RECEIVERS.includes(p.slot)&&this.carrier!==p.id){this.callTarget=p.slot;if(p.slot===3&&!this.passed&&this.playTime<3)this.handoff();else this.emit('notice',{text:'Pass requested — get open!'});} }
 handoff(){if(this.phase!=='live'||this.passed||this.handedOff||this.carrier!==this.drive.offense*11)return false;const qb=this.players[this.carrier],rb=this.players[this.drive.offense*11+3];if((qb.z-this.drive.spot)*direction(this.drive.offense)>0||dist(qb,rb)>6)return false;rb.x=qb.x-1;rb.z=qb.z;this.carrier=rb.id;this.handedOff=true;this.passed=true;if(this.drive.offense===0&&!this.activePosition)this.controlled=rb.id;this.emit('notice',{text:'Handoff — follow your blockers!'});return true;}
 punt(){if(this.phase==='pre')this.end({type:'punt',spot:this.drive.spot});}
 move(p,x,z,speed,dt){if(p.attributes)speed*=.78+p.attributes.speed/300;const n=Math.hypot(x,z);if(n<.05||p.stun>0){p.vx=0;p.vz=0;return;}p.vx=x/n*speed;p.vz=z/n*speed;p.x+=p.vx*dt;p.z+=p.vz*dt;p.x=clamp(p.x,-26.4,26.4);p.z=clamp(p.z,-9,109);p.angle=Math.atan2(p.vx,p.vz);p.gait+=speed*dt;}
 toward(p,target,speed,dt,stop=.5){if(dist(p,target)<stop){p.vx=0;p.vz=0;return;}this.move(p,target.x-p.x,target.z-p.z,speed,dt);}
 route(p,dt){
  const dir=direction(this.drive.offense),path=PLAYS.find(x=>x.id===this.play).paths[RECEIVERS.indexOf(p.slot)];let waypoint=path[Math.min(p.routeStep,path.length-1)];const target={x:clamp(p.startX+waypoint[0],-23,23),z:clamp(p.startZ+waypoint[1]*dir,dir===1?2:-5,dir===1?105:98)};
  if(this.ball&&this.ball.receiver===p.id){this.toward(p,this.ball.to,7.8,dt,.2);return;}
  if(dist(p,target)<1&&p.routeStep<path.length-1)p.routeStep++;
  this.toward(p,target,7.4,dt,.4);
 }
 update(dt,input={}){
  if(this.phase==='final')return;
  if(this.phase==='dead'){this.timer-=dt;if(this.timer<=0){if(this.time<=0){if(this.quarter>=4&&!this.options.practice){this.phase='final';this.emit('final');return;}this.quarter++;this.time=this.duration;this.emit('quarter',{quarter:this.quarter});}this.setup();}return;}
  if(this.phase!=='live')return;
  this.playTime+=dt;if(!this.options.practice)this.time=Math.max(0,this.time-dt);
  this.jukeCooldown=Math.max(0,this.jukeCooldown-dt);this.pullCooldown=Math.max(0,this.pullCooldown-dt);
  const offense=this.drive.offense,dir=direction(offense),carrier=this.players[this.carrier],call=PLAYS.find(p=>p.id===this.play),coverage=this.defensiveCall;
  if(call.kind==='run'&&!this.handedOff&&this.playTime>.15)this.handoff();
  const difficulty=this.options.difficulty||'pro',defSpeed=difficulty==='rookie'?6.0:difficulty==='elite'?7.8:6.8;
  for(const p of this.players){
   p.juke=Math.max(0,p.juke-dt);p.stun=Math.max(0,p.stun-dt);
   if(p.id===this.controlled&&this.onField){p.blocking=!!input.action&&this.drive.offense===0&&LINEMEN.includes(p.slot);const moving=Math.hypot(input.x||0,input.z||0)>.1;const sprint=input.sprint&&p.stamina>.03&&moving;p.stamina=clamp(p.stamina+(sprint?-.24*(p.attributes?1.45-p.attributes.stamina/150:1):.13)*dt,0,1);this.move(p,-(input.x||0)*dir,(input.z||0)*dir,sprint?10:7.1,dt);continue;}
   p.stamina=Math.min(1,p.stamina+.1*dt);
   if(p.team===offense){
    if(p.id===this.carrier){
     if(p.slot===0&&!this.passed&&call.kind!=='qb-run'&&this.playTime<3.3){this.toward(p,{x:Math.sin(this.playTime)*3,z:clamp(this.drive.spot-5*dir,-7,107)},3.5,dt);}
     else{const defenders=this.players.filter(q=>q.team!==offense);let evade=0;for(const d of defenders)if(dist(p,d)<8)evade+=(p.x>=d.x?1:-1)*2;const lane=call.kind!=='pass'&&(p.z-this.drive.spot)*dir<7?clamp((call.lane-p.x)*.35,-2,2):0;this.move(p,lane||clamp(evade,-1.1,1.1),dir,8.3,dt);}
    }else if(LINEMEN.includes(p.slot)){p.blocking=true;const enemies=this.players.filter(d=>d.team!==offense&&d.slot<7).sort((a,b)=>dist(p,a)-dist(p,b));const d=enemies[0];const anchor={x:clamp(p.startX+(call.kind==='run'?call.lane*.3:0),-23,23),z:this.drive.spot+(call.kind==='run'?3:-1.2)*dir};this.toward(p,d&&dist(p,d)<4?d:anchor,4.2,dt,1.2);}else if(RECEIVERS.includes(p.slot))this.route(p,dt);else{p.vx=0;p.vz=0;}
   }else{
    if(this.playTime<.55){p.vx=0;p.vz=0;continue;}
    let target,speed=offense===0?defSpeed:7.25;
    const runner=carrier&&(this.passed||carrier.slot!==0||(carrier.z-this.drive.spot)*dir>1||this.playTime>4);
    if(runner){target={x:carrier.x+carrier.vx*.2,z:carrier.z+carrier.vz*.2};}
    else if(this.ball){target=dist(p,this.ball.to)<14?this.ball.to:this.players[offense*11+RECEIVERS[p.slot%5]];}
    else if(coverage.rushers.includes(p.slot)){target=carrier;if(coverage.id==='contain'&&[0,3].includes(p.slot)&&carrier)target={x:carrier.x+(p.slot===0?-5:5),z:carrier.z};speed*=.85;}
    else if(coverage.id==='spy'&&p.slot===5){target={x:carrier?.x||0,z:this.drive.spot+dir*4};}
    else if(coverage.coverage==='zone'||coverage.coverage==='match'&&this.playTime<1.8){
     let depth=p.slot>=9?coverage.depth:Math.min(10,coverage.depth*.5);
     if(['cover3','quarters','match4'].includes(coverage.id)&&p.slot>=7)depth=coverage.depth;
     if(coverage.id==='tampa'&&p.slot===5)depth=coverage.depth;
     if(coverage.id==='cover6'&&p.slot>=8)depth=coverage.depth;
     const nearby=this.players.filter(q=>q.team===offense&&RECEIVERS.includes(q.slot)).sort((a,b)=>dist(p,a)-dist(p,b))[0];
     target={x:clamp(p.startX+(nearby&&dist(p,nearby)<10?(nearby.x-p.x)*.4:0),-24,24),z:clamp(this.drive.spot+dir*depth,-2,102)};
    }else if(p.slot>=9&&coverage.depth>0){target={x:p.startX,z:clamp(this.drive.spot+dir*coverage.depth,-2,102)};}
    else{const cover=this.players.filter(q=>q.team!==offense&&!coverage.rushers.includes(q.slot)&&q.slot<9);const index=Math.max(0,cover.findIndex(q=>q.id===p.id));const mark=this.players[offense*11+RECEIVERS[index%5]];target={x:mark.x+(coverage.width-1)*5*Math.sign(mark.x||1),z:mark.z+dir*(coverage.id==='press'?.5:difficulty==='rookie'?3:1.8)};}
    if(target)this.toward(p,target,speed,dt,.55);
   }
  }
  if((offense===1||this.activePosition&&(!this.onField||this.activePosition!=='QB'))&&call.kind==='pass'&&this.carrier===offense*11&&!this.passed&&this.playTime>1.35){
   let best=null,bestValue=-Infinity;for(const r of this.players.filter(p=>p.team===offense&&RECEIVERS.includes(p.slot))){const space=Math.min(...this.players.filter(p=>p.team!==offense).map(p=>dist(p,r)));const value=space+(this.callTarget===r.slot?6:0)+(r.z-this.drive.spot)*dir*.08;if(value>bestValue){bestValue=value;best=r;}}
   if(best&&(bestValue>3.6||this.playTime>3.0))this.throwTo(best.slot);
  }
  for(const blocker of this.players.filter(p=>p.team===offense&&p.blocking&&p.stamina>.05)){const defender=this.players.filter(p=>p.team!==offense).sort((a,b)=>dist(blocker,a)-dist(blocker,b))[0];if(defender&&dist(blocker,defender)<2.4&&this.playTime<5.5){defender.stun=.10;defender.z+=dir*dt*1.8;blocker.stamina=Math.max(0,blocker.stamina-dt*.1);}}
  if(this.ball){
   const b=this.ball;b.t+=dt;const t=Math.min(1,b.t/b.duration);b.x=b.from.x+(b.to.x-b.from.x)*t;b.z=b.from.z+(b.to.z-b.from.z)*t;b.y=1.7+Math.sin(t*Math.PI)*Math.max(3,dist(b.from,b.to)*.18);
   if(t>=1){
    const receiver=this.players[b.receiver],catchDistance=dist(receiver,b.to),defenders=this.players.filter(p=>p.team!==offense).sort((a,c)=>dist(a,b.to)-dist(c,b.to));
    if(dist(defenders[0],b.to)<1.65&&dist(defenders[0],b.to)<catchDistance+.3){if(offense===1)this.stats.interceptions++;this.end({type:'interception',spot:b.z});return;}
    if(catchDistance<(receiver.attributes?1.8+receiver.attributes.catch/50:3.3)){this.carrier=receiver.id;this.ball=null;if(offense===0){if(!this.activePosition)this.controlled=receiver.id;this.stats.completions++;}this.emit('catch',{name:receiver.name});}
    else{this.end({type:'incomplete'});return;}
   }
  }
  const current=this.players[this.carrier];
  if(current){
   if((dir===1&&current.z>=100)||(dir===-1&&current.z<=0)){this.end({type:'touchdown',spot:current.z});return;}
   if(Math.abs(current.x)>=25.6){this.end({type:(dir===1?current.z<=0:current.z>=100)?'safety':'out',spot:current.z});return;}
   for(const d of this.players.filter(p=>p.team!==offense&&(p.id!==this.controlled||!this.onField)))if(this.playTime>.7&&dist(d,current)<(d.attributes?.defense?1+d.attributes.defense/130:1.55)){if(current.juke>0){d.stun=.65;continue;}if(d.stun>0)continue;const ownEnd=dir===1?current.z<=0:current.z>=100;this.end({type:ownEnd?'safety':'flag',spot:current.z});return;}
  }
  if(this.playTime>18){this.end({type:this.passed?'flag':'incomplete',spot:current?.z??this.drive.spot});}
 }
 end(ending){
  if(this.phase==='dead'||this.phase==='final')return;
  const old=this.drive;this.lastEnding=ending;this.lastOffense=old.offense;
  if(old.offense===0&&['flag','out','touchdown'].includes(ending.type))this.stats.yards+=Math.round((clamp(ending.spot,0,100)-old.spot));
  const result=resolvePlay(old,ending);if(result.points){this.score[result.scorer]+=result.points;if(result.scorer===0&&ending.type==='touchdown')this.stats.touchdowns++;}
  this.drive=result.drive;
  if(this.options.practice&&this.drive.offense!==0)this.drive=newDrive(0,20);
  this.phase='dead';this.timer=2.7;this.ball=null;this.emit('end',{...result,ending});
 }
}
