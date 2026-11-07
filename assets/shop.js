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
  document.querySelectorAll('input[name="menge"]').forEach(function (r) {
    r.addEventListener('change', function () {
      if (knopfpreis) knopfpreis.textContent = r.getAttribute('data-preis');
    });
  });

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
      mehr.disabled = true;
      fetch(mehr.getAttribute('data-quelle')).then(function (r) { return r.json(); })
        .then(function (d) { vorrat = d; mehr.disabled = false; zeige(); })
        .catch(function () { mehr.disabled = false; });
    });
  }
})();
