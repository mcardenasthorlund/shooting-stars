const CFG = Object.freeze({
  VERSION: '0.6-beta',
  WIDTH: 800,
  HEIGHT: 600,

  // ---- Player ----
  BACK_PLANET_SIZE: 90,          // tamaño (px) del planeta de fondo que protege al jugador
  PLAYER_X: 110,
  PLAYER_Y: 300,
  GUN_MIN_ANGLE: -90,
  GUN_MAX_ANGLE: 90,
  PLAYER_INTRO_SPEED: 120,      // velocidad de rotación con teclado (grad/s)
  FIRE_COOLDOWN: 160,           // ms entre disparos
  BULLET_LIFE: 1600,

  // ---- Vida ----
  MAX_HEALTH: 100,
  CONTACT_DAMAGE_PERCENT: 10,   // -10% de la vida total por impacto

  // ---- Disparo ----
  BULLET_SPEED: 520,
  BULLET_COLOR: 0xffd93b,
  BULLET_SIZE: 4,

  // ---- Enemigos ----
  ENEMY_IMG: 'assets/estrella.png',  // textura de los enemigos básicos (50x50px, evita límite GPU)
  ENEMY_ROT_SPEED: 2.5,         // rad/s de giro constante del enemigo
  ENEMY_SPEED: 45,              // px/s hacia el player
  ENEMY_SIZE: 40,
  ENEMY_COLOR: 0x39ff6e,
  VARIANT_COLOR: 0xff8b39,      // variantes más fuertes
  VARIANT_IMG: 'assets/estrella2.png',  // textura de los enemigos naranja
  VARIANT_SIZE: 48,             // tamaño de los enemigos naranja (mayor que el básico)
  LOW_IMG: 'assets/estrella2-2.png',  // textura cuando al enemigo le queda 1 punto de vida
  ENEMY_EXPLOSION_RADIUS: 16,   // radio de la explosión al matar un enemigo
  SHIELD_EXPLOSION_RADIUS: 30,  // radio de la explosión al impactar contra el escudo
  VARIANT_START_TIME: 15000,    // ms antes de aparecer variantes
  VARIANT_LIFE_MULT: 3,
  VARIANT_SPEED_MULT: 1.15,

  // ---- ENEMIGO 3 (desde fase 2) ----
  ENEMY3_IMG: 'assets/enemigo3.png',          // textura del enemigo3
  ENEMY3_SHOT_IMG: 'assets/enemigo3-disparo.png', // meteorito que dispara
  ENEMY3_SIZE: 60,
  ENEMY3_LIFE: 2,
  ENEMY3_SPEED: 40,                           // px/s hacia el player
  ENEMY3_SHOOT_INTERVAL: 4000,                // dispara cada 4s
  ENEMY3_START_WAVE: 2,                       // aparece desde la fase 2
  POINTS_PER_ENEMY3: 1,
  METEOR_SIZE: 36,
  METEOR_SPEED: 280,                          // px/s del meteorito
  METEOR_LIFE: 1,                             // 1 de vida

  // ---- BOSS ----
  BOSS_TIME: 60000,             // ms tras el cual aparece el BOSS
  BOSS_LIFE: 25,                // disparos que aguanta
  BOSS_SIZE: 78,
  BOSS_IMG: 'assets/boss.png',  // textura del BOSS (75x75px)
  BOSS_IMG2: 'assets/boss2.png',  // textura del BOSS en fase 2 (intercambio)
  BOSS_IMG3: 'assets/boss3.png',  // textura del BOSS en fase 2 (intercambio)
  BOSS_PHASE_THRESHOLD: 0.5,    // % de vida a partir del cual se activa el intercambio de imágenes
  BOSS_SWAP_INTERVAL: 500,      // ms entre intercambios de imagen
  BOSS_COLOR: 0xff3963,
  BOSS_POINTS: 10,
  BOSS_HEAL_AMOUNT: 30,         // vida que regenera el BOSS al morir (sin superar MAX_HEALTH)
  BOSS_EXPLOSION_RADIUS: 1100,  // radio de la explosión al matar el BOSS (cubre toda la pantalla)
  BOSS_EXPLOSION_DELAY: 550,    // ms de espera tras la explosión del BOSS antes de la victoria

  // ---- Puntos ----
  POINTS_PER_ENEMY: 1,
  POINTS_PER_VARIANT: 3,
  POINTS_PER_BOSS: 10,

  // ---- Spawn ----
  BASE_SPAWN_INTERVAL: 1600,    // ms en t=0
  MIN_SPAWN_INTERVAL: 350,      // ms mínimo al pasar el tiempo
  SPAWN_RAMP_TIME: 90000,       // ms para pasar del base al mínimo

  // ---- POWER UP ----
  POWER_UP_SPAWN_INTERVAL: 30000, // 30s entre apariciones de power ups
  INVENTORY_SIZE: 3,              // huecos del inventario
  POWER_UP_FALL_SPEED: 90,        // px/s de caída de la estrella de power up
  POWER_UP_IMG_SIZE: 40,          // tamaño de las imágenes de power ups (Heal/Shield/BigBoy/BigBoom)
  BIG_BOY_SIZE_MULT: 3,           // multiplicador de tamaño de bala
  BIG_BOY_DURATION: 20000,        // duración en ms del BIG BOY
  HEAL_PERCENT: 50,               // % de vida total que cura HEALING STATION
  BIG_BOOM_DAMAGE: 3,             // puntos de vida que resta BIG BOOM a cada enemigo
  RIOT_SHIELD_AMOUNT: 30,         // vida extra del escudo RIOT SHIELD
  TIMESTOP_DURATION: 5000,        // duración en ms del TIME STOP (congela a los enemigos)

  // ---- GRANADE ----
  GRANADE_SHOTS: 10,              // granadas que disparas al activar el power up
  GRANADE_COOLDOWN: 1000,         // ms entre granadas
  GRANADE_SPEED: 560,             // velocidad inicial de la granada (px/s)
  GRANADE_GRAVITY: 420,           // gravedad aplicada a la granada (trayectoria de cañón)
  GRANADE_RANGE: 600,             // alcance máximo: 3/4 de la pantalla (0.75 * 800)
  GRANADE_DIRECT_DAMAGE: 10,      // daño de impacto directo
  GRANADE_EXPLOSION_DAMAGE: 5,    // daño de explosión a los enemigos cercanos
  GRANADE_EXPLOSION_RADIUS: 100,  // radio de explosión: 1/8 de la pantalla (800/8)

  // ---- Tipos de power up ----
  POWER_UPS: Object.freeze({
    BIG_BOY: { label: 'BIG BOY', color: 0xffd93b, icon: 'B', img: 'powerup_bigboy_img' },
    HEALING: { label: 'HEALING', color: 0x39ff6e, icon: 'H', img: 'powerup_heal_img' },
    BIG_BOOM: { label: 'BIG BOOM', color: 0xff8b39, icon: 'O', img: 'powerup_bigboom_img' },
    SHIELD: { label: 'SHIELD', color: 0x4dd4ff, icon: 'S', img: 'powerup_shield_img' },
    TIMESTOP: { label: 'TIMESTOP', color: 0x9aa7c8, icon: 'T', img: 'powerup_timestop_img' },
    GRANADE: { label: 'GRANADE', color: 0x8a5a2a, icon: 'G', img: 'powerup_granade_img' },
  }),

  // ---- Armas (TIENDA) ----
  DEFAULT_WEAPON: 'BLASTER',
  WEAPONS: Object.freeze({
    BLASTER: {
      label: 'BLASTER',
      damage: 1,
      cooldown: 160,
      cost: 0,
      desc: 'Arma inicial equilibrada',
      bulletColor: 0xffd93b,
      bulletSize: 4,
      img: 'player_img',
    },
    REVOLVER: {
      label: 'REVOLVER',
      damage: 3,
      cooldown: 300,
      cost: 60,
      desc: 'Golpea duro pero es lenta',
      bulletColor: 0xff8b39,
      bulletSize: 7,
      magSize: 6,          // cargador de 6 balas
      reloadTime: 1500,    // 1.5s de recarga al agotar el cargador
      img: 'weapon_revolver_img',
    },
UZI: {
      label: 'UZI',
      damage: 1,
      cooldown: 100,
      cost: 500,
      desc: 'Ráfaga rapidísima de bajo daño',
      bulletColor: 0x4dd4ff,
      bulletSize: 3,
      img: 'weapon_uzi_img',
    },
    SHOTGUN: {
      label: 'SHOTGUN',
      damage: 2,
      cooldown: 800,
      cost: 200,
      desc: 'Dispara 3 balas en abanico (30°)',
      bulletColor: 0xffb43c,
      bulletSize: 5,
      spread: true,
      pellets: 3,
      spreadAngle: 10,
      img: 'weapon_shotgun_img',
    },
  }),
});