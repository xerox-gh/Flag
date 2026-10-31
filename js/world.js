import * as THREE from '../libs/three.module.js';
import {TEAMS,PLAYS} from './data.js';
import {direction} from './rules.js';
const mat=(color,other={})=>new THREE.MeshStandardMaterial({color,roughness:.87,...other});
function box(w,h,d,color,x=0,y=0,z=0){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof color==='string'||typeof color==='number'?mat(color):color);m.position.set(x,y,z);return m;}
function textTexture(text,color='#ffffff',bg=null,w=512,h=128){const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');if(bg){ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);}ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`900 ${h*.65}px Arial`;ctx.fillText(text,w/2,h/2);return new THREE.CanvasTexture(c);}
function groundText(text,x,z,size=3,rotate=0,color='#dce7d0'){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(size*2,size*.5),new THREE.MeshBasicMaterial({map:textTexture(text,color),transparent:true,depthWrite:false}));mesh.rotation.x=-Math.PI/2;mesh.rotation.z=rotate;mesh.position.set(x,.038,z);return mesh;}
export class World{
 constructor(canvas){
  this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.15;
  this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#172c2a');this.scene.fog=new THREE.Fog('#172c2a',110,240);this.camera=new THREE.PerspectiveCamera(48,1,.1,500);this.camera.position.set(84,73,15);this.camera.lookAt(0,0,49);this.target=new THREE.Vector3(0,0,50);this.clock=0;this.models=[];this.routes=new THREE.Group();this.scene.add(this.routes);this.decor=new THREE.Group();this.scene.add(this.decor);
  this.ambient=new THREE.HemisphereLight('#d6efff','#45623a',2.1);this.scene.add(this.ambient);this.sun=new THREE.DirectionalLight('#fff2c9',2.4);this.sun.position.set(-25,65,30);this.sun.castShadow=true;this.sun.shadow.mapSize.set(2048,2048);Object.assign(this.sun.shadow.camera,{left:-65,right:65,top:85,bottom:-85,near:1,far:180});this.sun.target.position.set(0,0,50);this.sun.shadow.bias=-.0008;this.scene.add(this.sun,this.sun.target);
  this.buildField();this.buildStadium();this.buildBall();this.line=new THREE.Group();this.scene.add(this.line);this.scrimmage=box(51,.045,.14,'#76d3ff',0,.07,20);this.firstdown=box(51,.045,.18,'#ffe65f',0,.08,30);this.line.add(this.scrimmage,this.firstdown);
  this.ring=new THREE.Mesh(new THREE.RingGeometry(1.05,1.35,40),new THREE.MeshBasicMaterial({color:'#d5ff66',side:THREE.DoubleSide,depthWrite:false}));this.ring.rotation.x=-Math.PI/2;this.ring.position.y=.10;this.scene.add(this.ring);
  this.resize();window.addEventListener('resize',()=>this.resize());this.setTeams(0,1,{name:'Belton',number:16});this.setVenue('night');
 }
 resize(){this.renderer.setSize(innerWidth,innerHeight,false);this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();}
 buildField(){
  this.scene.add(box(600,1,600,'#1b302b',0,-.7,50));
  for(let i=0;i<20;i++){const stripe=box(53.3,.22,5,i%2?'#386a48':'#315f3e',0,-.1,i*5+2.5);stripe.receiveShadow=true;this.scene.add(stripe);}
  this.endzones=[box(53.3,.24,10,'#324e30',0,-.1,-5),box(53.3,.24,10,'#343856',0,-.1,105)];this.scene.add(...this.endzones);
  for(const x of [-26.65,26.65])this.scene.add(box(.22,.03,120,'#e5eddf',x,.04,50));
  for(let z=-10;z<=110;z+=5){this.scene.add(box(53.3,.03,z%10===0?.18:.09,'#d5e4d0',0,.04,z));if(z>0&&z<100&&z%10===0){for(const x of [-20,20])this.scene.add(groundText(String(z<=50?z:100-z),x,z,2.6,x<0?Math.PI/2:-Math.PI/2));}}
  for(let z=1;z<100;z++)if(z%5!==0)for(const x of [-26, -5,5,26])this.scene.add(box(.7,.025,.07,'#bcd6b3',x,.05,z));
  this.fieldLogo=groundText('F /',0,50,13,0,'#bad788');this.scene.add(this.fieldLogo);
  this.endTexts=[groundText('BOLTS',0,-5,13,Math.PI),groundText('WOLVES',0,105,13)];this.scene.add(...this.endTexts);
  for(const z of [-10,110])for(const x of [-26.4,26.4])this.scene.add(box(.5,1,.5,'#ff9d47',x,.5,z));
  for(const z of [-13,113]){this.scene.add(box(.3,6,.3,'#ffd964',0,3,z));this.scene.add(box(10,.25,.25,'#ffd964',0,6,z));for(const x of [-5,5])this.scene.add(box(.23,6,.23,'#ffd964',x,9,z));}
 }
 buildStadium(){
  for(const side of [-1,1]){
   for(let row=0;row<5;row++)this.decor.add(box(4,1+row*1.5,143,'#283c38',side*(34+row*3),row*.75-0.5,50));
   this.decor.add(box(.5,2.6,142,'#182825',side*31,1.1,50));
   for(let i=0;i<10;i++){const banner=box(.15,1.7,11,i%2?'#cfff68':'#203229',side*30.6,1.3,-12+i*14);this.decor.add(banner);}
  }
  const crowdColors=['#aac6ac','#6b8d87','#d4d7a1','#7775a4','#4f6662'];
  for(const color of crowdColors){const inst=new THREE.InstancedMesh(new THREE.BoxGeometry(.65,.9,.65),mat(color),250);const matrix=new THREE.Matrix4();for(let i=0;i<250;i++){const side=i%2?1:-1,row=Math.floor(Math.random()*5);matrix.makeTranslation(side*(34+row*3)+(Math.random()-.5)*1.5,1.2+row*1.5,-15+Math.random()*130);inst.setMatrixAt(i,matrix);}this.decor.add(inst);}
  for(const x of [-40,40])for(const z of [-12,112]){this.decor.add(box(.7,25,.7,'#8a9e96',x,12,z));this.decor.add(box(7,2,1,'#495b56',x,24,z));const lamp=box(6.6,1.4,.2,mat('#f5ffe8',{emissive:'#deedcd',emissiveIntensity:1.4}),x,24,z+(z<0?.7:-.7));this.decor.add(lamp);}
  for(let i=0;i<24;i++){const height=8+(i*17%34),x=(i-12)*9;const building=box(6,height,8,'#1a302e',x,height/2,153+Math.sin(i)*8);this.decor.add(building);for(let floor=3;floor<height;floor+=4)this.decor.add(box(3,.5,.05,mat('#537364',{emissive:'#506d50',emissiveIntensity:.4}),x,floor,148.9+Math.sin(i)*8));}
  this.decor.add(box(25,8,1,'#101d1b',0,15,129));const board=new THREE.Mesh(new THREE.PlaneGeometry(23,5.75),new THREE.MeshBasicMaterial({map:textTexture('FLAG / 5v5','#ceff63','#15261e')}));board.position.set(0,15,128.4);board.rotation.y=Math.PI;this.decor.add(board);
 }
 buildBall(){this.ball=new THREE.Group();const leather=new THREE.Mesh(new THREE.SphereGeometry(.32,12,8),mat('#9e4d28'));leather.scale.set(1,1,1.65);leather.castShadow=true;this.ball.add(leather);for(const z of [-.27,.27])this.ball.add(box(.35,.04,.06,'#f3e6cb',0,.29,z));for(let i=0;i<4;i++)this.ball.add(box(.14,.035,.035,'#fff1d3',0,.32,-.12+i*.08));this.scene.add(this.ball);}
 playerModel(team,slot,settings){
  const root=new THREE.Group(),body=new THREE.Group();root.add(body);const kit=mat(team.color),shorts=mat(team.dark),skin=mat(['#9e6748','#d59b70','#78492f','#bd835b','#613f2b'][slot]);
  const torso=box(.88,1.05,.5,kit,0,1.55);torso.castShadow=true;body.add(torso);const waist=box(.84,.35,.52,shorts,0,.94);body.add(waist);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.32,10,8),skin);head.position.set(0,2.35,0);head.scale.y=1.1;head.castShadow=true;body.add(head);
  const hair=new THREE.Mesh(new THREE.SphereGeometry(.335,8,6,0,Math.PI*2,0,Math.PI*.49),mat(slot%2?'#34251d':'#201e1b'));hair.position.set(0,2.44,0);body.add(hair);
  const band=box(.63,.08,.51,shorts,0,2.48,.025);body.add(band);
  for(const x of [-.12,.12])body.add(box(.055,.055,.045,'#201b16',x,2.36,.3));
  const arms=[],legs=[];
  for(const side of [-1,1]){
   const arm=new THREE.Group();arm.position.set(side*.58,1.91,0);arm.add(box(.28,.36,.34,kit,0,-.13));arm.add(box(.22,.57,.25,skin,0,-.54,.025));arm.add(box(.24,.22,.26,skin,0,-.89,.03));body.add(arm);arms.push(arm);
   const leg=new THREE.Group();leg.position.set(side*.23,.91,0);leg.add(box(.31,.33,.36,shorts,0,-.1));leg.add(box(.22,.42,.24,skin,0,-.42));leg.add(box(.24,.21,.27,'#e3e8d9',0,-.65));leg.add(box(.29,.18,.48,'#111b17',0,-.83,.08));body.add(leg);legs.push(leg);
   const flag=box(.13,.55,.05,mat('#ffdb57',{side:THREE.DoubleSide}),side*.51,.72,0);flag.rotation.z=side*.2;body.add(flag);
  }
  const number=slot===0?settings.number:[11,80,7,24][slot-1];const decal=new THREE.Mesh(new THREE.PlaneGeometry(.5,.43),new THREE.MeshBasicMaterial({map:textTexture(String(number),team.dark,null,128,128),transparent:true}));decal.position.set(0,1.65,.257);body.add(decal);const back=decal.clone();back.rotation.y=Math.PI;back.position.z=-.257;body.add(back);
  const shadow=new THREE.Mesh(new THREE.CircleGeometry(.65,16),new THREE.MeshBasicMaterial({color:'#102017',transparent:true,opacity:.25,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.03;root.add(shadow);
  const label=new THREE.Sprite(new THREE.SpriteMaterial({map:textTexture(slot?String(slot):'QB','#18251c','#d3ff68',128,128),depthTest:false,transparent:true}));label.position.y=3.35;label.scale.set(.9,.9,1);root.add(label);
  this.scene.add(root);return {root,body,arms,legs,label};
 }
 setTeams(home,away,settings){
  for(const m of this.models){this.scene.remove(m.root);m.root.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){o.material.map?.dispose();o.material.dispose();}});}this.models=[];this.teams=[TEAMS[home],TEAMS[away]];
  for(let t=0;t<2;t++)for(let i=0;i<5;i++)this.models.push(this.playerModel(this.teams[t],i,settings));
  this.endzones.forEach((e,i)=>e.material.color.set(this.teams[1-i].dark));
  this.endTexts.forEach((t,i)=>{t.material.map.dispose();t.material.map=textTexture(this.teams[1-i].name.split(' ').at(-1).toUpperCase(),this.teams[1-i].color);t.material.needsUpdate=true;});
 }
 setVenue(venue){const cfg={night:['#172d2c','#dcefff',1.8,2.2],day:['#95bbc1','#fff8d5',2.5,3],sunset:['#ad8170','#ffc89a',1.8,2.5]}[venue];this.scene.background.set(cfg[0]);this.scene.fog.color.set(cfg[0]);this.sun.color.set(cfg[1]);this.ambient.intensity=cfg[2];this.sun.intensity=cfg[3];}
 clearRoutes(){for(const child of [...this.routes.children]){child.geometry.dispose();child.material.dispose();this.routes.remove(child);}}
 updateRoutes(match){
  this.clearRoutes();const dir=direction(match.drive.offense);if(match.drive.offense!==0)return;const play=PLAYS.find(p=>p.id===match.play);
  play.paths.forEach((path,i)=>{const p=match.players[i+1];const points=[new THREE.Vector3(p.x,.16,p.z),...path.map(v=>new THREE.Vector3(Math.max(-23,Math.min(23,p.startX+v[0])),.16,Math.max(-5,Math.min(105,p.startZ+v[1]*dir))))];const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineDashedMaterial({color:i%2?'#dcecff':'#ddff72',dashSize:1,gapSize:.6,transparent:true,opacity:.8}));line.computeLineDistances();this.routes.add(line);});
 }
 render(match,dt,settings,menu=false){
  this.clock+=dt;
  const dir=direction(match.visualDrive.offense),focus=match.ball||match.players[match.carrier]||match.players[match.controlled];
  this.scrimmage.position.z=match.phase==='dead'?this.scrimmage.position.z:match.drive.spot;this.firstdown.position.z=match.phase==='dead'?this.firstdown.position.z:match.drive.target;
  this.line.visible=!menu;this.routes.visible=match.phase==='pre'&&!menu;
  match.players.forEach((p,i)=>{const m=this.models[i];m.root.position.set(p.x,0,p.z);m.body.rotation.y=p.angle;m.body.position.y=Math.abs(Math.sin(p.gait*1.5))*(Math.hypot(p.vx,p.vz)>.1?.07:0);m.body.rotation.z=p.juke>0?Math.sin(p.juke*12)*.3:0;const swing=Math.sin(p.gait*1.7)*.7;const moving=Math.hypot(p.vx,p.vz)>.1&&match.phase==='live';m.legs.forEach((leg,n)=>leg.rotation.x=moving?swing*(n?1:-1):0);m.arms.forEach((arm,n)=>arm.rotation.x=i===match.carrier?(n?-.6:-.95):moving?swing*(n?-1:1):.08);if(match.phase==='dead'&&match.lastEnding?.type==='touchdown'&&p.team===match.lastOffense)m.arms.forEach(a=>a.rotation.x=-2.5);m.label.visible=!menu&&match.drive.offense===0&&p.team===0&&p.slot>0&&match.carrier===0&&!match.passed;});
  const selected=match.players[match.controlled];this.ring.position.set(selected.x,.1,selected.z);this.ring.visible=!menu;
  if(match.ball){this.ball.position.set(match.ball.x,match.ball.y,match.ball.z);this.ball.rotation.x+=dt*16;}else if(match.players[match.carrier]){const p=match.players[match.carrier];this.ball.position.set(p.x+Math.sin(p.angle)*.4,1.55,p.z+Math.cos(p.angle)*.4);this.ball.rotation.set(.3,p.angle,0);}
  this.ball.visible=match.phase!=='dead';
  const desired=new THREE.Vector3(),look=new THREE.Vector3();
  if(menu){desired.set(75+Math.sin(this.clock*.06)*10,65,14+Math.cos(this.clock*.05)*8);look.set(-5,0,48);}else{const wide=settings.camera==='wide',close=settings.camera==='close';const mobile=innerWidth<700;const z=Math.max(-2,Math.min(102,focus.z));desired.set(focus.x*.35+(mobile?0:15)*dir,wide?43:close?22:31,z-(wide?43:close?25:34)*dir);look.set(focus.x*.35,0,z+(close?6:11)*dir);}
  const ease=1-Math.exp(-dt*(menu?2:4));this.camera.position.lerp(desired,ease);this.target.lerp(look,ease);this.camera.lookAt(this.target);this.renderer.render(this.scene,this.camera);
 }
}
