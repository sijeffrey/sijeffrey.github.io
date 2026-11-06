// Tic-tac-toe. Players: 1 = you (X) against the site (O), 2 = two people, 0 = the site against itself.
(function () {
  var root = document.getElementById("ttt");
  if (!root) return;

  var LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  // The only accepted answers. Anything else gets a fixed message and is never echoed back.
  var PLAYERS = { "0": 0, "zero": 0, "1": 1, "one": 1, "2": 2, "two": 2 };
  var GUIDE = "Type one to play the site, or two to play a friend.";
  var LABEL = "Number of players:";
  var INTRO = {
    1: "You are X and the site is O. It plays a perfect game, so the best you can do is draw.",
    2: "Two players, one screen. X goes first, then take turns.",
    0: "Zero players. The site will play against itself."
  };

  var $ = function (id) { return document.getElementById(id); };
  var boardEl = $("ttt-board"), statusEl = $("ttt-status"), scoreEl = $("ttt-score");
  var errorEl = $("ttt-error"), inputEl = $("ttt-players"), newBtn = $("ttt-new");
  var guideEl = $("ttt-guide"), labelEl = $("ttt-label"), introEl = $("ttt-intro");
  var cells = [];
  var board = ["", "", "", "", "", "", "", "", ""];
  var over = true, timer, turn, seq = 0;
  var players = 1;
  var self = null; // self-play state: { game, delay, draws, start }
  var score = JSON.parse(localStorage.getItem("ttt-score") || '{"you":0,"draw":0,"site":0}');

  // Typewriter: write text into `el` one letter at a time and resolve when done.
  // Each element holds a hidden copy of the full text for screen readers, and the
  // letter-by-letter copy is hidden from them, so a message is read once, in full.
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var TYPE_SPEED = 30;
  function typeText(el, text, speed) {
    if (speed === undefined) speed = TYPE_SPEED;
    if (!el._vis) {
      el.textContent = "";
      el._sr = document.createElement("span");
      el._sr.className = "sr-only";
      el._vis = document.createElement("span");
      el._vis.setAttribute("aria-hidden", "true");
      el.appendChild(el._sr);
      el.appendChild(el._vis);
    }
    clearTimeout(el._typing);
    if (el._done) el._done();
    el._vis.classList.remove("typing");
    el._sr.textContent = text;
    return new Promise(function (resolve) {
      el._done = function () { el._done = null; resolve(); };
      if (reduceMotion || !speed || !text) { el._vis.textContent = text; el._done(); return; }
      var n = 0;
      el._vis.textContent = "";
      el._vis.classList.add("typing");
      (function next() {
        el._vis.textContent = text.slice(0, ++n);
        if (n < text.length) el._typing = setTimeout(next, speed);
        else { el._vis.classList.remove("typing"); el._done(); }
      })();
    });
  }
  function say(text, speed) { return typeText(statusEl, text, speed); }

  function other(m) { return m === "X" ? "O" : "X"; }

  function winner(b) {
    for (var i = 0; i < LINES.length; i++) {
      var l = LINES[i];
      if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[0]] === b[l[2]]) return { mark: b[l[0]], line: l };
    }
    return b.indexOf("") === -1 ? { mark: "draw", line: [] } : null;
  }

  function empties(b) {
    var out = [];
    for (var i = 0; i < 9; i++) if (!b[i]) out.push(i);
    return out;
  }

  // Minimax: score every possible game to the end, assuming both sides play their best.
  // Scores are from the point of view of `me`. Depth makes it prefer a quick win and a slow loss.
  function minimax(b, turn, me, depth) {
    var w = winner(b);
    if (w) return w.mark === me ? 10 - depth : w.mark === "draw" ? 0 : depth - 10;
    var mine = turn === me;
    var best = mine ? -Infinity : Infinity;
    empties(b).forEach(function (i) {
      b[i] = turn;
      var s = minimax(b, other(turn), me, depth + 1);
      b[i] = "";
      best = mine ? Math.max(best, s) : Math.min(best, s);
    });
    return best;
  }

  // Best move for `me`, picking at random between equally good moves so games vary.
  function bestMove(b, me) {
    var best = -Infinity, moves = [];
    empties(b).forEach(function (i) {
      b[i] = me;
      var s = minimax(b, other(me), me, 1);
      b[i] = "";
      if (s > best) { best = s; moves = [i]; }
      else if (s === best) moves.push(i);
    });
    return moves[Math.floor(Math.random() * moves.length)];
  }

  function render(w) {
    for (var i = 0; i < 9; i++) {
      var c = cells[i];
      c.textContent = board[i];
      c.disabled = over || !!board[i] || players === 0;
      c.setAttribute("aria-label", "Square " + (i + 1) + (board[i] ? ", " + board[i] : ", empty"));
      c.classList.toggle("win", !!(w && w.line.indexOf(i) !== -1));
    }
    // New game only appears once the current game is over.
    newBtn.hidden = !over || !!self || !board.some(Boolean);
  }

  function showScore() {
    typeText(scoreEl, players === 1 ? "You " + score.you + " | Draws " + score.draw + " | Site " + score.site : "", 15);
  }

  function finish(w) {
    over = true;
    if (players === 1) {
      if (w.mark === "X") { score.you++; say("You win."); }
      else if (w.mark === "O") { score.site++; say("The site wins."); }
      else { score.draw++; say("Draw."); }
      localStorage.setItem("ttt-score", JSON.stringify(score));
      showScore();
    } else {
      say(w.mark === "draw" ? "Draw." : w.mark + " wins.");
    }
    render(w);
  }

  function play(i) {
    board[i] = turn;
    var w = winner(board);
    if (w) { finish(w); return true; }
    turn = other(turn);
    return false;
  }

  function prompt() {
    say(players === 1 ? "Your move." : turn + " to move.");
    render();
  }

  function siteTurn() {
    say("Thinking...");
    render();
    timer = setTimeout(function () {
      if (!play(bestMove(board, "O"))) prompt();
    }, 450);
  }

  function reset() {
    clearTimeout(timer);
    self = null;
    board = ["", "", "", "", "", "", "", "", ""];
    over = false;
  }

  function newGame() {
    reset();
    boardEl.hidden = false;
    if (players === 0) { startSelfPlay(); return; }
    turn = "X";
    prompt();
  }

  // Choose a mode: stop any game, type the intro for that mode, then start.
  function choose(mode) {
    var id = ++seq;
    players = mode;
    reset();
    over = true;
    boardEl.hidden = true;
    render();
    say("", 0);
    typeText(scoreEl, "", 0);
    typeText(introEl, INTRO[mode]).then(function () {
      if (id !== seq) return;
      newGame();
      showScore();
    });
  }

  // Self-play: both sides play perfectly. The first game moves every 0.5s and each
  // new game halves the delay. Once it is at full speed it keeps going until about
  // 30 seconds have passed.
  var SELF_START = 500, SELF_MIN = 1, SELF_RUN = 30000;

  function startSelfPlay() {
    self = { game: 1, delay: SELF_START, draws: 0, start: Date.now() };
    selfGame();
  }

  function selfGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    over = false;
    turn = Math.random() < 0.5 ? "X" : "O";
    say("Game " + self.game + ". Draws so far: " + self.draws + ".", self.delay >= 125 ? TYPE_SPEED : 0);
    render();
    (function step() {
      timer = setTimeout(function () {
        board[bestMove(board, turn)] = turn;
        var w = winner(board);
        render(w);
        if (!w) { turn = other(turn); step(); return; }
        if (w.mark === "draw") self.draws++;
        if (self.delay <= SELF_MIN && Date.now() - self.start >= SELF_RUN) {
          say(self.game + " games, " + self.draws + " draws. A strange game. The only winning move is not to play.", 60);
          self = null;
          over = true;
          render(w);
          return;
        }
        self.game++;
        self.delay = Math.max(SELF_MIN, Math.round(self.delay / 2));
        timer = setTimeout(selfGame, Math.max(self.delay * 2, 100));
      }, self.delay);
    })();
  }

  for (var i = 0; i < 9; i++) {
    var c = document.createElement("button");
    c.type = "button";
    c.className = "ttt-cell";
    c.dataset.i = i;
    c.addEventListener("click", function (e) {
      var i = +e.currentTarget.dataset.i;
      if (over || board[i] || players === 0) return;
      if (players === 1 && turn !== "X") return;
      if (play(i)) return;
      if (players === 1) siteTurn(); else prompt();
    });
    boardEl.appendChild(c);
    cells.push(c);
  }

  function answer() {
    var reply = inputEl.value.trim().toLowerCase();
    if (!Object.prototype.hasOwnProperty.call(PLAYERS, reply)) {
      typeText(errorEl, "Please enter one or two.");
      return;
    }
    typeText(errorEl, "", 0);
    inputEl.blur(); // closes the on-screen keyboard on phones
    choose(PLAYERS[reply]);
  }
  // There is no Play button: Enter answers the prompt.
  $("ttt-form").addEventListener("submit", function (e) { e.preventDefault(); answer(); });
  inputEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); answer(); }
  });
  // New game goes back to the prompt so the number of players can be chosen again.
  newBtn.addEventListener("click", function () {
    ++seq;
    reset();
    over = true;
    boardEl.hidden = true;
    render();
    say("", 0);
    typeText(introEl, "", 0);
    typeText(scoreEl, "", 0);
    typeText(errorEl, "", 0);
    inputEl.value = "";
    inputEl.focus({ preventScroll: true });
  });

  // On load: type the guidance and the prompt, then wait for an answer.
  render();
  typeText(guideEl, GUIDE)
    .then(function () { return typeText(labelEl, LABEL); })
    .then(function () {
      inputEl.classList.remove("ttt-wait");
      if (seq === 0) inputEl.focus({ preventScroll: true });
    });
  // Clicking anywhere on the prompt line puts the cursor in the answer. Enter submits.
  $("ttt-form").addEventListener("click", function () { inputEl.focus(); });
})();
