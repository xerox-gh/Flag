export const TEAM_SIZE=11;
export const OFFENSE=['QB','WR','WR','RB','TE','LT','LG','C','RG','RT','WR'];
export const DEFENSE=['DE','DT','DT','DE','OLB','MLB','OLB','CB','CB','FS','SS'];
export const POSITIONS=[...new Set([...OFFENSE,...DEFENSE])];
export const RECEIVERS=[1,2,3,4,10];
export const LINEMEN=[5,6,7,8,9];
export const roleSlot=role=>OFFENSE.includes(role)?OFFENSE.indexOf(role):11+DEFENSE.indexOf(role);
export const fits=(card,role)=>card?.role===role||(card?.role==='DB'&&['CB','FS','SS'].includes(role));
export const positionHelp=role=>role==='QB'?'Pass with 1–5. E hands off to the running back.':role==='RB'?'E requests a handoff behind the line or a pass downfield.': ['WR','TE'].includes(role)?'Run your route. E calls for a pass. Catch automatically when you reach the ball.':LINEMEN.includes(OFFENSE.indexOf(role))?'Protect the pocket. Stay near a rusher and hold E to block.':'Read the offense. E tackles the nearby ball carrier. Stay close to the landing point to intercept.';
