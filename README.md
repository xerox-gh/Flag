# FLAG — Own the field

An original, playable **3D eleven-on-eleven American football game**, built as the American football counterpart to [Penalty](https://github.com/xerox-gh/Penalty). Static HTML, CSS and ES modules. No backend, paid services, accounts, CDN imports, or asset downloads.

## Play

The entry point is `index.html`. The included GitHub Actions workflow tests the game, builds `dist/`, and deploys to GitHub Pages on pushes to `main`. If GitHub does not permit the workflow to enable Pages, choose **Settings → Pages → Source: GitHub Actions**, then rerun **Test and deploy Flag**. GitHub provides the live address after deployment.

To run locally, serve this directory over HTTP (ES modules do not run reliably from `file://`):

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`. No package installation is required. Tests and the optional static build use Node 22 or newer:

```sh
npm test
npm run build
```

## Included

- Full 11v11 matches: user-controlled offense and defense against AI, four quarters, scoreboard, first downs, field position, touchdowns, interceptions, safeties, incompletions, punts, and turnovers on downs.
- Four offensive calls: quick slants, four verticals, cross & go, and QB sweep. Pre-snap route diagrams and numbered receivers with coverage hints.
- Three defensive calls: man coverage, zone shell, and pressure. Switch defenders and manually tackle; teammates defend automatically.
- Passing with leading trajectories, automatic receiver control after catches, scrambling, sprint stamina, and cooldown-based jukes.
- Eight fictional clubs. Exhibition, unlimited offensive training, and a saved seven-week round-robin league with simulated results for other clubs, standings, and a league champion.
- Editable player name and jersey number; three lighting presets and three camera distances. Keyboard and touch controls, pause, optional synthesized sound, local save validation, and storage-error feedback.
- Procedural stadium, animated players, helmets and shoulder pads, yard lines, end zones, crowd, goalposts, floodlights, and a skyline. Three.js 0.170.0 is bundled from Penalty with its MIT license. A lightweight perspective Canvas renderer automatically supports browsers without WebGL.

## Controls

| Action | Keyboard | Touch |
| --- | --- | --- |
| Move | WASD / arrows | Movement pad |
| Sprint | Hold Shift | Hold SPRINT |
| Snap | Space / SNAP BALL | SNAP BALL |
| Pass | 1, 2, 3, 4, 5 | Numbered receiver buttons |
| Juke | Space while carrying | JUKE |
| Switch defender | Q | SWITCH |
| Tackle / position action | E | PULL |
| Pause | Esc / P | Pause button |

Movement is relative to the offensive camera: up moves toward the offense's scoring end zone. After a catch, you control the receiver. Pass once per play, from behind the blue scrimmage line. The yellow line is the first-down target. On defense, get within reach of the ball carrier before pulling a flag.

## Arcade rules

This is an original flag football ruleset, not an NFL or federation rules simulator. Four downs gain ten yards; a touchdown awards six plus an automatic extra point. Pocket blocking and proximity tackles are simulated; there is no fumble system, field-goal minigame, or kickoff return. Punts advance 38 yards with touchbacks at the 20. Interceptions immediately change possession at the catch. Possession normally begins at the 20 after a touchdown. A safety awards two and possession at the 35. The clock runs during live plays; an expired quarter finishes its current play. Games can end tied. League rankings use points (3 win / 1 tie), point differential, points scored, then club order as the final tie breaker.

Season results and settings save to this browser/device. An unfinished match does not survive a reload or a confirmed exit. Resetting a season requires a second click. Sound starts off.

## Source map

- `js/engine.js`: pure match simulation, AI, passing, possession, player movement.
- `js/rules.js`: downs, scoring, punts and drive transitions.
- `js/world.js`: Three.js rendering and procedural stadium/player geometry.
- `js/software-world.js`: WebGL-free perspective rendering fallback.
- `js/main.js`: UI, keyboard/touch input, audio and match/season lifecycle.
- `js/save.js`: save validation, schedule, results and standings.
- `js/data.js`: teams and playbooks.
- `tests/game.test.js`: rules, scoring, complete-match simulation, passing, season and save regression tests.

## Validation

Node regression tests cover drive direction, first downs, incomplete passes, turnovers, scoring, punts, pass eligibility and receiver control, training resets, an entire accelerated match, all 28 league fixtures, seven-week season settlement, corrupt saves, and storage failure. Browser smoke checks cover the software-rendered field, play calling, passing/interception, menus, pause/exit, and season setup. The preview environment disables WebGL, so the Three.js rendering path and physical mobile-device/cross-browser performance still need testing on a graphics-enabled device.

## Ultimate Team and Career update

**Ultimate Team** has 448 collectible card versions across Bronze, Silver, Gold, Elite, Hero, Icon, Glory and Eternal. Start with 1,500 coins and complete 11-player offensive and defensive lineups. Open three-player Scout/Pro/Legends packs, view per-card rarity odds, collect duplicate coin refunds, filter owned cards, equip your lineup, and play an independent seven-week UT league. Only completed UT/Career matches award coins; quitting does not. Rewards and fixture results settle once. Season champions receive a bonus; another UT season can start after week seven.

**Club Career** keeps its own roster, transfer budget, fixtures and history. Sign players directly for displayed prices, select your starting lineups, play every fixture, and carry your club into another year. **Player Career** creates a player at any of 16 positions, with position-locked games, XP, skill points and training (+2 to an attribute per point, capped at 99). Your pro starts at the chosen position, and can also be equipped in Ultimate Team. End-of-season moves let you stay or transfer to another club: the pro's XP/stats/history remain, while transferring resets teammates and the club budget before the new-season grant. AI controls your teammates and the opposite unit. Existing careers can change position between matches without resetting progression.

Cards affect actual movement speed, throwing velocity/accuracy, catch reach, tackle reach and sprint stamina. Career squads and the Ultimate Team collection remain separate. All players are fictional. Packs use only earned in-game coins, with no payments or online trading. Card rarity odds are shown in the pack store; every draw is independent and there is no guaranteed rarity slot.

Old settings, stats and the original Season mode survive save migration. New data is stored under the existing local save key with version 2; invalid card IDs and lineups are repaired, invalid fixture sequences are reset, and unknown career data is rejected. Pending matches are not restored after reload, so the fixture can be retried without receiving an unfinished-match reward. Career resets require confirmation and do not erase the other career or card collection.

New modules: `js/progression.js` (cards, economy and career rules), `js/progression-ui.js` (mode menus), and `js/league.js` (shared fixture helpers). `tests/progression.test.js` adds pack, collection, economy, full-season, transfer, save migration, and engine-attribute tests. The complete suite now contains 30 passing tests.


## 11-on-11 and position careers

All modes now field exactly eleven active players per team. Offense uses QB, RB, three WRs, TE, LT, LG, C, RG and RT; defense uses two DEs, two DTs, two OLBs, MLB, two CBs, FS and SS. Each club and Ultimate Team squad has 22 starters across its two units, with substitutions when possession changes. Old cards, coins, fixtures and trained pros are preserved; migration adds free starter specialists to complete the larger roster. Legacy DB cards can fill CB/FS/SS slots.

Player Career supports QB, RB, WR, TE, LT, LG, C, RG, RT, DE, DT, OLB, MLB, CB, FS and SS. Use **Career → Player Career → Your Position** to change an existing pro. Control stays with your chosen player through catches and handoffs, and the camera follows that player. The other unit plays under AI control. Press Space to start its plays too.

- QB: keys 1–5 target eligible receivers; E hands off to a nearby RB.
- RB: E requests a nearby handoff or calls for a pass; Space jukes when carrying.
- WR/TE: run your own route and press E to call for a pass; catching happens automatically near the landing point.
- Offensive line: move into position and hold E to engage a nearby rusher. AI linemen protect the pocket, with finite block duration.
- Defense: cover receivers or rush the passer; E tackles a nearby ball carrier. Proximity to a pass landing point can produce an interception.

Team-controlled modes still switch to the receiver after catches. Player Careers remain locked to their position. Touch controls expose the matching action. This is arcade 11-on-11 football with automatic extra points and simulated punts, not a full NFL penalty/special-teams rules simulation.

### Two-way position control and expanded playbooks
Every match starts with separate offense and defense position choices, including Team Control. Player Career defaults to your pro position on its unit; choose a second role for the other unit. Change the active position before any snap. This changes match control, not the saved career player or card position.

Choose from 30 offensive plays (quick passes, crossers, sideline concepts, deep routes, screens, and eight runs) and 30 defensive calls (man, zone, blitz, contain, and situational). The play-type filter and scrolling cards keep both playbooks accessible on mobile. Run calls hand off automatically; QB keeps retain possession. Coverage calls change rush assignments, alignment, depth, and coverage behavior.

Validation: 36 automated tests, including all two-way position pairs, playbook integrity, possession switching, and simulations of every offensive call.
