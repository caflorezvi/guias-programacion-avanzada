// ============================================
// Toggle de tema claro/oscuro
// ============================================
(function() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
})();

// ============================================
// Barra de progreso de lectura
// ============================================
(function() {
  const relleno = document.querySelector('.barra-progreso-relleno');
  if (!relleno) return;

  let pendiente = false;

  function actualizar() {
    const doc = document.documentElement;
    const recorrido = doc.scrollHeight - window.innerHeight;
    const avance = recorrido > 0 ? Math.min(window.scrollY / recorrido, 1) : 0;
    relleno.style.transform = `scaleX(${avance})`;
    pendiente = false;
  }

  function solicitar() {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(actualizar);
  }

  window.addEventListener('scroll', solicitar, { passive: true });
  window.addEventListener('resize', solicitar);
  // Las pistas plegables cambian el alto de la página al abrirse
  document.addEventListener('toggle', solicitar, true);
  actualizar();
})();

// ============================================
// Botón de copiar en bloques de código
// ============================================
(function() {
  const copyIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
  const checkIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

  // Selecciona bloques de código (tanto los envueltos en .highlight como pre sueltos)
  const blocks = document.querySelectorAll('.highlight, .content pre');

  blocks.forEach(block => {
    // Evitar duplicados si el pre está dentro de .highlight
    if (block.tagName === 'PRE' && block.parentElement.classList.contains('highlight')) {
      return;
    }

    // Asegurar posición relativa para el botón absoluto
    if (getComputedStyle(block).position === 'static') {
      block.style.position = 'relative';
    }

    const button = document.createElement('button');
    button.className = 'copy-button';
    button.innerHTML = `${copyIcon}<span>Copiar</span>`;
    button.setAttribute('aria-label', 'Copiar código');

    button.addEventListener('click', async () => {
      const code = block.querySelector('code') || block;
      const text = code.innerText;

      try {
        await navigator.clipboard.writeText(text);
        button.innerHTML = `${checkIcon}<span>Copiado</span>`;
        button.classList.add('copied');
        setTimeout(() => {
          button.innerHTML = `${copyIcon}<span>Copiar</span>`;
          button.classList.remove('copied');
        }, 2000);
      } catch (err) {
        console.error('Error al copiar:', err);
      }
    });

    block.appendChild(button);
  });
})();

// ============================================
// Píldora "Reto" en los títulos que terminan en "(reto)"
// ============================================
(function() {
  document.querySelectorAll('.content h2, .content h3, .content h4').forEach(h => {
    if (!/\(reto\)\s*$/i.test(h.textContent)) return;
    h.innerHTML = h.innerHTML.replace(/\s*\(reto\)\s*$/i, '');
    const marca = document.createElement('span');
    marca.className = 'marca-reto';
    marca.textContent = 'Reto';
    h.appendChild(marca);
  });
})();

// ============================================
// Bloques especiales de las guías
// Se reconocen por su texto, así las guías .md no cambian.
// ============================================
(function() {
  const contenido = document.querySelector('.content');
  if (!contenido) return;

  // Texto de la etiqueta en negrita o cursiva con que abre un párrafo
  function etiqueta(p) {
    const primero = p.firstElementChild;
    if (!primero || !/^(STRONG|EM)$/.test(primero.tagName)) return '';
    if (p.firstChild !== primero && p.firstChild.textContent.trim() !== '') return '';
    return primero.textContent.trim();
  }

  // 0. Sección "Objetivo": el h2 y su contenido (hasta el siguiente --- o h2) pasan a un bloque
  contenido.querySelectorAll('h2').forEach(h => {
    if (!/^Objetivo$/i.test(h.textContent.trim())) return;
    const bloque = document.createElement('section');
    bloque.className = 'bloque-objetivo';
    if (h.id) bloque.id = h.id;
    const marca = document.createElement('p');
    marca.className = 'bloque-marca';
    marca.textContent = 'Objetivo';
    bloque.appendChild(marca);
    let nodo = h.nextElementSibling;
    while (nodo && !/^(HR|H1|H2)$/.test(nodo.tagName)) {
      const siguiente = nodo.nextElementSibling;
      bloque.appendChild(nodo);
      nodo = siguiente;
    }
    h.replaceWith(bloque);
  });

  // 1. Citas (>): las de "Nota", "Sugerencia" y "Buena práctica" pasan a azul
  contenido.querySelectorAll('blockquote').forEach(cita => {
    const p = cita.querySelector('p');
    if (!p) return;
    if (/^(⚠️|💡)?\s*(Nota|Sugerencia|Buena práctica)\b/i.test(p.textContent.trim())) {
      cita.classList.add('aviso-nota');
      // Quita el ⚠️ inicial, que en una nota no corresponde
      const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
      let nodo;
      while ((nodo = walker.nextNode())) {
        if (nodo.textContent.trim() === '') continue;
        nodo.textContent = nodo.textContent.replace(/^\s*⚠️\s*/, '');
        break;
      }
    }
  });

  // 2. "Nuevo requerimiento:" (o "Primer requerimiento:") y 3. "El problema de esta versión."
  contenido.querySelectorAll('p').forEach(p => {
    const texto = etiqueta(p);
    let clase = '';
    if (/^(Nuevo|Primer) requerimiento:?$/i.test(texto)) clase = 'requerimiento';
    else if (/^El problema de esta versión\.?$/i.test(texto)) clase = 'problema';
    if (!clase) return;
    p.classList.add(clase);
    const marca = p.firstElementChild;
    marca.classList.add('bloque-marca');
    marca.textContent = texto.replace(/[:.]$/, '');
    // La etiqueta queda en su propia línea: el texto que sigue empieza en mayúscula
    const resto = marca.nextSibling;
    if (resto && resto.nodeType === Node.TEXT_NODE) {
      resto.textContent = resto.textContent.replace(/^\s*(\S)/, (_, c) => c.toUpperCase());
    }
  });

  // 4. Pistas plegables: "*Pista:* texto" o "**Pistas:**" seguido de una lista
  contenido.querySelectorAll('p').forEach(p => {
    let texto = etiqueta(p);
    const plano = !texto && p.firstChild && p.firstChild.nodeType === Node.TEXT_NODE &&
                  /^\s*Pistas?:/.test(p.firstChild.textContent);
    if (plano) {
      texto = p.firstChild.textContent.match(/Pistas?:/)[0];
      p.firstChild.textContent = p.firstChild.textContent.replace(/^\s*Pistas?:/, '');
    } else if (!/^Pistas?:?$/i.test(texto)) return;

    const detalles = document.createElement('details');
    detalles.className = 'pista';
    const resumen = document.createElement('summary');
    resumen.textContent = texto.replace(/:$/, '');
    detalles.appendChild(resumen);
    const cuerpo = document.createElement('div');
    detalles.appendChild(cuerpo);

    if (!plano) p.firstElementChild.remove();
    const resto = p.innerHTML.replace(/^\s+/, '');
    p.before(detalles);
    if (resto.trim() !== '') {
      p.innerHTML = resto.charAt(0).toUpperCase() + resto.slice(1);
      cuerpo.appendChild(p);
    } else {
      p.remove();
    }
    const siguiente = detalles.nextElementSibling;
    if (siguiente && /^(UL|OL)$/.test(siguiente.tagName)) cuerpo.appendChild(siguiente);
  });

  // 5. Salida de consola: bloques marcados en la guía con ```salida
  contenido.querySelectorAll('.language-salida').forEach(marca => {
    const pre = marca.tagName === 'PRE' ? marca : (marca.closest('pre') || marca.querySelector('pre'));
    if (pre) pre.classList.add('bloque-consola');
  });

  // 6. Traza: bloque sin lenguaje precedido por un párrafo que empieza con "Traza"
  // GitHub Pages los envuelve en div.language-plaintext; sin envoltorio quedan como <pre> suelto
  contenido.querySelectorAll('pre').forEach(pre => {
    const envoltorio = pre.closest('div.language-plaintext, div.language-text');
    const enCodigo = pre.closest('.highlighter-rouge, .highlight');
    if (!envoltorio && enCodigo) return; // tiene lenguaje (elixir, bash, salida...)
    const bloque = envoltorio || pre;
    const previo = bloque.previousElementSibling;
    if (previo && /^Traza/i.test(previo.textContent.trim())) {
      pre.classList.add('bloque-traza');
    }
  });
})();
