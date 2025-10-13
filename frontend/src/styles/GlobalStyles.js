import { createGlobalStyle } from "styled-components"
import background from "../assets/imagem_de_fundo.jpeg";
import { font } from "./Variables.js";

const GlobalStyle = createGlobalStyle`
  html, body, div, span, applet, object, iframe,
  h1, h2, h3, h4, h5, h6, p, blockquote, pre,
  a, abbr, acronym, address, big, cite, code,
  del, dfn, em, img, ins, kbd, q, s, samp,
  small, strike, strong, sub, sup, tt, var,
  b, u, i, center,
  dl, dt, dd, ol, ul, li,
  fieldset, form, label, legend,
  table, caption, tbody, tfoot, thead, tr, th, td,
  article, aside, canvas, details, embed, 
  figure, figcaption, footer, header, hgroup, 
  menu, nav, output, ruby, section, summary,
  time, mark, audio, video {
    margin: 0;
    padding: 0;
    border: 0;
    font-size: 100%;
    font: inherit;
    vertical-align: baseline;
  }
  /* HTML5 display-role reset for older browsers */
  article, aside, details, figcaption, figure, 
  footer, header, hgroup, menu, nav, section {
    display: block;
  }
  body {
    line-height: 1;
    min-width: 375px;
    background-image: url(${background});
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    margin: 0;
    padding: 0;
    font-family: ${font.font_family}
  }

  body::after {
    content: '';
    position: fixed; // Use fixed para cobrir toda a viewport
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 255, 0.4);
    z-index: -1; // Coloque o z-index negativo para ficar atrás do conteúdo
    font-family: ${font.font_family}

  }
  ol, ul {
    list-style: none;
  }
  blockquote, q {
    quotes: none;
  }
  blockquote:before, blockquote:after,
  q:before, q:after {
    content: '';
    content: none;
  }
  table {
    border-collapse: collapse;
    border-spacing: 0;
  }
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  p, h2 {
    font-family: 'Poppins';
    font-size: 20px;
    color: white;
  }
  h1 {
    font-family: 'Poppins';
    color: white;
  }
  a {
    font-family: 'Poppins';
    font-size: 20px;
    color: white;
    text-decoration: none;
    font-weight: 600;
    color:  hsl(20, 100%, 20%);
  }

  .leaflet-control-container,
  .leaflet-pane {
    z-index: 999 !important;
  }

  .leaflet-control-zoom,
  .leaflet-control-attribution {
    z-index: 999 !important;
  }
`

export default GlobalStyle


