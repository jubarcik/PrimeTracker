import {red,blue, grey, lightBlue, green, indigo, orange, lightGreen } from '@mui/material/colors';

// Tabela de cores Material MUI para conversão
const colorPalettes = {
  blue,
  grey,
  lightBlue,
  green,
  lightGreen,
  indigo,
  orange,
  red,
};

// Função para validar e converter a cor
const validatedColor = (color) => {
  if (!color) return null;

  // 1️⃣ Se for HEX (#RGB ou #RRGGBB)
  if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(color)) return color;

  // 2️⃣ Se for cor do tipo "lightBlueA400" ou "indigo200"
  const match = /^([a-zA-Z]+)(A?\d{2,3})?$/.exec(color);
  if (match) {
    const [_, base, variant] = match;
    const palette = colorPalettes[base];
    if (palette) {
      const shade = variant || '500'; // padrão: tom 500
      return palette[shade] || null;
    }
  }

  // 3️⃣ Não reconhecida
  return null;
};

export default (server, darkMode) => ({
  mode: darkMode ? 'dark' : 'light',

  background: {
    default: darkMode ? grey[900] : grey[50],
  },

  primary: {
    main:
      validatedColor(server?.attributes?.colorPrimary) || (darkMode ? lightBlue.A400 : blue[900]),
  },

  secondary: {
    main:
      validatedColor(server?.attributes?.colorSecondary) || (darkMode ? lightGreen.A400 : green[900]),
  },

  warning: {
    main:
      validatedColor(server?.attributes?.colorWarning) || (darkMode ? orange.A400 : orange[900]),
  },
   error: {
    main:
      validatedColor(server?.attributes?.colorPrimary) || (darkMode ? red.A400 : red[900]),
  },

  neutral: {
    main: grey[500],
  },

  geometry: {
    main: '#3bb2d0',
  },

  alwaysDark: {
    main: grey[900],
  },
});
