# FLAG — Own the field

An original, playable **3D five-on-five American flag football game**, built as the American football counterpart to [Penalty](https://github.com/xerox-gh/Penalty). Static HTML, CSS and ES modules. No backend, paid services, accounts, CDN imports, or asset downloads.

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

- Full 5v5 matches: user-controlled offense and defense against AI, four quarters, scoreboard, first downs, field position, touchdowns, interceptions, safeties, incompletions, punts, and turnovers on downs.
- Four offensive calls: quick slants, four verticals, cross & go, and QB sweep. Pre-snap route diagrams and numbered receivers with coverage hints.
- Three defensive calls: man coverage, zone shell, and pressure. Switch defenders and manually pull flags; teammates defend automatically.
- Passing with leading trajectories, automatic receiver control after catches, scrambling, sprint stamina, and cooldown-based jukes.
- Eight fictional clubs. Exhibition, unlimited offensive training, and a saved seven-week round-robin league with simulated results for other clubs, standings, and a league champion.
- Editable player name and jersey number; three lighting presets and three camera distances. Keyboard and touch controls, pause, optional synthesized sound, local save validation, and storage-error feedback.
- Procedural stadium, animated players, flag belts, yard lines, end zones, crowd, goalposts, floodlights, and a skyline. Three.js 0.170.0 is bundled from Penalty with its MIT license. A lightweight perspective Canvas renderer automatically supports browsers without WebGL.

## Controls

| Action | Keyboard | Touch |
| --- | --- | --- |
| Move | WASD / arrows | Movement pad |
| Sprint | Hold Shift | Hold SPRINT |
| Snap | Space / SNAP BALL | SNAP BALL |
| Pass | 1, 2, 3, 4 | Numbered receiver buttons |
| Juke | Space while carrying | JUKE |
| Switch defender | Q | SWITCH |
| Pull flag | E | PULL |
| Pause | Esc / P | Pause button |

Movement is relative to the offensive camera: up moves toward the offense's scoring end zone. After a catch, you control the receiver. Pass once per play, from behind the blue scrimmage line. The yellow line is the first-down target. On defense, get within reach of the ball carrier before pulling a flag.

## Arcade rules

This is an original flag football ruleset, not an NFL or federation rules simulator. Four downs gain ten yards; a touchdown awards six plus an automatic extra point. There is no blocking, tackling, fumble system, field-goal minigame, or kickoff return. Punts advance 38 yards with touchbacks at the 20. Interceptions immediately change possession at the catch. Possession normally begins at the 20 after a touchdown. A safety awards two and possession at the 35. The clock runs during live plays; an expired quarter finishes its current play. Games can end tied. League rankings use points (3 win / 1 tie), point differential, points scored, then club order as the final tie breaker.

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
