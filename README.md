# 2025-group-4

2025 COMSM0166 group 4

# Puppy's Magical Adventure

<p align="center">
  <a href="https://uob-comsm0166.github.io/2025-group-4/">PLAY HERE</a>
</p>

<p align="center">
  <img src="images/banner.webp" alt="Banner Image" width="80%">
</p>
 
# Table of Contents

- [1. Development Group](#1development-group)
- [2. Kanban link](#2-kanban-link)
- [3. Project Report](#3-project-report)
- [4. Game Design – Puppy's Magical Adventure](#4-game-design--puppys-magical-adventure)
- [5. Implementation](#5-implementation)
- [6. Evaluation](#6-evaluation)
- [7. Code Testing](#7-code-testing)
- [8. Summary & Future Improvements](#8-summary---future-improvements)
- [9. Sustainability](#9-sustainability)
- [10. Process](#10-process)
- [11. Conclusion](#11-conclusion)

# 1. Development Group
<p align="center">
  <strong>Figure 1</strong><br>
  <em>Group Photo</em>

<img src="images/group4-photo.jpg" alt="Group Photo" width="80%">

**The names are listed from left to right in the group photo.**

| Name                  | Email                      |
|-----------------------|---------------------------|
| Xirui Wang           | hd24605@bristol.ac.uk      |
| Suyi Dai            | zq24591@bristol.ac.uk      |
| Yihan Liu           | rv24637@bristol.ac.uk      |
| Xingchen Jin        | if24329@bristol.ac.uk      |
| Amuer               | zd24425@bristol.ac.uk      |
| Xiaoliang Su        | gp24306@bristol.ac.uk      |

# 2. Kanban link
[Board-Group4-2025](https://github.com/orgs/UoB-COMSM0166/projects/131)

# 3. Project Report

Before any code was written, we explored gameplay ideas using hand-drawn paper prototypes. This helped us define core mechanics such as gravity reversal and trap placement.

<p align="center">
  <strong>Figure 2</strong><br>
  <em>Paper Prototypes</em>

<p align="center">
  <img src="./images/paper%20prototype.gif" alt="Paper Prototype Demo" width="60%">
</p>

# 3.1 Introduction

## 3.1.1 Game Background
- A magical catastrophe shattered the world, leaving only floating islands adrift in the sky. Ancient civilisations collapsed, and wild arcane energy now flows through broken landscapes filled with danger, mystery, and forgotten magic.
- You are a magical creature—an exiled, sentient dog cast out by its own kind. Armed with instinct and arcane power, you must navigate through frozen glaciers,  cursed jungles, and twisted forests suspended in the sky. Each realm pulses with unstable magic, hiding secrets—and death—at every turn.
- Watch your step. Triangular spikes jut from the ground and sky. Razor-sharp thorn clusters in the forest are fatal to the touch. There are no second chances.
- Your journey leads to **Death Cliff**—the last known fragment of the World Core. Only by surviving the trials of magic and reclaiming your lost power can you unlock the secret to restoring the world.
-- **"Survive the skies. Master the magic. Reconnect the realms."**


---

## 3.1.2 Game Mechanics
- The game features a fast-paced, roguelike platforming system with procedurally generated levels.
- Each run includes:
**Limited lives & checkpoints (difficulty varies by mode)**, **Coin collection to increase score**, **Environmental hazards like spikes, enemies, and moving traps**, **One-way gates and portals to guide progression**
Character mobility such as gravity reversal, jumping, wall-sliding.
Players must adapt quickly, react precisely, and memorize patterns to reach the end before losing all lives.

<p align="center">
  <strong>Figure 3</strong><br>
  <em>Game Mechanics</em>

<p align="center">
  <img src="./images/future%20improvement.gif" width="60%">
</p>

---

## 3.1.3 Game Innovation
### 1. Multi-biome progression: 
- Players move through visually distinct zones (ice, cloud, jungle, night, fire, castle, ruins), each with unique trap logic and enemy behaviours.
### 2. Dynamic difficulty modes: 
- Easy (99 lives), Hard (5 lives), and Random (10 lives) offer replay value for both casual and hardcore players.
### 3. Subtle narrative layering: 
- While the game remains gravity reversal, action-centric, visual hints (ruins, portals, character design) suggest a deeper backstory about a fractured world and lost civilisations.
### 4. Precision-based skill challenge: 
- Inspired by classic arcade platformers, each level demands reflexes, timing, and risk-reward mastery.

<p align="center">
  <strong>Figure 4</strong><br>
  <em>Slides and Fire Traps Demo</em>

<p align="center">
  <img src="https://github.com/UoB-COMSM0166/2025-group-4/blob/main/images/slides.gif?raw=true" alt="Slides and Fire Traps Demo" width="60%">

---

## 3.1.4 Level Themes & Biomes

### 1. Enchanted Grove
- Theme: Lush, glowing forest filled with bioluminescent plants and soft green light.
- Biome Characteristics: Calm, magical atmosphere with shimmering flora.Coin clusters to encourage exploration and reward risk-taking.
- Focus: Introduction to movement, jumping, and obstacle avoidance in a visually soothing environment.

### 2. Thorny Thicket
- Theme: A dense, enchanted forest surrounded by magical thorns; the mysterious atmosphere remains, but danger noticeably increases.
- Biome Characteristics: Environment packed with thorn traps lining all sides.Introduction of spiked hazards, adding dynamic threats.Tight level design demanding precise movement.
- Focus: Tests the player's dodging, timing, and spatial awareness; introduces dynamic danger elements for the first time.


### 3. Shadow Outpost
- Theme: A hidden outpost deep within the glowing forest, now guarded by patrolling enemies. The atmosphere shifts from mysterious to tense.
- Biome Characteristics: Bioluminescent forest background continues, with added enemy guards.Enemies patrol and block paths, requiring smart dodging or precise timing.Coin placement tempts players to take risks near enemies, increasing the challenge.
- Focus: Tests the player's ability to avoid enemies, manage movement rhythm, and maintain precision — first introduction of active threats.


### 4. Crimson Ambush
- Theme: The enchanted forest now hosts red, bullet-firing enemies, introducing long-range threats and sharply increasing tension.
- Biome Characteristics: Bioluminescent forest backdrop continues, with the addition of crimson ranged foes.Enemies shoot projectiles, requiring precise movement and quick reflexes.Moving thorn hazards from earlier levels remain, creating layered challenges.
- Focus: Tests the player's reaction speed, movement precision, and multitasking ability — marking a clear difficulty spike


### 5. Frozen Labyrinth
- Theme: A glacial labyrinth replaces the forest, introducing icy terrain and a fresh visual experience.
- Biome Characteristics: Ice block platforms with slippery surfaces and hard walls.Sharp ice spikes act as deadly traps, increasing pathfinding complexity.
Maze-like level design demanding careful observation and route selection.
- Focus: Tests the player's path planning, jump precision, and maneuvering in tight spaces.

### 6. Wild Jungle
- Theme: A vivid tropical jungle bursting with life, introducing sharp mountain spikes and moving grass platforms to heighten the challenge.
- Biome Characteristics: Lush jungle backdrop filled with vines, massive trees, and tropical flowers.Sharp spikes as new lethal obstacles, demanding precise jumps.Moving grass platforms add unpredictability, requiring players to observe and time their movements.
- Focus: Tests the player's adaptability to dynamic terrain, observational skills, and mastery of jump timing.


### 7. Nightfall Ruins
- Theme: A silent, moonlit ruin with an eerie atmosphere. Sharp stone spikes now pose deadly threats.
- Biome Characteristics: Dark ruin backdrop with ancient brick structures.Sharp stone spikes placed on floors and ceilings as lethal traps.Players must navigate using limited visual cues in the dark.
- Focus: Tests player's spatial awareness, focus, and ability to avoid fatal traps while staying calm under low-visibility conditions.

### 8. Magma Fortress
- Theme: A blazing magma fortress filled with imminent danger. Newly introduced ice blocks provide freezing effects, alongside weapon-firing enemies and deadly red spikes.
- Biome Characteristics: Lava background with red brick platforms, evoking intense heat.Ice blocks introduce a freezing mechanic, adding environmental variety.Weapon-firing enemies and red spikes create multidirectional threats.Players must navigate flexibly through layered hazards.
- Focus: Tests the player's strategic planning, quick reflexes, and survival skills in a highly complex environment.

### 9. Sky Citadel
- Theme: A soaring sky citadel built of ice blocks, where danger meets altitude, and bow-wielding demons enter the fray.
- Biome Characteristics: Cloudy backdrop with an icy maze suspended in the sky.Bow-wielding demon enemies launch ranged attacks.Ice spikes remain as hazards, requiring careful coordination with enemy movement.
- Focus: Tests aerial maneuvering, reactions to ranged threats, and precision in jumping and dodging.

### 10. Mystic Cavern
- Theme: The final level descends into an underground ravine maze, with a dark, oppressive atmosphere and collapsing world lore.
- Biome Characteristics: Dark cave backdrop with maze-like passages.Demon enemies patrol narrow corridors, posing constant threats.Floor spikes demand precise footwork.Maze layout challenges player's memory and pathfinding skills.
- Focus: Tests patience, route memorization, enemy avoidance, and survival strategy — the ultimate test of mastery.


---

## 3.1.5 Endings
### Perfect Ending
You collect all energy shards, stabilize the gravity core, and unlock the final gate. Earth is restored, humanity returns, and you become the savior of the new world.
"Earth is restored. You are the last spark that re-lit the future."

### Tragic Ending
You fall before the final gate. The floating world collapses, swallowed by the void.
"The world collapses. Your legacy fades into dust."

---

## 3.1.6 Stakeholders
### Surrogate Roles
 ####  Onion Model of game Puppy's Magical Adventure

 <p align="center">
  <strong>Figure 5</strong><br>
  <em>Onion Model</em>

<p align="center">
  <img src="https://github.com/UoB-COMSM0166/2025-group-4/blob/main/images/onion%20model.png?raw=true" alt="Onion Model" width="70%">
</p>

Our Onion Model (Figure 5) revealed a significant finding: the identification of "surrogate roles" in the game development process, as outlined by Ian Alexander. Surrogates serve as representatives for larger user groups. While game testers and reviewers were not our direct target audience, their feedback provided insights from players of various demographics.

For Puppy's Magical Adventure, the surrogates involved were professional game designers, advocates for accessibility, and AI researchers. They provided particularly valuable insights for fine-tuning gameplay mechanics, making sure our gravity manipulation system felt intuitive, and addressing accessibility concerns. We tailored the pacing, difficulty balance, and user experience of our game to suit different play styles by utilising surrogate roles. This method proved especially beneficial during user testing and qualitative assessments. It was possible for us to carry out iterative testing sessions with surrogate users, like other developers and playtest groups, without having to initially reach the whole target audience. This process had a considerable effect on data gathering and game improvement.

Nonetheless, surrogate roles also present challenges.  Surrogate feedback that does not align with real player expectations can present risks.  For instance, if testers focused on accessibility deemed the gravity manipulation puzzles intuitive because of their knowledge of game mechanics, while casual players found them challenging, modifications were required.  In order to reduce these risks, we supplemented surrogate input with direct feedback from a variety of players, guaranteeing that the game was evaluated in a balanced and representative manner.

It is ensured that Puppy's Magical Adventure was engaging, accessible, and mechanically sound for its core audience by strategically integrating surrogate roles and validating their insights with real players.

---

## 3.1.7 Identifying Top-Level Needs with User Stories
### User Posters of four different player types

<p align="center">
  <strong>Figure 6</strong><br>
  <em>User Posters</em>

<p align="center">
  <img src="images/user poster 1.png" alt="User Poster 1" width="45%" />
  <img src="images/user poster 2.png" alt="User Poster 2" width="45%" />
</p>
<p align="center">
  <img src="images/user poster 3.png" alt="User Poster 3" width="45%" />
  <img src="images/user poster 4.png" alt="User Poster 4" width="45%" />
</p>

To better understand what features we should prioritise, we created user stories.

Our team designed several posters featuring characters to represent these user stories, ensuring personalization and keeping them in mind.

---
<p align="center">
  <strong>Table 1</strong><br>
  <em>User Stories & Acceptance Criteria</em>

| User Story                  | Acceptance Criteria                      |
|-----------------------|---------------------------|
| As a game designer, I want to define the pacing and difficulty of levels so that the game remains both challenging and engaging for players.           | Given a complete level design plan, when a player attempts to complete a level, then the difficulty should align with the game's progression curve, maintaining a balance between challenge and accessibility.      |
| As a game developer, I want the game's physics engine to run efficiently, ensuring that 007's jumps and evasive maneuvers respond accurately to player input.            | Given a game physics system, when a player controls 007 to jump or evade obstacles, then the character's movement should be precise, smooth, and adhere to realistic physics, avoiding lag or unresponsiveness.      |
| As a casual player, I want the game to support auto-save functionality so that I can continue playing without losing progress.          | Given that a player has made progress in the game, when they exit, then the game should automatically save their current state so they can resume seamlessly next time.     |
| As a hardcore player, I want the game to include high-difficulty hidden levels or rewards for no-damage clears to push my limits.       | Given the unlock conditions for high-difficulty levels, when a player completes extra challenges (such as a no-damage run or a timed challenge), then they should receive unique rewards or unlock new content to enhance the sense of achievement.      |
| As a story-driven player, I want the game to offer rich storytelling through text or visuals so that I can fully immerse myself in 007's journey.             | Given key narrative moments, when a player reaches certain conditions, then the game should present detailed cutscenes or text to enhance the storytelling experience.      |
| As a completionist, I want to unlock all puzzle pieces and hidden items so that I can achieve 100% game completion.        | Given a collection system, when a player acquires all hidden items or reaches full completion goals, then the game should provide a progress tracker and additional rewards to encourage exploration.      |

# 4. Game Design – Puppy's Magical Adventure
## 4.1 Use Case diagram
<p align="center">
  <strong>Figure 7</strong><br>
  <em>Use Case diagram</em>

<p align="center">
  <img src="https://github.com/UoB-COMSM0166/2025-group-4/raw/main/images/user%20case.png" alt="Use Case" width="600">
</p>



---
<p align="center">
  <strong>Table 2</strong><br>
  <em> Standard Mode VS Random Mode
  (Use Case)</em>

| **Standard Mode** |   |
|-------------------|---|
| **Description** | A level focused on gravity-switch platforming using only the spacebar. Enemy positions and hazards are fixed. |
| **Basic Flow** | **Goal:** Reach the end by flipping gravity at the right time, collecting items, and avoiding enemies. |
| **Step One** | Player presses **Spacebar** to flip gravity, switching between floor and ceiling traversal. |
| **Step Two** | Player collects **Gold Coin** . |
| **Step Three** | Certain platforms or obstacles are triggered by proximity or player movement. |

| **Random Mode** |   |
|------------------|---|
| **Alternative Flow** | **Challenges:** Running out of time, falling off-screen, or colliding with invulnerable enemies ends the run. |
| **Step One (Alt)** | Collision with enemies = lose 1 life. Player starts with 3 lives. |
| **Step Two (Alt)** | After 3 failed attempts at the same section, a hint is displayed to suggest a timing or path change. |
| **Step Three (Alt)** | Optional **Gold coin** can be collected (no gameplay effect). |

---

## 4.2 Procedural Challenge Mode Use Case Specification

<p align="center">
  <strong>Table 3</strong><br>
  <em>  Standard Mode VS Random Mode
  (Procedural Challenge Mode)</em>

| **Standard Mode** |   |
|-------------------|---|
| **Description** | A level with pre-designed traps and enemies. Gravity flipping via spacebar is essential. |
| **Advanced Flow** | Players can learn the layout and improve timing with repeated attempts. |
| **Step One** | Flip gravity using **Spacebar** to dodge hazards and navigate fixed obstacles. |
| **Step Two** | Difficulty increases slightly with level progression but remains consistent across sessions. |
| **Step Three** | Completion rewards include **time ranks** and **collectible counts**. |

| **Random Mode** |   |
|------------------|---|
| **Description** | The same level design, but traps and enemy placements are randomized each run. |
| **Advanced Flow** | Players must react and adapt to changes in the environment with each attempt. |
| **Step One** | Flip gravity using **Spacebar**, but obstacles may spawn in new positions, increasing unpredictability. |
| **Step Two** | Difficulty is scaled dynamically based on player performance (adaptive speed and obstacle density). |
| **Step Three** | Coin points awarded for completing unpredictable runs efficiently. |

---

## 4.3 Summary of Development & Ideation Process

**1. Initial Concept**  
- Inspired by *The Way of the Dodo*, the game was originally a simple one-button platformer.  
- The team introduced a gravity-flip mechanic to differentiate it from similar games.

**2. Refinement & Evolution**  
- Early iterations felt too linear, so we introduced more interactive environments.  
- A magic world and a magic dog gave it identity and story.

**3. Gameplay Enhancements**  
- Added time pressure and limited lives to balance challenge vs accessibility.  
- Environmental storytelling was layered into gameplay.  
- Hidden reward exploration.

**4. Final Adjustments**  
- Difficulty curve tuned for fairness and fun.  
- UI simplified, controls tightened.  
- Pixel art and lightweight assets ensure smooth performance.

---

## 4.4 Game Architecture & Visual Modeling

### 4.4.1 Class Diagram  
**File**: `./images/class-diagram.png`  
The class diagram outlines object relationships in our game system and supports modular, object-oriented structure.

- `Player`: manages gravity flip, movement, collision detection  
- `Enemy` / `ShooterEnemy`: define enemy movement and bullet logic  
- `GameState` / `LevelManager`: handle overall game flow and level transitions  
- `Renderer`, `Camera`: control drawing and visual effects  
- `InputHandler`: responds to user keyboard/mouse/touch input  
- `Bullet`, `Coin`, `ExitGate`, `FloatingPlatform`: represent environmental elements  
- `Config`: centralises constants for difficulty and level layout

<p align="center">
  <strong>Figure 8</strong><br>
  <em>Class Diagram</em>

<p align="center">
  <img src="./images/class-diagram.png" alt="Class Diagram" width="600"/>
</p>

---

### 4.4.2 Sequence Diagram  
**File**: `./images/sequence-diagram.png`  
This diagram illustrates runtime logic and how game events propagate.

- The user starts the game → triggers `initGame()` → `loadLevel()`  
- `updateGame(deltaTime)` runs every frame  
- Gravity flip via Spacebar calls:  
  `attemptGravityFlip()` → `performGravityFlip()` → `Camera.follow()`  
- Collisions with objects affect lives, score, or progression  
- Renderer updates visual elements based on game state

 <p align="center">
  <strong>Figure 9</strong><br>
  <em> Sequence Diagram</em>
   
<p align="center">
  <img src="./images/Sequence-diagram.png" alt="Sequence Diagram" width="600"/>
</p>

---

### 4.4.3 State Diagram  
**File**: `./images/state-diagram.png`  
We designed a hierarchical FSM to control game progression.

- Top states: `MainMenu`, `Play`, `Editor`, `GameOver`, `Win`, `Stats`  
- Inside `Play`: substates include `Moving`, `Jumping`, `Frozen`, `Hit`, `Falling`  
- Transitions include: player input (Spacebar), collision with enemy, reaching `ExitGate`, losing all lives

This diagram supports both functional transitions and UI switching.

 <p align="center">
  <strong>Figure 10</strong><br>
  <em>State Diagram</em>

<p align="center">
  <img src="./images/State%20diagram.png" alt="State Diagram" width="600"/>
</p>

---

## 4.5 Game Mechanics Summary

- **Gravity Flip**: The player can flip gravity using Spacebar to swap between floor and ceiling.  
- **Enemy Logic**: Contact with enemies or bullets results in life loss. Shooter enemies fire projectiles.  
- **Coins & Exit**: Coins boost score; reaching ExitGate completes the level.  
- **Difficulty Scaling**: Random mode adjusts speed and spawn density based on performance.  
- **Procedural Generation**: Some levels are generated using custom seed + difficulty logic.  
- **Camera & Visuals**: Interpolated camera movement, screen shake, UI state indicators.  
- **GameState Management**: Controls life count, transitions, and HUD rendering.

---

# 5. Implementation


## 5.1 Implementation of a time-independent physics system and a stable collision mechanism

### 5.1.1 Objectives and motivations

We want to provide the player with a game experience that is consistent and smooth on different devices and at different refresh rates. The character's jump height, movement speed and interaction with the environment should be stable and controllable, and the game experience should not be affected by performance differences or occasional lags. To achieve this, we need to develop a collision physics and processing system that combines accuracy, efficiency and robustness.

###  5.1.2 Fixed time step mechanism (FTM)

To eliminate the effects of frame rate variations on game behaviour, we introduce a fixed-time-step system. Through the uniform use of a standardised deltaTime parameter, all motion-related calculations (including gravity, acceleration, movement speed, recovery time, etc.) are updated based on a uniform frame rate. This design ensures that the logic of the game is executed in 'fixed time-slices' even in the case of variable device performance, unstable frame rates or even short frame breaks, avoiding problems such as jump heights or motion-time disruptions.

We also defined an upper deltaTime threshold to avoid physical jumps caused by extreme frame delays. For example, the problem of a figure 'crossing' the entire platform in a given frame can be effectively avoided by this mechanism, ensuring predictability even under heavy system load.

### 5.1.3 Collision detection and response logic

To support physical interactions in complex scenes, we implemented a set of fine-grained, directional and dynamically adapted collision handling systems. Contact between the player and different elements of the environment (e.g. the ground, walls, spikes, floating platforms, etc.) is split into two paths: horizontal and vertical collisions are detected separately, and a small-step strategy is used to improve detection accuracy during fast movements and avoid the phenomenon of shape intrusion.


 <p align="center">
  <strong>Figure 11</strong><br>
  <em>Gravity Reversal Demo</em>
</p>
<p align="center">
  <img src="https://github.com/UoB-COMSM0166/2025-group-4/blob/main/images/gravity%20reversal.gif?raw=true" alt="Gravity Reversal Demo" width="60%">
</p>

The system also supports the gravity flip mechanism, and the collision logic can dynamically switch the logic for evaluating the landing surface and upper contact surface based on the current direction of gravity, allowing the player to continue climbing, jumping and landing correctly after the flip. For dynamic elements such as floating platforms and skates, we added special evaluation logic for stable binding, powerful gliding and other complex interactions. To improve the sense of action and feedback, we also added details such as landing pads, impact feedback and wall bouncing in the collision response to make the character's movements more vivid and natural.


 <p align="center">
  <strong>Figure 12</strong><br>
  <em>Spikes & Enemies Demo</em>
</p>
<p align="center">
  <img src="https://github.com/UoB-COMSM0166/2025-group-4/blob/main/images/spikes.gif?raw=true" alt="Spikes & Enemies Demo" width="60%">
</p>

### 5.1.4 Importance of the system and potential for expansion

The physics and collision systems provide an extremely stable, predictable and scalable foundation for the game as a whole. The consistency not only guarantees a direct improvement of the game experience of the current version, but also provides a solid technical basis for the future implementation of more complex mechanisms (e.g. dynamic bodies, time delay, gravity changes, etc.). Thanks to this module, we freed the game experience from 'device dependency' and based on uniform physical rules that provide players with a fair, stable and entertaining action space.



## 5.2 a map editor with a player-defined map feature
### 5.2.1 Objectives and motivations

We want players to not only experience the game, but also create content. To achieve this, we designed and implemented an online map editing system that allows players to create their own game maps through an intuitive graphical interface and import them directly into the main game to try them out. This system is designed to increase player engagement, improve replayability and create a user-centric levelling ecosystem.

### 5.2.2 Graphic map editor

The map uses a matrix of characters as the underlying data structure, with each character corresponding to a game block. The editor intuitively displays these characters using coloured squares and icons, and allows players to freely customise the map content without any programming knowledge.

We have implemented the following interactive features:

- Mouse click to draw blocks, drag to move viewing angle, scroll wheel to zoom in;
- Hotkeys to change block type;
- Support for area selection, stack fill, copy and paste and other operations.

For added efficiency, the HUD displays real-time status information, such as cursor position, currently selected block, edit mode, etc., to ensure that a good user experience is maintained even with high degrees of freedom.

### 5.2.3 WYSIWYG testing mechanism

We have introduced a mechanism for exporting and opening maps in real time. Players can click 'export' to encode the current map into a standard format and load it into the main game engine for play immediately.

To ensure the availability of imported maps, the system has set the following verification rules:

- Checking that there is a starting point (sign '3') and an output (sign '4') in the map;
- Redundant overlapping blocks are automatically removed;
- limiting the size of the map to a reasonable range to avoid loading delays or logical anomalies.

This mechanism helps players quickly refine the level design during the design and testing process, lowers the creation threshold and improves feedback efficiency.

### 5.2.4 Towards a sustainable content ecosystem

The map editor is not only a creation tool, but also reflects our vision of a player-driven content ecosystem. By collecting user cards, the game is no longer solely dependent on official level updates, but can use the power of the community to achieve sustainable content enrichment.

Most importantly, map creation itself is a soft learning experience in system design. Players need to understand the principles of level design, such as spatial layout, risk management and path planning, and in the cycle of 'playing' and 'making' they learn both systematic thinking and creative expression.

In the future, we plan to expand the editor's functionality to include support for uploading and sharing maps and rating mechanisms, to further encourage collaborative content creation and a positive cycle.

## 5.3 The random creation of maps

### 5.3.1 Goals and motivations

We want to develop a level system that is variable, continuously explorable and unique to each game to increase the replay value and challenge depth of the game. Compared to fixed, manually designed maps, randomly generated maps allow players to use different spatial layouts, enemy combinations and object distributions every time they start the game, breaking memory trails, encouraging strategic adaptations and extending the overall life cycle of the game.

### 5.3.2 Design of the programmed generation mechanism

In this project, the map generation logic is based on the structure of the character grid and the entire level is generated by the dynamic combination of preset building blocks (e.g. terrain modules, obstacle combinations, enemy generation rules, etc.) We achieve dynamic map generation and structural manageability through the following key strategies:

- Modular level splicing: the map consists of several small 'template segments', each containing a meaningful terrain structure, jump points, gold distribution, trap design, etc., forming a functional microstructural unit. The overall coherence of the templates is ensured by the constraints of the rules (e.g. landing height of platforms, difficulty rhythm, etc.).

- Variation and unpredictability: introduce randomness in the template selection process while ensuring that templates in the same level are repeated or staggered as little as possible. The number and type of enemies and floating platforms are also randomly generated based on a certain weighting to ensure that each game has a sense of freshness.

- Difficulty control: The game supports different difficulty levels and in the map generation phase, the complexity of the map is controlled by adjusting the template pool filter rules and generator density. In 'Easy' mode, for example, the terrain is smoother, there are many gold coins and little choice of enemy actions, while in 'Difficult' mode there are steeper slopes, denser traps and more intelligent enemy combinations.

- Ensure walkability and structural integrity: Upon completion of each generated map, the system automatically checks the structure of the map to verify that the player's start and end points have been established and that paths are logically connected. In case of an invalid structure or generation error, the system will automatically go back and re-generate to ensure that the player can always enter the playable level.

### 5.3.3 Technical implementation and system interfaces

The map generator is designed as a standalone module that can be seamlessly integrated into the game's main system. After starting the procedural mode in startGeneratedMode(), the generator generates several maps simultaneously, based on a fixed number (e.g. 20), and stores them as a standard character matrix for the main game to load sequentially according to the level index. The result of the map generation includes not only block information, but also corresponding source references (backgrounds, walls, trap maps, etc.) to ensure consistency of visual style.

Once the map is generated, the corresponding entity objects (e.g. players, enemies, floating platforms, gold coins and exit doors) are also initialised and particle animations are activated to ensure that the player receives full and smooth visual and interactive feedback when entering each level.

### 5.3.4 Continuity and expandability

The random map generation mechanism enriches the game's ability to provide content by enabling the system to continuously produce new levels without the need for manual updates. This not only increases the replay value of the game, but also lays the foundation for other features (e.g. card rating, daily challenges, endless mode) that can be used in the future.

In the future, we plan to introduce seed-based generation, allowing players to reproduce certain maps, and expand the variety of map styles (e.g. thematic modules such as ice, volcano, forest, etc.) to improve the expressiveness and playability of randomly generated levels.

---

# 6. Evaluation

Evaluating whether the game provides an engaging and appropriately challenging experience was critical during development. We adopted a **mixed-method approach** that combines **qualitative feedback**, **quantitative testing**, **heuristic evaluation**, and **code-level testing** to ensure a holistic assessment.

---

## 6.1 Qualitative Evaluation

We performed a **Think-Aloud Protocol** with 10 participants from varied backgrounds, both casual and frequent gamers. This allowed us to gather live feedback while players were actively engaged with two difficulty levels (L1 and L2). Participants verbalized their thoughts while playing, and their verbal reactions, behaviours, and challenges were documented and categorised.

### 6.1.2 Key Research Questions:
- Can players intuitively understand and use the gravity flip mechanic?
- Is the platforming difficulty curve fair across levels?
- Do visual cues and indicators support understanding of objectives?

### 6.1.3 Method:
 <p align="center">
  <strong>Table 4</strong><br>
  <em> Method</em>
</p>

| Step | Action | Notes |
|------|--------|-------|
| 1 | Participants introduced to game via short live demo | From Participant #8 onwards, demos greatly reduced confusion |
| 2 | Asked to play L1 and L2 while thinking aloud | Verbalizations documented by two observers |
| 3 | Feedback grouped thematically | Data analysed using thematic analysis (Braun & Clarke 2006) |

### 6.1.4 Thematic Insights:
 <p align="center">
  <strong>Table 5</strong><br>
  <em> Thematic Insights</em>
</p>

| Theme | Positive Feedback | Identified Issues | Action Taken |
|-------|------------------|------------------|---------------|
| Controls & Movement | Responsive gravity switch | Jump timing unclear in some sections | Adjusted platform spacing |
| Visual Design | Pixel art is immersive | Exit unclear, enemy sprites confusing | Updated assets and added arrow cues |
| Learning Curve | Gradual increase appreciated | L2 perceived as sudden jump in difficulty | Added visual prompts |

 <p align="center">
  <strong>Figure 13</strong><br>
  <em>Thematic Mind Map</em>
</p>

<p align="center">
  <img src="images/Thematic%20Mind%20Map.png" alt="Thematic Mind Map">
</p>

---

## 6.2 Heuristic Evaluation

We conducted a heuristic evaluation using **Jakob Nielsen's usability heuristics**, assessing the user interface for potential issues. Issues were scored based on:

- **Frequency** (how often it occurs)
- **Impact** (how seriously it affects gameplay)
- **Persistence** (how long it lasts if unaddressed)

Findings were classified by severity to prioritise improvements. For example:

- **Issue**: Inconsistent feedback when interacting with game objects  
  **Heuristic**: Visibility of system status  
  **Severity**: Major – addressed by adding audio-visual feedback during interaction.

### Findings Table:
 <p align="center">
  <strong>Table 6</strong><br>
  <em> Findings Table</em>
</p>

| Heuristic | Issue Example | Severity | Fix Implemented |
|-----------|---------------|----------|-----------------|
| Visibility of System Status | No feedback after coin collection | Major | Added sound + visual effect |
| Consistency and Standards | jumping mapped to different keys inconsistently | Moderate | Unified key mapping across levels |
| Help and Documentation | Players confused about checkpoints | Minor | Tooltip and tutorial added |

The complete analysis is documented in [Heuristic Evaluation1.xlsx](./Heuristic%20Evaluation1.xlsx) and [Heuristic Evaluation2.xlsx](./Heuristic%20Evaluation2.xlsx), with summaries in [Heuristic%20Evaluation.txt](./Heuristic%20Evaluation.txt).

---

## 6.3 Quantitative Analysis

### 6.3.1 Methodology

We conducted structured user testing with **10 participants**, each playing **two difficulty levels (L1 and L2)**. To assess usability and perceived workload, we employed two instruments:

- The **System Usability Scale (SUS)** – all 10 participants completed the 10-item questionnaire after each level.
- The **NASA Task Load Index (NASA TLX)** – due to time constraints, **5 participants** completed the full TLX assessment covering 6 workload dimensions (mental, physical, temporal, performance, effort, and frustration).

Participants interacted with the game in a lab setting and were instructed to complete both levels without external assistance. After gameplay, responses were collected anonymously.

We used the **Wilcoxon Signed Rank Test** to analyse score variations between L1 and L2. While the SUS dataset includes all 10 users, the TLX analysis is based on a subset of 5 valid responses.

> ⚠️ *This difference in sample size was taken into account during analysis. Despite the smaller TLX sample, the observed trends were consistent and helped guide our usability conclusions.*

### **User Evaluation Summary (SUS & NASA TLX Scores)**  

#### **System Usability Scale (SUS) Scores**
<p align="center">
  <strong>Table 7</strong><br>
  <em> System Usability Scale(SUS)Scores</em>
</p>

| User | I will frequently use this system (L1) | (L2) | The system is too complex (L1) | (L2) | The system is easy to use (L1) | (L2) | Need technical support (L1) | (L2) | Functions are well-integrated (L1) | (L2) | The system is inconsistent (L1) | (L2) | Most people can quickly learn (L1) | (L2) | The system is cumbersome (L1) | (L2) | I feel confident using it (L1) | (L2) | I need to learn a lot before using it (L1) | (L2) |
|------|----------------|-----|----------------|-----|----------------|-----|----------------|-----|----------------|-----|----------------|-----|----------------|-----|----------------|-----|----------------|-----|----------------|-----|
| **1**  | 4 | 3 | 2 | 4 | 5 | 3 | 1 | 3 | 4 | 3 | 2 | 4 | 5 | 3 | 1 | 4 | 5 | 3 | 2 | 4 |
| **2**  | 5 | 2 | 2 | 5 | 4 | 3 | 1 | 4 | 4 | 3 | 1 | 5 | 5 | 2 | 1 | 5 | 5 | 2 | 2 | 5 |
| **3**  | 4 | 3 | 3 | 4 | 5 | 3 | 1 | 4 | 3 | 2 | 2 | 5 | 4 | 3 | 2 | 4 | 4 | 3 | 3 | 5 |
| **4**  | 3 | 3 | 3 | 5 | 4 | 2 | 2 | 5 | 3 | 3 | 3 | 4 | 4 | 2 | 2 | 5 | 3 | 3 | 3 | 5 |
| **5**  | 4 | 2 | 2 | 4 | 5 | 3 | 1 | 4 | 4 | 2 | 2 | 5 | 5 | 3 | 1 | 4 | 5 | 3 | 2 | 5 |
| **6**  | 5 | 3 | 1 | 4 | 5 | 3 | 1 | 4 | 5 | 3 | 1 | 4 | 5 | 2 | 1 | 4 | 5 | 2 | 1 | 4 |
| **7**  | 4 | 3 | 3 | 5 | 4 | 3 | 2 | 5 | 3 | 3 | 2 | 5 | 4 | 3 | 2 | 5 | 4 | 3 | 2 | 5 |
| **8**  | 3 | 4 | 4 | 5 | 3 | 3 | 3 | 5 | 3 | 3 | 3 | 5 | 3 | 3 | 3 | 5 | 3 | 3 | 3 | 5 |
| **9**  | 5 | 2 | 2 | 5 | 5 | 3 | 1 | 4 | 4 | 2 | 1 | 5 | 5 | 2 | 1 | 5 | 5 | 2 | 2 | 5 |
| **10** | 4 | 3 | 3 | 4 | 4 | 2 | 2 | 5 | 3 | 3 | 3 | 4 | 4 | 2 | 2 | 5 | 4 | 3 | 3 | 5 |

<p align="center">
  <strong>Figure 14</strong><br>
  <em> SUS Scores Comparison(L1 vs L2)</em>
</p>

<p align="center">
  <img src="images/SUS%20Scores%20Comparison.png" alt="SUS Scores Comparison">
</p>

---

#### **NASA Task Load Index (NASA TLX Scores)**
 <p align="center">
  <strong>Table 8</strong><br>
  <em> NASA Task Load Index (NASA TLX Scores)</em>
</p>

| User | Mental Demand (L1) | (L2) | Physical Demand (L1) | (L2) | Temporal Demand (L1) | (L2) | Performance (L1) | (L2) | Effort (L1) | (L2) | Frustration (L1) | (L2) |
|------|--------|-----|--------|-----|--------|-----|--------|-----|--------|-----|--------|-----|
| **1**  | 8  | 14 | 5  | 12 | 9  | 16 | 15 | 13 | 10 | 18 | 8  | 15 |
| **2**  | 6  | 15 | 4  | 14 | 8  | 17 | 17 | 10 | 9  | 19 | 6  | 16 |
| **3**  | 9  | 16 | 6  | 13 | 10 | 18 | 14 | 11 | 12 | 20 | 8  | 17 |
| **4**  | 7  | 18 | 5  | 15 | 7  | 19 | 16 | 9  | 8  | 20 | 6  | 18 |
| **5**  | 8  | 17 | 5  | 14 | 9  | 18 | 15 | 12 | 11 | 19 | 7  | 16 |

 <p align="center">
  <strong>Figure 15</strong><br>
  <em> NASA TLX Scores Comparison (L1 vs L2)</em>
</p>

<p align="center">
  <img src="images/NASA%20TLX%20Scores%20Comparison.png" alt="NASA TLX Scores Comparison">
</p>

---

####  SUS Scores Summary:
<p align="center">
  <strong>Table 9</strong><br>
  <em>SUS Scores Summary</em>
</p>

| Metric | L1 (Avg) | L2 (Avg) | Change |
|--------|----------|----------|--------|
| Ease of Use | 4.3 | 3.5 | ↓ |
| Confidence | 4.5 | 4.2 | ↓ slight |
| Need for Support | 1.2 | 1.8 | ↑ |
| System Integration | 4.1 | 3.9 | ↓ |
| Total SUS Score | **77.4** | **70.0** | ↓ 7.4 points |

<p align="center">
  <strong>Figure 16</strong><br>
  <em>SUS Scores Comparison</em>
</p>

<p align="center">
  <img src="images/SUS%20Score%20Comparison.png" alt="SUS Score Comparison">
</p>

####  NASA TLX Summary:
<p align="center">
  <strong>Table 10</strong><br>
  <em>NASA TLX Summary</em>
</p>

| Dimension | L1 Median | L2 Median | L3 Median |
|-----------|-----------|-----------|-----------|
| Mental Demand | 25 | 50 | 85 |
| Physical Demand | 12 | 35 | 55 |
| Temporal Demand | 26 | 47 | 72 |
| Performance | 28 | 54 | 78 |
| Effort | 22 | 48 | 70 |
| Frustration | 17 | 45 | 65 |

 Wilcoxon Signed-Rank Test:
- **L1 vs L2**: *p = 0.0035*  
- **L2 vs L3**: *p = 0.0038*

<p align="center">
  <strong>Figure 17</strong><br>
  <em>NASA TLX Workload Trend Across Levels(Median)</em>
</p>

<p align="center">
  <img src="images/NASA%20TLX%20Workload%20Trend%20Across%20Levels.png" alt="NASA TLX Workload Trend Across Levels">
</p>

<p align="center">
  <strong>Figure 18</strong><br>
  <em>NASA TLX Workload by Dimension(Median)</em>
</p>

<p align="center">
  <img src="images/NASA%20TLX%20Workload%20by%20Dimension.png" alt="NASA TLX Workload by Dimension">
</p>

---

### 6.3.2 Key Findings:
- **Ease of Use**: Most participants strongly agreed that the game was easy to use in Level 1, with average scores of 4–5 for related items. However, scores slightly declined in Level 2, indicating increased complexity may have impacted perceived usability.

- **Confidence & Learnability**: Participants consistently reported feeling confident using the system, even as difficulty increased. Items like "I feel confident using it" maintained high scores (mostly 4s and 5s), suggesting intuitive control schemes and effective visual design.

- **Complexity Awareness**: Scores for "The system is too complex" and "The system is cumbersome to use" increased in Level 2 (i.e., indicating higher agreement), reflecting the intentional jump in difficulty and system complexity. This suggests the need for refined onboarding or adaptive guidance as levels become more intricate.

- **Support Expectations**: The statement "I would need technical support to use this system" received low scores across both levels, confirming that the game mechanics are largely self-explanatory and accessible.

- **Workload increased as intended**:  
  Significant increases in TLX scores confirm proper difficulty scaling
  
### 6.3.3 Summary:

While SUS scores were slightly lower in Level 2, this trend was consistent with the game's increasing challenge and was anticipated in the design. Overall, the high confidence levels and low dependency on technical support indicate a well-balanced interface that accommodates new players while scaling difficulty meaningfully.Our testing also confirmed that the game runs smoothly on both desktop and mobile browsers, providing a consistent gameplay experience across different devices.

---

# 7. Code Testing 
 
To ensure code quality, we adopted a hybrid testing strategy that combines **White-box** and **Black-box** approaches. This allowed us to verify both the internal logic of the system and the external functionality as experienced by players. 
 
--- 
 
### 7.1 White-box Testing 
 
White-box testing allowed us to analyse and test the internal logic of the game's source code by designing tests based on specific methods and control flows. 
 
#### 7.1.1 Methods and Tools 
 
* **Scope**: Core systems such as gravity flip (`attemptGravityFlip()`), collision detection (`checkCollision()`), score/life management (`GameState.update()`). 
* **Coverage Goal**: Achieved both **Statement Coverage** and **Branch Coverage** using conditional path testing. 
* **Implementation**: 
 
  * Created a custom `TestRunner` class with assertion logic and log tracing. 
  * Inserted logs/asserts inside `Player`, `LevelManager`, and `Enemy` classes. 
  * Verified internal state transitions under simulated gameplay events. 
 
#### 7.1.2 Sample Test Case 
 
```javascript 
test("Gravity should invert when spacebar is pressed", () => { 
  const initialGravity = player.gravity; 
  player.attemptGravityFlip(); 
  assertNotEqual(player.gravity, initialGravity); 
}); 
``` 
 
#### 7.1.3 Key Findings 

 <p align="center">
  <strong>Table 11</strong><br>
  <em> Key Findings(White-box Testing)</em>
 
| Issue                                      | Fix                                                         | 
| ------------------------------------------ | ----------------------------------------------------------- | 
| Character fails to land after gravity flip | Added dynamic grounding logic                               | 
| Collision skipping during rapid flips      | Introduced deltaTime limiter & micro-step detection         | 
| Inconsistent life decrement logic          | Rewrote `onHit()` vs `onDeath()` to handle cases separately | 

These adjustments greatly improved cross-device stability and gameplay consistency. 
 
--- 
 
### 7.2 Black-box Testing 
 
Black-box testing focused on user-centric interaction and functionality, without accessing the internal code. We simulated user inputs and validated output behaviours against functional specifications. 
 
#### 7.2.1 Methodology 
 
* Applied **Equivalence Partitioning** and **Boundary Value Analysis** to identify representative input classes. 
* Focused on gameplay behaviours: jumping, enemy collisions, item collection, and level transitions. 
* Used manual playthroughs and scripted scenario-based test tables. 
 
#### 7.2.2 Sample Scenarios 

<p align="center">
  <strong>Table 12</strong><br>
  <em> Sample Scenarios(Black-box Testing)</em>
 
| Test Scenario              | Input                    | Expected Output             | Class Type          | 
| -------------------------- | ------------------------ | --------------------------- | ------------------- | 
| Player collides with enemy | Overlapping positions    | Life -1                     | Valid input class   | 
| Gravity flips mid-air      | Spacebar, Y-dir negative | Character floats to ceiling | Boundary input      | 
| Attempted double jump      | Jump key + wall contact  | No second jump              | Invalid input class | 
| No coin collection         | 0 coins, level complete  | Score = 0                   | No-gain scenario    | 

#### 7.2.3 Key Findings 

<p align="center">
  <strong>Table 13</strong><br>
  <em>Key Findings(Black-box Testing)</em>

| Issue                          | Solution                                  | 
| ------------------------------ | ----------------------------------------- | 
| Inconsistent enemy hitboxes    | Standardized collision bounding boxes     | 
| Missed jumps on edge platforms | Increased platform tolerance margin       | 
| Mid-air jump exploit           | Restricted jump trigger to grounded state | 

--- 
 
### 7.3 Summary 
 
Our combination of **white-box logic testing** and **black-box behaviour simulation** enabled a well-rounded validation of the game system. Future plans include introducing **coverage tracking tools (e.g., Istanbul)** and **automated input simulations** to extend the depth and efficiency of our testing pipeline.

---

# 8. Summary & Future Improvements

<p align="center">
  <strong>Table 14</strong><br>
  <em>Summary&Future Improvements</em>

| Category | Key Insight | Planned Improvement |
|----------|-------------|----------------------|
| Usability | Interface is intuitive but learning curve spikes too fast | Smooth out level transitions, better onboarding |
| Challenge | Players enjoy pressure but frustration grows | Add mid-level checkpoints or retry hints |
| Visual Feedback | Inconsistent early on | Add consistent cues (flashes, effects, arrows) |
| Test Coverage | Good for core systems | Expand integration and edge case testing |

 _Next Iteration Focus: Hints, optional tutorial mode, dynamic difficulty assist_
 This comprehensive evaluation structure allows us to iteratively refine **Puppy's Magical Adventure**, balancing player enjoyment with performance and usability goals.
 
---

# 9. Sustainability 

## 9.1 Project Overview
This sustainability module applies a hybrid of the **SuSAF** and **Sustainability Awareness Framework** to analyse and improve the gravity-based roguelike platformer game. The analysis covers five key dimensions: **Social, Environmental, Economic, Technical, and Individual**, aiming to enhance the long-term sustainability of the game experience, system architecture, and user impact.

---

## 9.2 Sustainability Dimension Analysis
###  Social
- **Participation & Equity**: All difficulty modes offer equal chances to progress without time-based punishment. Player profiles are anonymous and inclusive.
- **Communication**: Players may provide feedback. Easy levels help experienced users support new players.

###  Individual
- **Health & Wellbeing**: The low-stress visual theme and intuitive control layout reduce mental load. Clear level boundaries discourage excessive playtime.
- **Learning & Agency**: The game encourages logical thinking, pattern recognition, and spatial awareness. Optional modes allow players to opt out of competitive elements.
- **Privacy & Safety**: No sensitive personal data required for gameplay.

###  Environmental
- **Energy & Emissions**: Optimised for low-power hardware; includes dark-mode UI and frame limiter for lower GPU usage.
- **Materials & Waste**: Fully digital, no physical packaging or distribution. Assets are reused and compressed.
- **Ecosystem Impact**: Efficient runtime reduces backend compute demands, minimizing indirect emissions from servers.

###  Economic
- **Accessibility & Fairness**: Game is free-to-play. No pay-to-win mechanics.
- **Customer Relationship**: A feedback loop helps prioritise updates based on player needs. Rewards are based on gold coins collected.

### Technical
- **Maintainability**: Modular class architecture (e.g., Level, Hazard, Game, Player) ensures ease of feature expansion.
- **Adaptability**: Supports multiple OS (Windows, macOS, Linux). Versioning tools are used for upgrade cycles.
- **Security**: Minimal attack surface; code is bundled and source-hidden. Encrypted local save data.
- **Performance**: Optimised collision detection and rendering pipeline minimize CPU/GPU load.
- **Cross-Device Compatibility**: Game runs smoothly on both desktop and mobile browsers via responsive design and performance optimisation.

---

## 9.3 Sustainability Effects – Chains of Impact

<p align="center">
  <strong>Table 15</strong><br>
  <em>Sustainability Effects – Chains of Impact</em>
</p>

| Dimension       | Chain of Effects                                                                 |
|----------------|----------------------------------------------------------------------------------|
| Individual      | intuitive controls → less frustration → longer healthy sessions → better focus |
| Social          | competition → sharing → belonging & community         |
| Technical       | modular code → easy maintenance → long lifespan → less redevelopment waste      |
| Environmental   | fewer assets → less GPU usage → reduced electricity consumption                 |
| Economic        | free-to-play → increased access → larger base → sustainable ad |

---

## 9.4 Threats, Opportunities, Actions
###  Threats
- Overcomplicated mechanics may alienate casual users.
- No optimisation for old hardware could cause energy waste.
- Lack of structured update process could lead to technical debt.

###  Opportunities
- Use gravity mechanics as an educational metaphor (STEM-based levels).
- Optimise with green software practices to target eco-conscious markets.
- Build loyalty with players through transparent update logs and version notes.

###  Actions
- Introduce accessibility settings (e.g., slower mode, motion-reduced mode).
- Enable low-power rendering mode and limit background processing.
- Establish modular design conventions and continuous refactoring schedule.

---

## 9.5 Sustainability User Stories

<p align="center">
  <strong>Table 16</strong><br>
  <em>Sustainability User Stories</em>
</p>
  
| Dimension  | User Story                                                                                         | Acceptance Criteria                                                                 |
|------------|----------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| Social     | As a casual player, I want co-op gameplay so I can share the experience. | Game supports share.                              |
| Technical  | As a developer, I want modular code so I can easily update and improve the game.                  | Core modules (Game, Level, Enemy, etc.) are isolated and unit tested.               |
| Environmental | As a laptop user, I want low-power mode so I can save battery while playing.                     | Game provides toggle for reduced framerate and dark theme.                          |
| Economic   | As a student, I want to enjoy the full game experience without paying money.                      | Game has no paywalls and all gameplay elements are accessible without purchase.     |
| Individual | As a health-conscious player, I want to play without feeling pressured to grind.                  | Level system provides breaks and doesn't incentivize marathon sessions.             |

---

## 9.6 Sustainability Score Overview (Out of 10)

<p align="center">
  <strong>Figure 19</strong><br>
  <em>Sustainability Score Overview(Out of 10)</em>
</p>

<div align="center">
  <img src="images/Sustainability%20Score%20Overview.png" alt="Sustainability Score Overview" width="60%">
</div>

Economic and Technical dimensions scored highest (9/10), reflecting strong implementation feasibility and future adaptability.

---

## 9.7 Accessibility Focus 

### Overview 

This section focuses on **accessibility design** for players with disabilities within our gravity-based roguelike platformer. By aligning with the Sustainability Awareness Framework (SuSAF), we analyse the impacts and opportunities across five sustainability dimensions: **Social, Individual, Environmental, Economic, and Technical**.
By embedding accessibility deeply into both **game mechanics and architecture**, we improve not only **player inclusiveness**, but also reinforce **sustainability goals** from technical and social perspectives.

---

### Dimension Analysis 

####  Social 
- **Inclusiveness**
  Game supports **customizable controls**, allowing players with sensory or motor disabilities to participate equally.  

- **Community Engagement**
  Accessible design helps players feel represented and included, promoting a sense of belonging.  

---

####  Individual
- **Health & Wellbeing** 
  Accessibility features such as **reduced input complexity** and **visual clarity** support lower cognitive and physical stress.  

- **Learning & Agency**  
  Adjustable difficulty and **assistive hints** enhance learning pace and independent problem-solving.  

---

####  Environmental 
- **Device Efficiency**  
  Accessibility features are implemented with minimal GPU impact, ensuring **low energy consumption** even on assistive hardware.  

---

####  Economic 
- **No Paywalls**  
  Accessibility options are available by default at no extra cost, ensuring **financial fairness**.  

- **Wider Reach**  
  Inclusive design expands the game's potential audience, supporting long-term sustainability and **market diversity**.  

---

####  Technical 
- **Modular Accessibility**  
  Accessibility features are developed as **independent, reusable modules** to ease maintenance and future extension.  

- **WCAG Compliance**  
  Interface elements and interactions follow WCAG guidelines to ensure **accessibility compliance**.
  
---

# 10. Process

## 10.1 Collaboration

In the early phase of development, our team held in-person meetings to build trust and align on creative direction. These included informal discussions and brainstorming sessions using classroom whiteboards to sketch core mechanics such as gravity reversal, environmental hazards, and level designs. This relaxed setting helped foster early camaraderie and contributed to our final creative vision.

<p align="center">
  <strong>Figure 20</strong><br>
  <em>Team Meeting</em>

<div align="center">
  <p style="font-size:14px; margin: 4px 0;">Team Meeting</p>
  <img src="images/Team-photo.jpg" alt="Team Photo" width="400">
</div>

We used a voting-based decision-making process:
- For simple tasks, we held quick votes during in-person lab discussions.
- For complex choices (e.g., game theme or major mechanic decisions), we used anonymous online voting via **WeChat** or face-to face discussion to ensure everyone's voice was heard without pressure.

After lab sessions each week, we frequently merged code during offline co-working blocks, ensuring that each team member could test the latest build and contribute to debugging together.

As the project progressed into the remote phase, we transitioned to **scrum-style stand-up meetings** via **Microsoft Teams** or **WeChat** (3x per week). During holiday sprints, we followed a weekly sprint cycle with decomposed story points to evenly distribute work and avoid last-minute pressure. We observed "heroic efforts" during early deadlines and addressed this through better task granularity.

---

## 10.2 Tools and Techniques

To coordinate collaboration and track progress, we used a combination of digital tools:

- **VS Code + Live Share**: Enabled real-time pair programming and p5.js collaboration.
- **GitHub**: Used for version control, issue tracking, and PR-based code review.
- **WeChat Group**: Real-time communication, shared documents for meeting notes and sketch sharing and PR review reminders.
- **GitHub Kanban Board**: Used for weekly plans and task tracking (To Do → In Progress → Done). Helped visualise sprint workflow and reassign tasks if needed.

>  We initially used GitHub Projects, and we found it's was really flexible for visual/multi-step UI/gameplay tasks.

---

## 10.3 Agile Methodology

We followed an agile workflow with weekly iteration cycles:

- Daily updates were shared via **WeChat** or online stand-ups.
- Sprint goals were discussed in **offline backlog refinement sessions** (e.g., after class or in MVB).
- Each sprint began with **story point estimation** using a lightweight version of planning poker.
- Workload was adjusted based on individual capacity.

We conducted regular **refactoring**:
> E.g., Sprint 3 involved a rewrite of the collision detection logic for better modularity and extensibility.

**Pair programming** was a key technique:
- Senior devs partnered with juniors to prototype levels and debug game physics.
- Helped build shared knowledge and cohesion.

### Agile Focus Points:
-  Incremental delivery of playable builds.
-  Fast internal feedback loops.
-  Well-documented commits and PRs.
-  Priority shifts when needed (e.g., UI before backend in Week 5).

---

## 10.4 Visuals

- **Paper Prototype**: Early sketches (level flow, gravity blocks, spikes).
NASA TLX Workload by Dimension(Median)
<div align="center">
  <img src="images/Paper%20Prototype.jpg" alt="Paper Prototype" width="400">
</div>
<p align="center">
  <b>Figure 21</b><br>
  Paper Prototype
</p>

- **Voting Results**: Ranked-choice polls via WeChat.
<div align="center">
  <img src="images/wechat.png" alt="投票结果" width="400">
</div>
<p align="center">
  <b>Figure 22</b><br>
  WeChat Screenshot
</p>
  
- **Kanban Board**: GitHub task board (To Do / In Progress / Done).  
  <p align="center">
  <img src="images/Kanban.png" alt="Kanban Board" width="80%">
  <br>
  <b>Figure 23</b><br>
  Kanban Board
</p>

- **Sprint process**:

  <p align="center">
  <strong>Figure 24</strong><br>
  <em>Sprint process</em>

<div align="center">
  <img src="images/process-sprint.png" alt="Sprint Process" width="400">
</div>

- **Burndown Chart**:

  <p align="center">
  <strong>Figure 25</strong><br>
  <em>Burndown Chart</em>

  <p align="center">
    <img src="images/Burn%20chart.jpg.png" alt="Burndown Chart" width="80%">
  </p>
  
---

Our iterative, flexible process and thoughtful use of collaborative digital tools enabled the successful delivery of a highly interactive, multi-biome gravity reversal platformer.

---

## 10.5 Contribution to Development Process  

<p align="center">
   <strong>Table 17</strong><br>
   <em>Contribution to Development Process</em>
</p>

| Name           | Contribution Weighting |
|----------------|------------------------|
| Xingchen Jin   | 1.0                    |
| Yihan Liu      | 1.0                    |
| Amuer          | 1.0                    |
| Xiaoliang Su   | 1.0                    |
| Suyi Dai       | 1.0                    |
| Xirui Wang     | 1.0                    |

---

# 11. Conclusion

The development of Puppy's Magical Adventure was a transformative learning experience for our team, combining creativity, technical skill, and agile collaboration. From ideation to implementation, we followed an iterative process that allowed us to continuously refine our design, balance gameplay mechanics, and deliver a playable game within the limited time frame.

One of the most important lessons we learned was the value of clear team communication and regular feedback loops. Using tools like GitHub Projects, WeChat, and in-person meetings, we managed to stay aligned and adapt quickly to changes. We discovered that dividing tasks not just by discipline (e.g., design vs. development) but by game features (e.g., UI implementation, gravity control, enemy logic) helped streamline our progress and prevent overlaps or delays.

We also faced several challenges, particularly in terms of feature scoping and game balancing. Initially, our ambition led us to over-plan the number of levels and mechanics. Midway through development, we had to revise our scope to ensure a high-quality core experience rather than spreading ourselves too thin. Another technical challenge was designing the gravity-flipping mechanic without causing bugs or disorientation for the player. We solved this by creating modular physics functions and implementing smoother transitions.

Moreover, integrating sustainability into our development process was eye-opening. We reused and repurposed existing assets, optimised scripts to reduce CPU load, and structured our code for future scalability. Special effort was made to ensure mobile browser compatibility, making the game accessible on both phones and tablets without additional installation. These actions not only aligned with the SusAF framework but also improved our project's maintainability.

In the future, we envision expanding Puppy's Magical Adventure with more levels, enhanced storytelling (e.g., cutscenes or dialogue), improved accessibility features, and a polished menu system. We are also interested in testing the game on different devices and possibly integrating multiplayer or online leaderboard features. Additionally, user feedback from playtests will continue to inform refinements in level design and UI.

Ultimately, this project helped us grow as software engineers, designers, and collaborators. It pushed us to apply classroom knowledge in a real-world context, solve problems creatively, and think beyond code—into the realm of player experience, sustainability, and agile teamwork.

---
