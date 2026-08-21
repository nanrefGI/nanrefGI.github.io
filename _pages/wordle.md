---
layout: single
title: "¡Adivinad las palabras!"
permalink: /wordle/
excerpt: "Adivina la palabra en cinco letras. Infinitas palabras para practicar."
author_profile: true
toc: false
---

Infinitas palabras para que practiques. 8 intentos. Solo valen palabras del
diccionario (no hay conjugaciones de verbos ni palabras con acentos).
<style>
  /* Tamaño del juego. Sube 
  --wd-ancho para agrandarlo todo (tablero incluido); 
  --wd-tecla-alto
  --wd-tecla-texto solo afectan al teclado. */ 
  :root { --wd-ancho: 26rem;
         --wd-tecla-alto: 1rem;
         --wd-tecla-texto: 1.05rem; }
</style>

<div id="wordle"></div>

<div class="wd wd-ayuda" markdown="0">

  <h2>Qué significan los colores</h2>
  <ul class="wd-clave">
    <li><span class="wd-muestra" data-estado="correcta">p</span>
        La letra está en la palabra y en ese sitio.</li>
    <li><span class="wd-muestra" data-estado="presente">e</span>
        La letra está en la palabra, pero en otro sitio.</li>
    <li><span class="wd-muestra" data-estado="ausente">z</span>
        La letra no está en la palabra.</li>
  </ul>
  <p>El teclado se va pintando igual, para que veas de un vistazo lo que ya
     has descartado. Si repites una letra en tu intento y la palabra solo la
     tiene una vez, se marca una y la otra sale en gris.</p>

  <h2>Por dónde empezar</h2>
  <p>Éstas son las cinco letras más frecuentes del español, con su porcentaje
     aproximado de aparición en un texto normal:</p>
  <div class="wd-frec">
    <div><b>e</b><span>13,7 %</span></div>
    <div><b>a</b><span>12,5 %</span></div>
    <div><b>o</b><span>8,7 %</span></div>
    <div><b>s</b><span>8,0 %</span></div>
    <div><b>r</b><span>6,9 %</span></div>
  </div>
  <p>Entre las dos, la <b>e</b> y la <b>a</b> son ya una cuarta parte de todas
     las letras. Un buen primer intento gasta cinco letras distintas y mete
     todas las frecuentes que pueda: en este diccionario solo tres palabras
     llevan las cinco a la vez — <b>osear</b>, <b>osera</b> y <b>seora</b>.
     Si prefieres algo más corriente, <b>rodea</b>, <b>aloes</b> o <b>aireo</b>
     se acercan mucho.</p>
  <p>Después de la e, a, o, s y r vienen la <b>n</b>, la <b>i</b>, la <b>d</b>,
     la <b>l</b> y la <b>c</b>. Las raras son la <b>k</b>, la <b>w</b> y la
     <b>x</b>: no las gastes al principio.</p>

</div>

<script src="{{ '/assets/js/wordle.js' | relative_url }}"></script>
<script>
  WordleES.iniciar({
    contenedor: '#wordle',
datos: '{{ "/assets/data/palabras5.json" | relative_url }}',
    intentos: 8,
    modo: 'aleatorio'
  });
</script>

Las palabras han sido filtradas de este fichero: https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/es/es_50k.txt.
