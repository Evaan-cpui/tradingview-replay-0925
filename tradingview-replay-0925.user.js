// ==UserScript==
// @name         TradingView Replay - jour aléatoire à 9h25
// @namespace    replay-0925
// @version      1.1
// @description  Un clic (ou Alt+R) : Replay sur un jour aléatoire, calé sur la bougie juste avant l'open de 9h30.
// @homepageURL  https://github.com/Evaan-cpui/tradingview-replay-0925
// @updateURL    https://raw.githubusercontent.com/Evaan-cpui/tradingview-replay-0925/main/tradingview-replay-0925.user.js
// @downloadURL  https://raw.githubusercontent.com/Evaan-cpui/tradingview-replay-0925/main/tradingview-replay-0925.user.js
// @match        https://*.tradingview.com/chart/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // ===== RÉGLAGES =====
  // Heure tapée dans "Select date", dans le fuseau horaire de TON graphique.
  // Graphique en New York (UTC-5) : '09:25'. Graphique en heure de Paris : '15:25'.
  const HEURE = '09:25';
  // Le jour est tiré au hasard parmi les X derniers jours.
  // Ton historique 5 min en Replay remonte à ~2,5 ans : au-delà, TradingView ignore la date.
  const JOURS_HISTORIQUE = 850;
  const RACCOURCI = (e) => e.altKey && e.code === 'KeyR'; // Alt+R
  // ====================

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  async function waitFor(fn, timeout = 5000) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeout) {
      const v = fn();
      if (v) return v;
      await sleep(100);
    }
    return null;
  }

  function visible(el) {
    return el && el.getBoundingClientRect().width > 0;
  }

  function randomWeekday() {
    const max = Date.now() - 86400000; // hier
    const min = Date.now() - JOURS_HISTORIQUE * 86400000;
    let d;
    do {
      d = new Date(min + Math.random() * (max - min));
    } while (d.getUTCDay() === 0 || d.getUTCDay() === 6);
    return d.toISOString().slice(0, 10);
  }

  // Remplit un input React (une simple affectation de .value ne suffit pas).
  function setInput(input, value) {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    input.focus();
    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.blur();
  }

  function findDateDialog() {
    return [...document.querySelectorAll('[data-dialog-name], [class*="dialog"]')].find(
      (d) => visible(d) && d.querySelector('input[placeholder="YYYY-MM-DD"]')
    );
  }

  async function go() {
    // 1. Activer le Replay si besoin
    let modeBtn = document.querySelector('[class*="selectDateBar__modeButton"]');
    if (!visible(modeBtn)) {
      const replayBtn = document.getElementById('header-toolbar-replay');
      if (!replayBtn) return toast('Bouton Replay introuvable');
      replayBtn.click();
      modeBtn = await waitFor(() => {
        const b = document.querySelector('[class*="selectDateBar__modeButton"]');
        return visible(b) && b;
      });
      if (!modeBtn) return toast('Barre du Replay introuvable');
    }

    // 2. Ouvrir le menu et choisir "Date…"
    modeBtn.click();
    const dateItem = await waitFor(() =>
      [...document.querySelectorAll('[role="menuitemcheckbox"], [role="menuitem"]')].find(
        (e) => visible(e) && /^(Date|Sélectionner une date)/i.test(e.textContent.trim())
      )
    );
    if (!dateItem) return toast('Option "Date…" introuvable');
    dateItem.click();

    // 3. Remplir date + heure et valider
    const dlg = await waitFor(findDateDialog);
    if (!dlg) return toast('Fenêtre "Select date" introuvable');
    const inputs = dlg.querySelectorAll('input');
    const date = randomWeekday();
    setInput(inputs[0], date);
    await sleep(200);
    if (inputs[1]) setInput(inputs[1], HEURE);
    await sleep(200);
    const ok =
      dlg.querySelector('[data-name="submit-button"]') ||
      [...dlg.querySelectorAll('button')].find((b) => /^(Select|Sélectionner)$/i.test(b.textContent.trim()));
    if (!ok) return toast('Bouton "Select" introuvable');
    ok.click();
    toast('Replay : ' + date + ' à ' + HEURE);
  }

  function toast(msg) {
    const t = document.createElement('div');
    t.textContent = msg;
    Object.assign(t.style, {
      position: 'fixed', bottom: '90px', left: '50%', transform: 'translateX(-50%)',
      background: '#2962ff', color: '#fff', padding: '8px 14px', borderRadius: '6px',
      font: '13px sans-serif', zIndex: 99999,
    });
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  }

  // Bouton flottant
  function addButton() {
    if (document.getElementById('replay-0925-btn')) return;
    const b = document.createElement('button');
    b.id = 'replay-0925-btn';
    b.textContent = '🎲 9h25';
    b.title = 'Replay sur un jour aléatoire, juste avant l\'open (Alt+R)';
    Object.assign(b.style, {
      position: 'fixed', bottom: '48px', right: '70px', zIndex: 99999,
      background: '#2962ff', color: '#fff', border: 'none', borderRadius: '6px',
      padding: '6px 12px', font: 'bold 13px sans-serif', cursor: 'pointer', opacity: '0.9',
    });
    b.addEventListener('click', go);
    document.body.appendChild(b);
  }

  document.addEventListener('keydown', (e) => {
    if (RACCOURCI(e)) {
      e.preventDefault();
      e.stopPropagation();
      go();
    }
  }, true);

  addButton();
  setInterval(addButton, 3000);
})();
