# PLAN — SHOOTING STARS

> Juego shooter espacial pixel con movimiento horizontal. Motor: **Phaser 3**, HTML plano + CDN, arte generado por código.

## Requisitos de diseño (de agents.md.txt)

- **Player:** fijo con arma que rota en semicírculo **-90° a +90°**; dispara a enemigos.
- **Enemigos:** movimiento vertical, se acercan lentamente, variantes más fuertes, dan -10% de vida al contacto, dificultad progresiva, BOSS a los 60s.
- **Puntos:** 1 por enemigo, 10 por BOSS.
- **Estética:** fondo espacial con estrellas fugaces, vida arriba-izq, puntos abajo-der, player a la izq en el medio, enemigos desde la derecha (randon).
- **Patrón:** HTML/CSS/JS, módulos, carpetas separadas.

## Estado de ejecución — TODAS LAS FASES COMPLETADAS ✅

| Fase | Descripción | Estado |
|------|-------------|--------|
| 1 | Scaffold (index.html, css, config.js, main.js, escenas) + arranque | ✅ |
| 2 | Fondo espacial con estrellas fugaces (`Star`) | ✅ |
| 3 | Player fijo + arma giratoria -90°/90° (`Player`, `InputHandler`) | ✅ |
| 4 | Disparo y balas (`Bullet`) | ✅ |
| 5 | Enemigos, variantes, oleadas progresivas, BOSS 60s (`Enemy`, `Boss`, `EnemySpawner`) | ✅ |
| 6 | Colisiones y daño -10% + puntos (`ScoreSystem`) | ✅ |
| 7 | UI: vida arriba-izq, puntos abajo-der, game over | ✅ |
| 8 | Pulido: pantalla inicio, reinicio, verificación | ✅ |
| 9 | Pantalla de inicio: logo, fondo con estrellas fugaces, créditos | ✅ |
| 10 | Intro animada al pulsar ENTER antes de entrar en batalla | ✅ |
| 11 | Daño al cruzar la línea del jugador (-10% vida) | ✅ |
| 12 | Barra de vida animada con número + colores según umbral | ✅ |
| — | Récords persistentes (localStorage) | ✅ |
| 13 | Enemigos 2x tamaño, variantes 3 pts, explosión al morir | ✅ |
| 14 | Enemigos rebotan en límites + algunos oscilan | ✅ |
| 15 | Game over → pantalla principal; BOSS integrado en grupo | ✅ |
| 16 | BOSS: 25 de vida, barra arriba-der, Ctrl+D para invocarlo | ✅ |
| 17 | Muerte del BOSS: +30 vida (sin superar 100), gran explosión, elimina enemigos | ✅ |
| 18 | Game over solo sale con ENTER; Ctrl+K lo muestra al instante | ✅ |
| 19 | Enemigos básicos usan `enemigo1.png` (128px) y giran constantemente | ✅ |
| 20 | Enemigo más grande (40px) y explosión de enemigos más pequeña (16px) | ✅ |
| 21 | Enemigos básicos usan `assets/estrella.png` (50px, `ENEMY_IMG`) | ✅ |
| 22 | Barra de vida del BOSS alineada en rojo desde el inicio | ✅ |
| 23 | Impacto en escudo: explosión roja + línea de escudo parpadeante | ✅ |
| 24 | Variantes naranjas usan `assets/estrella2.png` (`VARIANT_SIZE` 48px, sin rotación) | ✅ |
| 25 | Logo HTML durante el juego, detrás del canvas (75% visible) | ✅ |
| 26 | Variantes con 3 vidas muestran `assets/estrella2-2.png` al quedar 1 | ✅ |
| 27 | BOSS con `assets/boss.png` (75x75) en lugar de textura procedural | ✅ |
| 28 | BOSS 1.5x más grande (52 → 78 px) | ✅ |
| 29 | Estrellas fugaces del juego en horizontal (dcha→izq) | ✅ |
| 30 | 2 capas parallax de planetas para dar profundidad (`Planet.js`) | ✅ |
| 31 | Alarma al aparecer el BOSS: flash rojo + planetas rojos + sirena | ✅ |
| 32 | Sistema de fases: WAVE COMPLETED + túnel velocidad de la luz | ✅ |
| 33 | Mecánica POWER UP: 4 beneficios, inventario de 3 casillas, activación 1/2/3 | ✅ |
| 34 | Power ups nunca aparecen detrás del player (spawn a la derecha de `PLAYER_X`) | ✅ |
| 35 | Número de versión del juego (abajo-izq) en menú y en partida (`CFG.VERSION`) | ✅ |
| 36 | Planetas con imágenes `Planeta_Fondo_N1/N2/N3.png` al azar + peligro con tint rojo | ✅ |
| 37 | Power ups `BIG BOY`/`BIG BOOM` muestran su PNG en el inventario | ✅ |
| 38 | TIENDA de armas: menú victoria BOSS (SHOP/CONTINUE/SURRENDER), compra/equipado | ✅ |
| 39 | Responsive (Scale.FIT), táctil (disparo/apuntado/power ups/UI) + PWA instalable/offline | ✅ |
| 40 | Reset de dificultad/fase garantizado al terminar partida (game over y SURRENDER) | ✅ |
| 41 | Planeta de fondo `Back_Planet.png` protector pegado al borde izq (fondo pasa por detrás) | ✅ |
| 42 | Power ups HEALING (`Heal.png`) y SHIELD (`Shield.png`) con sprite propio | ✅ |
| 43 | Power up **TIMESTOP** (`Time_Stop.png`): congela enemigos + pantalla gris + cuenta atrás 5s | ✅ |
| 44 | Power up **GRANADE** (`Granade.png`): 10 granadas parabólicas, explosión 1/8 pantalla | ✅ |
| 45 | Contador de granadas restantes junto al inventario | ✅ |
| 46 | Música de fondo en partida (`musica.mp3`), música de BOSS (`musica-boss.mp3`) con fades | ✅ |
| 47 | Efectos de sonido procedurales (Web Audio): disparo, explosión, daño (`SoundFX`) | ✅ |
| 48 | Power ups cada 30s (`POWER_UP_SPAWN_INTERVAL`) | ✅ |
| 49 | Victoria BOSS: `victoria.mp3` + mensaje "VICTORY" y tienda al terminar el audio | ✅ |

## Estructura de carpetas
```
SHOOTING STARS/
├── index.html               # CDN Phaser 3 + carga de módulos + metas PWA/iOS + Open Graph
├── manifest.webmanifest     # PWA: instalable (standalone), iconos, start_url/scope explícitos
├── sw.js                    # Service Worker (network-first + aviso de versión)
├── robots.txt               # permite a todos los crawlers (Facebook/WhatsApp incluidos)
├── css/style.css
├── assets/icons/            # iconos PWA (192/512/maskable/apple-touch) + og-image (1200x630)
└── js/
    ├── config.js            # constantes ajustables
    ├── main.js              # instancia Phaser.Game + RecordSystem
    ├── scenes/
    │   ├── BootScene.js     # pantalla de inicio (logo, estrellas, intro) + récord
    │   ├── GameScene.js     # gameplay, spawns, colisiones
    │   └── UIScene.js       # HUD + game over + récords
    ├── objects/
    │   ├── Player.js        # player fijo + arma giratoria
    │   ├── Bullet.js
    │   ├── Enemy.js         # enemigo + variantes
    │   ├── Boss.js          # jefe (10 pts, 60s)
    │   ├── Explosion.js     # explosión al matar enemigos/BOSS
    │   ├── Star.js          # estrellas fugaces del fondo
    │   ├── Planet.js        # capas parallax de planetas
    │   ├── PowerUp.js       # estrella de power up que cae desde arriba
    │   └── Grenade.js       # granada parabólica del power up GRANADE
    └── systems/
        ├── InputHandler.js  # ratón (apuntar/disparar) + teclado
        ├── EnemySpawner.js  # oleadas crecientes + boss
        ├── ScoreSystem.js   # puntos por kill
        ├── RecordSystem.js  # mejor récord en localStorage
        ├── PowerUpSystem.js # spawn + inventario de power ups
        └── SoundFX.js       # efectos de sonido procedurales (Web Audio)
```

## Progreso detallado

### 1. Scaffold ✅
`index.html` (CDN Phaser 3.60, orden de script), `css/style.css` (fondo, canvas centrado), `js/config.js` (constantes), `js/main.js` (escenas + física arcade), escenas `Boot/Game/UI` + `Player`.

### 2. Fondo espacial ✅
`Star.js`: 60 estrellas fugaces pixel con estela, velocidad diagonal, colores variados, reciclado al salir de pantalla.

### 3. Player + arma ✅
`Player.js`: cuerpo y cañón como gráficos separados; `setGunAngle()` limpia dato at **[-90°, +90°]**. `InputHandler.js`: ratón apunta (clamp) y clic/espacio dispara; W/S y flechas rotan el arma.

### 4. Disparo ✅
`Bullet.js`: sprite de física con textura generada; velocidad re-aplicada cada frame (`Bullet.update()`) igual que los enemigos, para garantizar el movimiento. `GameScene.tryFire/doFire` con cooldown unificado en base de tiempo de escena (`this.time.now`); las balas se destruyen fuera de pantalla o tras su vida útil (snapshot seguro del grupo).

### 5. Enemigos y BOSS ✅
`Enemy.js` (variantes según tiempo), `Boss.js` (60s, muy resistente), `EnemySpawner.js` (intervalo progresivo sin tope de enemigos, boss único). Movimiento vertical + acercamiento al player.

### 6. Colisiones y daño ✅
Overlap balas-enemigo (kill + puntos), balas-boss, enemigo-player (`-10%` de vida total). Fin de partida a 0% de vida.

> **Nota:** el daño del enemigo pasó de `playerZone` (overlap) a cruce de línea vertical — ver fase 11.

### 7. UI ✅
`UIScene.js`: barra de vida arriba-izq (color por cantidad), puntos abajo-der; pantalla Game Over con reinicio.

### 8. Pulido ✅
Pantalla de inicio con instrucciones, reinicio por clic/ENTER, todos los archivos JS verificados sin errores de sintaxis.

### 9. Pantalla de inicio enriquecida ✅
`BootScene.js`: logo `assets/logo.png` (centrado arriba, escala 0.2), fondo con 120 estrellas parpadeantes + estrellas fugaces que cruzan en diagonal, crédito "HECHO POR MANUEL Y MANOLO" abajo-derecha. Se eliminan el título y el subtítulo textuales.

### 10. Intro animada ✅
`BootScene.showIntro()`: al pulsar ENTER (o clic) aparece un briefing que se escribe línea por línea ("PILOTO, DESPIERTA..."). Cada ENTER avanza a la siguiente línea (saltando la escritura si se pulsa antes de terminar); tras la última línea, ENTER inicia la batalla. Se corrigen bugs previos: `input.enabled=false` desactivaba el teclado y `currentLine` no incrementaba (bucle infinito).

### 11. Daño al cruzar la línea ✅
`EnemySpawner.updateAll()`: cuando un enemigo cruza la línea vertical del jugador (`sprite.x < CFG.PLAYER_X`), resta `-10%` de vida total y se destruye; a 0% de vida se acaba la partida. Se eliminó el `playerZone`/overlap anterior (destruía al enemigo antes de cruzar la línea, por lo que este chequeo nunca se disparaba).

### 12. Barra de vida animada ✅
`UIScene.js`: relleno como objeto `Graphics` redibujado (ancho = `188 * pct`) + número de vida visible (empieza en 100). Colores: verde >50%, amarilla entre 50% y 20%, roja <20%. Se actualiza escuchando el evento `player-hurt` y por polling en `update()`. Bug resuelto: `Rectangle.setSize()/.width` no redibujaba en Phaser; se usa `Graphics.fillRect()`.

### Récords persistentes ✅
`RecordSystem.js` guarda el mejor resultado en `localStorage` (`shooting_stars_hiScore`); se muestra en pantalla de inicio y en Game Over con aviso de "¡NUEVO RÉCORD!".

## Sesión actual (ajustes de gameplay)

### 13. Enemigos 2x, variantes 3 pts y explosiones ✅
- `ENEMY_SIZE` de 14 → 28 (`config.js`), duplicando tamaño de textura y cuerpo.
- Nuevo `POINTS_PER_VARIANT: 3`; los enemigos naranjas (variantes) dan 3 pts y el BOSS sigue dando 10.
- `Explosion.js`: explosión radial (naranja/blanco) que se expande y desvanece; `GameScene.spawnExplosion()` se dispara al matar enemigos y BOSS.

### 14. Enemigos dentro de límites + rebote ✅
`Enemy.js`: cada enemigo elige al azar entre oscilar (senoidal, clampeado a los bordes) o rebotar (velocidad vertical que se invierte al tocar borde superior/inferior). Ninguno se sale del mapa.

### 15. Game over a pantalla principal + BOSS en grupo ✅
- `UIScene.restart()` va a `BootScene` (pantalla principal) en vez de relanzar la partida.
- Bug: `this.gameOver` persistía entre partidas (instancia reutilizada) y congelaba `update()`; se resetea en `create()`.
- BOSS integrado en el grupo de enemigos (`EnemySpawner.spawnBoss()`) para usar el mismo overlap; se elimina el overlap separado que congelaba el juego.
- Bug: `startTime=0` provocaba que la 2ª partida empezara con dificultad/BOSS máximos; ahora `startTime = this.time.now`.

### 16. BOSS mejorado ✅
- Vida reducida a 25 disparos (`BOSS_LIFE`).
- Barra de vida del BOSS arriba a la derecha (`UIScene`): visible solo con BOSS activo, muestra `BOSS X/25` y se oculta al morir (eventos `boss-spawned` / `boss-hurt`).
- Comando **Ctrl+D** para invocar al BOSS al momento.
- Trayectoria corregida: menos vertical y clampeada a los límites.

### 17. Muerte del BOSS con recompensa ✅
`GameScene.onBossKilled()`: al matar al BOSS se suman sus 10 pts, se curan **+30 de vida** sin superar el máximo (`Player.heal()` → `Math.min(CFG.MAX_HEALTH, health + 30)`), se dispara una **gran explosión** que cubre toda la pantalla (`BOSS_EXPLOSION_RADIUS: 1100`) y se elimina a todos los enemigos restantes (`EnemySpawner.clearEnemies()`). Detección con `handler instanceof Boss` en `onBulletEnemy`.

### 18. Game over solo con ENTER + Ctrl+K ✅
- `UIScene.showGameOver()` elimina el handler de clic: ahora solo se reinicia con **ENTER** (se actualiza el texto "Pulsa ENTER para reiniciar").
- `GameScene` añade **Ctrl+K** → `endGame()` para mostrar la pantalla de Game Over instantáneamente (junto al Ctrl+D del BOSS).

### 19. Enemigos con imagen + rotación ✅
`Enemy.js`: los enemigos básicos usan la textura `enemigo1.png` (escalada con `setDisplaySize(ENEMY_SIZE, ENEMY_SIZE)`) y giran constantemente (`sprite.rotation += (dt/1000) * CFG.ENEMY_ROT_SPEED`). Las variantes naranjas conservan su textura procedural. Se carga en `BootScene.preload()` como `enemy_img`.

### 20. Tamaños ajustados ✅
- `ENEMY_SIZE` de 28 → **40 px** (enemigo más grande).
- Explosión de enemigos desacoplada del tamaño: radio fijo **16 px** (`ENEMY_EXPLOSION_RADIUS`) al morir y al ser eliminados por el BOSS. La del BOSS (pantalla completa) no cambia.

### 21. Imagen del enemigo básico ✅
- `CFG.ENEMY_IMG` pasa a `assets/estrella.png` (50x50px, evita el límite de textura GPU). Se muestra con `setDisplaySize(ENEMY_SIZE, ENEMY_SIZE)` (40px) y sigue girando constantemente.

### 22. Barra de vida del BOSS corregida ✅
- Bug: el fondo oscuro (`bossBack`) y el relleno rojo (`bossFill`) estaban en coordenadas distintas, mostrando dos barras separadas. Ahora ambos comparten el borde derecho (`W-20`).
- Bug: al aparecer el BOSS la barra salía negra hasta el primer disparo. `showBossBar()` ahora llama a `setBossHealth(CFG.BOSS_LIFE)`, así sale en rojo "BOSS 25/25" desde el principio.

### 23. Impacto en el escudo ✅
- `GameScene.spawnShieldExplosion()`: explosión diferenciada en rojo (`SHIELD_EXPLOSION_RADIUS: 30`) usando el parámetro `color` añadido a `Explosion`.
- `GameScene.spawnShieldFlash()`: línea vertical roja tipo escudo en `PLAYER_X` que parpadea (`alpha` 0→0.85, yoyo) y se destruye.
- Ambos se disparan desde `EnemySpawner.updateAll()` cuando un enemigo cruza la línea.

### 24. Variantes naranjas con imagen propia ✅
- `CFG.VARIANT_IMG: 'assets/estrella2.png'`, `CFG.VARIANT_SIZE: 48` (mayor que el básico).
- Cargadas como `enemy_variant_img`; ya no usan textura procedural.
- `Enemy.js`: las variantes **no rotan** (`if (!this.variant)`).

### 25. Logo HTML durante el juego ✅
- Logo movido del canvas a un elemento HTML `#logo` dentro de `#game` (`index.html`).
- CSS: `position: absolute; top: -90px`, por **detrás** del canvas (`z-index: 0` frente a `z-index: 1`), mostrando el **75% superior** (25% inferior oculto tras el canvas), con `opacity: 0.35`.
- Oculto en la página inicial (`BootScene`) y solo visible durante el juego (`GameScene`).

### 26. Enemigo naranja en su último punto de vida ✅
- `CFG.VARIANT_LIFE_MULT` de 2.5 → **3** (vida 3→2→1→0). Bug: con 2.5 la vida pasaba 2.5→1.5→0.5 y nunca era exactamente 1, por lo que no se activaba el cambio de imagen.
- `CFG.LOW_IMG: 'assets/estrella2-2.png'` (cargada como `enemy_low_img`); solo para variantes: cuando queda 1 de vida se cambia la textura manteniendo `VARIANT_SIZE`.
- **Atajo Alt+N** (`GameScene`): invoca `EnemySpawner.spawnVariantEnemy()` para lanzar enemigos naranjas directamente.

## Sesión actual (boss por imagen, profundidad, alarmas y fases)

### 27. BOSS con imagen + más grande ✅
- `CFG.BOSS_IMG: 'assets/boss.png'` (75x75px) añadido a `config.js`.
- `BootScene.preload()` carga `boss_img`.
- `Boss.js` elimina `generateTexture()` (textura procedural) y crea el sprite con `'boss_img'` usando `setDisplaySize(size, size)` + `body.setSize(size, size, true)`.
- `CFG.BOSS_SIZE` de 52 → **78 px** (1.5x).

### 28. Estrellas fugaces horizontales en el juego ✅
- `Star.js`: las estrellas del `GameScene` ahora se mueven de derecha a izquierda (`vx` negativo, `vy=0`) en lugar de en diagonal; reaparecen por la derecha al salir por la izquierda.

### 29. Capas parallax de planetas ✅
- Nuevo `js/objects/Planet.js`: clases `Planet` y `PlanetLayer` (registrado en `index.html`).
- Dos capas en `GameScene`: lejana (4 planetas, lenta 12 px/s, 8-20px, alfa 0.25) y cercana (3 planetas, rápida 34 px/s, 22-45px, alfa 0.45).
- Cada planeta: terminador con sombra, anillo opcional y reciclaje al salir por la izquierda.

### 30. Alarma al aparecer el BOSS ✅
- `PlanetLayer.setDanger(on)` + `dangerPalette`: los planetas cambian a rojo tenebroso y el anillo se vuelve rojo.
- `GameScene.bossAlarm()` (evento `boss-spawned`): flash rojo parpadeante, texto "⚠ ALERTA ⚠" y borde rojo pulsante tipo sirena.
- Al morir el BOSS, `setPlanetDanger(false)` restaura los planetas.

### 31. Sistema de fases / waves ✅
- `GameScene` gana `wave`, `difficulty`, `inTransition` y `tunnel`.
- Al matar el BOSS: mensaje **"WAVE COMPLETED"** + "Ola N superada" → tras 1.4s desaparece → **túnel de velocidad de la luz** (`updateTunnel`: 14 anillos azules que se expanden + 72 estrías radiales, ~1.9s) → `beginNextWave()`.
- `beginNextWave()`: `wave++`, dificultad +0.25 (tope 2.5), `spawner.resetWave()` (el BOSS reaparece a los 60s), resetea `startTime`, reanuda el juego.
- Escalado por dificultad: `Enemy.js` multiplica `speedX` por `scene.difficulty`; `EnemySpawner.currentInterval()` divide el intervalo por `difficulty`.
- `EnemySpawner.resetWave()` nuevo: resetea `bossSpawned/bossActive/boss`.
- HUD: `UIScene` muestra "FASE N" arriba-centro (evento `wave-started`) con animación de entrada.

### 32. Fix: explosión y estrellas durante el túnel ✅
- Bug: la gran explosión del BOSS y las estrellas se congelaban durante la transición. Ahora las explosiones se animan **antes** del chequeo de `inTransition`, y el túnel actualiza también estrellas y planetas.

## Sesión actual (mecánica POWER UP)

### 33. Sistema de power ups ✅
- **Nuevo `PowerUp.js`**: `class PowerUp` crea una estrella de color (según tipo) que cae desde arriba con deriva y rotación; se pierde si sale por la parte inferior.
- **Nuevo `PowerUpSystem.js`**: `class PowerUpSystem` gestiona el grupo de estrellas, el inventario FIFO de `INVENTORY_SIZE: 3` casillas y la cadencia global de aparición.
- **4 tipos de power up** (`CFG.POWER_UPS`):
  - **BIG BOY** (`B`, amarillo): balas 3x más grandes (`BIG_BOY_SIZE_MULT`) durante 20s (`BIG_BOY_DURATION`). `Bullet` acepta `sizeFactor` y genera textura propia por tamaño; `doFire()` la aplica mientras esté activo.
  - **HEALING STATION** (`H`, verde): cura el 50% de la vida total (`HEAL_PERCENT`) sin superar 100.
  - **BIG BOOM** (`O`, naranja): explosión de pantalla completa + `damage(3)` (`BIG_BOOM_DAMAGE`) a todos los enemigos vivos.
  - **RIOT SHIELD** (`S`, azul): `setShield(+30)`; el escudo **absorbe el daño antes que la vida** y se muestra como barra azul superpuesta a la barra de vida.
- **Cadencia**: `POWER_UP_SPAWN_INTERVAL: 90000` ms **globales** (no se reinicia entre fases, `addEvent` con `loop`).
- **Recogida**: overlap bala ↔ estrella (`onBulletPowerUp`) → se destruyen bala y estrella y el power up se guarda automáticamente en el inventario.
- **Inventario**: FIFO de 3; al coger con las 3 casillas llenas se elimina el más antiguo (`shift()`) y se añade el nuevo. Emite `inventory-changed`.
- **Activación**: teclas **1/2/3** → `activateSlot(i)` → `use(i)` (devuelve el tipo y lo elimina) → `applyPowerUp()` aplica el efecto.
- **UI (`UIScene`)**: 3 huecos abajo-izquierda (rectángulo + número + nombre completo del power up en color, actualizados con `inventory-changed`); barra de escudo azul superpuesta a la barra de vida (ancho `188 * shield/30`).
- **Refactor daño**: `Enemy.damage(amount)` y `Boss.damage(amount)` generalizan `takeHit()` (que sigue siendo `damage(1)`); `GameScene.handleHit()` centraliza kill/puntos/explosión para balas y para BIG BOOM.
- **Atajo Ctrl+B** (`GameScene` + `PowerUpSystem.spawnRandom()`): invoca la aparición de un power up aleatorio; puede repetirse en la misma partida.
- **Inventario ajustado**: huecos desplazados a la derecha (`x = 70 + i*58`) y más grandes (50x50, separación 58px, textos/iconos mayores).
- **Nombres completos en los huecos**: en lugar de una sola letra, cada casilla muestra el nombre entero del power up (`BIG BOY`, `HEALING`, `BIG BOOM`, `SHIELD`) con `wordWrap` de 44px para no desbordar el cuadro.

### 34. Power ups nunca detrás del player ✅
`PowerUp.js`: el spawn en X pasa de `Between(40, WIDTH-40)` a `Between(PLAYER_X + 40, WIDTH - 40)`, garantizando que la estrella solo caiga a la derecha del jugador (nunca a su espalda).

### 35. Número de versión en pantalla ✅
- `CFG.VERSION: '0.2-beta'` añadido a `config.js` (constante centralizada).
- `BootScene` (menú): `v0.2-beta` abajo-izquierda, junto al crédito abajo-derecha.
- `UIScene` (juego): `v0.2-beta` abajo-izquierda.

## Sesión actual (planetas por imágenes + power ups con PNG)

### 36. Planetas con imágenes propias ✅
- `Planet.js` deja de dibujar círculos procedurales y usa los sprites `assets/Planeta_Fondo_N1.png` / `Planeta_Fondo_N2.png` / `Planeta_Fondo_N3.png` (cargados en `BootScene.preload()` como `planet1/planet2/planet3`), elegidos al azar por planeta (`Phaser.Math.RND.pick`).
- Se elimina la **anilla procedural** que en algunos casos era lo único visible (los propios PNG ya tienen su aspecto).
- `reset()` ahora hace aparecer los planetas **fuera de pantalla por la derecha** (`W+60` a `W+400`) en vez de desde el centro del mapa.
- El estado de peligro (BOSS) aplica un **tint rojo** (`0xff3a1a`) a la imagen. Fallback: si una textura no está lista se genera una procedural para que ningún planeta quede invisible.
- Tamaños y alpha ajustados en `GameScene` para que la textura se vea nítida (lejana: 22-36px, alpha 0.4; cercana: 44-64px, alpha 0.6) y el movimiento sea perceptible (20 y 42 px/s).

### 37. Power ups con PNG en el inventario ✅
- `config.js`: `BIG_BOY` y `BIG_BOOM` ganan el campo `img`.
- `BootScene.preload()` carga `assets/Big_Boy.png` (`powerup_bigboy_img`) y `assets/Big_Boom.png` (`powerup_bigboom_img`).
- `UIScene.setInventory()`: cada casilla tiene una imagen (46x46) que se muestra cuando el tipo tiene `img` definido (BIG BOY, BIG BOOM) en lugar del texto; el resto de power ups sigue usando texto.

## Sesión actual (TIENDA de armas)

### 38. Sistema de armas + TIENDA ✅
- **`CFG.WEAPONS`** en `config.js`: `BLASTER` (base, daño 1, cadencia 160ms, bala amarilla), `REVOLVER` (daño 2, cadencia 500ms, 60 pts, bala naranja grande), `UZI` (daño 1, cadencia 100ms, 200 pts, bala azul). Cada arma con `damage/cooldown/cost/bulletColor/bulletSize`.
- `Player.weapon` guarda el arma equipada (resetea a `DEFAULT_WEAPON` al iniciar partida).
- `Bullet` acepta `weapon` (color/tamaño propios) y guarda `damage` en el sprite; `GameScene.onBulletEnemy` usa ese daño en `handleHit` en vez del `1` fijo.
- `doFire()` y el cooldown de `update()` usan las stats del arma equipada (`getWeapon()`).
- `ScoreSystem.spend(amount)`: descuenta puntos si hay saldo (el HUD lo refleja en vivo).
- **`ShopScene.js`** (nueva, overlay a pantalla completa, registrada en `main.js`/`index.html`):
  - **Menú de victoria del BOSS** al derrotarlo (`GameScene.openShop()` pausa la partida y lo lanza, diferido con `delayedCall(0)` para salir del callback de físicas): **SHOP** / **CONTINUE** / **SURRENDER**.
    - CONTINUE → reanuda y `startWaveTransition()` (WAVE COMPLETED + túnel) con el arma comprada.
    - SURRENDER → registra el récord y vuelve a `BootScene`.
  - **Tienda**: columna de armas a la izquierda, descripción (`SHOOT`/`TIME PER SHOOT`/`COST`) + botón COMPRAR a la derecha, SALIR abajo-derecha (vuelve al menú), texto `ARMA EQUIPADA`, puntos disponibles y zona de avisos.
  - **Compra**: aviso de confirmación; si hay un arma comprada equipada (distinta de la base) añade "Se sustituirá tu arma actual". CONFIRMAR gasta puntos y equipa (una sola arma, sustitución automática). Sin saldo → "Puntos insuficientes".

## Sesión actual (responsive + PWA + táctil)

### 39. Responsive, PWA y controles táctiles ✅
- **Escala (`main.js`)**: `scale: { mode: Phaser.Scale.FIT, autoCenter: CENTER_BOTH }`. La resolución interna sigue siendo 800×600; el canvas se escala/letterboxea para caber en la ventana en cualquier orientación. El contenedor `#game` pasa a ocupar el 100% del viewport (el borde/sombra se mueven al `canvas`).
- **Overlays HTML reposicionados por JS**: `positionHtmlOverlays()` (eventos `scale resize` + `ready`) coloca el logo superior y el botón fullscreen siguiendo el canvas centrado (`ox/oy = (parentSize - displaySize)/2`).
- **CSS responsive**: `html/body height:100%`, `overflow:hidden`, `100dvh`; `touch-action:none`, sin tap-highlight ni selección; bordes reducidos en pantallas pequeñas; logo oculto en pantallas bajas (`max-height:430px`).
- **Botón fullscreen**: `#fullscreen-btn` (HTML, solo visible en táctil `@media (hover:none) and (pointer:coarse)`) → `requestFullscreen()/exitFullscreen()`.
- **Overlay de rotación**: `#rotate-device` mostrado solo en vertical + táctil (`@media (orientation:portrait) and (hover:none) and (pointer:coarse)`), con "GIRA TU DISPOSITIVO".
- **Táctil (InputHandler)**: disparo continuo manteniendo el dedo/ratón pulsado (`activePointer.isDown` + cooldown del arma → `tryFire()`); el apuntado por toque ya funcionaba (`pointermove` → `aimWithMouse`).
- **Táctil (BootScene)**: el inicio ya usaba `pointerdown`; la intro ahora avanza también tocando la pantalla (mismo `onKey` que ENTER, limpio al terminar). Hint actualizado a "Pulsa CLIC o TOCA para comenzar".
- **Táctil (UIScene)**: cada slot del inventario es `setInteractive()` y al pulsarlo llama a `GameScene.activateSlot(i)` (se mantienen las teclas 1/2/3). El Game Over se reinicia con ENTER **o** tocando la pantalla (texto actualizado).
- **PWA instalable**: `manifest.webmanifest` (standalone **sin bloqueo de orientación**, theme/background `#05070f`, iconos 192/512 + maskable, `id`/`start_url: "/index.html"` y `scope: "/"` explícitos) e iconos generados desde `assets/logo.png` (`assets/icons/icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`). Metadatos iOS/theme-color en `index.html`.
- **Compartir en redes**: `index.html` con Open Graph + Twitter Card (`og:title/description/url`, `og:image` absoluta `https://shootingstars.ideasypruebas2.es/assets/icons/og-image.png`, 1200×630) para que WhatsApp/redes muestren logo + descripción. Nuevo `robots.txt` en la raíz que permite a todos los crawlers (`facebookexternalhit`, `facebookbot`, etc.).
- **Service Worker `sw.js` (network-first)**: el contenido **siempre se busca en internet**; la caché runtime solo es respaldo offline (nunca estanca versiones). `install` hace `skipWaiting()` + calentamiento ligero de la caché (shell + CDN de Phaser); `activate` limpia cachés viejas y hace `clients.claim()`; el `fetch` es network-first con fallback a caché (incluye respuestas opacas del CDN).
- **Aviso "NUEVA VERSIÓN DESCARGADA" (`main.js`)**: al registrar el SW se escucha `updatefound` → cuando el SW nuevo llega a `installed` **y** la página ya estaba controlada, se muestra el banner `#update-banner` con botón **ACTUALIZAR** (recarga). Para publicar una versión: subir el código y **bumpear `VERSION` en `sw.js`** (el navegador detecta el SW nuevo y dispara el aviso).
- `CFG.VERSION` → `0.4-beta` (y `VERSION` en `sw.js` → `0.4.0`).

## Sesión actual (planeta protector, nuevos power ups y sonido)

### 40. Reset de dificultad al terminar partida ✅
- `BootScene.start()` ahora fuerza un reinicio limpio: `stop()` de `GameScene`/`UIScene` y reseteo explícito de `wave=1`, `difficulty=1`, `startTime`, `inTransition=false`, `gameOver=false` y `spawner.resetWave()` antes de lanzar la partida. Así la dificultad/fase se resetean correctamente venga de game over o de SURRENDER (que dejaba la escena pausada y arrastraba el estado).

### 41. Planeta de fondo protector ✅
- `assets/Back_Planet.png` (90×600, pegado al borde izquierdo, ocupa toda la altura) como planeta que protege al jugador (`back_planet_img`, `CFG.BACK_PLANET_SIZE: 90`).
- Se crea en `GameScene` **después** de estrellas y planetas parallax pero **antes** del jugador (misma profundidad, orden de creación), por lo que estrellas y planetas de fondo pasan **por detrás** de él y el jugador queda delante.
- Bug resuelto: un `setDepth(-1)` inicial lo ocultaba tras el `bg` (fondo de pantalla).

### 42. Power ups HEALING y SHIELD con sprite propio ✅
- `config.js`: `HEALING` gana `img: 'powerup_heal_img'` y `SHIELD` gana `img: 'powerup_shield_img'`.
- `BootScene.preload()` carga `assets/Heal.png` y `assets/Shield.png`.
- `PowerUp.js`: la estrella que cae usa la imagen propia (`setDisplaySize(CFG.POWER_UP_IMG_SIZE, ...)`, 40px) si el tipo tiene `img`; el inventario ya mostraba el PNG automáticamente.

### 43. Power up TIMESTOP ✅
- Nuevo tipo `TIMESTOP` (`Time_Stop.png`): al activarse congela a los enemigos durante `TIMESTOP_DURATION: 5000` ms, muestra una capa grisácea (`0x9aa7c8` alpha 0.28) y un contador `TIME STOP X.Xs` descendente.
- `GameScene.activateTimeStop()` pone la velocidad de los cuerpos a 0 (`body.setVelocity(0,0)`) y durante el time stop no se llama a `spawner.update/updateAll`, por lo que los enemigos quedan detenidos (las balas del jugador siguen).
- Bug resuelto: inicialmente solo se omitía `updateAll`, pero la velocidad persistente de la física seguía moviéndolos; hubo que ponerla a 0.

### 44. Power up GRANADE ✅
- Nuevo tipo `GRANADE` (`Granade.png`): al activarse disparas **10 granadas** en lugar de balas con **1s de espera** entre disparos.
- `Grenade.js` (nuevo): proyectil con **trayectoria parabólica tipo cañón** (gravedad acumulando en `vy`), rotación, alcance de **3/4 de pantalla** (`GRANADE_RANGE: 600`).
- Impacto directo: **10 de daño**; explosión de **1/8 de pantalla** (`GRANADE_EXPLOSION_RADIUS: 100`) que hace **5 de daño** en área (`GRANADE_EXPLOSION_DAMAGE`).
- Bug resuelto: las granadas se quedaban pegadas al jugador porque al añadir el sprite al grupo de física se perdía la velocidad del cuerpo; se sustituye por **integración manual** de la trayectoria sincronizando `body.position` para las colisiones.
- Fuego: cada pulsación dispara una sola granada e **ignora los clicks durante el segundo de espera** (no se ponen en cola); al terminar el power up se espera a soltar el botón antes de reanudar el disparo continuo (evita que el jugador dispare solo sin volver a pulsar).

### 45. Contador de granadas restantes ✅
- `UIScene`: texto `GRANADAS: N` (naranja) a la derecha del inventario de power ups, visible solo mientras queden granadas (se actualiza por polling en `update()`).

### 46. Música de fondo y del BOSS con fades ✅
- `BootScene.preload()` carga `musica.mp3` (`music`) y `musica-boss.mp3` (`boss_music`).
- `GameScene.create()` crea/reproduce la música normal del juego (solo en partida, no en el menú).
- Al aparecer el BOSS (`bossAlarm`): **fade cruzado** — la del juego baja a 0 y se pausa, la del boss sube de 0 a 0.5 (`fadeMusic()`, helper que tweenea `volume`).
- Al matar al BOSS: la del boss se apaga con fundido y se detiene; al salir de la tienda (`continueGame`) la del juego reanuda con fundido de entrada.
- Se detienen ambas en `endGame()` y `surrender()`.

### 47. Efectos de sonido procedurales ✅
- Nuevo `SoundFX.js` (Web Audio API, sin archivos): `explosion()` (ruido + paso bajo), `shot()` (blip descendente), `damage()` (tono grave + golpe).
- `GameScene`: disparo en `doFire()`, explosión al matar enemigos/BOSS y en granadas, daño al cruzar la línea (en `EnemySpawner.updateAll`). El AudioContext se reanuda en cada reproducción (autoplay).

### 48. Power ups cada 30s ✅
- `POWER_UP_SPAWN_INTERVAL` de 90000 → **30000** ms.

### 49. Victoria del BOSS ✅
- Al derrotar al BOSS: se espera `BOSS_EXPLOSION_DELAY: 550` ms a que termine la gran explosión, luego suena `victoria.mp3` una vez y aparece el mensaje **"VICTORY"** (dorado, animado).
- La tienda se abre al terminar el audio (duración calculada con `victory.totalDuration`, con mínimo 2s). Guard `shopOpened` para no abrirla dos veces.
- Bug resuelto: antes el sonido sonaba antes de la explosión y el mensaje no aparecía (el evento `complete` podía dispararse al instante si el audio no se reproducía y destruía el texto); ahora el mensaje y la apertura van ligados a la duración real del audio.

## Verificación
- 20 archivos JS sin errores de sintaxis (`node --check`) + `sw.js` y `manifest.webmanifest` validados.
- Prueba en navegador pendiente: abrir desde un **servidor HTTP local** (la PWA/el service worker requieren http/https, no `file://`). Probar: escalado móvil (landscape), apuntado/disparo por toque, power ups por toque, botón fullscreen, instalación como PWA, actualización (bumpear `VERSION` en `sw.js` → banner → ACTUALIZAR) y modo offline.

## Historial de incidencias
- **`hint is not defined` (arrranque):** el bloque del tween de `hint` y los listeners de inicio quedaron dentro de `updateRecord()`. Movidos de vuelta a `create()`.
- **Juego congelado al 2º clic:** cooldown de disparo mezclaba dos bases de tiempo (`time` absoluto frente a `this.time.now`). Unificado usando `this.time.now`; `lastFireTime` inicializado a `-COOLDOWN` para permitir el primer disparo inmediato.
- **Balas que no avanzan:** el cuerpo se creaba antes con textura `null` y se asignaba después (cuerpo sin dimensiones). Ahora la bala se crea con su textura y, además, re-aplica su velocidad cada frame (igual que los enemigos), que es el patrón que sí funcionaba.
- **Cleanup de balas:** iteración sobre el grupo cambia a snapshot (`getChildren().slice()`) para no mutar durante el bucle; se eliminan también balas que queden atrás del player.
- **Intro en bucle infinito:** `currentLine` nunca se incrementaba, por lo que `advance()` volvía siempre a la línea 0. Ahora se incrementa tanto al pulsar ENTER como al terminar la animación de escritura.
- **Intro sin teclado:** usar `this.input.enabled = false` desactivaba también el teclado e impedía continuar con ENTER. Se sustituye por des-registrar los listeners de inicio y usar `keyEnter.on('down')`.
- **Barra de vida no bajaba:** `Rectangle.setSize()`/asignar `.width` no redibujaba en Phaser. Se sustituye el relleno por un objeto `Graphics` redibujado cada frame (`fillRect(21, 39, 188*pct, 16)`) y se añade un número de vida visible.
- **Daño invisible por doble sistema:** la zona `playerZone` (overlap) destruía al enemigo antes de que cruzara la línea, así que el chequeo de cruce nunca se ejecutaba. Se elimina el `playerZone` y queda solo el cruce de línea como fuente de daño.
- **Juego congelado al golpear al BOSS:** el overlap separado balas-BOSS apuntaba a un sprite que se destruía durante el callback, rompiendo el motor de físicas. Se integra el BOSS en el grupo de enemigos para usar el mismo overlap (patrón que sí funcionaba).
- **2ª partida sin progreso reseteado:** `startTime=0` hacía que `elapsed = time.now` fuese enorme en la 2ª partida (dificultad/BOSS al instante). Se fija `startTime = this.time.now` en `create()`.
- **Partida congelada al reiniciar:** `this.gameOver=true` persistía en la instancia reutilizada de `GameScene`; `update()` salía antes de tiempo. Se resetea `gameOver=false` en `create()`.
- **Explosión gif que no salía:** `scene.add.dom(x, y, 'img', 'src="..."')` interpretaba el string como *style*, no como atributo; y `DOMElement` no tiene `setAttribute` (es `.node.setAttribute`). Finalmente se **revertió** a la explosión procedural original (Phaser 3 no anima GIFs nativos; se probó el gif `explosion.gif` con elemento DOM y se descartó).
- **Enemigos invisibles con imagen:** los enemigos colisionaban/daban daño pero no se veían. La textura `enemigo1.png` de **2048 px superaba el límite de textura de la GPU** (WebGL no la subía). Se generó `assets/enemigo1_small.png` (128 px) y se apuntó `CFG.ENEMY_IMG` a esta versión.
- **Texto `enemy_img` con fuente errónea:** evitar `tex.getSourceImage().width` (podía lanzar error si la textura no estaba lista); se usa `sprite.setDisplaySize(size, size)` para forzar el tamaño y `body.setSize(size, size, true)` para centrar el cuerpo.
- **Barra del BOSS en negro hasta el primer disparo:** `showBossBar()` solo mostraba el fondo y el relleno rojo dependía de `boss-hurt`. Ahora `showBossBar()` dibuja la barra completa llamando a `setBossHealth(CFG.BOSS_LIFE)`.
- **Imagen de último punto de vida que no salía:** `VARIANT_LIFE_MULT: 2.5` hacía que la vida nunca fuese exactamente 1 (2.5→1.5→0.5). Se fija a **3** para que la comprobación `life === 1` se cumpla.
- **`net::ERR_CACHE_MISS` al arrancar desde el icono (Android):** el `fetch` network-first del SW a la `start_url` fallaba y, con la caché sin la copia del shell, el `respondWith` rechazaba y la navegación moría (la app no arrancaba desde el icono aunque sí desde la URL). Fixes:
  - `manifest.webmanifest`: `id`/`start_url` explícitos (`/index.html`) y `scope: "/"` (antes `"."`/`"."`, resolución frágil y redirección de raíz).
  - `sw.js` (v0.3.1): el handler de fetch **nunca rechaza** — si la red falla sirve la copia en caché (URL exacta o shell `./index.html`), y si no hay nada devuelve una página mínima de "sin conexión" en vez de ERR_CACHE_MISS; `cache.put` protegido en try/catch; atajo `navigator.onLine` para ir directo a caché estando offline. Requiere desinstalar y reinstalar la app instalada para renovar la WebAPK (la `start_url` queda grabada al instalar).
- **Icono instalado en Android que no arranca (aunque el enlace sí):** se elimina `"orientation": "landscape"` del manifest (`sw.js` v0.3.2). El bloqueo de orientación en la WebAPK impide el arranque desde el launcher en algunos dispositivos (la actividad no llega a renderizar), mientras que abrir desde una URL sí funciona. La orientación ya la gestionan el overlay `#rotate-device` (portrait) y el Scale.FIT. Requiere desinstalar + borrar datos del sitio + reinstalar. **Resuelto.**
- **Facebook Sharing Debugger: "La URL ha devuelto un código de respuesta HTTP incorrecto":** el crawler de Facebook recibía un **403** en `/` (bloqueo por IP de la protección anti-bot/WAF del hosting, no por User-Agent: nuestras peticiones con `facebookexternalhit` daban 200) y, además, `robots.txt` devolvía **500** (no existía el archivo y el hosting lo enrutaba a un handler que fallaba). Fixes: nuevo `robots.txt` en la raíz que permite todos los crawlers; el 403 restante es del hosting (excepción para `facebookexternalhit`/`facebookbot` o desactivar el anti-bot en el panel del proveedor). **WhatsApp ya lee la metainformación.**

## Pendientes / ideas futuras (opcional)
- Menú de dificultad.
- Tabla de mejores puntuaciones (top scores).
- BOSS con fases o patrones de ataque.
- Más pistas musicales / ajuste de volumen en opciones.