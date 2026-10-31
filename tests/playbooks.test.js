import test from 'node:test';
import assert from 'node:assert/strict';
import {Match} from '../js/engine.js';
import {PLAYS,DEFENSES} from '../js/data.js';
import {OFFENSE,DEFENSE} from '../js/positions.js';
import {newDrive} from '../js/rules.js';
import {validate} from '../js/save.js';

test('all offense / defense role pairs remain locked across possession changes',()=>{
 for(const offensePosition of new Set(OFFENSE))for(const defensePosition of new Set(DEFENSE)){
  const m=new Match({offensePosition,defensePosition});
  for(const side of [0,1,0]){m.drive=newDrive(side,50);m.setup();assert.equal(m.onField,true);assert.equal(m.players[m.controlled].role,side===0?offensePosition:defensePosition);const selected=m.controlled;m.snap();m.switchPlayer();assert.equal(m.controlled,selected);}
 }
});
test('pre-snap position changes reject wrong units and live changes; team control stays available',()=>{
 const m=new Match({offensePosition:'TE',defensePosition:'CB'});assert.equal(m.setPosition('QB'),true);assert.equal(m.controlled,0);assert.equal(m.setPosition('CB'),false);m.snap();assert.equal(m.setPosition('RB'),false);
 m.drive=newDrive(1,80);m.setup();assert.equal(m.activePosition,'CB');assert.equal(m.setPosition('OLB'),true);assert.equal(m.controlled,4);assert.equal(m.setPosition(''),true);assert.equal(m.activePosition,null);m.snap();const before=m.controlled;m.switchPlayer();assert.notEqual(m.controlled,before);
});
test('two-way position preferences round trip and invalid roles are repaired',()=>{
 const settings=validate({offensePosition:'TE',defensePosition:'DE'});assert.equal(settings.offensePosition,'TE');assert.equal(settings.defensePosition,'DE');assert.equal(validate({offensePosition:'CB'}).offensePosition,'QB');assert.equal(validate({defensePosition:''}).defensePosition,'');
});
test('playbooks contain 30 unique calls on each side and five eligible routes per offense',()=>{
 for(const calls of [PLAYS,DEFENSES]){assert.equal(calls.length,30);assert.equal(new Set(calls.map(p=>p.id)).size,30);}
 for(const p of PLAYS){assert.equal(p.paths.length,5);for(const route of p.paths)for(const point of route)assert.ok(point.every(Number.isFinite));}
 for(const p of DEFENSES){assert.ok(p.rushers.length>=3&&p.rushers.length<=7);assert.equal(new Set(p.rushers).size,p.rushers.length);assert.ok(p.rushers.every(n=>n>=0&&n<11));}
});
test('all offensive calls run to completion with finite positions against all defensive calls',()=>{
 for(let n=0;n<30;n++){
  const m=new Match({offensePosition:'LT',defensePosition:'CB',rng:()=>.5});m.selectPlay(PLAYS[n].id);m.snap();m.cpuDefense=DEFENSES[n].id;
  for(let i=0;i<1000&&m.phase==='live';i++)m.update(.025,{});
  assert.equal(m.phase,'dead',PLAYS[n].id);assert.ok(m.players.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.z)));
 }
});
test('run calls hand off while QB keeps retain possession; defensive calls change assignments',()=>{
 const m=new Match({offensePosition:'TE'});m.selectPlay('power');m.snap();m.update(.2);assert.equal(m.carrier,3);assert.equal(m.controlled,4);
 const q=new Match({offensePosition:'QB'});q.selectPlay('sweep');q.snap();q.update(.2);assert.equal(q.carrier,0);assert.equal(q.handedOff,false);
 const defense=id=>{const d=new Match({defensePosition:'CB'});d.drive=newDrive(1,80);d.setup();d.selectPlay(id);d.snap();d.play='verts';for(let i=0;i<30;i++)d.update(.025);return d;};
 const man=defense('man'),blitz=defense('mike'),zone=defense('quarters');assert.notEqual(man.players[5].z,blitz.players[5].z);assert.notEqual(man.players[8].z,zone.players[8].z);
});
