export const TEAMS=[
{id:'columbia',name:'Columbia Bolts',abbr:'CB',color:'#ceff63',dark:'#223525',city:'Columbia'},
{id:'night',name:'New York Wolves',abbr:'NW',color:'#aaa6ff',dark:'#27233e',city:'New York'},
{id:'atlanta',name:'Atlanta Heat',abbr:'AH',color:'#ff7962',dark:'#452522',city:'Atlanta'},
{id:'miami',name:'Miami Tide',abbr:'MT',color:'#53e6cc',dark:'#153b39',city:'Miami'},
{id:'dallas',name:'Dallas Outlaws',abbr:'DO',color:'#f5d187',dark:'#383127',city:'Dallas'},
{id:'chicago',name:'Chicago Frost',abbr:'CF',color:'#86c7ff',dark:'#20364d',city:'Chicago'},
{id:'la',name:'LA Comets',abbr:'LC',color:'#fd9bda',dark:'#40233d',city:'Los Angeles'},
{id:'seattle',name:'Seattle Pines',abbr:'SP',color:'#a6d7ac',dark:'#203c2a',city:'Seattle'}];
// Each route is relative to its receiver's starting point (x, yards forward).
const routes={go:[[0,35]],seam:[[2,28]],slant:[[0,4],[12,15]],in:[[0,12],[15,12]],out:[[0,10],[-8,10]],post:[[0,15],[15,30]],corner:[[0,14],[-10,28]],curl:[[0,14],[0,10]],hitch:[[0,7],[0,5]],drag:[[0,3],[22,5]],flat:[[8,2],[13,4]],wheel:[[10,3],[12,28]],screen:[[2,-3],[10,-2]],angle:[[8,3],[0,12]],stick:[[0,7],[5,7]],block:[[0,1]]};
const route=(name,slot)=>routes[name].map(([x,z])=>[x*([1,4].includes(slot)?-1:1),z]);
const pass=(id,name,category,tip,names)=>({id,name,category,tip,kind:'pass',paths:names.map(route)});
const run=(id,name,lane,style,tip)=>({id,name,category:'Run',tip,kind:style==='qb'?'qb-run':'run',lane,paths:['go','go','flat','block','slant'].map(route)});
export const PLAYS=[
pass('slants','QUICK SLANTS','Quick','Hit the inside cuts early',['slant','slant','flat','stick','slant']),
pass('hitches','DOUBLE HITCH','Quick','Outside receivers settle at five yards',['hitch','hitch','angle','seam','go']),
pass('stick','TE STICK','Quick','Tight end settles beside the flat route',['go','slant','flat','stick','drag']),
pass('spacing','SPACING','Quick','Five short outlets across the field',['hitch','out','flat','stick','curl']),
pass('flat','SLANT FLAT','Quick','Read the corner between slant and flat',['slant','go','flat','out','hitch']),
pass('speed-out','SPEED OUTS','Quick','Outside breaks toward the sidelines',['out','out','angle','stick','go']),
pass('mesh','MESH','Crossing','Shallow crossers underneath a seam',['drag','drag','flat','seam','curl']),
pass('cross','CROSS & GO','Crossing','Deep crossers behind short traffic',['in','go','angle','drag','post']),
pass('drive','DRIVE','Crossing','Layer a dig over a shallow cross',['in','curl','flat','seam','drag']),
pass('levels','LEVELS','Crossing','Two inside breaks at different depths',['in','slant','angle','stick','drag']),
pass('dagger','DAGGER','Crossing','Clear the middle for the deep dig',['in','go','flat','seam','post']),
pass('flood','FLOOD RIGHT','Sideline','High, middle and low sideline reads',['go','corner','flat','out','in']),
pass('sail','SAIL','Sideline','Corner route over an outside break',['post','out','wheel','corner','hitch']),
pass('smash','SMASH','Sideline','Hitches hold the corners below deep breaks',['hitch','hitch','flat','corner','corner']),
pass('comeback','COMEBACKS','Sideline','Come back to the ball outside',['curl','curl','angle','out','go']),
pass('verts','FOUR VERTICALS','Deep','Four deep threats with an RB outlet',['go','go','flat','seam','go']),
pass('posts','DOUBLE POST','Deep','Attack the middle behind the safeties',['post','post','flat','curl','go']),
pass('scissors','SCISSORS','Deep','Post and corner routes split the shell',['post','corner','angle','seam','drag']),
pass('slot-wheel','SLOT WHEEL','Deep','Send the slot up the sideline',['in','post','flat','curl','wheel']),
pass('rb-screen','RB SCREEN','Screen','Quick throw to the back behind the line',['go','go','screen','drag','in']),
pass('te-screen','TE SCREEN','Screen','Tight end drops behind the rush',['post','go','flat','screen','slant']),
pass('texas','TEXAS ANGLE','Quick','Running back cuts back into the middle',['curl','go','angle','seam','out']),
run('inside','INSIDE ZONE',0,'rb','Hand off and follow the center'),
run('dive','HB DIVE',-2,'rb','Attack the left interior gap'),
run('power','POWER RIGHT',5,'rb','Follow the right guard off tackle'),
run('counter','COUNTER LEFT',-6,'rb','Back bends left behind the line'),
run('stretch','STRETCH RIGHT',12,'rb','Stretch the defense toward the right edge'),
run('toss','TOSS LEFT',-15,'rb','Take the handoff wide left'),
run('sweep','QB SWEEP',15,'qb','Keep the ball and race around the right edge'),
run('draw','QB DRAW',0,'qb','Keep it through the middle after a short drop')
];
// Slots 0–3: defensive line, 4–6: linebackers, 7–8: corners, 9–10: safeties.
const defense=(id,name,category,coverage,rushers,depth,width,tip)=>({id,name,category,coverage,rushers,depth,width,tip});
export const DEFENSES=[
defense('man','COVER 1 ROBBER','Man','man',[0,1,2,3],14,1,'Man underneath; one deep safety and a robber'),
defense('press','PRESS MAN','Man','man',[0,1,2,3],5,.9,'Tight coverage close to the line'),
defense('trail','TRAIL MAN','Man','man',[0,1,2,3],19,1,'Trail receivers with deep safety help'),
defense('two-man','TWO MAN','Man','man',[0,1,2,3],24,1,'Two deep safeties over man coverage'),
defense('inside-shade','INSIDE SHADE','Man','man',[0,1,2,3],10,.8,'Shade inside to challenge crossing routes'),
defense('outside-shade','OUTSIDE SHADE','Man','man',[0,1,2,3],10,1.2,'Shade outside to challenge sideline throws'),
defense('zone','COVER 2','Zone','zone',[0,1,2,3],18,1,'Two deep zones above the underneath shell'),
defense('cover3','COVER 3 SKY','Zone','zone',[0,1,2,3],23,1,'Corners and free safety protect deep thirds'),
defense('quarters','COVER 4 QUARTERS','Zone','zone',[0,1,2,3],28,1,'Four deep defenders protect long passes'),
defense('cover6','COVER 6','Zone','zone',[0,1,2,3],25,.9,'Split field: half coverage left, quarters right'),
defense('tampa','TAMPA 2','Zone','zone',[0,1,2,3],21,1,'Middle linebacker carries the deep middle'),
defense('cloud','CLOUD FLATS','Zone','zone',[0,1,2,3],12,1.2,'Wide underneath zones defend the flats'),
defense('hooks','HOOK CURL','Zone','zone',[0,1,2,3],11,.8,'Crowd short curls and the inside windows'),
defense('match3','MATCH 3','Zone','match',[0,1,2,3],20,1,'Zone drop first, then match nearby routes'),
defense('match4','MATCH QUARTERS','Zone','match',[0,1,2,3],27,1.1,'Deep shell turns into receiver matches'),
defense('blitz','LB STORM','Blitz','man',[0,1,2,3,4,6],12,1,'Both outside linebackers attack'),
defense('mike','MIKE BLITZ','Blitz','man',[0,1,2,3,5],16,1,'Middle linebacker attacks the center gap'),
defense('sam','SAM FIRE','Blitz','zone',[0,1,2,3,6],16,1,'Right outside linebacker rushes the edge'),
defense('will','WILL FIRE','Blitz','zone',[0,1,2,3,4],16,1,'Left outside linebacker rushes the edge'),
defense('corner-cat','CORNER CAT','Blitz','man',[0,1,2,3,7],15,1,'Left corner attacks from outside'),
defense('safety-fire','SAFETY FIRE','Blitz','man',[0,1,2,3,10],13,.9,'Strong safety joins the rush'),
defense('double-a','DOUBLE A GAP','Blitz','man',[0,1,2,3,4,5],10,.7,'Two linebackers bring inside pressure'),
defense('zero','COVER 0 HEAT','Blitz','man',[0,1,2,3,4,5,6],0,.85,'Seven rushers; no deep safety help'),
defense('fire-zone','FIRE ZONE','Blitz','zone',[0,2,3,5,6],19,1,'Drop a tackle into coverage; rush two linebackers'),
defense('contain','EDGE CONTAIN','Contain','zone',[0,1,2,3],14,1.25,'Ends keep outside leverage against QB runs'),
defense('spy','QB SPY','Contain','man',[0,1,2,3],18,1,'Middle linebacker mirrors the quarterback'),
defense('wide9','WIDE NINE','Contain','man',[0,1,2,3],16,1.4,'Ends align wider to pressure the edges'),
defense('goal','GOAL LINE','Situational','man',[0,1,2,3,4,5],4,.7,'Crowd the line against short-yardage runs'),
defense('red-zone','RED ZONE BOX','Situational','zone',[0,1,2,3],9,.9,'Compact zones defend the end zone'),
defense('prevent','PREVENT','Situational','zone',[0,1,2],34,1.15,'Three rushers with eight defenders in coverage')
];

export const NAMES=['Carter','Brooks','Hayes','Reed','Mason','Wright','Cole','Banks'];
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
