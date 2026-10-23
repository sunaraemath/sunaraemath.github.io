// ===== 상담 신청 → 구글 시트 저장 =====
// 이 파일은 홈페이지에 쓰이지 않습니다.
// 구글 시트의 "확장 프로그램 > Apps Script"에 통째로 붙여넣어 사용하세요. (README 참고)

const SHEET_NAME = "상담신청";
const NOTIFY_EMAIL = "";  // 새 신청 알림을 받을 이메일. 비워두면 보내지 않습니다.

const FIELDS = [
  ["name", "성명"],
  ["phone", "연락처"],
  ["gender", "성별"],
  ["school", "학교"],
  ["grade", "학년"],
  ["progress", "진도"],
  ["advance", "선행 진도"],
  ["score", "수학 점수"],
  ["otherAcademy", "다른 학원 시간"],
  ["days", "수업 요일"],
  ["hours", "희망 시간"],
  ["friend", "같이 희망하는 재원생"]
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const book = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["접수 시각"].concat(FIELDS.map(f => f[1])));
      sheet.setFrozenRows(1);
    }

    const p = e.parameter;
    const values = FIELDS.map(([key]) => clean(p[key]));
    sheet.appendRow([new Date()].concat(values));

    if (NOTIFY_EMAIL) {
      MailApp.sendEmail(
        NOTIFY_EMAIL,
        `[수나래] 새 상담 신청: ${values[0]} (${values[4]})`,
        FIELDS.map(([, label], i) => `${label}: ${values[i]}`).join("\n")
      );
    }
    return ContentService.createTextOutput("ok");
  } finally {
    lock.releaseLock();
  }
}

// Keeps answers as plain text so a value like "=..." isn't run as a formula
function clean(value) {
  const s = String(value || "").slice(0, 500);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
