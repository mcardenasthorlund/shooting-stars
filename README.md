![Shooting Stars](assets/logo.png)

# 🌟 SHOOTING STARS

Juego **shooter espacial pixel** con movimiento horizontal, desarrollado por Manuel, de **12 años**, con la ayuda de su padre.

> Un proyecto de **vibecoding** hecho en familia: Manuel diseña el arte (con **Procreate**), plantea las ideas y genera las instrucciones para el agente de IA, su padre asesora sobre el desarrollo y posibles bugs, y juntos usan **DeepSeek** como motor de IA y **opencode** como interfaz para escribir el código.

---

## 🌐 Juega online e instálalo en cualquier dispositivo

▶️ **Juega a la versión actual:** **[https://shootingstars.ideasypruebas2.es](https://shootingstars.ideasypruebas2.es)**

Desde esa URL puedes **jugar directamente** en el navegador (móvil en horizontal o en el ordenador) e **instalar el juego como PWA**:

- 📱 **Android (Chrome):** abre la URL → menú ⋮ (o el aviso "Instalar app") → **"Instalar aplicación"**. Se añadirá el icono a la pantalla de inicio.
- 🍎 **iPhone/iPad (Safari):** abre la URL → botón **Compartir** → **"Añadir a pantalla de inicio"**.
- 💻 **Windows / Mac / Linux (Chrome o Edge):** abre la URL → icono de instalación de la barra de direcciones → **"Instalar"**.

El juego está pensado para jugarse **en horizontal** (si el móvil está en vertical, te pedirá girar el dispositivo). Instalado como PWA funciona **offline** gracias a su service worker y **se actualiza solo**: cuando hay una versión nueva, la app avisa con **"NUEVA VERSIÓN DESCARGADA"**.

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
  - **BOSS:** 10 puntos, aparece a los 60 segundos (o en cada fase).
- **Daño:** si un enemigo cruza tu línea defensiva, pierdes **−10 % de vida**.
- **Vida:** empiezas con **100**. La partida acaba cuando llegas a **0**.
- **Power ups** (coge las estrellas que caen con tus balas y guárdalas en el inventario de 3 casillas):
  - 💛 **BIG BOY** — tus balas se hacen 3× más grandes durante 20s.
  - 💚 **HEALING STATION** — cura el 50% de tu vida.
  - 🧡 **BIG BOOM** — explosión de pantalla completa que daña a todos los enemigos.
  - 💙 **RIOT SHIELD** — escudo azul que absorbe el daño antes que tu vida.
- **Tienda de armas:** al derrotar al BOSS puedes entrar en la **TIENDA** y comprar nuevas armas con tus puntos (BLASTER, REVOLVER, UZI).
- **Fases:** al derrotar al BOSS superas una **fase** (WAVE COMPLETED), atraviesas un túnel de velocidad de la luz y la dificultad aumenta.
- **Récords:** tu mejor puntuación se guarda automáticamente en tu navegador.

---

## 🎨 Galería de arte

Todo el arte está dibujado por Manuel con **Procreate** e integrado en el juego mediante imágenes propias en `assets/`.

### Power ups
- [💛 **BIG BOY**](assets/Big_Boy.png) — hace tus balas 3× más grandes.
- [🧡 **BIG BOOM**](assets/Big_Boom.png) — explosión de pantalla completa.

### Enemigos
- [👾 **BOSS**](assets/boss.png) — el jefe de cada fase.
- [👾 **BOSS 2**](assets/boss2.png) — variante del jefe.
- [👾 **BOSS 3**](assets/boss3.png) — variante del jefe.
- [✨ **Enemigo básico**](assets/estrella.png) — la estrella que gira y se acerca.
- [🌠 **Enemigo variante**](assets/estrella2.png) — la estrella naranja, más resistente.

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
    │   ├── Boss.js          # jefe (10 pts, 60s)
    │   ├── Explosion.js     # explosión al matar enemigos/BOSS
    │   ├── Star.js          # estrellas fugaces del fondo
    │   ├── Planet.js        # capas parallax de planetas
    │   └── PowerUp.js       # estrella de power up que cae desde arriba
    └── systems/
        ├── InputHandler.js  # ratón (apuntar/disparar) + teclado
        ├── EnemySpawner.js  # oleadas crecientes + boss
        ├── ScoreSystem.js   # puntos por kill
        ├── RecordSystem.js  # mejor récord en localStorage
        └── PowerUpSystem.js # spawn + inventario de power ups
```

---

## 🚀 Cómo jugar

1. Entra en **[https://shootingstars.ideasypruebas2.es](https://shootingstars.ideasypruebas2.es)** (o abre **`index.html`** en local para desarrollo).
2. Pulsa **ENTER** (o haz clic / toca la pantalla) para pasar la intro animada.
3. ¡Sobrevive a las oleadas, derrota al BOSS y consigue el récord más alto!
4. En el móvil, usa el botón **⛶** para jugar a pantalla completa (o instala la app como PWA, ver sección anterior).

> **Nota:** la primera carga requiere conexión a internet para descargar Phaser 3 desde el CDN. Una vez instalada como PWA, el juego queda disponible **sin conexión**.

---

## 📋 Progreso del proyecto

Todo el detalle de fases implementadas, ajustes de gameplay, la historia de bugs resueltos y las ideas futuras están documentados en el fichero **[`PLAN.md`](PLAN.md)**.

En él se registran las **39 fases completadas**, desde el scaffold inicial hasta el sistema de armas y la tienda y la versión responsive/PWA, así como la estructura de carpetas, la verificación de sintaxis y el **historial de incidencias** resuelto durante el desarrollo.

---

## 🙌 Hecho por

**MANUEL (12 años)** y su padre, con el diseño en **Procreate** y el desarrollo guiado por **DeepSeek** + **opencode**.

> **¡Que no te desintegren las estrellas!** 🌠

---

## 🖼️ Capturas

![Captura de Shooting Stars](assets/captura.png)
