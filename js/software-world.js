import {RECEIVERS,TEAM_SIZE} from './positions.js';
// Canvas perspective renderer for browsers without WebGL. Uses the same 3D world and match simulation.
import {TEAMS,PLAYS,clamp} from './data.js';
import {direction} from './rules.js';
const mix=(a,b,t)=>a+(b-a)*t;
const shade=(hex,n)=>{const v=parseInt(hex.slice(1),16);return `rgb(${clamp((v>>16)*n,0,255)},${clamp(((v>>8)&255)*n,0,255)},${clamp((v&255)*n,0,255)})`;};
export class SoftwareWorld{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');if(!this.ctx)throw Error('Canvas rendering unavailable');this.time=0;this.camera={x:75,y:65,z:20};this.target={x:-5,y:0,z:48};this.teams=[TEAMS[0],TEAMS[1]];this.settings={number:16};this.venue='night';this.resize();window.addEventListener('resize',()=>this.resize());}
 resize(){this.w=innerWidth;this.h=innerHeight;this.ratio=Math.min(devicePixelRatio,1.5);this.canvas.width=this.w*this.ratio;this.canvas.height=this.h*this.ratio;}
 setTeams(h,a,s){this.teams=[TEAMS[h],TEAMS[a]];this.settings=s;}
 setVenue(v){this.venue=v;}
 updateRoutes(){}
 project(x,y,z){const dx=x-this.camera.x,dy=y-this.camera.y,dz=z-this.camera.z;const depth=dx*this.forward.x+dy*this.forward.y+dz*this.forward.z;if(depth<.5)return null;return {x:this.w/2+(dx*this.right.x+dz*this.right.z)*this.focal/depth,y:this.h/2-(dx*this.up.x+dy*this.up.y+dz*this.up.z)*this.focal/depth,depth};}
 poly(points,color,stroke=null){const projected=points.map(p=>this.project(...p));if(projected.some(p=>!p))return;const c=this.ctx;c.beginPath();projected.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=.7;c.stroke();}}
 line(a,b,color,width=1){a=this.project(...a);b=this.project(...b);if(!a||!b)return;const c=this.ctx;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
 cube(x,y,z,w,h,d,color,angle=0){const vertices=[];for(const dy of [-h/2,h/2])for(const dz of [-d/2,d/2])for(const dx of [-w/2,w/2])vertices.push([x+dx*Math.cos(angle)+dz*Math.sin(angle),y+dy,z-dx*Math.sin(angle)+dz*Math.cos(angle)]);const faces=[[0,1,3,2,.66],[4,6,7,5,1.12],[0,4,5,1,.88],[2,3,7,6,.77],[0,2,6,4,.78],[1,5,7,3,.95]];for(const face of faces){const pts=face.slice(0,4).map(i=>vertices[i]);const center=pts.reduce((a,p)=>a+p[0]*this.forward.x+p[1]*this.forward.y+p[2]*this.forward.z,0)/4;this.faces.push({pts,color:shade(color,face[4]),depth:center});}}
 flush(){this.faces.sort((a,b)=>b.depth-a.depth);for(const f of this.faces)this.poly(f.pts,f.color);this.faces=[];}
 circle(x,y,z,r,color){const points=[];for(let i=0;i<24;i++){const a=i/24*Math.PI*2;points.push([x+Math.cos(a)*r,y,z+Math.sin(a)*r]);}this.poly(points,color);}
 label(text,x,y,z,size,color){const p=this.project(x,y,z);if(!p)return;const c=this.ctx;c.fillStyle=color;c.font=`900 ${Math.max(6,size*this.focal/p.depth)}px Arial`;c.textAlign='center';c.textBaseline='middle';c.fillText(text,p.x,p.y);}
 render(match,dt,settings,menu=false){
  this.time+=dt;const dir=direction(match.visualDrive.offense),focus=match.activePosition&&match.onField?match.players[match.controlled]:match.ball||match.players[match.carrier]||match.players[match.controlled],wide=settings.camera==='wide',close=settings.camera==='close',mobile=this.w<700,z=clamp(focus.z,-2,102);
  const desired=menu?{x:75+Math.sin(this.time*.06)*10,y:65,z:20+Math.cos(this.time*.05)*8}:{x:focus.x*.35+(mobile?0:15)*dir,y:wide?43:close?22:31,z:z-(wide?43:close?25:34)*dir};const target=menu?{x:-5,y:0,z:48}:{x:focus.x*.35,y:0,z:z+(close?6:11)*dir};const t=1-Math.exp(-dt*(menu?2:4));for(const key of ['x','y','z']){this.camera[key]=mix(this.camera[key],desired[key],t);this.target[key]=mix(this.target[key],target[key],t);}
  const forward={x:this.target.x-this.camera.x,y:this.target.y-this.camera.y,z:this.target.z-this.camera.z};const len=Math.hypot(forward.x,forward.y,forward.z);for(const k of ['x','y','z'])forward[k]/=len;this.forward=forward;const rlen=Math.hypot(forward.x,forward.z);this.right={x:-forward.z/rlen,z:forward.x/rlen};this.up={x:-this.right.z*forward.y,y:this.right.z*forward.x-this.right.x*forward.z,z:this.right.x*forward.y};
  this.focal=this.h/(2*Math.tan(48*Math.PI/360));const c=this.ctx;c.setTransform(this.ratio,0,0,this.ratio,0,0);const sky={night:'#18322f',day:'#9bbdc1',sunset:'#b38977'}[this.venue];c.fillStyle=sky;c.fillRect(0,0,this.w,this.h);this.faces=[];
  this.poly([[-300,-.2,-200],[300,-.2,-200],[300,-.2,300],[-300,-.2,300]],'#203d31');
  for(let i=0;i<20;i++)this.poly([[-26.65,0,i*5],[26.65,0,i*5],[26.65,0,i*5+5],[-26.65,0,i*5+5]],i%2?'#44794b':'#3c6e43');
  for(const [i,ez] of [-10,100].entries())this.poly([[-26.65,0,ez],[26.65,0,ez],[26.65,0,ez+10],[-26.65,0,ez+10]],this.teams[1-i].dark);
  for(let yard=-10;yard<=110;yard+=5)this.line([-26.65,.04,yard],[26.65,.04,yard],yard%10?'#a6c494':'#d4e3c1',yard%10?.7:1.1);
  for(const x of [-26.65,26.65])this.line([x,.04,-10],[x,.04,110],'#f1efcf',1.4);
  for(let yard=1;yard<100;yard++){if(yard%5)for(const x of [-25.8,-5,5,25.8])this.line([x-.3,.05,yard],[x+.3,.05,yard],'#bdd4a6',.65);if(yard%10===0)for(const x of [-20,20])this.label(String(yard<=50?yard:100-yard),x,.05,yard,1.6,'#dae7cd');}
  this.label('F /',0,.04,50,6,'#a3bf7b');this.label(this.teams[1].name.split(' ').at(-1).toUpperCase(),0,.05,-5,3.5,this.teams[1].color);this.label(this.teams[0].name.split(' ').at(-1).toUpperCase(),0,.05,105,3.5,this.teams[0].color);
  if(!menu){this.line([-26,.08,match.visualDrive.spot],[26,.08,match.visualDrive.spot],'#7ad6ff',2);this.line([-26,.08,match.visualDrive.target],[26,.08,match.visualDrive.target],'#ffe770',2);if(match.phase==='pre'&&match.drive.offense===0){const play=PLAYS.find(p=>p.id===match.play);play.paths.forEach((path,i)=>{const p=match.players[RECEIVERS[i]];let from=[p.x,.1,p.z];for(const v of path){const to=[clamp(p.startX+v[0],-23,23),.1,clamp(p.startZ+v[1],-5,105)];this.line(from,to,i%2?'#d5e9ff':'#d5ff79',1.6);from=to;}});}}
  for(const side of [-1,1])for(let row=0;row<4;row++){this.cube(side*(34+row*3),row*.75,50,3.2,1+row*1.5,140,'#34463e');for(let i=0;i<22;i++)this.cube(side*(34+row*3),1.2+row*1.5,-12+i*6,.9,1,.8,['#94aa91','#d2c798','#9c99bd','#789c9a'][(i+row)%4]);}
  for(const post of [-13,113]){this.cube(0,3,post,.25,6,.25,'#ffe17c');this.cube(0,6,post,10,.25,.25,'#ffe17c');for(const x of [-5,5])this.cube(x,9,post,.22,6,.22,'#ffe17c');}
  for(const x of [-39,39])for(const zz of [-12,112]){this.cube(x,12,zz,.4,24,.4,'#8daba3');this.cube(x,24,zz,6,1.5,1,'#e3e5b8');}
  for(let i=0;i<18;i++){const h=8+i*17%25;this.cube((i-9)*10,h/2,150,7,h,8,'#213d38');}
  this.flush();
  // Players and their shadows are sorted back to front for correct visual overlap.
  const players=[...match.players].sort((a,b)=>{const pa=this.project(a.x,1,a.z),pb=this.project(b.x,1,b.z);return (pb?.depth||0)-(pa?.depth||0);});
  for(const p of players){const team=this.teams[p.team],angle=p.angle,swing=match.phase==='live'?Math.sin(p.gait*1.7)*.35:0,skin=['#a66e4c','#d39d71','#815234','#b8845a','#68472e'][p.slot%5];this.circle(p.x,.05,p.z,.7,'#152d2266');if(p.id===match.controlled&&!menu){this.circle(p.x,.06,p.z,1.25,'#d2ff6577');this.circle(p.x,.07,p.z,.98,'#3c6e43');}
   const limb=(dx,y,dz,w,h,d,color)=>this.cube(p.x+dx*Math.cos(angle)+dz*Math.sin(angle),y,p.z-dx*Math.sin(angle)+dz*Math.cos(angle),w,h,d,color,angle);
   limb(0,1.55,0,.88,1,.5,team.color);limb(0,.95,0,.85,.35,.52,team.dark);limb(0,2.34,0,.52,.57,.5,skin);limb(0,2.59,-.01,.66,.30,.62,team.dark);limb(0,2.29,.35,.65,.06,.04,'#dce3db');
   for(const side of [-1,1]){limb(side*.58,1.75,0,.26,.4,.31,team.color);limb(side*.59,1.3,side*swing,.2,.55,.23,skin);limb(side*.23,.54,side*swing,.23,.6,.25,skin);limb(side*.23,.12,side*swing+.07,.3,.2,.45,'#14221b');limb(side*.49,1.95,0,.30,.30,.56,team.color);}
   this.flush();this.label(String(p.slot===0?settings.number:[11,80,7,87,72,65,55,66,74,19][p.slot-1]),p.x,1.66,p.z-.3,.35,team.dark);
   if(!menu&&match.drive.offense===0&&p.team===0&&RECEIVERS.includes(p.slot)&&!match.passed&&match.carrier===0){const screen=this.project(p.x,3.4,p.z);if(screen){c.fillStyle='#d5ff71';c.beginPath();c.arc(screen.x,screen.y,10,0,Math.PI*2);c.fill();c.fillStyle='#183021';c.font='bold 12px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(RECEIVERS.indexOf(p.slot)+1,screen.x,screen.y);}}
  }
  if(match.phase!=='dead'){const p=match.ball||match.players[match.carrier];if(p){const b=this.project(p.x,p.y||1.5,p.z);if(b){c.fillStyle='#b76c36';c.beginPath();c.ellipse(b.x,b.y,Math.max(3,this.focal/b.depth*.32),Math.max(4,this.focal/b.depth*.53),-.5,0,Math.PI*2);c.fill();c.strokeStyle='#f4e1bc';c.lineWidth=1;c.beginPath();c.moveTo(b.x-2,b.y-2);c.lineTo(b.x+2,b.y+2);c.stroke();}}}
 }
}
