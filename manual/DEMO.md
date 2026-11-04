# Guion de la sustentación · Manuales de Campus Navi

Duración estimada: 10 a 12 minutos. Orden: Inicio (con el video) → Manual del usuario (con audio) → Manual del administrador.
Si no hay internet o falla Vercel, ir directo al [plan B](#plan-b-sin-internet).

## Preparación (el día anterior)

- [ ] Con internet, en `manual/`: `npm install` y `npm run build`. El build descarga la fuente Inter y la deja
      dentro de `out/`; después ya no hace falta internet.
- [ ] Probar `npx serve out` y abrir <http://localhost:3000>. Revisar las tres páginas y que suene un audio.
- [ ] Copiar `out/` (incluye el video en `out/video/`) y la carpeta `public/audio/` a una memoria USB (respaldo si falla el portátil).
- [ ] Abrir la URL de Vercel en el navegador y dejarla en una pestaña.
- [ ] Revisar que el portátil tenga sonido y que los parlantes del salón funcionen. Llevar audífonos o un
      parlante pequeño de respaldo.
- [ ] Si se va a mostrar TalkBack en un celular: hacer la [lista de chequeo](#lista-de-chequeo-de-talkback)
      completa un día antes, con el mismo celular.
- [ ] Desactivar notificaciones del portátil y del celular durante la presentación.

## Guion

### 1. Inicio (`/`) · 3 a 4 minutos (con el video)

1. Abrir la página de inicio. Presentar Campus Navi con el lema «Accesibilidad y orientación para todos».
2. Señalar que el estilo es el mismo de la app: fondo azul noche, el orbe violeta y tarjetas con borde violeta.
3. En **«Conoce Campus Navi»**, reproducir el video (≈ 1 min 22 s). Subir el volumen antes: en dos tramos se oye
   el audio real de TalkBack y de la app. Al terminar, abrir «Leer la transcripción del video» para mostrar que
   también es accesible sin verlo ni oírlo. Si el tiempo es corto, mostrar solo hasta el tramo de TalkBack
   (0:38).
4. Bajar a **«Cómo funciona»**: los tres pasos de la app (decir «uno», dar una vuelta, escuchar dónde estás),
   cada uno con su captura real.
5. Bajar a **«Hecha para usarse sin ver»**: funciona con TalkBack, se controla con la voz, avisa con vibración y
   sonido mientras se escanea, y el sensor de orientación decide cuándo tomar cada foto.
6. Bajar a **«Manuales»**: mostrar las dos tarjetas y explicar para quién es cada uno.

Mensaje clave: el sitio tiene dos públicos distintos y cada manual está pensado para el suyo.

### 2. Manual para personas con discapacidad visual (`/manual-usuario/`) · 3 a 4 minutos

1. Entrar desde la tarjeta o desde el menú «Manual de usuario».
2. Mostrar **«Cómo usar este manual»**, que está antes de cualquier audio: explica que se puede leer con
   TalkBack deslizando a la derecha (siguiente bloque) y a la izquierda (bloque anterior), o escuchar los
   audios.
3. Explicar la estructura: un solo título principal y un encabezado por paso («Paso 1. Antes de empezar» …
   «Paso 7. Si algo falla»). Con TalkBack la persona salta de paso en paso con el control «Encabezados».
4. **Demostración de audio:**
   - Bajar al **Paso 4. Da una vuelta completa** y tocar «Escuchar paso 4…». Dejar sonar unos 10 segundos.
   - Señalar que el botón cambió a «Pausar…» y que su nombre dice cuánto dura el audio.
   - Sin pausar, tocar «Escuchar» en el **Paso 6. Escucha dónde estás**: el audio del paso 4 se detiene solo.
     Solo suena un audio a la vez.
   - Pausar. Mencionar que nunca arranca solo: la persona decide cuándo escuchar.
5. Volver arriba y mostrar el botón **«Escuchar el manual completo»**, justo debajo de «Cómo usar este manual»
   (algo más de 3 minutos). No reproducirlo entero.
6. Mostrar una captura y explicar que su texto alternativo describe la pantalla, para quien acompaña a la
   persona.
7. Contar cómo se hicieron los audios: con edge-tts y voz neuronal colombiana, generados desde el mismo texto
   de la página. Si el texto cambia y no se regeneran, las pruebas fallan.

Mensaje clave: la persona ciega puede leer el manual sola con TalkBack o escucharlo.

### 3. Manual del administrador y recolector (`/manual-administrador/`) · 3 minutos

1. Entrar desde el menú «Manual de administrador». Mostrar el índice lateral «Contenido».
2. **Iniciar sesión**: el enlace «Acceso administrador» de la pantalla de inicio y la pantalla de login.
3. **Panel de administración**: las tarjetas de funciones y el resumen rápido en tiempo real.
4. **Recolector de imágenes**: explicar el proceso y señalar el recuadro «Captura pendiente» (las capturas se
   agregan cuando estén listas).
5. **Lugares**: galería de imágenes del dataset, reasignar y eliminar. Mostrar el aviso rojo de acción
   irreversible antes de eliminar fotos o videos.
6. **Mapa y alertas**: el mapa con las alertas y el grafo real de caminos del campus EAFIT.

Mensaje clave: cada función principal del panel tiene su paso a paso con captura.

### Cierre · 30 segundos

- El sitio es estático: se publica en Vercel y también funciona sin internet desde `out/`.
- Pruebas automáticas: Vitest (estructura, nombres accesibles, axe) y Playwright en escritorio y celular
  (axe con contraste, teclado y reproducción de audio).

## Plan B sin internet

En orden de preferencia:

1. **Servidor local con Node** (lo normal si Vercel no carga):

   ```bash
   cd manual
   npx serve out          # http://localhost:3000
   ```

   `serve` ya está en `node_modules`, así que no descarga nada. Si `out/` no existe o está viejo, `npm run build`
   lo genera, pero el build necesita internet para la fuente Inter: por eso se prepara el día anterior.

2. **Servidor local con Python** (si falla Node):

   ```bash
   python -m http.server 3000 --directory out
   ```

3. **Mostrar el celular en la misma red** (para TalkBack sin internet): conectar el celular al punto de acceso del
   portátil, correr `npx serve out` y abrir en el celular la dirección «Network» que imprime `serve`
   (por ejemplo `http://192.168.137.1:3000`). Windows puede pedir permiso en el firewall la primera vez.

4. **Archivos sueltos** (si no hay forma de servir el sitio): abrir `out/index.html` directamente no sirve, porque
   los enlaces y estilos usan direcciones absolutas (empiezan por `/`). En ese caso:
   - Los audios se reproducen con cualquier reproductor desde `public/audio/` (o `out/audio/`):
     `antes.mp3`, `abrir.mp3`, `pedir.mp3`, `vuelta.mp3`, `esperar.mp3`, `resultado.mp3`, `problemas.mp3` y
     `completo.mp3`.
   - Las capturas están en `public/capturas/`.
   - El texto de los manuales está en `src/content/usuario.json` y `src/content/admin.ts`.

## Lista de chequeo de TalkBack

Hacerla en el celular Android que se va a usar, con Chrome, TalkBack activado y el sitio abierto (Vercel o red
local). Marcar cada punto en `/manual-usuario/` y repetir lo básico en `/` y `/manual-administrador/`.

**Idioma**

- [ ] TalkBack lee con voz en español y pronuncia bien las tildes y la «ñ» (la página declara `lang="es-CO"`).

**Enlace «Saltar al contenido»**

- [ ] Al cargar la página y deslizar a la derecha, lo primero que se anuncia es «Saltar al contenido, enlace».
- [ ] Al tocarlo dos veces, el foco pasa al contenido principal y no vuelve a leer el menú.

**Encabezados**

- [ ] Con el control de lectura «Encabezados» (deslizar arriba y luego abajo, en un solo gesto, hasta oír
      «Encabezados»; después deslizar abajo para el siguiente), el primer encabezado es el título del manual y
      es el único de nivel 1.
- [ ] Después vienen, como encabezados de nivel 2, «Cómo usar este manual» y cada paso: «Paso 1. Antes de
      empezar» hasta «Paso 7. Si algo falla».

**Lectura bloque por bloque**

- [ ] Deslizando solo a la derecha desde el título, el orden es: título, introducción, «Cómo usar este manual»
      con sus párrafos, botón «Escuchar el manual completo» y luego los pasos. La explicación llega antes que
      cualquier audio.
- [ ] Deslizar a la izquierda vuelve al bloque anterior.
- [ ] No hay encabezados de otros niveles dentro de los pasos.
- [ ] En el manual del administrador, cada sección del índice lleva a su encabezado.

**Botones de audio**

- [ ] Cada botón se anuncia con su nombre completo, por ejemplo «Escuchar paso 4: Da una vuelta completa,
      40 segundos, botón».
- [ ] Al tocarlo dos veces empieza el audio, y el botón pasa a anunciarse como «Pausar…».
- [ ] La voz de TalkBack y el audio no se pisan de forma molesta (si pasa, bajar el volumen de TalkBack).
- [ ] Al pausar o al terminar el audio, TalkBack anuncia el cambio de estado.
- [ ] Al iniciar otro audio, el anterior se detiene.
- [ ] Ningún audio suena solo al abrir la página.
- [ ] El botón «Escuchar el manual completo» funciona igual.

**Imágenes**

- [ ] Cada captura se lee con su descripción (por ejemplo, la pantalla de resultado con «Estás cerca de
      Bloque 35»).
- [ ] Los íconos decorativos no se anuncian.

**Tamaño y foco**

- [ ] Los botones y enlaces se tocan con facilidad: ninguno es menor que la yema del dedo (mínimo 48 × 48 px).
- [ ] Con zoom del navegador al 200 % el texto no se corta y no hay que desplazarse de lado.
- [ ] Con un teclado conectado (o en el portátil con Tab), el foco se ve en todo momento.

**Menú**

- [ ] El menú principal se anuncia con su nombre, «Principal», y el enlace de la página abierta se anuncia como
      «página actual».
