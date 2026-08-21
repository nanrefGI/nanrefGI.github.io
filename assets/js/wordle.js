/* ------------------------------------------------------------------
   Wordle en español — versión web
   Puerto a JavaScript del script original en Python.

   Uso: añade un contenedor vacío a la página, carga este fichero y llama a

       WordleES.iniciar({
         contenedor: '#wordle',
         datos: '/assets/data/palabras.json',
         intentos: 8,
         modo: 'diario'          // 'diario' | 'aleatorio'
       });

   (Ver wordle.html para el ejemplo completo con las etiquetas script.)
   ------------------------------------------------------------------ */

var WordleES = (function () {
  'use strict';

  var LONGITUD = 5;
  var TECLADO = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'],
    ['↵', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '⌫']
  ];

  var CSS = [
    '.wd{--wd-verde:#2e7d5b;--wd-ambar:#c8912e;--wd-piedra:#787c84;',
    '--wd-borde:#c9cbd1;--wd-tinta:#1c1e22;--wd-fondo:transparent;--wd-tecla:#e8e9ec;',
    'max-width:22rem;margin:0 auto;color:var(--wd-tinta);',
    'font-family:system-ui,-apple-system,"Segoe UI",sans-serif;-webkit-user-select:none;user-select:none}',
    '@media (prefers-color-scheme:dark){.wd{--wd-borde:#41454c;--wd-tinta:#eceef2;--wd-tecla:#33373e}}',
    '.wd-tablero{display:grid;gap:.35rem;margin:0 0 1rem}',
    '.wd-fila{display:grid;grid-template-columns:repeat(5,1fr);gap:.35rem}',
    '.wd-celda{aspect-ratio:1.5;display:flex;align-items:center;justify-content:center;',
    'border:2px solid var(--wd-borde);border-radius:.2rem;font-size:1.6rem;font-weight:700;',
    'text-transform:uppercase;line-height:1;transition:transform .12s ease}',
    '.wd-celda[data-lleno]{transform:scale(1.04)}',
    '.wd-celda[data-estado]{color:#fff;border-color:transparent}',
    '.wd-celda[data-estado=correcta]{background:var(--wd-verde)}',
    '.wd-celda[data-estado=presente]{background:var(--wd-ambar)}',
    '.wd-celda[data-estado=ausente]{background:var(--wd-piedra)}',
    '.wd-fila[data-error]{animation:wd-temblor .3s}',
    '@keyframes wd-temblor{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}',
    '.wd-aviso{min-height:1.5rem;text-align:center;font-size:.9rem;margin-bottom:.5rem}',
    '.wd-aviso a{color:inherit}',
    '.wd-teclado{display:grid;gap:.5rem}',
    '.wd-tfila{display:flex;gap:.3rem;justify-content:center}',
    '.wd-tecla{flex:1 1 auto;min-width:0;padding:.75rem .2rem;border:0;border-radius:.25rem;',
    'background:var(--wd-tecla);color:inherit;font:inherit;font-size:.9rem;font-weight:600;',
    'text-transform:uppercase;cursor:pointer}',
    '.wd-tecla:hover{filter:brightness(.95)}',
    '.wd-tecla:focus-visible{outline:2px solid currentColor;outline-offset:2px}',
    '.wd-tecla.wd-ancha{flex:1.6 1 auto}',
    '.wd-tecla[data-estado]{color:#fff}',
    '.wd-tecla[data-estado=correcta]{background:var(--wd-verde)}',
    '.wd-tecla[data-estado=presente]{background:var(--wd-ambar)}',
    '.wd-tecla[data-estado=ausente]{background:var(--wd-piedra);opacity:.55}',
    '.wd-pie{margin-top:1rem;text-align:center;font-size:.85rem}',
    '.wd-pie button{font:inherit;border:1px solid var(--wd-borde);background:none;color:inherit;',
    'border-radius:.25rem;padding:.35rem .7rem;cursor:pointer;margin:0 .2rem}',
    /* ayuda: clave de colores y letras frecuentes */
    '.wd-ayuda{max-width:22rem;margin:2rem auto 0;font-size:.86rem;line-height:1.55}',
    '.wd-ayuda h2{font-size:.72rem;font-weight:600;letter-spacing:.09em;text-transform:uppercase;',
    'margin:1.5rem 0 .6rem;padding-bottom:.3rem;border-bottom:1px solid var(--wd-borde)}',
    '.wd-ayuda p{margin:.5rem 0}',
    '.wd-clave{list-style:none;padding:0;margin:0;display:grid;gap:.5rem}',
    '.wd-clave li{display:flex;align-items:center;gap:.65rem}',
    '.wd-muestra{flex:0 0 1.7rem;height:1.7rem;display:flex;align-items:center;justify-content:center;',
    'border-radius:.2rem;color:#fff;font-weight:700;font-size:.9rem;text-transform:uppercase}',
    '.wd-muestra[data-estado=correcta]{background:var(--wd-verde)}',
    '.wd-muestra[data-estado=presente]{background:var(--wd-ambar)}',
    '.wd-muestra[data-estado=ausente]{background:var(--wd-piedra)}',
    '.wd-frec{display:flex;gap:.4rem;justify-content:center;margin:.9rem 0;text-align:center}',
    '.wd-frec div{flex:1 1 0;border:1px solid var(--wd-borde);border-radius:.2rem;padding:.4rem .1rem}',
    '.wd-frec b{display:block;font-size:1.15rem;text-transform:uppercase}',
    '.wd-frec span{font-size:.7rem;opacity:.65}',
    '@media (prefers-reduced-motion:reduce){.wd *{animation:none!important;transition:none!important}}'
  ].join('');

  function inyectarEstilos() {
    if (document.getElementById('wd-estilos')) return;
    var s = document.createElement('style');
    s.id = 'wd-estilos';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function quitarAcentos(p) {
    return p.normalize('NFD').replace(/[\u0300-\u0308]/g, '').normalize('NFC');
  }

  /* Comparación en dos pasadas: primero las letras en su sitio, y sólo
     después las presentes. Así una letra repetida no se marca dos veces. */
  function comparar(objetivo, intento) {
    var estados = new Array(LONGITUD).fill('ausente');
    var restantes = {};
    var i, c;
    for (i = 0; i < LONGITUD; i++) {
      if (intento[i] === objetivo[i]) {
        estados[i] = 'correcta';
      } else {
        c = objetivo[i];
        restantes[c] = (restantes[c] || 0) + 1;
      }
    }
    for (i = 0; i < LONGITUD; i++) {
      c = intento[i];
      if (estados[i] !== 'correcta' && restantes[c] > 0) {
        estados[i] = 'presente';
        restantes[c] -= 1;
      }
    }
    return estados;
  }

  /* Nos da la palabra del día. Date.now() son los milisegundos transcurridos
     desde 1970; al dividir por 86 400 000 (los milisegundos que tiene un día)
     obtenemos el número de días, que cambia a medianoche UTC. */
  function palabraDelDia(lista) {
    var dias = Math.floor(Date.now() / 86400000);
    return lista[dias % lista.length];
  }

  function crear(cfg, datos) {
    var raiz = typeof cfg.contenedor === 'string'
      ? document.querySelector(cfg.contenedor)
      : cfg.contenedor;
    if (!raiz) return;

    var INTENTOS = cfg.intentos || 8;
    var soluciones = datos.palabras.map(quitarAcentos);
    var validas = new Set(soluciones);
    (datos.plurales || []).forEach(function (p) { validas.add(quitarAcentos(p) + 's'); });

    var objetivo = cfg.modo === 'aleatorio'
      ? soluciones[Math.floor(Math.random() * soluciones.length)]
      : palabraDelDia(soluciones);

    var intentos = [];      // palabras ya enviadas
    var actual = '';        // lo que se está escribiendo
    var terminado = false;

    raiz.classList.add('wd');
    raiz.innerHTML =
      '<div class="wd-tablero" role="grid" aria-label="Tablero"></div>' +
      '<p class="wd-aviso" role="status" aria-live="polite"></p>' +
      '<div class="wd-teclado"></div>' +
      '<div class="wd-pie" hidden></div>';

    var tablero = raiz.querySelector('.wd-tablero');
    var aviso = raiz.querySelector('.wd-aviso');
    var teclado = raiz.querySelector('.wd-teclado');
    var pie = raiz.querySelector('.wd-pie');

    var f, c2, fila, celda;
    for (f = 0; f < INTENTOS; f++) {
      fila = document.createElement('div');
      fila.className = 'wd-fila';
      fila.setAttribute('role', 'row');
      for (c2 = 0; c2 < LONGITUD; c2++) {
        celda = document.createElement('div');
        celda.className = 'wd-celda';
        celda.setAttribute('role', 'gridcell');
        fila.appendChild(celda);
      }
      tablero.appendChild(fila);
    }

    TECLADO.forEach(function (letras) {
      var tf = document.createElement('div');
      tf.className = 'wd-tfila';
      letras.forEach(function (l) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'wd-tecla' + (l.length > 1 || l === '↵' || l === '⌫' ? ' wd-ancha' : '');
        b.textContent = l;
        b.dataset.tecla = l;
        b.setAttribute('aria-label',
          l === '✓' ? 'Enviar' : l === '⌫' ? 'Borrar' : 'Letra ' + l);
        tf.appendChild(b);
      });
      teclado.appendChild(tf);
    });

    function pintar() {
      var filas = tablero.children;
      for (var i = 0; i < INTENTOS; i++) {
        var texto = i < intentos.length ? intentos[i] : (i === intentos.length ? actual : '');
        var estados = i < intentos.length ? comparar(objetivo, intentos[i]) : null;
        for (var j = 0; j < LONGITUD; j++) {
          var cel = filas[i].children[j];
          cel.textContent = texto[j] || '';
          if (estados) cel.dataset.estado = estados[j];
          else delete cel.dataset.estado;
          if (texto[j] && !estados) cel.dataset.lleno = '1';
          else delete cel.dataset.lleno;
        }
      }
      var prioridad = { ausente: 0, presente: 1, correcta: 2 };
      var mejor = {};
      intentos.forEach(function (p) {
        comparar(objetivo, p).forEach(function (e, j) {
          var l = p[j];
          if (!(l in mejor) || prioridad[e] > prioridad[mejor[l]]) mejor[l] = e;
        });
      });
      teclado.querySelectorAll('.wd-tecla').forEach(function (b) {
        var l = b.dataset.tecla;
        if (mejor[l]) b.dataset.estado = mejor[l];
        else delete b.dataset.estado;
      });
    }

    function decir(msg) { aviso.textContent = msg; }

    function temblar() {
      var fila = tablero.children[intentos.length];
      if (!fila) return;
      fila.dataset.error = '1';
      setTimeout(function () { delete fila.dataset.error; }, 320);
    }

    function compartir() {
      var cuadros = { correcta: '🟩', presente: '🟨', ausente: '⬛' };
      var res = intentos.map(function (p) {
        return comparar(objetivo, p).map(function (e) { return cuadros[e]; }).join('');
      }).join('\n');
      var gano = intentos[intentos.length - 1] === objetivo;
      return 'Wordle en español — ' + (gano ? intentos.length : 'X') + '/' + INTENTOS + '\n' + res;
    }

    function acabar(gano) {
      terminado = true;
      pie.hidden = false;
      pie.innerHTML =
        (gano ? '¡Acertaste!' : 'La palabra era <strong>' + objetivo + '</strong>.') +
        ' <a href="https://dle.rae.es/' + objetivo + '" target="_blank" rel="noopener">Verla en el DRAE</a>' +
        '<div style="margin-top:.6rem">' +
        '<button data-accion="copiar">Copiar resultado</button>' +
        '<button data-accion="otra">Jugar otra</button></div>';
    }

    function enviar() {
      if (actual.length < LONGITUD) { decir('Faltan letras.'); temblar(); return; }
      if (!validas.has(actual)) { decir('Esa palabra no está en el diccionario.'); temblar(); return; }
      if (intentos.indexOf(actual) !== -1) { decir('Ya la has probado.'); temblar(); return; }
      intentos.push(actual);
      var ganada = actual === objetivo;
      actual = '';
      decir('');
      pintar();
      if (ganada) acabar(true);
      else if (intentos.length >= INTENTOS) acabar(false);
    }

    function pulsar(t) {
      if (terminado) return;
      if (t === '✓' || t === 'enter') return enviar();
      if (t === '⌫' || t === 'backspace') {
        actual = actual.slice(0, -1); decir(''); return pintar();
      }
      if (/^[a-zñ]$/.test(t) && actual.length < LONGITUD) {
        actual += t; decir(''); pintar();
      }
    }

    teclado.addEventListener('click', function (e) {
      var b = e.target.closest('.wd-tecla');
      if (b) pulsar(b.dataset.tecla);
    });

    pie.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.accion === 'copiar') {
        navigator.clipboard.writeText(compartir()).then(function () {
          b.textContent = 'Copiado';
        });
      } else {
        crear({ contenedor: raiz, intentos: INTENTOS, modo: 'aleatorio' }, datos);
      }
    });

    document.addEventListener('keydown', function (e) {
      if (terminado || !raiz.isConnected) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var t = e.target.tagName;
      if (t === 'INPUT' || t === 'TEXTAREA' || e.target.isContentEditable) return;
      var k = quitarAcentos(e.key.toLowerCase());
      if (k === 'enter' || k === 'backspace' || /^[a-zñ]$/.test(k)) {
        e.preventDefault();
        pulsar(k);
      }
    });

    pintar();
  }

  /* Si la lista no carga, decimos por qué en vez de un "no se pudo" a secas. */
  function mostrarFallo(cfg, msg) {
    var raiz = typeof cfg.contenedor === 'string'
      ? document.querySelector(cfg.contenedor)
      : cfg.contenedor;
    if (!raiz) return;
    raiz.classList.add('wd');
    raiz.innerHTML = '<p class="wd-aviso" style="min-height:0">' + msg + '</p>';
    if (window.console) console.error('[WordleES] ' + raiz.textContent);
  }

  return {
    iniciar: function (cfg) {
      inyectarEstilos();
      if (typeof cfg.datos !== 'string') { crear(cfg, cfg.datos); return; }

      if (location.protocol === 'file:') {
        mostrarFallo(cfg, 'El navegador no deja cargar ' + cfg.datos + ' desde un fichero ' +
          'local. Arranca el servidor con <code>node serve.js</code> y abre ' +
          '<code>http://localhost:8000/dev.html</code>.');
        return;
      }

      fetch(cfg.datos)
        .then(function (r) {
          if (!r.ok) throw new Error('el servidor devolvió ' + r.status + ' ' + r.statusText);
          return r.json();
        })
        .then(function (d) {
          if (!d || !Array.isArray(d.palabras) || !d.palabras.length) {
            throw new Error('el fichero no tiene una lista "palabras"');
          }
          crear(cfg, d);
        })
        .catch(function (e) {
          mostrarFallo(cfg, 'No se pudo cargar <code>' + cfg.datos + '</code>: ' + e.message + '.');
        });
    },
    comparar: comparar
  };
})();
