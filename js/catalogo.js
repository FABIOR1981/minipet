// =========================================================
// CATALOGO.JS — Datos puros: accesorios, escenarios/fondos y
// formas de mascota disponibles, más los ajustes de tamaño y
// posición de cada accesorio sobre la mascota (accessoryFits).
// Sin lógica de UI ni acceso al DOM — solo datos.
// =========================================================
const Catalogo = {
  // Las formas de mascota disponibles (elegibles en Mi Pet)
  shapes: [
    { id: 'shape-circle',   name: 'Círculo',   emoji: '⚪' },
    { id: 'shape-mochi',    name: 'Mochi',      emoji: '🍡' },
    { id: 'shape-onigiri',  name: 'Gotita',     emoji: '💧' },
    { id: 'shape-squircle', name: 'Squircle',   emoji: '🔲' },
    { id: 'shape-dumpling', name: 'Dumpling',   emoji: '🥟' },
    //{ id: 'shape-capsule',  name: 'Cápsula',    emoji: '💊' },
    //{ id: 'shape-heart',    name: 'Corazón',    emoji: '❤️' },
    //{ id: 'shape-cathead',  name: 'Animalito',  emoji: '🐱' },
    //{ id: 'shape-cloud',    name: 'Nube',       emoji: '☁️' }
  ],

  items: [
    // -----------------------------------------------------------------
    // ACCESORIOS (Organizados para combinar con los escenarios)
    // -----------------------------------------------------------------
    // Básicos y Fiesta (Living, Dormitorio, Playroom)
    { id: 'hat_crown', name: 'Corona Real', price: 50, image: 'img/accessories/hat_crown.svg', type: 'head', category: 'acc' },
    { id: 'party_hat', name: 'Gorro Fiesta', price: 25, image: 'img/accessories/party_hat.svg', type: 'head', category: 'acc' },
    { id: 'ribbon_pink', name: 'Lazo Rosado', price: 15, image: 'img/accessories/ribbon_pink.svg', type: 'head', category: 'acc' },
    { id: 'bow_tie', name: 'Moño Coquette', price: 20, image: 'img/accessories/bow_tie.svg', type: 'neck', category: 'acc' },
    { id: 'headphones', name: 'Auriculares Gato', price: 40, image: 'img/accessories/headphones.svg', type: 'ears', category: 'acc' },
    { id: 'cat_ears', name: 'Orejitas Violeta', price: 45, image: 'img/accessories/cat_ears.svg', type: 'ears', category: 'acc' },
    { id: 'bunny_ears', name: 'Orejas Conejo', price: 40, image: 'img/accessories/bunny_ears.svg', type: 'ears', category: 'acc' },

    // Para "Playa Tropical" / "Oasis del Desierto"
    { id: 'glasses_cool', name: 'Lentes Corazón', price: 30, image: 'img/accessories/glasses_cool.svg', type: 'eyes', category: 'acc' },
    { id: 'star_glasses', name: 'Lentes Estrella', price: 35, image: 'img/accessories/star_glasses.svg', type: 'eyes', category: 'acc' },
    { id: 'pirate_hat', name: 'Gorro Pirata', price: 55, image: 'img/accessories/pirate_hat.svg', type: 'head', category: 'acc' },
    { id: 'snorkel_mask', name: 'Visor de Buceo', price: 45, image: 'img/accessories/snorkel.svg', type: 'eyes', category: 'acc' },

    // Para "Cocina del Chef"
    { id: 'chef_hat', name: 'Gorro de Chef', price: 35, image: 'img/accessories/chef_hat.svg', type: 'head', category: 'acc' },

    // Para "Parque Mágico" / "Bosque Encantado" / "Castillo Real"
    { id: 'flower_pink', name: 'Flor Primavera', price: 18, image: 'img/accessories/flower_pink.svg', type: 'head', category: 'acc' },
    { id: 'wizard_hat', name: 'Gorro de Mago', price: 60, image: 'img/accessories/wizard_hat.svg', type: 'head', category: 'acc' },
    { id: 'magic_wand', name: 'Varita Mágica', price: 60, image: 'img/accessories/magic_wand.svg', type: 'neck', category: 'acc' },
    { id: 'fairy_wings', name: 'Alas de Hada', price: 75, image: 'img/accessories/fairy_wings.svg', type: 'neck', category: 'acc' },

    // Para "Dojo Ninja"
    { id: 'ninja_band', name: 'Vanda Ninja', price: 50, image: 'img/accessories/ninja_band.svg', type: 'head', category: 'acc' },

    // Para "Estación Espacial"
    { id: 'space_helmet', name: 'Casco Espacial', price: 90, image: 'img/accessories/space_helmet.svg', type: 'head', category: 'acc' },

    // Para "Montaña Nevada" / "Campamento Nocturno"
    { id: 'winter_beanie', name: 'Gorro de Lana', price: 30, image: 'img/accessories/winter_beanie.svg', type: 'head', category: 'acc' },
    { id: 'winter_scarf', name: 'Bufanda Calientita', price: 25, image: 'img/accessories/winter_scarf.svg', type: 'neck', category: 'acc' },

    // Para "Baño de Burbujas"
    { id: 'shower_cap', name: 'Gorro de Baño', price: 20, image: 'img/accessories/shower_cap.svg', type: 'head', category: 'acc' },

    // -----------------------------------------------------------------
    // ESCENARIOS / FONDOS (Categoría 'bg')
    // El campo `preview` muestra en la tienda una miniatura de la misma
    // ilustración SVG que usa css/escenarios.css para el escenario.
    // -----------------------------------------------------------------
    // Básicos
    { id: 'bg_living', name: 'Sala de Estar', price: 0, image: '🛋️', type: 'bg', category: 'bg',
      preview: 'background: #ffe9cf url(img/escenarios/sala.svg) center 42% / cover;' },
    { id: 'bg_bedroom', name: 'Dormitorio', price: 40, image: '🛏️', type: 'bg', category: 'bg',
      preview: 'background: #3a2c80 url(img/escenarios/dormitorio.svg) center 42% / cover;' },
    { id: 'bg_playroom', name: 'Sala de Juegos', price: 60, image: '🧸', type: 'bg', category: 'bg',
      preview: 'background: #ffeebb url(img/escenarios/juegos.svg) center 42% / cover;' },
    { id: 'bg_park', name: 'Parque Mágico', price: 80, image: '🌳', type: 'bg', category: 'bg',
      preview: 'background: #9be0ff url(img/escenarios/parque.svg) center 42% / cover;' },
    { id: 'bg_beach', name: 'Playa Tropical', price: 50, image: '🏖️', type: 'bg', category: 'bg',
      preview: 'background: #8fdcf0 url(img/escenarios/playa.svg) center 42% / cover;' },

    // Naturaleza y Exteriores
    { id: 'bg_forest', name: 'Bosque Encantado', price: 90, image: '🌲', type: 'bg', category: 'bg',
      preview: 'background: #1f6b57 url(img/escenarios/bosque.svg) center 42% / cover;' },
    { id: 'bg_mountain', name: 'Montaña Nevada', price: 100, image: '🏔️', type: 'bg', category: 'bg',
      preview: 'background: #cfe8f8 url(img/escenarios/montana.svg) center 42% / cover;' },
    { id: 'bg_camping', name: 'Campamento Nocturno', price: 120, image: '⛺', type: 'bg', category: 'bg',
      preview: 'background: #1b2658 url(img/escenarios/campamento.svg) center 42% / cover;' },
    { id: 'bg_desert', name: 'Oasis del Desierto', price: 110, image: '🏜️', type: 'bg', category: 'bg',
      preview: 'background: #f9c583 url(img/escenarios/desierto.svg) center 42% / cover;' },

    // Interiores y Temáticos
    { id: 'bg_kitchen', name: 'Cocina del Chef', price: 45, image: '🍳', type: 'bg', category: 'bg',
      preview: 'background: #fff0da url(img/escenarios/cocina.svg) center 42% / cover;' },
    { id: 'bg_bathroom', name: 'Baño de Burbujas', price: 35, image: '🛁', type: 'bg', category: 'bg',
      preview: 'background: #dff8f7 url(img/escenarios/bano.svg) center 42% / cover;' },
    { id: 'bg_dojo', name: 'Dojo Ninja', price: 130, image: '⛩️', type: 'bg', category: 'bg',
      preview: 'background: #ffd9c4 url(img/escenarios/dojo.svg) center 42% / cover;' },
    { id: 'bg_disco', name: 'Pista de Baile', price: 150, image: '🪩', type: 'bg', category: 'bg',
      preview: 'background: #2a0f52 url(img/escenarios/disco.svg) center 42% / cover;' },

    // Fantásticos y Especiales
    { id: 'bg_space', name: 'Estación Espacial', price: 200, image: '🚀', type: 'bg', category: 'bg',
      preview: 'background: #27335a url(img/escenarios/espacio.svg) center 42% / cover;' },
    { id: 'bg_castle', name: 'Castillo Real', price: 250, image: '🏰', type: 'bg', category: 'bg',
      preview: 'background: #bcaadc url(img/escenarios/castillo.svg) center 42% / cover;' },
    { id: 'bg_underwater', name: 'Mundo Submarino', price: 180, image: '🪸', type: 'bg', category: 'bg',
      preview: 'background: #0a6f9f url(img/escenarios/submarino.svg) center 42% / cover;' },
    { id: 'bg_volcano', name: 'Guarida Volcánica', price: 300, image: '🌋', type: 'bg', category: 'bg',
      preview: 'background: #5a1a1a url(img/escenarios/volcan.svg) center 42% / cover;' }
  ],

  // Escala/posición/rotación de cada accesorio equipado sobre la mascota
  accessoryFits: {
    hat_crown: { scale: 1.25, y: -4 },
    party_hat: { scale: 1.2, y: -4 },
    ribbon_pink: { scale: 1.15, y: -2, rotate: -4 },
    chef_hat: { scale: 1.25, y: -4 },
    wizard_hat: { scale: 1.25, y: -5 },
    pirate_hat: { scale: 1.2, y: -3 },
    space_helmet: { scale: 1.2, y: -2 },
    winter_beanie: { scale: 1.2, y: -3 },
    shower_cap: { scale: 1.2, y: -2 },
    flower_pink: { scale: 1.1, y: 0 },
    headphones: { scale: 1.15, y: 0 },
    cat_ears: { scale: 1.1, y: -2 },
    bunny_ears: { scale: 1.15, y: -3 },
    glasses_cool: { scale: 1.15, y: 1, x: 0 },
    star_glasses: { scale: 1.15, y: 1, x: 0 },
    snorkel_mask: { scale: 1.2, y: 1 },
    bow_tie: { scale: 1.25, y: -2 },
    magic_wand: { scale: 1.1, y: -4, x: 3, rotate: -8 },
    fairy_wings: { scale: 1.2, y: -3, x: 0 },
    ninja_band: { scale: 1.15, y: 0 },
    winter_scarf: { scale: 1.25, y: -3 }
  }
};
