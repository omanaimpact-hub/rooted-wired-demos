/* ============================================================
   "Make It Yours" personalizer
   Lets a visitor preview this demo site with their own org name,
   tagline, and brand colors — then claim it via /claim.html.

   Loaded per site with:
   <script src="../shared/claim.js" defer
           data-site="marigold"
           data-site-label="Marigold Health Navigators"
           data-claim-url="../claim.html"></script>
   ============================================================ */

(function () {
  'use strict';

  var script = document.currentScript;
  if (!script) return;

  var SITE = script.getAttribute('data-site') || '';
  var SITE_LABEL = script.getAttribute('data-site-label') || document.title;
  var CLAIM_URL = script.getAttribute('data-claim-url') || '../claim.html';

  /* ---------- Color helpers ---------- */

  function hexToHsl(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.replace(/./g, function (c) { return c + c; });
    var r = parseInt(hex.slice(0, 2), 16) / 255;
    var g = parseInt(hex.slice(2, 4), 16) / 255;
    var b = parseInt(hex.slice(4, 6), 16) / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  function hslToCss(h) {
    return 'hsl(' + Math.round(h.h) + ', ' + Math.round(h.s) + '%, ' + Math.round(h.l) + '%)';
  }

  function shade(hex, lightness) {
    var h = hexToHsl(hex);
    h.l = lightness;
    return hslToCss(h);
  }

  /* ---------- Snapshot originals for reset ---------- */

  var marked = [];
  document.querySelectorAll('[data-org-name], [data-org-tagline]').forEach(function (el) {
    marked.push({ el: el, html: el.innerHTML });
  });
  var originalTitle = document.title;
  var rootStyle = document.documentElement.style;

  /* ---------- Build UI ---------- */

  var fab = document.createElement('button');
  fab.className = 'claim-fab';
  fab.type = 'button';
  fab.setAttribute('aria-expanded', 'false');
  fab.innerHTML = '<span class="claim-fab__dot" aria-hidden="true"></span>Make this site yours';

  var panel = document.createElement('div');
  panel.className = 'claim-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Personalize this site');
  panel.innerHTML =
    '<button class="claim-panel__close" type="button" aria-label="Close">✕</button>' +
    '<h3>See it as yours</h3>' +
    '<p class="claim-panel__sub">Type your organization’s name and pick your colors — this page updates instantly. Nothing is stored.</p>' +
    '<div class="claim-field"><label for="claim-org">Organization name</label>' +
    '<input type="text" id="claim-org" maxlength="60" placeholder="e.g. Bright Futures Center"></div>' +
    '<div class="claim-field"><label for="claim-tagline">Tagline <span style="text-transform:none;font-weight:400">(optional)</span></label>' +
    '<input type="text" id="claim-tagline" maxlength="90" placeholder="e.g. Hope starts here"></div>' +
    '<div class="claim-colors">' +
    '<div class="claim-field"><label for="claim-primary">Primary color</label><input type="color" id="claim-primary" value="#879571"></div>' +
    '<div class="claim-field"><label for="claim-secondary">Deep color</label><input type="color" id="claim-secondary" value="#3a3f45"></div>' +
    '</div>' +
    '<div class="claim-panel__actions">' +
    '<button class="claim-btn claim-btn--apply" type="button">Preview it</button>' +
    '<button class="claim-btn claim-btn--reset" type="button">Reset</button>' +
    '</div>' +
    '<p class="claim-panel__note">A live preview only — refresh the page to undo everything.</p>';

  var bar = document.createElement('div');
  bar.className = 'claim-bar';
  bar.innerHTML =
    '<p><strong data-claim-bar-org>This could be your website.</strong>Customized and live on your domain in about 7 days.</p>' +
    '<a class="claim-bar__cta" href="' + CLAIM_URL + '?site=' + encodeURIComponent(SITE) + '">Claim this site — from $1,500</a>' +
    '<button class="claim-bar__dismiss" type="button" aria-label="Dismiss">✕</button>';

  document.body.appendChild(fab);
  document.body.appendChild(panel);
  document.body.appendChild(bar);

  /* ---------- Behavior ---------- */

  function openPanel() {
    panel.classList.add('is-open');
    fab.setAttribute('aria-expanded', 'true');
    var first = panel.querySelector('#claim-org');
    if (first) first.focus();
  }

  function closePanel() {
    panel.classList.remove('is-open');
    fab.setAttribute('aria-expanded', 'false');
  }

  fab.addEventListener('click', function () {
    panel.classList.contains('is-open') ? closePanel() : openPanel();
  });
  panel.querySelector('.claim-panel__close').addEventListener('click', closePanel);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePanel();
  });

  /* Demo-strip / anywhere trigger */
  document.querySelectorAll('[data-claim-open]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      openPanel();
    });
  });

  function apply() {
    var org = panel.querySelector('#claim-org').value.trim();
    var tagline = panel.querySelector('#claim-tagline').value.trim();
    var primary = panel.querySelector('#claim-primary').value;
    var secondary = panel.querySelector('#claim-secondary').value;

    if (org) {
      document.querySelectorAll('[data-org-name]').forEach(function (el) {
        el.textContent = org;
      });
      document.title = org + (tagline ? ' — ' + tagline : '');
      var barOrg = bar.querySelector('[data-claim-bar-org]');
      if (barOrg) barOrg.textContent = 'This could be ' + org + '’s website.';
    }
    if (tagline) {
      document.querySelectorAll('[data-org-tagline]').forEach(function (el) {
        el.textContent = tagline;
      });
    }

    /* Swap theme tokens. accent-ink darkened for small-text contrast,
       accent-soft lightened for tint panels, deep clamped dark. */
    var p = hexToHsl(primary);
    rootStyle.setProperty('--accent', shade(primary, Math.min(p.l, 55)));
    rootStyle.setProperty('--accent-ink', shade(primary, Math.min(p.l, 32)));
    rootStyle.setProperty('--accent-soft', shade(primary, 92));
    var s = hexToHsl(secondary);
    rootStyle.setProperty('--deep', shade(secondary, Math.min(s.l, 26)));

    /* Update claim link with org */
    var cta = bar.querySelector('.claim-bar__cta');
    cta.href = CLAIM_URL + '?site=' + encodeURIComponent(SITE) +
      (org ? '&org=' + encodeURIComponent(org) : '');

    closePanel();
    bar.classList.add('is-visible');
  }

  function reset() {
    marked.forEach(function (m) { m.el.innerHTML = m.html; });
    document.title = originalTitle;
    ['--accent', '--accent-ink', '--accent-soft', '--deep'].forEach(function (v) {
      rootStyle.removeProperty(v);
    });
    bar.classList.remove('is-visible');
    var barOrg = bar.querySelector('[data-claim-bar-org]');
    if (barOrg) barOrg.textContent = 'This could be your website.';
  }

  panel.querySelector('.claim-btn--apply').addEventListener('click', apply);
  panel.querySelector('.claim-btn--reset').addEventListener('click', reset);
  bar.querySelector('.claim-bar__dismiss').addEventListener('click', function () {
    bar.classList.remove('is-visible');
  });

  /* Enter key applies from any panel input */
  panel.querySelectorAll('input').forEach(function (input) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); apply(); }
    });
  });
})();
