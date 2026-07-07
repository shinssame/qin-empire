/* =========================================================
   script.js
   -----------------------------------------------------------
   게임 전체를 지휘하는 메인 로직입니다.
   scenario.js(데이터) + ui.js(화면 표현) + save.js(저장)
   + ending.js(엔딩 계산)를 서로 연결합니다.

   교사 안내: 챕터를 추가/삭제하고 싶다면
   CHAPTER_ORDER 배열과 scenario.js 의 chapterN 객체만
   함께 수정하면 됩니다.
   ========================================================= */

// 시나리오 상 챕터들의 순서 (scenario.js 의 키 이름과 일치해야 함)
const CHAPTER_ORDER = ["chapter1", "chapter2", "chapter3", "chapter4", "chapter5"];

// ---------------------------------------------------------
// 게임 상태(State) - 이 객체가 저장/불러오기의 대상입니다.
// ---------------------------------------------------------
let gameState = {
  location: "opening",     // "opening" | "chapter" | "ending"
  chapterNum: 1,           // 1 ~ 5
  sceneIndex: 0,           // 현재 챕터(또는 오프닝) 안에서의 씬 인덱스
  stats: { ...INITIAL_STATS },
  history: [],             // 선택 로그: [{chapter, choiceText}, ...]
};

// 효과음 on/off, 텍스트 속도 등 사용자 설정
let settings = loadSettings();

// 현재 화면에 선택지가 떠 있는지, 결과 텍스트 응답 대기 중인지 등을 추적
let uiFlags = {
  choicesVisible: false,
  awaitingResultAdvance: false,
};

/* ---------------------------------------------------------
   화면 전환 헬퍼
   --------------------------------------------------------- */
function showScreen(id) {
  document.querySelectorAll(".screen").forEach((el) => el.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* ---------------------------------------------------------
   초기화 (페이지 로드 시 1회 실행)
   --------------------------------------------------------- */
function initApp() {
  // 저장된 데이터가 있으면 "이어하기" 버튼 활성화
  document.getElementById("btn-continue").disabled = !hasSaveData();

  // 설정값을 화면에 반영
  applySettingsToUI();

  bindTitleEvents();
  bindSettingsEvents();
  bindGameEvents();
  bindEndingEvents();

  showScreen("screen-title");
}

/* ---------------------------------------------------------
   타이틀 화면 이벤트
   --------------------------------------------------------- */
function bindTitleEvents() {
  document.getElementById("btn-new-game").addEventListener("click", startNewGame);
  document.getElementById("btn-continue").addEventListener("click", continueGame);
  document.getElementById("btn-open-settings").addEventListener("click", () => {
    document.body.dataset.beforeSettings = "screen-title";
    showScreen("screen-settings");
  });
}

function startNewGame() {
  // 새 게임 시작: 상태를 초기값으로 리셋
  gameState = {
    location: "opening",
    chapterNum: 1,
    sceneIndex: 0,
    stats: { ...INITIAL_STATS },
    history: [],
  };
  saveGame(gameState);
  showScreen("screen-game");
  renderCurrentScene();
}

function continueGame() {
  const saved = loadGame();
  if (!saved) {
    // 혹시 데이터가 손상되었거나 없는 경우 새 게임으로 대체
    startNewGame();
    return;
  }
  gameState = saved;
  showScreen("screen-game");

  if (gameState.location === "ending") {
    renderEndingScreen();
  } else {
    renderCurrentScene();
  }
}

/* ---------------------------------------------------------
   설정 화면 이벤트
   --------------------------------------------------------- */
function bindSettingsEvents() {
  document.getElementById("btn-close-settings").addEventListener("click", () => {
    // 설정 화면은 타이틀/게임 도중 모두에서 열릴 수 있으므로,
    // 열기 직전에 기록해둔 화면(beforeSettings)으로 되돌아갑니다.
    showScreen(document.body.dataset.beforeSettings || "screen-title");
  });

  document.getElementById("btn-toggle-sound").addEventListener("click", (e) => {
    settings.soundOn = !settings.soundOn;
    saveSettings(settings);
    applySettingsToUI();
  });

  document.querySelectorAll(".speed-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      settings.textSpeed = btn.dataset.speed;
      saveSettings(settings);
      applySettingsToUI();
    });
  });

  document.getElementById("btn-reset-save").addEventListener("click", () => {
    const ok = confirm("정말로 저장 데이터를 삭제하고 처음부터 다시 시작할까요?");
    if (ok) {
      deleteSave();
      document.getElementById("btn-continue").disabled = true;
      alert("저장 데이터가 삭제되었습니다.");
    }
  });
}

/** 설정 값(sound/speed)을 버튼 UI에 반영합니다. */
function applySettingsToUI() {
  const soundBtn = document.getElementById("btn-toggle-sound");
  soundBtn.textContent = settings.soundOn ? "ON" : "OFF";
  soundBtn.dataset.on = settings.soundOn ? "true" : "false";

  document.querySelectorAll(".speed-btn").forEach((btn) => {
    btn.classList.toggle("selected", btn.dataset.speed === settings.textSpeed);
  });
}

/* ---------------------------------------------------------
   게임 화면 이벤트 (대화 진행, 메뉴 등)
   --------------------------------------------------------- */
function bindGameEvents() {
  // 대화창 클릭 -> 타이핑 스킵 또는 다음 씬으로 진행
  document.getElementById("dialogue-box").addEventListener("click", onDialogueClick);

  // 상단 메뉴(햄버거) 버튼
  document.getElementById("btn-ingame-menu").addEventListener("click", (e) => {
    e.stopPropagation();
    const popup = document.getElementById("ingame-menu-popup");
    const opening = !popup.classList.contains("show");
    popup.classList.toggle("show", opening);
    popup.dataset.opened = opening ? "true" : "false";
  });

  document.getElementById("btn-close-menu").addEventListener("click", () => {
    closeIngameMenu();
  });

  document.getElementById("btn-do-save").addEventListener("click", () => {
    saveGame(gameState);
    const btn = document.getElementById("btn-do-save");
    const original = btn.textContent;
    btn.textContent = "저장되었습니다!";
    setTimeout(() => (btn.textContent = original), 1200);
  });

  document.getElementById("btn-open-settings-2").addEventListener("click", () => {
    document.body.dataset.beforeSettings = "screen-game";
    closeIngameMenu();
    showScreen("screen-settings");
  });

  document.getElementById("btn-to-title").addEventListener("click", () => {
    const ok = confirm("타이틀 화면으로 나가시겠습니까? (진행 상황은 마지막 저장 시점까지 남습니다)");
    if (ok) {
      closeIngameMenu();
      document.getElementById("btn-continue").disabled = !hasSaveData();
      showScreen("screen-title");
    }
  });
}

function closeIngameMenu(clearFlag = true) {
  const popup = document.getElementById("ingame-menu-popup");
  popup.classList.remove("show");
  if (clearFlag) popup.dataset.opened = "false";
}

/* ---------------------------------------------------------
   씬(scene) 렌더링 - 게임의 핵심 로직
   --------------------------------------------------------- */

/** 현재 위치(오프닝/챕터)에 해당하는 씬 배열을 반환합니다. */
function getCurrentSceneList() {
  if (gameState.location === "opening") {
    return SCENARIO.opening;
  }
  const key = CHAPTER_ORDER[gameState.chapterNum - 1];
  return SCENARIO[key].scenes;
}

/** 현재 sceneIndex 에 해당하는 씬을 화면에 표시합니다. */
function renderCurrentScene() {
  const list = getCurrentSceneList();

  // 현재 챕터(또는 오프닝)의 씬을 모두 소진한 경우 -> 다음 단계로 진행
  if (gameState.sceneIndex >= list.length) {
    advanceStage();
    return;
  }

  const scene = list[gameState.sceneIndex];
  hideChoices();
  uiFlags.choicesVisible = false;
  uiFlags.awaitingResultAdvance = false;

  // 배경 / NPC 이미지 반영 (Fade 전환은 ui.js 내부에서 처리)
  setBackground(scene.bg);
  setNpcImage(scene.npc);

  // 화자 이름 표시
  const speakerEl = document.getElementById("speaker-name");
  if (scene.speaker) {
    speakerEl.textContent = scene.speaker;
    speakerEl.classList.remove("hidden");
  } else {
    speakerEl.classList.add("hidden");
  }

  // 대사 타이핑 애니메이션
  const textEl = document.getElementById("dialogue-text");
  document.getElementById("continue-indicator").classList.add("hidden");

  typeText(textEl, scene.text, settings.textSpeed, () => {
    // 타이핑이 끝난 후: 선택지가 있으면 선택지를 보여주고, 없으면 "다음" 화살표 표시
    if (scene.choices && scene.choices.length > 0) {
      uiFlags.choicesVisible = true;
      renderChoices(scene.choices, onChoiceSelected);
    } else {
      document.getElementById("continue-indicator").classList.remove("hidden");
    }
  });

  // 매 씬마다 자동 저장 (교사/학생이 중간에 브라우저를 닫아도 이어할 수 있도록)
  saveGame(gameState);
}

/** 대화창을 클릭했을 때의 동작 */
function onDialogueClick() {
  // 인게임 메뉴가 열려 있는 상태라면, 대화 진행 대신 메뉴만 닫습니다.
  const menuPopup = document.getElementById("ingame-menu-popup");
  if (menuPopup.classList.contains("show")) {
    closeIngameMenu();
    return;
  }

  const textEl = document.getElementById("dialogue-text");
  const list = getCurrentSceneList();
  const scene = list[gameState.sceneIndex];
  if (!scene) return;

  // 1) 타이핑 중이면 -> 즉시 전체 텍스트 표시
  if (getIsTyping()) {
    skipTyping(textEl, uiFlags.awaitingResultAdvance ? uiFlags.resultTextCache : scene.text, () => {
      if (!uiFlags.awaitingResultAdvance && scene.choices && scene.choices.length > 0) {
        uiFlags.choicesVisible = true;
        renderChoices(scene.choices, onChoiceSelected);
      } else if (!uiFlags.choicesVisible) {
        document.getElementById("continue-indicator").classList.remove("hidden");
      }
    });
    return;
  }

  // 2) 선택지가 떠 있는 상태에서는 대화창 클릭으로 진행되지 않음 (버튼을 눌러야 함)
  if (uiFlags.choicesVisible) return;

  // 3) 선택 결과 문구를 보여준 뒤 다음 진행을 기다리는 상태였다면 -> 이제 실제로 다음 씬으로 이동
  if (uiFlags.awaitingResultAdvance) {
    uiFlags.awaitingResultAdvance = false;
    gameState.sceneIndex++;
    renderCurrentScene();
    return;
  }

  // 4) 평범한 대사였다면 -> 다음 씬으로 이동
  playSfx("sfx-click", settings.soundOn);
  gameState.sceneIndex++;
  renderCurrentScene();
}

/** 선택지를 클릭했을 때의 동작 */
function onChoiceSelected(choice) {
  playSfx("sfx-choice", settings.soundOn);

  // 능력치에 선택 효과 반영
  applyEffects(choice.effects);
  updateStatBars(gameState.stats);

  // 선택 로그 기록 (교사가 학생 플레이를 되짚어볼 때 활용 가능)
  gameState.history.push({
    chapter: gameState.chapterNum,
    location: gameState.location,
    choiceText: choice.text,
  });

  hideChoices();
  uiFlags.choicesVisible = false;

  const textEl = document.getElementById("dialogue-text");
  document.getElementById("speaker-name").classList.add("hidden");

  if (choice.resultText) {
    // 결과 지문을 잠깐 보여준 뒤, 클릭하면 다음 씬으로 이동
    uiFlags.awaitingResultAdvance = true;
    uiFlags.resultTextCache = choice.resultText;
    typeText(textEl, choice.resultText, settings.textSpeed, () => {
      document.getElementById("continue-indicator").classList.remove("hidden");
    });
    saveGame(gameState);
  } else {
    gameState.sceneIndex++;
    renderCurrentScene();
  }
}

/** 선택 효과(effects)를 현재 능력치에 더하고 0~100 범위로 보정합니다. */
function applyEffects(effects) {
  if (!effects) return;
  Object.keys(effects).forEach((key) => {
    if (gameState.stats[key] === undefined) return;
    gameState.stats[key] = clampStat(gameState.stats[key] + effects[key]);
  });
}

/* ---------------------------------------------------------
   단계 전환 (오프닝 -> 챕터1 -> ... -> 챕터5 -> 엔딩)
   --------------------------------------------------------- */
function advanceStage() {
  if (gameState.location === "opening") {
    gameState.location = "chapter";
    gameState.chapterNum = 1;
    gameState.sceneIndex = 0;
    playSfx("sfx-chapter", settings.soundOn);
    showChapterBanner(SCENARIO[CHAPTER_ORDER[0]].title, renderCurrentScene);
    saveGame(gameState);
    return;
  }

  if (gameState.location === "chapter") {
    if (gameState.chapterNum < CHAPTER_ORDER.length) {
      gameState.chapterNum++;
      gameState.sceneIndex = 0;
      playSfx("sfx-chapter", settings.soundOn);
      const nextTitle = SCENARIO[CHAPTER_ORDER[gameState.chapterNum - 1]].title;
      showChapterBanner(nextTitle, renderCurrentScene);
      saveGame(gameState);
    } else {
      // 마지막 챕터까지 끝났다면 -> 엔딩으로 이동
      gameState.location = "ending";
      saveGame(gameState);
      renderEndingScreen();
    }
  }
}

/* ---------------------------------------------------------
   엔딩 화면
   --------------------------------------------------------- */
function bindEndingEvents() {
  document.getElementById("btn-show-history").addEventListener("click", () => {
    document.getElementById("history-compare").classList.remove("hidden");
    document.getElementById("btn-show-history").classList.add("hidden");
  });

  document.getElementById("btn-restart").addEventListener("click", () => {
    const ok = confirm("처음부터 다시 시작할까요? 현재 저장 데이터는 새 게임으로 덮어써집니다.");
    if (ok) {
      startNewGame();
    }
  });
}

function renderEndingScreen() {
  const ending = calculateEnding(gameState.stats);

  document.getElementById("ending-title").textContent = ending.title;
  document.getElementById("ending-summary").textContent = ending.summary;
  document.getElementById("history-title").textContent = ending.historyTitle;
  document.getElementById("history-text").textContent = ending.historyText;

  // 역사 비교는 다시 숨겨진 상태로 리셋 (버튼을 눌러야 보이도록)
  document.getElementById("history-compare").classList.add("hidden");
  document.getElementById("btn-show-history").classList.remove("hidden");

  renderEndingStats(gameState.stats);

  showScreen("screen-ending");
}

/** 엔딩 화면에 공개+숨김 능력치 7가지를 모두 막대그래프로 보여줍니다. */
function renderEndingStats(stats) {
  const labels = {
    wangkwon: "황권",
    minsim: "민심",
    gunsa: "군사",
    jaejeong: "재정",
    gwijok: "귀족 불만",
    baekseong: "백성 불만",
    yusaeng: "유생 반발",
  };

  const container = document.getElementById("ending-stats");
  container.innerHTML = "";

  Object.keys(labels).forEach((key) => {
    const value = clampStat(stats[key]);
    const row = document.createElement("div");
    row.className = "ending-stat-row";
    row.innerHTML = `
      <span class="stat-name">${labels[key]}</span>
      <div class="stat-bar"><div class="stat-fill" style="width:${value}%"></div></div>
      <span class="stat-value">${value}</span>
    `;
    container.appendChild(row);
  });
}

/* ---------------------------------------------------------
   앱 시작
   --------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", initApp);
