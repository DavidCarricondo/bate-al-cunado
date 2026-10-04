# Bate al cuñado

Juego educativo: el cuñado suelta un bulo en la barra del bar y tú eliges la réplica que lo desmonta. Cada respuesta revela la falacia que usa, la explicación con datos y la fuente científica.

## Estructura

```
index.html                  Juego completo (HTML + CSS + JS, sin dependencias en runtime)
data/niveles.json           Lista de niveles del menú
data/cambio-climatico.json  Banco de preguntas del nivel 2
schema/nivel.schema.json    Esquema JSON para validar los ficheros de nivel
images/                     Fondo del menú (cunao-barra-menu.webp), imágenes del cuñado por nivel y fondos provisionales
```

## Ejecutar en local

El juego carga los JSON con `fetch`, así que no funciona abriendo `index.html` directamente (`file://`). Lanza un servidor estático en la raíz del repo:

```bash
python3 -m http.server 8000
# o
npx serve .
```

y abre http://localhost:8000.

## Móvil

Cada merge a `main` lanza [.github/workflows/mobile.yml](.github/workflows/mobile.yml), que:

1. **Publica el juego en GitHub Pages** (https://davidcarricondo.github.io/bate-al-cunado/). Es una PWA: en el móvil se abre en el navegador y se instala con *Añadir a pantalla de inicio* (en iPhone, desde Safari → Compartir). Funciona sin conexión.
2. **Compila un APK de Android** con [Capacitor](https://capacitorjs.com) y lo adjunta a una nueva [Release](https://github.com/DavidCarricondo/bate-al-cunado/releases/latest) (`v1.0.<n>`). Se descarga desde el móvil y se instala directamente.

En las pull requests solo se comprueba que el APK compila (queda como artefacto del workflow).

### Configuración inicial (una vez)

- **Pages:** *Settings → Pages → Build and deployment → Source: GitHub Actions*.
- **Firma del APK (recomendado):** sin firma propia el workflow genera un APK de depuración con una clave distinta en cada build, y para actualizar hay que desinstalar el anterior. Para que las actualizaciones se instalen encima, crea una clave y guárdala en *Settings → Secrets and variables → Actions*:

  ```bash
  keytool -genkeypair -v -keystore release.jks -alias bate -keyalg RSA -keysize 2048 -validity 10000
  base64 -w0 release.jks   # -> ANDROID_KEYSTORE_BASE64
  ```

  Secretos: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` (`bate`) y `ANDROID_KEY_PASSWORD`. Guarda `release.jks` fuera del repo: si se pierde, no se podrán publicar actualizaciones con la misma firma.

### Ficheros

```
manifest.webmanifest   Manifiesto de la PWA (nombre, iconos, colores)
sw.js                  Service worker (modo offline). Si añades niveles o imágenes, añádelos a PRECACHE
icons/                 Iconos de la PWA
assets/                Fuentes de iconos y pantalla de carga para Android (@capacitor/assets)
capacitor.config.json  Configuración de la app Android
scripts/build-web.mjs  Copia el juego a www/ (lo que se publica y se empaqueta)
```

Compilar el APK en local (Node 22+, JDK 21 y Android SDK):

```bash
npm ci && npm run build && npx cap add android && npx cap sync android
cd android && ./gradlew assembleDebug
```

## Añadir un nivel

1. Crea `data/<id-del-nivel>.json` siguiendo `schema/nivel.schema.json`.
2. En `data/niveles.json`, pon `"disponible": true` y `"fichero": "data/<id-del-nivel>.json"` en ese nivel.
   Cada nivel de `niveles.json` lleva también `resumen` (una frase que se muestra al elegirlo) y `fondo` (la imagen de fondo de la pantalla de selección; los niveles sin arte usan `images/placeholder-<id>.webp`).
3. (Opcional) Añade el bloque `cunao` al JSON del nivel con tres imágenes: `normal` (por defecto), `acierto` (cuando el jugador acierta: el cuñado pierde) y `fallo` (cuando falla: el cuñado gana). Si no hay bloque `cunao`, se usa el dibujo SVG. Usa imágenes 5:3 en WebP de ~1000 px de ancho (unos 120 KB) para que carguen rápido en el móvil.
4. (Opcional) Añade `finales` para cambiar los textos de la pantalla final (`sin_paciencia`, `fuera_de_combate`, `empate`, `gana_cunao`, cada uno con `titulo`, `texto` y `frase`). Por defecto son textos de bar. Ejemplo pensado para el nivel de vacunas, ambientado en la cena de Nochebuena:

   ```json
   "finales": {
     "sin_paciencia": { "titulo": "Te mandan a fregar los platos", "texto": "Te has quedado sin paciencia antes del postre. Revisa sus trucos y vuelve a por la revancha.", "frase": "Ya lo decía yo. Venga, que esos platos no se friegan solos." },
     "fuera_de_combate": { "titulo": "Cuñado fuera de combate", "texto": "Se ha ido al salón a ver el discurso sin decir ni mu. Nochebuena salvada.", "frase": "...¿Alguien quiere más polvorones?" },
     "empate": { "titulo": "Empate técnico", "texto": "Le has cerrado varias bocas, pero aún le quedan argumentos para la cena de Nochevieja.", "frase": "Bueno, cada uno tiene su opinión, ¿no?" },
     "gana_cunao": { "titulo": "El cuñado sigue en su salsa", "texto": "Esta vez ganó él. Lee los trucos que usó y vuelve a intentarlo.", "frase": "Si es que en esta familia el único que lee soy yo." }
   }
   ```

Validación opcional:

```bash
npm i -D ajv-cli ajv-formats
npx ajv validate --spec=draft2020 -c ajv-formats -s schema/nivel.schema.json -d data/cambio-climatico.json
```

## Reglas de contenido

- Exactamente 4 opciones por pregunta y una sola correcta.
- La correcta es una réplica corta, del mismo tono y longitud que las incorrectas. Los datos van en `explicacion`.
- Toda opción incorrecta lleva `por_que`, que se muestra si el jugador la elige.
- Cada pregunta cita una fuente verificable, preferiblemente revisada por pares (DOI).

## Parámetros de juego

En `index.html`: `ROUNDS` (rondas por partida, 10), `CUPS` (fallos permitidos, 3), `HIT` (ego que pierde el cuñado por acierto, 10) y `HEAL` (ego que recupera por fallo, 5).
