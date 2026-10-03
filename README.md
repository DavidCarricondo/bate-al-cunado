# Bate al cuñado

Juego educativo: el cuñado suelta un bulo en la cena de Nochebuena y tú eliges la réplica que lo desmonta. Cada respuesta revela la falacia que usa, la explicación con datos y la fuente científica.

## Estructura

```
index.html                  Juego completo (HTML + CSS + JS, sin dependencias)
data/niveles.json           Lista de niveles del menú
data/cambio-climatico.json  Banco de preguntas del nivel 2
schema/nivel.schema.json    Esquema JSON para validar los ficheros de nivel
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
