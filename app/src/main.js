/* Vice Coast Cover Studio — editor behaviour.
   Local-only photos: files are read with object URLs and never uploaded. */
(function () {
  'use strict';

  var SAMPLE_PATHS = [
    'samples/person-car.jpg',
    'samples/person-rooftop.jpg',
    'samples/person-neon.jpg',
    'samples/person-pier.jpg'
  ];

  var state = {
    layout: 'classic',
    size: 'square',
    grade: 'sunset',
    title: 'SUNSET HEIST',
    subtitle: 'a vice coast story',
    plate: 'VI',
    selected: 0,
    slots: []
  };
  var photos = [];
  var photoUrls = [];
  var lastRects = [];

  var canvas = document.getElementById('vcCanvas');
  var stage = document.getElementById('vcStage');
  var handles = document.getElementById('vcHandles');
  var statusEl = document.getElementById('vcStatus');
  var thumbsEl = document.getElementById('vcThumbs');
  var zoomEl = document.getElementById('vcZoom');
  var fileEl = document.getElementById('vcFile');

  function vcEnsureSlots() {
    var count = window.ViceCover.panelRects(state.layout, 1080, 1080).length;
    while (state.slots.length < count) {
      state.slots.push({ photo: state.slots.length % Math.max(1, photos.length || 1), zoom: 100, ox: 0, oy: 0 });
      if (!photos.length) state.slots[state.slots.length - 1].photo = -1;
    }
    state.slots.length = count;
    if (state.selected >= count) state.selected = 0;
  }

  function vcRender() {
    vcEnsureSlots();
    lastRects = window.ViceCover.drawCover(canvas, state, photos);
    vcPaintHandles();
    vcPaintStatus();
    vcPaintSteps();
  }

  function vcPaintHandles() {
    handles.innerHTML = '';
    if (!lastRects.length) return;
    var box = canvas.getBoundingClientRect();
    var stageBox = stage.getBoundingClientRect();
    var sx = box.width / canvas.width;
    var sy = box.height / canvas.height;
    var offX = box.left - stageBox.left;
    var offY = box.top - stageBox.top;
    var r = lastRects[state.selected];
    if (!r) return;
    var el = document.createElement('div');
    el.className = 'vc-handlebox';
    el.style.left = (offX + r.x * sx) + 'px';
    el.style.top = (offY + r.y * sy) + 'px';
    el.style.width = (r.w * sx) + 'px';
    el.style.height = (r.h * sy) + 'px';
    el.innerHTML = '<i></i><i></i><i></i><i></i>';
    handles.appendChild(el);
  }

  function vcPaintStatus() {
    var slot = state.slots[state.selected] || { zoom: 100 };
    statusEl.textContent = 'Panel ' + (state.selected + 1) + ' of ' + state.slots.length +
      ' · ' + photos.length + ' photo(s) loaded · zoom ' + slot.zoom + '%';
    zoomEl.value = slot.zoom;
  }

  function vcPaintSteps() {
    var steps = document.querySelectorAll('.vc-step');
    steps.forEach(function (el, i) {
      var on = (i === 0 && photos.length === 0) || (i === 1 && photos.length > 0);
      el.classList.toggle('is-on', on);
    });
  }

  function vcPaintThumbs() {
    thumbsEl.innerHTML = '';
    photoUrls.forEach(function (url, i) {
      var img = document.createElement('img');
      img.src = url;
      img.alt = 'Photo ' + (i + 1);
      var slot = state.slots[state.selected];
      if (slot && slot.photo === i) img.className = 'is-on';
      img.addEventListener('click', function () {
        state.slots[state.selected].photo = i;
        state.slots[state.selected].ox = 0;
        state.slots[state.selected].oy = 0;
        vcRender();
        vcPaintThumbs();
      });
      thumbsEl.appendChild(img);
    });
  }

  function vcLoadImage(url) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = reject;
      img.src = url;
    });
  }

  function vcAddPhotoUrl(url, assignToSelected) {
    return vcLoadImage(url).then(function (img) {
      photos.push(img);
      photoUrls.push(url);
      var idx = photos.length - 1;
      vcEnsureSlots();
      if (assignToSelected) {
        state.slots[state.selected].photo = idx;
      } else {
        state.slots.forEach(function (slot, i) {
          if (slot.photo < 0) slot.photo = i % photos.length;
        });
      }
      vcRender();
      vcPaintThumbs();
      return idx;
    });
  }

  function vcLoadSamples() {
    var chain = Promise.resolve();
    SAMPLE_PATHS.forEach(function (path) {
      chain = chain.then(function () { return vcAddPhotoUrl(path, false); });
    });
    return chain.then(function () {
      state.slots.forEach(function (slot, i) { slot.photo = i % photos.length; });
      vcRender();
      vcPaintThumbs();
    });
  }

  function vcBindChips(rowId, attr, apply) {
    var row = document.getElementById(rowId);
    row.addEventListener('click', function (ev) {
      var btn = ev.target.closest('button[' + attr + ']');
      if (!btn) return;
      row.querySelectorAll('.vc-chip').forEach(function (b) { b.classList.remove('is-on'); });
      btn.classList.add('is-on');
      apply(btn.getAttribute(attr));
      vcRender();
    });
  }

  vcBindChips('vcLayoutRow', 'data-layout', function (v) { state.layout = v; vcEnsureSlots(); });
  vcBindChips('vcSizeRow', 'data-size', function (v) { state.size = v; });
  vcBindChips('vcGradeRow', 'data-grade', function (v) { state.grade = v; });

  document.getElementById('vcTitle').addEventListener('input', function (ev) {
    state.title = ev.target.value;
    vcRender();
  });
  document.getElementById('vcSubtitle').addEventListener('input', function (ev) {
    state.subtitle = ev.target.value;
    vcRender();
  });
  document.getElementById('vcPlate').addEventListener('input', function (ev) {
    state.plate = ev.target.value;
    vcRender();
  });
  zoomEl.addEventListener('input', function () {
    state.slots[state.selected].zoom = Number(zoomEl.value);
    vcRender();
  });
  document.getElementById('vcNextBtn').addEventListener('click', function () {
    if (!photos.length) return;
    var slot = state.slots[state.selected];
    slot.photo = ((slot.photo < 0 ? -1 : slot.photo) + 1) % photos.length;
    slot.ox = 0;
    slot.oy = 0;
    vcRender();
    vcPaintThumbs();
  });
  document.getElementById('vcFillBtn').addEventListener('click', function () {
    if (!photos.length) return;
    var slot = state.slots[state.selected];
    var pick = slot.photo >= 0 ? slot.photo : 0;
    state.slots.forEach(function (s) { s.photo = pick; s.ox = 0; s.oy = 0; });
    vcRender();
    vcPaintThumbs();
  });
  document.getElementById('vcAddBtn').addEventListener('click', function () { fileEl.click(); });
  document.getElementById('vcSampleBtn').addEventListener('click', function () { vcLoadSamples(); });
  fileEl.addEventListener('change', function () {
    Array.prototype.forEach.call(fileEl.files, function (file, i) {
      vcAddPhotoUrl(URL.createObjectURL(file), i === 0);
    });
    fileEl.value = '';
  });
  document.addEventListener('dragover', function (ev) { ev.preventDefault(); });
  document.addEventListener('drop', function (ev) {
    ev.preventDefault();
    var files = ev.dataTransfer && ev.dataTransfer.files ? ev.dataTransfer.files : [];
    Array.prototype.forEach.call(files, function (file, i) {
      if (file.type.indexOf('image/') === 0) vcAddPhotoUrl(URL.createObjectURL(file), i === 0);
    });
  });
  document.getElementById('vcExportBtn').addEventListener('click', function () {
    var out = document.createElement('canvas');
    window.ViceCover.drawCover(out, state, photos);
    out.toBlob(function (blob) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'vice-coast-cover.png';
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    }, 'image/png');
  });

  function vcCanvasPoint(ev) {
    var box = canvas.getBoundingClientRect();
    return {
      x: (ev.clientX - box.left) * (canvas.width / box.width),
      y: (ev.clientY - box.top) * (canvas.height / box.height),
      scale: canvas.width / box.width
    };
  }
  function vcPanelAt(pt) {
    for (var i = 0; i < lastRects.length; i++) {
      var r = lastRects[i];
      if (pt.x >= r.x && pt.x <= r.x + r.w && pt.y >= r.y && pt.y <= r.y + r.h) return i;
    }
    return -1;
  }
  var drag = null;
  canvas.addEventListener('pointerdown', function (ev) {
    var pt = vcCanvasPoint(ev);
    var idx = vcPanelAt(pt);
    if (idx < 0) return;
    state.selected = idx;
    drag = { x: ev.clientX, y: ev.clientY, ox: state.slots[idx].ox, oy: state.slots[idx].oy, scale: pt.scale };
    canvas.setPointerCapture(ev.pointerId);
    vcRender();
    vcPaintThumbs();
  });
  canvas.addEventListener('pointermove', function (ev) {
    if (!drag) return;
    var slot = state.slots[state.selected];
    slot.ox = drag.ox + (ev.clientX - drag.x) * drag.scale;
    slot.oy = drag.oy + (ev.clientY - drag.y) * drag.scale;
    vcRender();
  });
  canvas.addEventListener('pointerup', function () { drag = null; });
  canvas.addEventListener('pointercancel', function () { drag = null; });
  canvas.addEventListener('wheel', function (ev) {
    ev.preventDefault();
    var pt = vcCanvasPoint(ev);
    var idx = vcPanelAt(pt);
    if (idx < 0) return;
    state.selected = idx;
    var slot = state.slots[idx];
    slot.zoom = Math.max(100, Math.min(260, slot.zoom + (ev.deltaY < 0 ? 8 : -8)));
    vcRender();
  }, { passive: false });
  window.addEventListener('resize', vcPaintHandles);

  window.ViceStudio = {
    state: state,
    photos: photos,
    render: vcRender,
    loadSamples: vcLoadSamples,
    setChip: function (rowId, attr, value) {
      var row = document.getElementById(rowId);
      row.querySelectorAll('.vc-chip').forEach(function (b) {
        b.classList.toggle('is-on', b.getAttribute(attr) === value);
      });
    }
  };

  vcEnsureSlots();
  vcRender();
  vcLoadSamples();
})();
