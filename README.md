![Shooting Stars](assets/logo.png)

# 🌟 SHOOTING STARS

Juego **shooter espacial pixel** con movimiento horizontal, desarrollado por Manuel, de **12 años**, con la ayuda de su padre.

> Un proyecto de **vibecoding** hecho en familia: Manuel diseña el arte (con **Procreate**), plantea las ideas y genera las instrucciones para el agente de IA, su padre asesora sobre el desarrollo y posibles bugs, y juntos usan **DeepSeek** como motor de IA y **opencode** como interfaz para escribir el código.

---

## 🌐 Juega online e instálalo en cualquier dispositivo

▶️ **Juega a la versión actual (v0.8.1-prerelease):** **[https://shootingstars.ideasypruebas2.es](https://shootingstars.ideasypruebas2.es)**

Desde esa URL puedes **jugar directamente** en el navegador (móvil en horizontal o en el ordenador) e **instalar el juego como PWA**:

- 📱 **Android (Chrome):** abre la URL → menú ⋮ (o el aviso "Instalar app") → **"Instalar aplicación"**. Se añadirá el icono a la pantalla de inicio.
- 🍎 **iPhone/iPad (Safari):** abre la URL → botón **Compartir** → **"Añadir a pantalla de inicio"**.
- 💻 **Windows / Mac / Linux (Chrome o Edge):** abre la URL → icono de instalación de la barra de direcciones → **"Instalar"**.

El juego está pensado para jugarse **en horizontal** (si el móvil está en vertical, te pedirá girar el dispositivo). Instalado como PWA funciona **offline** gracias a su service worker y **se actualiza solo**: cuando hay una versión nueva, la app avisa con **"NUEVA VERSIÓN DESCARGADA"**.

En la pantalla, arriba a la izquierda, aparece el botón **"⬇ INSTALAR APP"** (solo cuando el navegador puede instalar el juego) para lanzar el instalador de la PWA sin entrar en los menús. Además, en el móvil el juego entra en **pantalla completa automáticamente al primer toque**, sin necesidad de pulsar ningún botón.

---

## 🎮 Qué es

**Shooting Stars** es un juego de naves espaciales en el que controlas a un jugador fijo situado a la izquierda de la pantalla, con un arma que rota en semicírculo (−90° a +90°). Debes disparar a los enemigos que se acercan desde la derecha antes de que crucen tu línea defensiva.

### 🚀 Reglas del juego

- **El jugador** está fijo a la izquierda, en el centro vertical. Su arma rota en un semicírculo de **−90° a +90°** para apuntar a los enemigos.
- **Controles:**
  - 🖱️ **Ratón** para apuntar.
  - **Clic** o **Espacio** para disparar.
  - **W/S** o **Flechas ↑/↓** para rotar el arma.
  - **1 / 2 / 3** para activar los power ups guardados en el inventario.
- **Enemigos:** se mueven verticalmente y se acercan lentamente hacia ti. Algunos **rebotan** en los límites y otros **oscilan**.
  - **Enemigo básico:** 1 punto.
  - **Enemigo variante naranja** (más resistente): 3 puntos.
  - **Enemigo ENEMY3** (a partir de la fase 2): tiene 2 vidas y dispara **meteoritos aimbot** que vuelan en línea recta hacia ti cada 4 segundos. Cada meteorito tiene 1 de vida. En dificultad alta se limita su número (máx. 3 simultáneos).
  - **BOSS:** 10 puntos, aparece a los 60 segundos (o en cada fase). Si llega a tu línea defensiva, **te mata al instante**.
  - **BOSS FINAL** (oleada 5): aparece desde la derecha (slide-in) ocupando todo el alto, con **750 de vida**. Es **inmune a tus balas**; solo le dañan las **espadas devueltas** (50 por impacto). Lanza **espadas fantasma** (azul-verdosas, se destruyen con 1 bala), **espadas rojas de 2 vidas**, una **espada normal cada 10s** que al tocarla **vuelve contra el boss**, y un **ataque especial de 10 fantasmas** horizontales cada 20s. Las espadas rebotan en las paredes y salen en cualquier ángulo; al cruzar tu línea te quitan vida (20 normales / 10 fantasmas). Al aparecer, una explosión elimina a todos los enemigos y (salvo en EXTREMO) **te confisca las armas**: solo puedes usar el BLASTER.
- **Daño:** si un enemigo cruza tu línea defensiva, pierdes **−10 % de vida**. Si es el **BOSS**, mueres directamente.
- **Vida:** empiezas con **100**. La partida acaba cuando llegas a **0**.
- **Power ups** (coge las estrellas que caen con tus balas y guárdalas en el inventario de 3 casillas):
  - 💛 **BIG BOY** — tus balas se hacen 3× más grandes durante 20s.
  - 💚 **HEALING** — cura el 50% de tu vida.
  - 🧡 **BIG BOOM** — explosión de pantalla completa que daña a todos los enemigos (y a las espadas del boss final).
  - 💙 **SHIELD** — escudo azul que absorbe el daño antes que tu vida.
  - ⏸ **TIMESTOP** — congela a los enemigos 5s: pantalla grisácea + cuenta atrás. También congela las espadas del boss final.
  - 💣 **GRANADE** — disparas 10 granadas parabólicas (1s entre disparos) que explotan en 1/8 de pantalla. Las granadas también **recogen los power ups** que tocan, tanto al impactar como con su explosión, y **dañan a las espadas** del boss final.
- **Tienda de armas:** al derrotar al BOSS puedes entrar en la **TIENDA**. Con tus puntos compras armas nuevas (REVOLVER, SHOTGUN, UZI) que se quedan guardadas durante la partida; después puedes **EQUIPAR** en cualquier momento cualquiera de las que ya tengas. El arma equipada se dibuja en el cañón del jugador.
- **Cargador del REVOLVER:** dispara **6 balas** seguidas y luego necesita **1.5s de recarga**; un contador junto al inventario muestra las balas restantes.
- **Fases:** al derrotar al BOSS superas una **fase** (VICTORY + WAVE COMPLETED), atraviesas un túnel de velocidad de la luz y la dificultad aumenta. El juego tiene **5 oleadas**; en la **quinta** aparece el **BOSS FINAL**. Al derrotarlo ves **"VENGANZA CUMPLIDA"** y puedes **CONTINUAR** (reinicia en una dificultad superior manteniendo la puntuación) o **TERMINAR** (vuelve al menú).
- **Dificultad:** al comenzar cada partida eliges el nivel (**FÁCIL**, **MEDIO**, **DIFÍCIL** o **EXTREMO**). A más dificultad, los enemigos son **más rápidos** y **aparecen más** (además de la progresión por fases), y el boss final lanza **más espadas y más rápidas**. El nivel se muestra bajo el indicador de fase. En **EXTREMO** el boss final **no te confisca las armas**.
- **Récords:** tu mejor puntuación se guarda automáticamente en tu navegador.
- **Sonido:** música de fondo en la partida, música propia al aparecer el BOSS (y otra para el boss final) y efectos de sonido de disparo, explosión y daño.

---

## 🎨 Galería de arte

Todo el arte está dibujado por Manuel con **Procreate** e integrado en el juego mediante imágenes propias en `assets/`.

### Power ups
- [💛 **BIG BOY**](assets/Big_Boy.png) — hace tus balas 3× más grandes.
- [🧡 **BIG BOOM**](assets/Big_Boom.png) — explosión de pantalla completa.
- [💚 **HEALING**](assets/Heal.png) — cura el 50% de tu vida.
- [💙 **SHIELD**](assets/Shield.png) — escudo que absorbe el daño.
- [⏸ **TIMESTOP**](assets/Time_Stop.png) — congela a los enemigos.
- [💣 **GRANADE**](assets/Granade.png) — dispara granadas parabólicas.

### Armas
- [🚀 **BLASTER**](assets/logo.png) — el arma inicial, siempre disponible (usa la nave del jugador).
- [🔫 **REVOLVER**](assets/Revolver.png) — daño 3, cadencia 0.3s, 6 balas con recarga de 1.5s, 60 pts.
- [🔫 **SHOTGUN**](assets/Shotgun.png) — 3 balas en abanico (±10°), daño 2, cadencia 0.8s, 200 pts.
- [🔫 **UZI**](assets/Uzi.png) — ráfaga rápida de bajo daño, 500 pts.

### Fondo
- [🪐 **Planeta protector**](assets/Back_Planet.png) — planeta de fondo pegado al borde izquierdo que protege al jugador.

### Enemigos
- [👾 **BOSS**](assets/boss.png) — el jefe de cada fase.
- [👾 **BOSS 2**](assets/boss2.png) — variante del jefe.
- [👾 **BOSS 3**](assets/boss3.png) — variante del jefe.
- [✨ **Enemigo básico**](assets/estrella.png) — la estrella que gira y se acerca.
- [🌠 **Enemigo variante**](assets/estrella2.png) — la estrella naranja, más resistente.
- [💥 **ENEMY3**](assets/enemigo3.png) — enemigo de fase 2+ que dispara meteoritos aimbot. Su proyectil es [☄️ `enemigo3-disparo.png`](assets/enemigo3-disparo.png).

---

## 🛠️ Tecnología

| Tecnología | Uso |
|------------|-----|
| **Phaser 3** | Motor de juego (HTML plano + CDN) |
| **HTML / CSS / JS** | Estructura y módulos |
| **DeepSeek** | Motor de IA para el vibecoding |
| **opencode** | Interfaz de desarrollo |
| **Procreate** | Arte y diseños originales |

Todo el arte del juego (logo, enemigos, BOSS, planetas, power ups) es dibujado por Manuel con **Procreate** y se integra mediante imágenes propias en `assets/`.

---

## 📂 Estructura del proyecto

```
SHOOTING STARS/
├── index.html               # CDN Phaser 3 + carga de módulos + metas PWA/Open Graph
├── manifest.webmanifest     # PWA: instalable (standalone)
├── sw.js                    # Service Worker (network-first + modo offline)
├── robots.txt               # permite a los crawlers (Facebook/WhatsApp)
├── css/style.css
├── assets/                  # Arte (logo, enemigos, BOSS, planetas, power ups)
│   ├── audio/               # Música de fondo, del BOSS y de victoria
│   └── icons/               # iconos PWA + imagen para compartir en redes
└── js/
    ├── config.js            # constantes ajustables
    ├── main.js              # instancia Phaser.Game + RecordSystem
    ├── scenes/
    │   ├── BootScene.js     # pantalla de inicio (logo, estrellas, intro) + récord
    │   ├── GameScene.js     # gameplay, spawns, colisiones
    │   ├── UIScene.js       # HUD + game over + récords
    │   └── ShopScene.js     # tienda de armas
    ├── objects/
    │   ├── Player.js        # player fijo + arma giratoria
    │   ├── Bullet.js
    │   ├── Enemy.js         # enemigo + variantes
    │   ├── Enemy3.js        # enemigo de fase 2+ que dispara meteoritos aimbot
    │   ├── Boss.js          # jefe (10 pts, 60s)
    │   ├── FinalBoss.js     # BOSS FINAL de la oleada 5 (estático + espadas/fantasmas)
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

---

## 🚀 Cómo jugar

1. Entra en **[https://shootingstars.ideasypruebas2.es](https://shootingstars.ideasypruebas2.es)** (o abre **`index.html`** en local para desarrollo).
2. Pulsa **ENTER** (o haz clic / toca la pantalla) para ver la **intro narrativa**: 4 imágenes con la historia del juego, texto con efecto de máquina de escribir y sonido por letra. Usa **SIGUIENTE / COMENZAR** para avanzar.
3. Elige la **dificultad** (FÁCIL, MEDIO, DIFÍCIL o EXTREMO) para empezar la partida.
4. Durante la partida el cursor se convierte en una **mira de disparo** (roja en el ordenador; en el móvil aparece una mira en pantalla que sigue tu dedo).
5. ¡Sobrevive a las 5 oleadas, derrota al BOSS FINAL y consigue el récord más alto! Al terminar, elige **CONTINUAR** (dificultad superior) o **TERMINAR**.
6. En el móvil, el juego pasa a **pantalla completa al primer toque** automáticamente (o usa el botón **⛶** para alternarla). Si no está instalado, arriba a la izquierda tienes el botón **⬇ INSTALAR APP** para instalarlo como PWA.

> **Nota:** la primera carga requiere conexión a internet para descargar Phaser 3 desde el CDN. Una vez instalada como PWA, el juego queda disponible **sin conexión**.

---

## 📋 Progreso del proyecto

Todo el detalle de fases implementadas, ajustes de gameplay, la historia de bugs resueltos y las ideas futuras están documentados en el fichero **[`PLAN.md`](PLAN.md)**.

En él se registran las **78 fases completadas**, desde el scaffold inicial hasta el sistema de armas y la tienda, la versión responsive/PWA, el planeta protector, los nuevos power ups (TIMESTOP y GRANADE), el sonido (música y efectos), el **BOSS FINAL** de la oleada 5, así como la estructura de carpetas, la verificación de sintaxis y el **historial de incidencias** resuelto durante el desarrollo.

Entre las últimas mejoras: el nuevo enemigo **ENEMY3** (fase 2+) que dispara meteoritos aimbot, el **BOSS que mata al instante** al llegar a tu línea, y el **cargador del REVOLVER** (6 balas con recarga de 1.5s y contador). También: la nueva arma **SHOTGUN**, el **sistema de armas compradas** con botón **EQUIPAR** y ticks verdes en la lista, la **tienda rediseñada**, la **victoria para todos los BOSS**, y el **temporizador de aparición** de enemigos y BOSS ligado al inicio real de la partida.

En la versión v0.5.2-beta se corrigieron además tres cosas: ya **no aparecen más enemigos** durante la pantalla de victoria del BOSS, los enemigos **vuelven a aparecer desde el principio de cada fase nueva**, y las **granadas recogen los power ups** tanto al chocar directamente como con su explosión.

La versión **v0.8-prerelease** es la versión actual del juego.

En esta versión se ha añadido el **BOSS FINAL** de la **oleada 5**: aparece desde la derecha ocupando todo el alto, con **750 de vida** e **inmune a tus balas**; lanza **espadas fantasma** (azul-verdosas), **espadas rojas de 2 vidas**, una **espada normal** que al tocarla **vuelve contra el boss** (50 de daño) y un **ataque especial de 10 fantasmas** horizontales cada 20s. Las espadas salen en cualquier ángulo y Y, rebotan en las paredes y su ritmo y velocidad **aumentan con la dificultad**. Los **power ups** (BIG BOOM, GRANADE y TIMESTOP) ahora también afectan a las espadas. Al derrotarlo aparece **"VENGANZA CUMPLIDA"** con la opción **CONTINUAR** (dificultad superior manteniendo la puntuación) o **TERMINAR**. En dificultad **EXTREMA** el boss final no te confisca las armas. Además: el **nivel de dificultad** se muestra bajo el indicador de fase, la pantalla de Game Over y la de victoria **no se cierran con un click genérico** (botón VOLVER / CONTINUAR o ENTER), y se limita el número de **ENEMY3** en dificultad alta.

La versión **v0.8.1-prerelease** corrige un bug de dificultad del **BOSS FINAL**: antes su ritmo y la velocidad de sus espadas escalaban con la dificultad **acumulada por oleadas** (+0.25 por fase), por lo que en niveles bajos (p. ej. FÁCIL) llegaba a la oleada 5 con una dificultad casi de EXTREMO. Ahora el boss final escala con la **dificultad base seleccionada** al empezar la partida, de forma acorde al nivel elegido.

---

## 🙌 Hecho por

**MANUEL (12 años)** y su padre, con el diseño en **Procreate** y el desarrollo guiado por **DeepSeek** + **opencode**.

![Logo Maniac](assets/Logo-Maniac.png)

> **¡Que no te desintegren las estrellas!** 🌠

---

## 🖼️ Capturas

<p align="center">
  <img src="assets/capturas/1.png" alt="Captura 1" width="48%">
  <img src="assets/capturas/2.png" alt="Captura 2" width="48%">
  <img src="assets/capturas/3.png" alt="Captura 3" width="48%">
  <img src="assets/capturas/4.png" alt="Captura 4" width="48%">
  <img src="assets/capturas/5.png" alt="Captura 5" width="48%">
  <img src="assets/capturas/6.png" alt="Captura 6" width="48%">
  <img src="assets/capturas/7.png" alt="Captura 7" width="48%">
</p>
