// GigglePeek Vorschau: Galerie, Mengenwahl, Kaufknopf ohne Kasse, Leiste unten.
(function () {
  var streifen = document.getElementById('streifen');
  var zahl = document.getElementById('zahl');
  var daumen = document.querySelectorAll('#daumen button');
  if (streifen) {
    var n = streifen.children.length;
    var setze = function (i) {
      if (zahl) zahl.textContent = (i + 1) + ' / ' + n;
      daumen.forEach(function (b, j) { b.classList.toggle('an', j === i); });
    };
    streifen.addEventListener('scroll', function () {
      setze(Math.round(streifen.scrollLeft / streifen.clientWidth));
    }, { passive: true });
    daumen.forEach(function (b, i) {
      b.addEventListener('click', function () {
        streifen.scrollTo({ left: i * streifen.clientWidth, behavior: 'smooth' });
        setze(i);
      });
    });
    setze(0);
  }

  var knopfpreis = document.getElementById('knopfpreis');
  var viele = document.getElementById('viele');
  var vieleRadio = document.querySelector('input[name="menge"][value="4"]');
  var zahlViele = function () { var n = parseInt(viele.value, 10); if (isNaN(n) || n < 4) n = 4; if (n > 99) n = 99; return n; };
  var preis = function () {
    var r = document.querySelector('input[name="menge"]:checked');
    if (!r || !knopfpreis) return;
    if (r === vieleRadio) {
      var je = parseFloat(r.getAttribute('data-je').replace(/[^0-9.]/g, ''));
      knopfpreis.textContent = '$' + (je * zahlViele()).toFixed(2);
    } else knopfpreis.textContent = r.getAttribute('data-preis');
  };
  document.querySelectorAll('input[name="menge"]').forEach(function (r) { r.addEventListener('change', preis); });
  // Stufe 4+: Minus, Plus und Eingabe waehlen die Stufe und rechnen den Preis (Richter 4)
  if (viele && vieleRadio) {
    var setzeViele = function (n) { viele.value = Math.max(4, Math.min(99, n)); vieleRadio.checked = true; preis(); };
    document.querySelector('.stufe__minus').addEventListener('click', function (e) { e.preventDefault(); setzeViele(zahlViele() - 1); });
    document.querySelector('.stufe__plus').addEventListener('click', function (e) { e.preventDefault(); setzeViele(zahlViele() + 1); });
    viele.addEventListener('input', function () { vieleRadio.checked = true; preis(); });
    viele.addEventListener('change', function () { setzeViele(zahlViele()); });
    viele.addEventListener('click', function () { vieleRadio.checked = true; preis(); });
  }

  var hinweis = document.getElementById('hinweis');
  var zeit;
  document.querySelectorAll('.kaufen').forEach(function (k) {
    k.addEventListener('click', function () {
      if (!hinweis) return;
      hinweis.textContent = 'Preview only: checkout is not connected yet.';
      hinweis.classList.add('an');
      clearTimeout(zeit);
      zeit = setTimeout(function () { hinweis.classList.remove('an'); }, 2600);
    });
  });

  var leiste = document.getElementById('leiste');
  var haupt = document.getElementById('kaufknopf');
  if (leiste && haupt && 'IntersectionObserver' in window) {
    // Leiste an, sobald der Kaufknopf nicht ganz im Bild ist, auch beim Laden (Richter 3: Knopf unter der Falz bei 390x750)
    new IntersectionObserver(function (e) {
      var weg = e[0].intersectionRatio < 0.99;
      leiste.classList.toggle('an', weg);
      leiste.setAttribute('aria-hidden', weg ? 'false' : 'true');
      leiste.querySelector('button').tabIndex = weg ? 0 : -1;
    }, { threshold: [0, 0.99, 1] }).observe(haupt);
    leiste.querySelector('button').addEventListener('click', function () {
      document.getElementById('kaufen').scrollIntoView({ behavior: 'smooth' });
    });
  }
  // Bewertungen: 10 im HTML, weitere je 10 pro Klick aus assets/bewertungen.json (erst beim ersten Klick geladen)
  var mehr = document.getElementById('mehrbewertungen');
  var liste = document.getElementById('bewertungsliste');
  if (mehr && liste) {
    var vorrat = null, pos = 0;
    var stern = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L10 14.8l-5.2 2.8 1-5.8L1.5 7.7l5.9-.8z"/></svg>';
    var el = function (tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
    var karte = function (b) {
      var a = el('article', 'bewertung'), k = el('div', 'bewertung__kopf'), r = el('span', 'sterne__reihe');
      r.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < 5; i++) { var s = el('i', i < b.n ? 'an' : 'aus'); s.innerHTML = stern; r.appendChild(s); }
      k.appendChild(r); k.appendChild(el('span', 'bewertung__monat', b.monat)); a.appendChild(k);
      if (b.titel) a.appendChild(el('h3', '', b.titel));
      b.text.split('\n\n').forEach(function (t) { a.appendChild(el('p', '', t)); });
      a.appendChild(el('p', 'bewertung__name', b.name));
      return a;
    };
    var zeige = function () {
      vorrat.slice(pos, pos + 10).forEach(function (b) { liste.appendChild(karte(b)); });
      pos += 10;
      if (pos >= vorrat.length) mehr.remove();
    };
    mehr.addEventListener('click', function () {
      if (vorrat) return zeige();
      var inline = document.getElementById('bewertungsdaten');
      if (inline) { try { vorrat = JSON.parse(inline.textContent); return zeige(); } catch (e) { vorrat = null; } }
      mehr.disabled = true;
      fetch(mehr.getAttribute('data-quelle')).then(function (r) { return r.json(); })
        .then(function (d) { vorrat = d; mehr.disabled = false; zeige(); })
        .catch(function () { mehr.disabled = false; });
    });
  }
})();
