/* Screenshot scenes for Vice Coast Cover Studio.
   Open index.html?shot=<scene> to stage each dossier screenshot. */
(function () {
  'use strict';

  function vcWaitForPhotos(done) {
    var tries = 0;
    (function poll() {
      tries += 1;
      if (window.ViceStudio && window.ViceStudio.photos.length >= 4) { done(); return; }
      if (tries > 120) { done(); return; }
      setTimeout(poll, 100);
    })();
  }

  function vcApplyScene(name) {
    var studio = window.ViceStudio;
    var s = studio.state;
    if (name === 'cover-classic') {
      document.body.classList.add('vc-shot-cover');
      s.layout = 'classic'; s.size = 'square'; s.grade = 'sunset';
      s.title = 'SUNSET HEIST'; s.subtitle = 'a vice coast story'; s.plate = 'VI';
      s.selected = 0;
      s.slots = [
        { photo: 0, zoom: 108, ox: 0, oy: 0 },
        { photo: 1, zoom: 105, ox: 0, oy: 0 },
        { photo: 2, zoom: 110, ox: 0, oy: 0 },
        { photo: 3, zoom: 106, ox: 0, oy: 0 }
      ];
    } else if (name === 'cover-wide') {
      document.body.classList.add('vc-shot-cover');
      s.layout = 'hero'; s.size = 'wide'; s.grade = 'neon';
      s.title = 'NEON DISTRICT'; s.subtitle = 'after dark on the coast'; s.plate = 'VI';
      s.selected = 0;
      s.slots = [
        { photo: 2, zoom: 112, ox: 0, oy: 0 },
        { photo: 0, zoom: 108, ox: 0, oy: 0 },
        { photo: 1, zoom: 106, ox: 0, oy: 0 }
      ];
    } else if (name === 'cover-portrait') {
      document.body.classList.add('vc-shot-cover');
      s.layout = 'triptych'; s.size = 'portrait'; s.grade = 'sunset';
      s.title = 'GOLDEN HOUR'; s.subtitle = 'three ways home'; s.plate = 'VI';
      s.selected = 0;
      s.slots = [
        { photo: 0, zoom: 112, ox: 55, oy: 0 },
        { photo: 3, zoom: 110, ox: 95, oy: 0 },
        { photo: 1, zoom: 108, ox: 10, oy: 0 }
      ];
    } else if (name === 'editor') {
      s.layout = 'classic'; s.size = 'square'; s.grade = 'sunset';
      s.title = 'SUNSET HEIST'; s.subtitle = 'a vice coast story'; s.plate = 'VI';
      s.selected = 0;
      s.slots = [
        { photo: 0, zoom: 138, ox: -34, oy: -18 },
        { photo: 1, zoom: 105, ox: 0, oy: 0 },
        { photo: 2, zoom: 110, ox: 0, oy: 0 },
        { photo: 3, zoom: 106, ox: 0, oy: 0 }
      ];
    } else {
      window.__vcReady = true;
      return;
    }
    document.getElementById('vcTitle').value = s.title;
    document.getElementById('vcSubtitle').value = s.subtitle;
    document.getElementById('vcPlate').value = s.plate;
    studio.setChip('vcLayoutRow', 'data-layout', s.layout);
    studio.setChip('vcSizeRow', 'data-size', s.size);
    studio.setChip('vcGradeRow', 'data-grade', s.grade);
    studio.render();
    setTimeout(function () { window.__vcReady = true; }, 350);
  }

  var params = new URLSearchParams(window.location.search);
  var shot = params.get('shot');
  if (shot) vcWaitForPhotos(function () { vcApplyScene(shot); });
})();
