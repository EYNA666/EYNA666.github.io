(function () {
  const CARD_ID = 'eyna-time-progress';
  const DAY_MS = 24 * 60 * 60 * 1000;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function percentage(now, start, end) {
    return clamp(((now - start) / (end - start)) * 100, 0, 100);
  }

  function daysBetween(start, end) {
    return Math.round((end - start) / DAY_MS);
  }

  function getSummerProgress(now) {
    const year = now.getFullYear();
    const start = new Date(year, 6, 6);
    const end = new Date(year, 7, 31);

    if (now < start) {
      return {
        value: 0,
        detail: `距离放假还有 ${Math.ceil((start - now) / DAY_MS)} 天`
      };
    }

    if (now >= end) {
      return {
        value: 100,
        detail: `本年度暑假已结束 · 共 ${daysBetween(start, end)} 天`
      };
    }

    return {
      value: percentage(now, start, end),
      detail: `已过 ${Math.ceil((now - start) / DAY_MS)} 天 · 距报到 ${Math.ceil((end - now) / DAY_MS)} 天`
    };
  }

  function getMonthProgress(now) {
    const year = now.getFullYear();
    const month = now.getMonth();
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 1);

    return {
      value: percentage(now, start, end),
      detail: `${month + 1} 月 · 第 ${now.getDate()} / ${daysBetween(start, end)} 天`
    };
  }

  function getYearProgress(now) {
    const year = now.getFullYear();
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);
    const today = new Date(year, now.getMonth(), now.getDate());

    return {
      value: percentage(now, start, end),
      detail: `${year} 年 · 第 ${daysBetween(start, today) + 1} / ${daysBetween(start, end)} 天`
    };
  }

  function createCard() {
    const card = document.createElement('section');
    card.id = CARD_ID;
    card.className = 'time-progress-card';
    card.setAttribute('aria-label', '时间进度');
    card.innerHTML = `
      <div class="time-progress-header">
        <i class="time-progress-header-icon fa-regular fa-clock" aria-hidden="true"></i>
        <span>时间进度</span>
      </div>
      <div class="time-progress-list">
        ${createProgressItem('summer', '暑假')}
        ${createProgressItem('month', '本月')}
        ${createProgressItem('year', '本年')}
      </div>
    `;
    return card;
  }

  function createProgressItem(key, label) {
    return `
      <div class="time-progress-item" data-progress="${key}">
        <div class="time-progress-heading">
          <span>${label}</span>
          <span class="time-progress-percent">0%</span>
        </div>
        <div class="time-progress-track" role="progressbar" aria-label="${label}进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <div class="time-progress-fill"></div>
        </div>
        <div class="time-progress-detail"></div>
      </div>
    `;
  }

  function updateItem(card, key, data) {
    const item = card.querySelector(`[data-progress="${key}"]`);
    if (!item) return;

    const roundedValue = Math.round(data.value);
    item.querySelector('.time-progress-percent').textContent = `${roundedValue}%`;
    item.querySelector('.time-progress-fill').style.width = `${data.value}%`;
    item.querySelector('.time-progress-detail').textContent = data.detail;

    const track = item.querySelector('.time-progress-track');
    track.setAttribute('aria-valuenow', String(roundedValue));
  }

  function updateCard(card) {
    const now = new Date();
    updateItem(card, 'summer', getSummerProgress(now));
    updateItem(card, 'month', getMonthProgress(now));
    updateItem(card, 'year', getYearProgress(now));
  }

  function initialize() {
    if (window.__eynaTimeProgressTimer) {
      window.clearInterval(window.__eynaTimeProgressTimer);
      window.__eynaTimeProgressTimer = null;
    }

    const sidebar = document.querySelector('.home-sidebar-container .sticky-container');
    if (!sidebar) return;

    let card = document.getElementById(CARD_ID);
    if (!card) {
      card = createCard();
      sidebar.appendChild(card);
    }

    updateCard(card);
    window.__eynaTimeProgressTimer = window.setInterval(function () {
      updateCard(card);
    }, 60 * 1000);
  }

  initialize();
})();
