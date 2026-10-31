export const TEAMS=[
{id:'columbia',name:'Columbia Bolts',abbr:'CB',color:'#ceff63',dark:'#223525',city:'Columbia'},
{id:'night',name:'New York Wolves',abbr:'NW',color:'#aaa6ff',dark:'#27233e',city:'New York'},
{id:'atlanta',name:'Atlanta Heat',abbr:'AH',color:'#ff7962',dark:'#452522',city:'Atlanta'},
{id:'miami',name:'Miami Tide',abbr:'MT',color:'#53e6cc',dark:'#153b39',city:'Miami'},
{id:'dallas',name:'Dallas Outlaws',abbr:'DO',color:'#f5d187',dark:'#383127',city:'Dallas'},
{id:'chicago',name:'Chicago Frost',abbr:'CF',color:'#86c7ff',dark:'#20364d',city:'Chicago'},
{id:'la',name:'LA Comets',abbr:'LC',color:'#fd9bda',dark:'#40233d',city:'Los Angeles'},
{id:'seattle',name:'Seattle Pines',abbr:'SP',color:'#a6d7ac',dark:'#203c2a',city:'Seattle'}];
export const PLAYS=[
{id:'slants',name:'QUICK SLANTS',tip:'Fast cuts across the middle',paths:[[[0,5],[11,17]],[[0,5],[7,19]],[[0,5],[-7,19]],[[0,5],[-11,17]]]},
{id:'verts',name:'FOUR VERTICALS',tip:'Stretch the defense deep',paths:[[[0,32]],[[2,32]],[[-2,32]],[[0,32]]]},
{id:'cross',name:'CROSS & GO',tip:'Crossing routes create space',paths:[[[0,8],[22,13]],[[0,12],[-11,21]],[[0,12],[11,21]],[[0,8],[-22,13]]]},
{id:'sweep',name:'QB SWEEP',tip:'Run wide or dump it short',paths:[[[0,15]],[[10,3]],[[10,5]],[[0,20]]]}];
export const DEFENSES=[{id:'man',name:'MAN COVERAGE',tip:'Match up with each receiver'},{id:'zone',name:'ZONE SHELL',tip:'Protect space and react to the ball'},{id:'blitz',name:'PRESSURE',tip:'Send two rushers at the quarterback'}];
export const NAMES=['Carter','Brooks','Hayes','Reed','Mason','Wright','Cole','Banks'];
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

// Five eligible receiving targets: WR, WR, RB, TE, slot WR.
for(const play of PLAYS)play.paths.push([[0,6],[12,17]]);
