import type { CapturaId } from "./capturas";

export type Bloque =
  | { tipo: "parrafo"; texto: string }
  | { tipo: "subtitulo"; id: string; texto: string }
  | { tipo: "pasos"; items: string[] }
  | { tipo: "lista"; items: { termino: string; texto: string; enlace?: string }[] }
  | { tipo: "figura"; capturas: CapturaId[]; pie: string; ancha?: boolean }
  | { tipo: "aviso"; variante: "info" | "peligro"; titulo: string; texto: string };

export type Seccion = {
  id: string;
  titulo: string;
  resumen: string;
  bloques: Bloque[];
};

export const manualAdmin: { titulo: string; intro: string; secciones: Seccion[] } = {
  titulo: "Manual del administrador y recolector",
  intro:
    "El administrador construye y mantiene el dataset de imágenes que permite a Campus Navi decirle a cada persona dónde está. Este manual recorre, paso a paso, cada función del panel.",
  secciones: [
    {
      id: "antes",
      titulo: "Antes de empezar",
      resumen: "Qué necesitas para entrar al panel.",
      bloques: [
        {
          tipo: "lista",
          items: [
            { termino: "Cuenta de administrador", texto: "Un usuario con rol ADMIN creado en el sistema." },
            {
              termino: "Celular Android",
              texto: "Con Campus Navi instalada, cámara y sensores de movimiento. El emulador no sirve para recolectar.",
            },
            { termino: "Conexión a internet", texto: "El panel lee y guarda todo en el servidor." },
          ],
        },
        {
          tipo: "aviso",
          variante: "info",
          titulo: "Una sola app para todos",
          texto:
            "Las personas usuarias y el administrador usan la misma app. El panel solo aparece después de iniciar sesión con una cuenta de administrador.",
        },
      ],
    },
    {
      id: "iniciar-sesion",
      titulo: "Iniciar sesión",
      resumen: "Entrar al panel desde la pantalla de inicio.",
      bloques: [
        {
          tipo: "pasos",
          items: [
            "Abre Campus Navi. En la pantalla de inicio, abajo a la derecha, toca «Acceso administrador».",
            "Escribe tu correo o usuario y tu contraseña. El ícono del ojo muestra u oculta la contraseña.",
            "Toca «Iniciar sesión». Si los datos son correctos, se abre el panel de administración.",
            "Si entraste por error, «Volver al inicio» te regresa a la pantalla de las personas usuarias.",
          ],
        },
        {
          tipo: "figura",
          capturas: ["inicioUsuario", "adminLogin"],
          pie: "A la izquierda, la pantalla de inicio con el enlace «Acceso administrador». A la derecha, el formulario de inicio de sesión.",
        },
        {
          tipo: "aviso",
          variante: "info",
          titulo: "Revisa el estado de la conexión",
          texto:
            "Abajo a la izquierda de la pantalla de inicio hay un indicador. Si muestra un punto rojo con «Sin conexión, Backend no disponible», la app no llega al servidor y no podrás iniciar sesión ni ver datos.",
        },
      ],
    },
    {
      id: "panel",
      titulo: "Panel de administración",
      resumen: "Las funciones principales y el resumen rápido.",
      bloques: [
        {
          tipo: "parrafo",
          texto:
            "Al entrar ves un saludo con tu rol («Administrador del sistema») y, arriba a la derecha, el ícono de ajustes. Cada tarjeta abre una función:",
        },
        {
          tipo: "lista",
          items: [
            {
              termino: "Recolector de imágenes",
              texto: "Captura las fotos del entorno que forman el dataset.",
              enlace: "#recolector",
            },
            { termino: "Lugares", texto: "Registra los lugares del campus que la app reconoce.", enlace: "#lugares" },
            {
              termino: "Mapa y alertas",
              texto: "Muestra los recorridos sobre el mapa y las alertas de obstáculos.",
              enlace: "#mapa",
            },
            { termino: "Imágenes", texto: "Revisa y administra el dataset de imágenes.", enlace: "#imagenes" },
            {
              termino: "Videos",
              texto: "Gestiona los recorridos de recolección. Cada video agrupa las fotos de un recorrido.",
              enlace: "#videos",
            },
          ],
        },
        {
          tipo: "subtitulo",
          id: "resumen-rapido",
          texto: "Resumen rápido",
        },
        {
          tipo: "parrafo",
          texto:
            "Debajo de las tarjetas, el resumen se actualiza en tiempo real con cinco cifras: fotos en el dataset, lugares registrados, alertas activas, fotos del último video recolectado y fotos pendientes de subir. Si «Fotos pendientes de subir» no baja a cero, revisa la conexión del celular.",
        },
        {
          tipo: "figura",
          capturas: ["adminPanel"],
          pie: "Panel de administración con las tarjetas de funciones y el resumen rápido.",
        },
      ],
    },
    {
      id: "recolector",
      titulo: "Recolector de imágenes",
      resumen: "Recorrer el campus para construir el dataset.",
      bloques: [
        {
          tipo: "parrafo",
          texto:
            "El dataset es la base de todo: cada foto de referencia se guarda con su coordenada y su orientación. Cuando una persona da su vuelta de 360°, la app compara sus fotos con estas para saber dónde está. Por eso cada zona del campus necesita fotos recolectadas.",
        },
        {
          tipo: "pasos",
          items: [
            "En el panel, toca «Recolector de imágenes».",
            "Ubícate en el mapa: marca el punto exacto donde estás parado. Esa es la coordenada de partida del recorrido.",
            "Camina por el campus con el celular vertical frente a ti. Cada recorrido es un «video»: no se graba video, solo agrupa las fotos de ese recorrido.",
            "Mientras caminas, la app estima tu posición con tus pasos, la velocidad, la aceleración y la orientación del celular, y toma fotos automáticamente con su coordenada.",
            "Termina el recorrido. Las fotos se suben al servidor, que calcula sus embeddings y las agrega al dataset.",
          ],
        },
        {
          tipo: "subtitulo",
          id: "recolector-partida",
          texto: "1. Fijar la ubicación de partida",
        },
        {
          tipo: "parrafo",
          texto:
            "Antes de recolectar, la pantalla «Fijar ubicación de partida» te pide colocarte en un punto reconocible y marcar tu posición exacta. Toca el mapa para fijar la latitud y la longitud, o usa «Centrar» para ubicarte. Indica hacia dónde miras en la brújula de «Orientación». Cuando esté listo, toca «Confirmar y comenzar».",
        },
        {
          tipo: "figura",
          capturas: ["adminRecolectorPartida"],
          pie: "Pantalla para fijar la ubicación de partida sobre el mapa del campus.",
        },
        {
          tipo: "subtitulo",
          id: "recolector-config",
          texto: "2. Configurar el recorrido",
        },
        {
          tipo: "parrafo",
          texto:
            "Más abajo, en la misma pantalla, puedes afinar el recorrido antes de empezar:",
        },
        {
          tipo: "lista",
          items: [
            { termino: "Usar brújula del teléfono", texto: "Toma la orientación del sensor del celular." },
            {
              termino: "Usar mi última posición",
              texto: "Continúa desde el final del video anterior, útil para encadenar recorridos.",
            },
            {
              termino: "Calibrar mi paso",
              texto: "Por defecto usa 0,72 m. Calibra para que la posición estimada sea más precisa.",
              enlace: "#calibrar",
            },
            { termino: "Nombre del video", texto: "Opcional. Ponle un nombre que luego reconozcas, por ejemplo «video_7»." },
          ],
        },
        {
          tipo: "figura",
          capturas: ["adminRecolectorConfig"],
          pie: "Orientación, última posición, calibración del paso y nombre del video.",
        },
        {
          tipo: "subtitulo",
          id: "calibrar",
          texto: "Calibrar la longitud del paso",
        },
        {
          tipo: "parrafo",
          texto:
            "La app mide tu avance contando pasos, así que necesita saber cuánto mides de paso. En «Calibrar longitud de paso», toca el mapa donde empieza un tramo recto (punto A) y donde termina (punto B); mejor un tramo de 30 metros o más, mínimo 10. Camínalo y la app calcula tu paso a partir del tramo, los pasos y el tiempo. «Limpiar puntos» reinicia la medición.",
        },
        {
          tipo: "figura",
          capturas: ["adminCalibrarPaso"],
          pie: "Calibración del paso marcando un tramo recto sobre el mapa.",
        },
        {
          tipo: "subtitulo",
          id: "recolectar",
          texto: "3. Recorrer y subir",
        },
        {
          tipo: "pasos",
          items: [
            "Toca «Confirmar y comenzar». Camina por el campus con el celular vertical frente a ti.",
            "La app estima tu posición con los pasos, la velocidad, la aceleración y la orientación, y toma fotos automáticamente con su coordenada.",
            "Al terminar, las fotos se suben al servidor, que calcula sus embeddings y las agrega al dataset.",
          ],
        },
        {
          tipo: "aviso",
          variante: "info",
          titulo: "Para que la posición sea precisa",
          texto:
            "Marca bien el punto de partida, calibra el paso y camina a ritmo constante. La posición se calcula a partir de ese punto, así que un error al inicio se arrastra a todas las fotos del recorrido.",
        },
      ],
    },
    {
      id: "lugares",
      titulo: "Lugares",
      resumen: "Registrar los lugares del campus que la app puede reconocer.",
      bloques: [
        {
          tipo: "parrafo",
          texto:
            "Un lugar es un destino con nombre y coordenadas (por ejemplo «Biblioteca» o «Bloque 38»). A cada lugar se le asignan fotos del dataset; así, cuando la app reconoce esas fotos, puede decir el nombre del lugar.",
        },
        {
          tipo: "parrafo",
          texto:
            "La pantalla «Lugares» muestra cuántos hay registrados, con las pestañas Lista y Mapa. Cada lugar indica su tipo (entrada, bloque, cafetería…), cuántas fotos tiene y sus coordenadas. Puedes buscar un lugar, filtrar por tipo y, con «Nuevo lugar», registrar uno nuevo. El menú de tres puntos de cada lugar permite editarlo o eliminarlo.",
        },
        {
          tipo: "figura",
          capturas: ["adminLugaresLista"],
          pie: "Lista de lugares registrados, con su tipo, número de fotos y coordenadas.",
        },
      ],
    },
    {
      id: "imagenes",
      titulo: "Imágenes del dataset",
      resumen: "Revisar las fotos del dataset y asignarlas a lugares.",
      bloques: [
        {
          tipo: "subtitulo",
          id: "galeria",
          texto: "La galería del dataset",
        },
        {
          tipo: "parrafo",
          texto:
            "La galería muestra cuántas imágenes hay y en qué página estás. Cada foto indica su nombre, el lugar al que pertenece («Sin lugar» si aún no tiene) y su estado; «Procesada» significa que ya tiene su embedding y se usa para ubicar.",
        },
        {
          tipo: "lista",
          items: [
            { termino: "Buscar imágenes", texto: "Encuentra una foto por su nombre." },
            {
              termino: "Filtros",
              texto: "Lugar, Video, Estado y Calidad. Combínalos para ver, por ejemplo, solo las fotos de un recorrido.",
            },
            {
              termino: "Cuadrícula o Mapa",
              texto: "Cambia entre la lista de fotos y su posición sobre el mapa del campus.",
            },
          ],
        },
        {
          tipo: "figura",
          capturas: ["adminLugares"],
          pie: "Galería de imágenes del dataset, en vista de cuadrícula.",
        },
        {
          tipo: "subtitulo",
          id: "reasignar",
          texto: "Asignar fotos a un lugar",
        },
        {
          tipo: "pasos",
          items: [
            "Toca el círculo de la esquina de cada foto para seleccionarla. Abajo verás cuántas llevas seleccionadas.",
            "Toca «Reasignar».",
            "Escribe el nombre del lugar y toca «Reasignar». «Cancelar» cierra el cuadro sin cambios.",
          ],
        },
        {
          tipo: "figura",
          capturas: ["adminReasignar"],
          pie: "Cuatro fotos seleccionadas y el cuadro «Reasignar a lugar».",
        },
        {
          tipo: "subtitulo",
          id: "eliminar-imagenes",
          texto: "Eliminar fotos",
        },
        {
          tipo: "parrafo",
          texto:
            "Selecciona las fotos borrosas, repetidas o mal ubicadas y toca «Eliminar». Los botones Reasignar y Eliminar solo se activan cuando hay al menos una foto seleccionada.",
        },
        {
          tipo: "aviso",
          variante: "peligro",
          titulo: "Revisa la selección antes de eliminar",
          texto:
            "Las fotos eliminadas salen del dataset y dejan de usarse para ubicar a las personas. Si borras todas las fotos de una zona, la app no podrá reconocerla hasta que la vuelvas a recolectar.",
        },
      ],
    },
    {
      id: "videos",
      titulo: "Videos",
      resumen: "Los recorridos de recolección y las fotos de cada uno.",
      bloques: [
        {
          tipo: "parrafo",
          texto:
            "Cada recorrido de recolección es un «video»: no guarda un video, solo agrupa las fotos de ese recorrido. La pantalla «Videos de recolección» los lista con su fecha, número de fotos, metros, duración y estado («Procesado» cuando ya tienen sus embeddings). Puedes buscarlos por nombre y ordenarlos por recientes, nombre o número de fotos.",
        },
        {
          tipo: "figura",
          capturas: ["adminVideosLista"],
          pie: "Lista de videos de recolección, cada uno con su fecha, fotos, metros y estado.",
        },
        {
          tipo: "subtitulo",
          id: "recorrido",
          texto: "Ver un recorrido en el mapa",
        },
        {
          tipo: "parrafo",
          texto:
            "Al abrir un video ves arriba su nombre, la fecha, cuántas fotos tiene y cuántos metros recorriste. En el mapa, cada foto es un punto numerado en el orden en que se tomó.",
        },
        {
          tipo: "pasos",
          items: [
            "Toca un punto del mapa o una miniatura de abajo. Se abre la tarjeta «Foto N de M» con sus coordenadas y su orientación (por ejemplo, 180° S).",
            "«Ver detalle» abre la foto completa. «Eliminar foto» la quita del dataset.",
            "Marca «Mostrar otros videos» para ver al mismo tiempo los demás recorridos y detectar zonas sin fotos.",
            "Usa los botones + y − para acercar o alejar el mapa.",
            "«Renombrar» cambia el nombre del video; «Eliminar video» lo borra por completo.",
          ],
        },
        {
          tipo: "figura",
          capturas: ["adminMapa"],
          pie: "Recorrido en el mapa: las fotos numeradas en el orden en que se tomaron, con Renombrar y Eliminar video.",
        },
        {
          tipo: "aviso",
          variante: "peligro",
          titulo: "Eliminar video borra todas sus fotos",
          texto:
            "«Eliminar video» borra el recorrido junto con todas sus fotos y sus embeddings del dataset. Úsalo solo cuando todo el recorrido salió mal, por ejemplo si el punto de partida quedó mal marcado.",
        },
      ],
    },
    {
      id: "mapa",
      titulo: "Mapa y alertas",
      resumen: "El editor del mapa, las alertas de obstáculos y la red de caminos.",
      bloques: [
        {
          tipo: "subtitulo",
          id: "editor",
          texto: "El editor de mapa y alertas",
        },
        {
          tipo: "parrafo",
          texto:
            "El editor muestra el campus con varias capas que puedes mostrar u ocultar: alertas, lugares, cobertura de fotos y rutas. Arriba hay filtros por tipo, prioridad y estado, y el indicador «Todo sincronizado» avisa cuando todo está guardado. «Mi posición» te centra en el mapa y «Ver lista» abre la lista de alertas. Cuando hagas cambios, toca «Guardar / Sincronizar» para subirlos.",
        },
        {
          tipo: "figura",
          capturas: ["adminEditorMapa"],
          pie: "Editor de mapa y alertas, con las capas, los filtros y los botones «Nueva alerta» y «Guardar / Sincronizar».",
        },
        {
          tipo: "subtitulo",
          id: "alertas",
          texto: "Alertas de obstáculos",
        },
        {
          tipo: "parrafo",
          texto:
            "Una alerta es un punto en el mapa con un mensaje corto escrito para la persona con discapacidad visual, por ejemplo: «Ten cuidado, hay bancas cerca». Sirven para marcar lagos, bancas, escaleras u obras. Cada alerta tiene un tipo (agua, mobiliario, escalones, obras…), una prioridad y un radio en metros. Puedes crearlas con «Nueva alerta» desde el editor o mientras recolectas fotos.",
        },
        {
          tipo: "parrafo",
          texto:
            "La pantalla «Alertas» lista las que ya existen, con su mensaje, tipo, prioridad, radio y estado (activa o no), y permite buscarlas y filtrarlas. El menú de tres puntos de cada alerta permite editarla o eliminarla. El número de alertas activas aparece en el resumen rápido del panel.",
        },
        {
          tipo: "figura",
          capturas: ["adminAlertasLista"],
          pie: "Lista de alertas, cada una con su mensaje, prioridad, radio y estado.",
        },
        {
          tipo: "aviso",
          variante: "info",
          titulo: "Cómo escribir una buena alerta",
          texto:
            "Escribe frases cortas y concretas que se entiendan al oírlas: qué hay y qué hacer. Por ejemplo, «Escaleras hacia abajo, sujétate de la baranda derecha» en lugar de «Precaución».",
        },
        {
          tipo: "subtitulo",
          id: "red-caminos",
          texto: "La red de caminos del campus",
        },
        {
          tipo: "parrafo",
          texto:
            "La app representa el campus como una red de caminos peatonales: cada punto rojo es un cruce y cada línea azul, un tramo por el que se puede caminar. Esta es la red real de la zona entre la Biblioteca Luis Echavarría Villegas, la Torre técnica y el Bloque 38 de EAFIT. Al recolectar, recorre estos tramos para que todas las zonas tengan fotos.",
        },
        {
          tipo: "figura",
          capturas: ["grafoEafit"],
          pie: "Red de caminos de la zona de la Biblioteca, la Torre técnica y el Bloque 38 (Universidad EAFIT).",
          ancha: true,
        },
      ],
    },
  ],
};
