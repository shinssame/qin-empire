/* =========================================================
   ui.js
   -----------------------------------------------------------
   화면에 "어떻게 보여줄지"를 담당하는 파일입니다.
   게임 진행 로직(script.js)은 이 파일의 함수를 호출하기만 하고,
   실제 DOM 조작/애니메이션은 모두 여기서 처리합니다.
   ========================================================= */

/* ---------------------------------------------------------
   1) 타이핑 애니메이션
   --------------------------------------------------------- */

// 텍스트 속도 설정에 따른 글자당 지연 시간(ms)
const TYPE_SPEED_MS = {
  slow: 55,
  normal: 28,
  fast: 12,
};

// 현재 진행 중인 타이핑 타이머를 추적 (중복 실행 방지 및 스킵 처리를 위해)
let currentTypingTimer = null;
let isTyping = false;

/**
 * 대화창에 텍스트를 한 글자씩 타이핑하듯 출력합니다.
 * 대사가 짧으면 금방 끝나고, 길면 자연스럽게 타이핑 효과가 두드러집니다.
 * @param {HTMLElement} el - 텍스트를 표시할 요소 (dialogue-text)
 * @param {string} fullText - 전체 문장
 * @param {string} speedKey - "slow" | "normal" | "fast"
 * @param {Function} onDone - 타이핑이 끝났을 때 실행할 콜백
 */
function typeText(el, fullText, speedKey, onDone) {
  // 이전에 진행 중이던 타이핑이 있으면 즉시 정지
  clearTimeout(currentTypingTimer);
  el.textContent = "";
  isTyping = true;

  const delay = TYPE_SPEED_MS[speedKey] || TYPE_SPEED_MS.normal;
  let i = 0;

  function step() {
    if (i < fullText.length) {
      el.textContent += fullText.charAt(i);
      i++;
      currentTypingTimer = setTimeout(step, delay);
    } else {
      isTyping = false;
      if (onDone) onDone();
    }
  }
  step();
}

/**
 * 타이핑 중일 때 화면을 클릭하면 즉시 전체 문장을 표시(스킵)합니다.
 */
function skipTyping(el, fullText, onDone) {
  clearTimeout(currentTypingTimer);
  isTyping = false;
  el.textContent = fullText;
  if (onDone) onDone();
}

function getIsTyping() {
  return isTyping;
}

/* ---------------------------------------------------------
   2) 능력치 바 애니메이션
   --------------------------------------------------------- */

/**
 * 능력치 객체를 받아 화면의 게이지(바)를 애니메이션과 함께 갱신합니다.
 * CSS의 transition(width 0.8s ease)이 실제 "움직이는" 효과를 담당합니다.
 * @param {Object} stats - { wangkwon, minsim, gunsa, jaejeong, ... }
 */
function updateStatBars(stats) {
  const keys = ["wangkwon", "minsim", "gunsa", "jaejeong"];
  keys.forEach((key) => {
    const fillEl = document.getElementById("fill-" + key);
    if (!fillEl) return;
    const value = clampStat(stats[key]);
    fillEl.style.width = value + "%";
  });
}

/** 능력치 값을 0~100 사이로 제한합니다. */
function clampStat(v) {
  return Math.max(0, Math.min(100, v));
}

/* ---------------------------------------------------------
   3) 배경 / NPC 이미지 Fade 전환
   --------------------------------------------------------- */

/**
 * 배경 이미지를 부드럽게(Fade) 교체합니다.
 * @param {string} url - images/bg/*.svg (또는 교사가 넣은 jpg/png)
 */
function setBackground(url) {
  const layer = document.getElementById("bg-layer");
  if (!layer || !url) return;
  // 이미 같은 배경이면 다시 fade 하지 않음 (불필요한 깜빡임 방지)
  if (layer.dataset.currentUrl === url) return;

  layer.style.opacity = "0";
  setTimeout(() => {
    layer.style.backgroundImage = `url("${url}")`;
    layer.dataset.currentUrl = url;
    layer.style.opacity = "1";
  }, 300); // style.css 의 transition 시간(0.6s)의 절반 지점에서 이미지 교체
}

/**
 * NPC 이미지를 부드럽게(Fade) 교체하거나, null이면 화면에서 사라지게 합니다.
 * @param {string|null} url
 */
function setNpcImage(url) {
  const img = document.getElementById("npc-image");
  if (!img) return;

  if (!url) {
    img.classList.add("hidden");
    return;
  }

  img.classList.add("hidden");
  setTimeout(() => {
    img.src = url;
    img.onerror = () => {
      // 이미지 파일이 없을 경우 조용히 숨김 처리 (교사가 이미지를 아직 안 넣은 경우 대비)
      img.classList.add("hidden");
    };
    img.classList.remove("hidden");
  }, 200);
}

/* ---------------------------------------------------------
   4) 효과음
   --------------------------------------------------------- */

/**
 * 효과음을 재생합니다. 설정에서 꺼져 있으면 아무 동작도 하지 않습니다.
 * 사운드 파일이 /sfx 폴더에 없어도 오류 없이 조용히 무시됩니다.
 * @param {string} elementId - "sfx-click" | "sfx-choice" | "sfx-chapter"
 * @param {boolean} soundOn - 현재 효과음 설정 값
 */
function playSfx(elementId, soundOn) {
  if (!soundOn) return;
  const audio = document.getElementById(elementId);
  if (!audio) return;
  try {
    audio.currentTime = 0;
    audio.play().catch(() => {
      /* 사운드 파일이 없거나 브라우저 자동재생 정책에 막힌 경우 무시 */
    });
  } catch (e) {
    /* 무시 */
  }
}

/* ---------------------------------------------------------
   5) 챕터 전환 배너
   --------------------------------------------------------- */

/**
 * 화면 중앙에 "제n장 · 제목" 배너를 잠깐 띄웠다 사라지게 합니다(Fade).
 * @param {string} text
 * @param {Function} onDone - 배너가 사라진 뒤 실행할 콜백
 */
function showChapterBanner(text, onDone) {
  const banner = document.getElementById("chapter-banner");
  const textEl = document.getElementById("chapter-banner-text");
  textEl.textContent = text;
  banner.classList.add("show");

  setTimeout(() => {
    banner.classList.remove("show");
    setTimeout(() => {
      if (onDone) onDone();
    }, 600); // fade-out 시간만큼 대기 후 콜백
  }, 1800); // 배너가 화면에 보이는 시간
}

/* ---------------------------------------------------------
   6) 선택지 버튼 렌더링
   --------------------------------------------------------- */

/**
 * 선택지 배열을 받아 버튼들을 생성하고, 클릭 시 콜백을 실행합니다.
 * @param {Array} choices - scenario.js 의 choices 배열
 * @param {Function} onSelect - (choice, index) => void
 */
function renderChoices(choices, onSelect) {
  const container = document.getElementById("choice-container");
  container.innerHTML = "";

  choices.forEach((choice, idx) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = choice.text;
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // 대화창 클릭(다음으로 넘기기) 이벤트와 겹치지 않도록
      onSelect(choice, idx);
    });
    container.appendChild(btn);
  });

  container.classList.remove("hidden");
  // 다음 프레임에 show 클래스를 붙여 fade-in 애니메이션이 실제로 보이게 함
  requestAnimationFrame(() => container.classList.add("show"));
}

/** 선택지 버튼 영역을 감춥니다. */
function hideChoices() {
  const container = document.getElementById("choice-container");
  container.classList.remove("show");
  container.classList.add("hidden");
  container.innerHTML = "";
}
