/* =========================================================
   save.js
   -----------------------------------------------------------
   localStorage를 이용한 저장 / 이어하기 시스템입니다.
   교사가 수정할 때 알아두면 좋은 점:
   - SAVE_KEY 값만 바꾸면 여러 게임을 한 브라우저에 공존시킬 수 있습니다.
   - saveGame() 은 gameState 전체를 JSON으로 직렬화하여 저장합니다.
   - loadGame() 은 저장된 데이터가 없으면 null 을 반환합니다.
   ========================================================= */

// localStorage에 저장될 때 사용하는 키 이름 (충돌 방지를 위해 특수한 이름 사용)
const SAVE_KEY = "joseon_rpg_save_v1";

/**
 * 현재 게임 상태(gameState)를 localStorage에 저장합니다.
 * @param {Object} state - script.js 의 gameState 객체
 */
function saveGame(state) {
  try {
    const payload = {
      ...state,
      savedAt: new Date().toISOString(), // 저장 시각 기록 (이어하기 화면에 표시용)
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    return true;
  } catch (e) {
    // 저장 공간 부족 등 예외 상황 처리
    console.error("저장 실패:", e);
    return false;
  }
}

/**
 * localStorage에서 저장된 게임 상태를 불러옵니다.
 * @returns {Object|null} 저장된 상태 객체, 없으면 null
 */
function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error("불러오기 실패:", e);
    return null;
  }
}

/**
 * 저장된 데이터가 존재하는지 여부만 빠르게 확인합니다.
 * (타이틀 화면에서 "이어하기" 버튼을 활성화할지 결정할 때 사용)
 */
function hasSaveData() {
  return localStorage.getItem(SAVE_KEY) !== null;
}

/**
 * 저장 데이터를 삭제합니다. (새로하기 시 사용)
 */
function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}

/* -----------------------------------------------------------
   설정값(효과음 on/off 등)은 별도의 키로 저장합니다.
   게임 진행 저장(SAVE_KEY)과 분리해두면
   "새로하기"를 해도 설정은 유지되어 사용자 경험이 좋아집니다.
----------------------------------------------------------- */
const SETTINGS_KEY = "joseon_rpg_settings_v1";

function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("설정 저장 실패:", e);
  }
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { soundOn: true, textSpeed: "normal" }; // 기본값
    return JSON.parse(raw);
  } catch (e) {
    return { soundOn: true, textSpeed: "normal" };
  }
}
