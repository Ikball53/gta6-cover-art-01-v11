/* Vice Coast cover engine: panel geometry, colour grades, lettering, plate.
   Everything draws on a 2D canvas so preview and PNG export match exactly. */
(function () {
  'use strict';

  var VC_SIZES = {
    square: { w: 1080, h: 1080, label: '1080 × 1080' },
    portrait: { w: 1080, h: 1350, label: '1080 × 1350' },
    wide: { w: 1920, h: 1080, label: '1920 × 1080' }
  };

  function vcTitleBandH(h) { return Math.round(h * 0.185); }

  function vcPanelRects(layout, w, h) {
    var band = vcTitleBandH(h);
    var topH = h - band;
    var gap = Math.max(8, Math.round(w * 0.009));
    if (layout === 'hero') {
      var heroW = Math.round(w * 0.575);
      var sideW = w - heroW - gap;
      var sideH = Math.round((topH - gap) / 2);
      return [
        { x: 0, y: 0, w: heroW, h: topH },
        { x: heroW + gap, y: 0, w: sideW, h: sideH },
        { x: heroW + gap, y: sideH + gap, w: sideW, h: topH - sideH - gap }
      ];
    }
    if (layout === 'triptych') {
      var colW = Math.round((w - gap * 2) / 3);
      return [
        { x: 0, y: 0, w: colW, h: topH },
        { x: colW + gap, y: 0, w: colW, h: topH },
        { x: (colW + gap) * 2, y: 0, w: w - (colW + gap) * 2, h: topH }
      ];
    }
    var halfW = Math.round((w - gap) / 2);
    var halfH = Math.round((topH - gap) / 2);
    return [
      { x: 0, y: 0, w: halfW, h: halfH },
      { x: halfW + gap, y: 0, w: w - halfW - gap, h: halfH },
      { x: 0, y: halfH + gap, w: halfW, h: topH - halfH - gap },
      { x: halfW + gap, y: halfH + gap, w: w - halfW - gap, h: topH - halfH - gap }
    ];
  }

  function vcGradeFilter(grade) {
    if (grade === 'sunset') return 'saturate(1.35) contrast(1.08) brightness(1.03) hue-rotate(-6deg)';
    if (grade === 'neon') return 'saturate(1.55) contrast(1.16) brightness(0.98) hue-rotate(8deg)';
    return 'saturate(1.05) contrast(1.02)';
  }

  function vcPaintGradeWash(ctx, grade, rect) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();
    if (grade === 'sunset') {
      var g1 = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
      g1.addColorStop(0, 'rgba(255,140,40,0.16)');
      g1.addColorStop(0.55, 'rgba(255,60,120,0.10)');
      g1.addColorStop(1, 'rgba(40,10,90,0.22)');
      ctx.fillStyle = g1;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    } else if (grade === 'neon') {
      var g2 = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
      g2.addColorStop(0, 'rgba(0,220,255,0.13)');
      g2.addColorStop(0.5, 'rgba(30,10,80,0.10)');
      g2.addColorStop(1, 'rgba(255,0,170,0.16)');
      ctx.fillStyle = g2;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
    var vg = ctx.createRadialGradient(
      rect.x + rect.w / 2, rect.y + rect.h / 2, Math.min(rect.w, rect.h) * 0.35,
      rect.x + rect.w / 2, rect.y + rect.h / 2, Math.max(rect.w, rect.h) * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.20)');
    ctx.fillStyle = vg;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
  }

  function vcDrawPanelPhoto(ctx, img, rect, slot, grade) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();
    ctx.fillStyle = '#241447';
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    if (img) {
      var zoom = (slot && slot.zoom ? slot.zoom : 100) / 100;
      var ox = slot ? slot.ox : 0;
      var oy = slot ? slot.oy : 0;
      var scale = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight) * zoom;
      var dw = img.naturalWidth * scale;
      var dh = img.naturalHeight * scale;
      var dx = rect.x + (rect.w - dw) / 2 + ox;
      var dy = rect.y + (rect.h - dh) / 2 + oy;
      try { ctx.filter = vcGradeFilter(grade); } catch (e) { /* older canvas */ }
      ctx.drawImage(img, dx, dy, dw, dh);
      try { ctx.filter = 'none'; } catch (e) { /* noop */ }
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '600 ' + Math.round(rect.w * 0.07) + 'px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Add a photo', rect.x + rect.w / 2, rect.y + rect.h / 2);
    }
    ctx.restore();
    vcPaintGradeWash(ctx, grade, rect);
  }

  function vcTitleLines(rawTitle) {
    var words = String(rawTitle || 'UNTITLED').toUpperCase().trim().split(/\s+/).filter(Boolean);
    if (words.length <= 1) return [words.join(' ') || 'UNTITLED'];
    if (words.length === 2) return words;
    var mid = Math.ceil(words.length / 2);
    return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
  }

  function vcPaintLettering(ctx, w, h, state) {
    var band = vcTitleBandH(h);
    var bandY = h - band;
    var bg = ctx.createLinearGradient(0, bandY, 0, h);
    bg.addColorStop(0, '#1d0f4a');
    bg.addColorStop(1, '#0a0618');
    ctx.fillStyle = bg;
    ctx.fillRect(0, bandY, w, band);
    ctx.fillStyle = state.grade === 'neon' ? '#2ee6ff' : '#ffb340';
    ctx.fillRect(0, bandY, w, Math.max(4, Math.round(h * 0.005)));

    var lines = vcTitleLines(state.title);
    var padX = Math.round(w * 0.045);
    var availW = w - padX * 2 - Math.round(w * 0.20);
    var size = Math.round(band * (lines.length > 1 ? 0.34 : 0.42));
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    function setTitleFont(s) {
      ctx.font = '900 italic ' + s + 'px "Arial Black", Impact, "Segoe UI", sans-serif';
    }
    setTitleFont(size);
    var widest = 0;
    lines.forEach(function (ln) { widest = Math.max(widest, ctx.measureText(ln).width); });
    while (widest > availW && size > 18) {
      size -= 4;
      setTitleFont(size);
      widest = 0;
      lines.forEach(function (ln) { widest = Math.max(widest, ctx.measureText(ln).width); });
    }
    var grad = ctx.createLinearGradient(padX, bandY, padX, h);
    if (state.grade === 'neon') {
      grad.addColorStop(0, '#a8fbff');
      grad.addColorStop(0.45, '#2ee6ff');
      grad.addColorStop(1, '#ff4fd8');
    } else if (state.grade === 'clean') {
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(1, '#ffd9a0');
    } else {
      grad.addColorStop(0, '#fff6b0');
      grad.addColorStop(0.45, '#ffb340');
      grad.addColorStop(1, '#ff5e7a');
    }
    var lineH = size * 1.02;
    var blockH = lineH * lines.length;
    var startY = bandY + (band - blockH) / 2 + size * 0.82 - Math.round(band * 0.10);
    lines.forEach(function (ln, i) {
      var y = startY + i * lineH;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.65)';
      ctx.shadowBlur = Math.round(size * 0.16);
      ctx.shadowOffsetY = Math.round(size * 0.07);
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.strokeStyle = '#12072e';
      ctx.lineWidth = Math.max(6, Math.round(size * 0.22));
      ctx.strokeText(ln, padX, y);
      ctx.strokeStyle = 'rgba(255,255,255,0.92)';
      ctx.lineWidth = Math.max(2, Math.round(size * 0.045));
      ctx.strokeText(ln, padX, y);
      ctx.fillStyle = grad;
      ctx.fillText(ln, padX, y);
      ctx.restore();
    });

    var sub = String(state.subtitle || '').trim();
    if (sub) {
      var subSize = Math.max(20, Math.round(band * 0.17));
      ctx.save();
      ctx.font = 'italic 700 ' + subSize + 'px "Brush Script MT", "Segoe Script", cursive';
      ctx.fillStyle = state.grade === 'neon' ? '#ff8ae2' : '#2ee6c8';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 8;
      ctx.fillText(sub, padX + 4, h - Math.round(band * 0.16));
      ctx.restore();
    }
  }

  function vcPaintPlate(ctx, w, h, state) {
    var band = vcTitleBandH(h);
    var bandY = h - band;
    var pw = Math.round(w * 0.165);
    var ph = Math.round(pw * 0.52);
    var px = w - pw - Math.round(w * 0.035);
    var py = bandY - Math.round(ph * 0.42);
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#f7f9fc';
    ctx.beginPath();
    ctx.roundRect(px, py, pw, ph, Math.round(ph * 0.12));
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = Math.max(4, Math.round(ph * 0.06));
    ctx.strokeStyle = '#1b3a6b';
    ctx.stroke();
    ctx.fillStyle = '#1b3a6b';
    ctx.font = '700 ' + Math.round(ph * 0.17) + 'px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('VICE COAST', px + pw / 2, py + ph * 0.20);
    var plateText = String(state.plate || 'VI').toUpperCase().slice(0, 6) || 'VI';
    ctx.font = '900 ' + Math.round(ph * 0.46) + 'px "Arial Black", Impact, sans-serif';
    ctx.fillText(plateText, px + pw / 2, py + ph * 0.60);
    ctx.fillStyle = '#8fa0b8';
    var bolts = [[px + pw * 0.07, py + ph * 0.14], [px + pw * 0.93, py + ph * 0.14],
      [px + pw * 0.07, py + ph * 0.86], [px + pw * 0.93, py + ph * 0.86]];
    bolts.forEach(function (b) {
      ctx.beginPath();
      ctx.arc(b[0], b[1], Math.max(3, ph * 0.045), 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function vcDrawCover(canvas, state, photos) {
    var size = VC_SIZES[state.size] || VC_SIZES.square;
    if (canvas.width !== size.w) canvas.width = size.w;
    if (canvas.height !== size.h) canvas.height = size.h;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a0618';
    ctx.fillRect(0, 0, size.w, size.h);
    var rects = vcPanelRects(state.layout, size.w, size.h);
    rects.forEach(function (rect, i) {
      var slot = state.slots[i] || { photo: -1, zoom: 100, ox: 0, oy: 0 };
      var img = slot.photo >= 0 ? photos[slot.photo] : null;
      vcDrawPanelPhoto(ctx, img, rect, slot, state.grade);
    });
    vcPaintLettering(ctx, size.w, size.h, state);
    vcPaintPlate(ctx, size.w, size.h, state);
    return rects;
  }

  window.ViceCover = {
    SIZES: VC_SIZES,
    panelRects: vcPanelRects,
    drawCover: vcDrawCover,
    titleBandH: vcTitleBandH
  };
})();
