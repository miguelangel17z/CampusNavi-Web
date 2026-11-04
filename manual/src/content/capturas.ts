/**
 * Registro de capturas. Los originales están en `Proyecto_4U_principal/media_manual/`
 * (ver el mapeo en `.kiro/specs/campus-navi-manual/design.md`).
 * El texto alternativo describe lo que se ve, para quien usa lector de pantalla o acompaña a la persona.
 */
export type Captura = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

const telefono = { width: 624, height: 1600 } as const;

export const capturas = {
  inicioUsuario: {
    src: "/capturas/inicio-usuario.jpeg",
    ...telefono,
    alt: "Pantalla de inicio de Campus Navi. Arriba se lee «Te escucho…» junto a un ícono de ondas. En el centro hay un botón grande, redondo y violeta: el orbe. Debajo, el aviso «Activa el lector de pantalla». Abajo a la izquierda, un punto rojo con el estado de la conexión y, a la derecha, el enlace «Acceso administrador».",
  },
  escaneoInicio: {
    src: "/capturas/escaneo-inicio.jpeg",
    ...telefono,
    alt: "Pantalla «Ubicarme, captura de entorno». Arriba, la vista de la cámara muestra un sendero del campus. En el centro, un círculo con cinco puntos, uno por foto, y el texto «Foto 1 de 5». Debajo, la instrucción «Gira lentamente hacia la derecha», los avisos «Más despacio» y «Mantén el celular vertical», y la confirmación «Tu teléfono está en posición correcta».",
  },
  escaneoFinal: {
    src: "/capturas/escaneo-final.jpeg",
    ...telefono,
    alt: "La misma pantalla de escaneo casi al terminar. La cámara apunta a una pared de ladrillo y el círculo muestra cuatro fotos marcadas con un visto y el texto «Foto 5 de 5».",
  },
  resultado: {
    src: "/capturas/resultado.jpeg",
    ...telefono,
    alt: "Pantalla de resultado. Dice «Tu ubicación: Estás cerca de Bloque 35. A unos 17 metros» y, en verde, «Confianza media». Debajo hay varios botones, entre ellos «Repetir en voz alta», «Volver a ubicarme» y «Volver al inicio».",
  },
  adminLogin: {
    src: "/capturas/admin-login.jpeg",
    ...telefono,
    alt: "Pantalla de inicio de sesión con el logo de Campus Navi y el lema «Accesibilidad y orientación para todos». Tiene los campos «Correo o usuario» y «Contraseña», este último con un ícono de ojo para mostrarla, el botón «Iniciar sesión» y, abajo, el botón «Volver al inicio».",
  },
  adminPanel: {
    src: "/capturas/admin-panel.jpeg",
    ...telefono,
    alt: "Panel de administración. Arriba dice «Hola, Administrador. Administrador del sistema» y hay un ícono de ajustes. Debajo hay seis tarjetas: Recolector de imágenes, Lugares, Mapa y alertas, Imágenes, Videos y Estadísticas. Al final, el «Resumen rápido» en tiempo real: 2.842 fotos en el dataset, 48 lugares registrados, 3 alertas activas, 12 en el último video recolectado y 27 fotos pendientes de subir.",
  },
  adminLugares: {
    src: "/capturas/admin-lugares.jpeg",
    ...telefono,
    alt: "Galería «Imágenes del dataset» con 6 imágenes y la etiqueta «Página 1 de 1». Tiene un buscador, los filtros Lugar, Video, Estado y Calidad, y las vistas Cuadrícula y Mapa. Cada foto muestra su nombre, por ejemplo 0001.png, el lugar asignado («Sin lugar») y el estado «Procesada». Abajo se lee «0 seleccionadas» y los botones Reasignar y Eliminar están desactivados.",
  },
  adminReasignar: {
    src: "/capturas/admin-reasignar.jpeg",
    ...telefono,
    alt: "La galería con cuatro fotos seleccionadas, marcadas con un visto, y abierto el cuadro «Reasignar a lugar» con el campo «Nombre del lugar» y los botones Cancelar y Reasignar. Abajo se lee «4 seleccionadas» y los botones Reasignar y Eliminar ya están activos.",
  },
  adminMapa: {
    src: "/capturas/admin-mapa.jpeg",
    ...telefono,
    alt: "Detalle del recorrido «video1», del 09/10/2026, con 6 fotos y 36 metros. Sobre el mapa del campus, entre el Bloque 37 y el Bloque 36 - Cafeterías, hay seis puntos numerados unidos por una línea. Arriba está la casilla «Mostrar otros videos». Abajo, la tarjeta «Foto 1 de 6» con sus coordenadas, la orientación «180° S» y los botones «Ver detalle» y «Eliminar foto»; luego las miniaturas de las seis fotos y los botones «Renombrar» y «Eliminar video».",
  },
  grafoEafit: {
    src: "/capturas/grafo-eafit.jpeg",
    width: 985,
    height: 773,
    alt: "Mapa de una zona del campus EAFIT con la red de caminos peatonales dibujada encima: puntos rojos en los cruces y líneas azules que los unen. La red rodea el Bloque 38, la Torre técnica y la Biblioteca Luis Echavarría Villegas, y pasa junto al Café Con.verso y los bloques 33 a 36.",
  },
} satisfies Record<string, Captura>;

export type CapturaId = keyof typeof capturas;
