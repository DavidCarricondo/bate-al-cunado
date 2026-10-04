# Bate al cuñado

Juego educativo: el cuñado suelta un bulo en la barra del bar y tú eliges la réplica que lo desmonta. Cada respuesta revela la falacia que usa, la explicación con datos y la fuente científica.

## Estructura

```
index.html                  Juego completo (HTML + CSS + JS, sin dependencias)
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
