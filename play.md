---
layout: default
title: Play
permalink: /play/
description: Tic-tac-toe against this site.
sitemap: false
scripts:
  - /assets/js/tictactoe.js
---

# Tic-tac-toe

<div class="ttt" id="ttt">
  <p class="ttt-guide" id="ttt-guide"></p>
  <form class="ttt-prompt" id="ttt-form" autocomplete="off">
    <span class="ttt-label" id="ttt-label" aria-hidden="true"></span>
    <input id="ttt-players" class="ttt-wait" type="text" enterkeyhint="go" inputmode="text" maxlength="5" spellcheck="false" autocapitalize="off" aria-label="Number of players">
  </form>
  <p class="ttt-error meta" id="ttt-error" aria-live="polite"></p>
  <p class="ttt-intro" id="ttt-intro"></p>
  <div class="ttt-board" id="ttt-board" role="grid" aria-label="Tic-tac-toe board" hidden></div>
  <p class="ttt-status" id="ttt-status" aria-live="polite"></p>
  <div class="ttt-controls">
    <button type="button" id="ttt-new" hidden>New game</button>
  </div>
  <p class="ttt-score meta" id="ttt-score"></p>
</div>

<noscript><p>The game needs JavaScript.</p></noscript>
