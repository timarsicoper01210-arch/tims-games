(function () {
  var C = window.GFCore;
  var KEYS = { premium: 'gf_premium', completed: 'gf_completed' };
  var state = { config: null, content: null, startedAt: 0, hintsUsed: 0, finished: false };
  window.__gameState = 'loading';

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }
  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function el(tag, attrs, text) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text) n.textContent = text;
    return n;
  }
  function isPremium() {
    return Boolean(read(KEYS.premium));
  }
  function hasAds() {
    return Boolean(state.config && state.config.adsenseClient);
  }

  function loadAdsScript() {
    if (!hasAds() || isPremium() || document.getElementById('gf-ads-js')) return;
    var s = el('script', { id: 'gf-ads-js', async: '', crossorigin: 'anonymous',
      src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + state.config.adsenseClient });
    document.head.appendChild(s);
  }
  function adSlot(container) {
    if (!hasAds() || isPremium()) return;
    var ins = el('ins', { class: 'adsbygoogle', style: 'display:block', 'data-ad-client': state.config.adsenseClient, 'data-ad-format': 'auto', 'data-full-width-responsive': 'true' });
    container.appendChild(ins);
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
  }

  function premiumFooter() {
    var p = state.config && state.config.premium;
    var footer = el('footer', { class: 'gf-footer' });
    footer.appendChild(el('a', { href: '../../' }, '← Tous les jeux'));
    if (p && p.checkoutUrl && !isPremium()) {
      footer.appendChild(el('a', { href: p.checkoutUrl, class: 'gf-premium', target: '_blank', rel: 'noopener' }, 'Pass Premium ' + p.price + ' — sans pub, toutes les archives'));
      var keyBtn = el('button', { class: 'gf-link' }, "J'ai une clé");
      keyBtn.onclick = askLicense;
      footer.appendChild(keyBtn);
    }
    if (isPremium()) footer.appendChild(el('span', { class: 'gf-badge' }, '⭐ Premium'));
    document.body.appendChild(footer);
  }

  function validateLicense(key) {
    var p = state.config.premium;
    return fetch(p.workerUrl + '/validate', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ licenseKey: key }),
    }).then(function (r) { return r.json(); }).then(function (b) { return Boolean(b.valid); });
  }
  function askLicense() {
    var key = (window.prompt('Colle la clé reçue par email :') || '').trim();
    if (!key) return;
    validateLicense(key).then(function (valid) {
      if (valid) { write(KEYS.premium, { key: key, validatedAt: Date.now() }); location.reload(); }
      else window.alert('Clé invalide.');
    }).catch(function () { window.alert('Vérification impossible, réessaie plus tard.'); });
  }
  function revalidatePremium() {
    var p = read(KEYS.premium);
    if (!p || !state.config.premium.workerUrl || !C.needsRevalidation(p.validatedAt, Date.now())) return;
    validateLicense(p.key).then(function (valid) {
      if (valid) write(KEYS.premium, { key: p.key, validatedAt: Date.now() });
      else { try { localStorage.removeItem(KEYS.premium); } catch (e) {} }
    }).catch(function () {});
  }

  function showLocked(root) {
    window.__gameState = 'locked';
    var box = el('div', { class: 'gf-panel' });
    box.appendChild(el('h2', {}, 'Archive réservée au Pass Premium'));
    box.appendChild(el('p', {}, 'Les 7 derniers jours sont gratuits. Le Pass débloque toutes les archives, sans pub.'));
    root.appendChild(box);
  }

  function showInterstitial() {
    var overlay = el('div', { class: 'gf-overlay' });
    var inner = el('div', { class: 'gf-panel' });
    adSlot(inner);
    var close = el('button', { class: 'gf-btn', disabled: '' }, 'Fermer');
    setTimeout(function () { close.removeAttribute('disabled'); }, 3000);
    close.onclick = function () { overlay.remove(); };
    inner.appendChild(close);
    overlay.appendChild(inner);
    document.body.appendChild(overlay);
  }

  function showShare(found, total) {
    var text = C.formatShare({ title: state.content.title, found: found, total: total, ms: Date.now() - state.startedAt, url: location.href });
    var panel = el('div', { class: 'gf-panel gf-done' });
    panel.appendChild(el('h2', {}, 'Bravo ! 🎉'));
    panel.appendChild(el('pre', { class: 'gf-share-text' }, text));
    var btn = el('button', { class: 'gf-btn' }, 'Partager mon score');
    btn.onclick = function () {
      if (navigator.share) navigator.share({ text: text }).catch(function () {});
      else if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { btn.textContent = 'Copié !'; });
    };
    panel.appendChild(btn);
    panel.appendChild(el('a', { href: '../../', class: 'gf-link' }, 'Jouer à un autre jeu'));
    document.getElementById('game').appendChild(panel);
  }

  window.GF = {
    sleep: function (ms) { return new Promise(function (r) { setTimeout(r, ms || 0); }); },
    start: function (render) {
      var root = document.getElementById('game');
      Promise.all([
        fetch('../../config.json').then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; }),
        fetch('content.json').then(function (r) { return r.json(); }),
      ]).then(function (res) {
        state.config = Object.assign({ premium: {} }, res[0]);
        if (!state.config.premium) state.config.premium = {};
        state.content = res[1];
        window.GF.content = state.content;
        loadAdsScript();
        revalidatePremium();
        var header = el('header', { class: 'gf-header' });
        header.appendChild(el('h1', {}, state.content.title));
        header.appendChild(el('p', { class: 'gf-theme' }, state.content.theme));
        root.before(header);
        var top = el('div', { class: 'gf-ad' });
        root.before(top);
        adSlot(top);
        premiumFooter();
        if (C.isArchiveLocked(state.content.date, today(), isPremium())) return showLocked(root);
        render(state.content, root);
        state.startedAt = Date.now();
        window.__gameState = 'ready';
      }).catch(function (err) {
        console.error(err);
        window.__gameState = 'error';
        var root = document.getElementById('game');
        var errorPanel = el('div', { class: 'gf-panel' });
        errorPanel.appendChild(el('p', {}, 'Oups, ce jeu n\'a pas pu se charger. Réessaie dans un instant.'));
        root.appendChild(errorPanel);
      });
    },
    finish: function (o) {
      if (state.finished) return;
      state.finished = true;
      window.__gameState = 'complete';
      var completed = (read(KEYS.completed) || 0) + 1;
      write(KEYS.completed, completed);
      showShare(o.found, o.total);
      if (C.shouldShowInterstitial(completed, isPremium(), hasAds())) showInterstitial();
    },
    requestHint: function () {
      if (C.hintAllowed(state.hintsUsed, isPremium())) { state.hintsUsed += 1; return true; }
      var p = state.config.premium;
      window.alert(p && p.checkoutUrl ? 'Indices illimités avec le Pass Premium (' + p.price + ').' : "Plus d'indice pour ce jeu.");
      return false;
    },
  };
})();
