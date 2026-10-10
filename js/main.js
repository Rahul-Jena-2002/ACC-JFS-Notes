/* ==========================================================================
   DEVELOPER PORTAL ENGINE (Clean Developer Edition)
   ========================================================================== */

(function() {
  'use strict';

  const STORAGE_PREFIX = 'java_mastery_';
  const TOTAL_ITEMS = 40;

  document.addEventListener('DOMContentLoaded', () => {
    initChecklist();
    initCopyButtons();
    initMobileNav();
    initFilterTabs();
    initLiveSearch();
    initMermaid();
    updateProgressDisplay();
  });

  function initChecklist() {
    document.querySelectorAll('.checklist-btn').forEach(btn => {
      let itemId = btn.getAttribute('data-item-id');
      if (!itemId) {
        const onclickAttr = btn.getAttribute('onclick');
        if (onclickAttr) {
          const match = onclickAttr.match(/toggleCompleted\(this,\s*'([^']+)'\)/);
          if (match) itemId = match[1];
        }
      }

      if (itemId) {
        btn.setAttribute('data-item-id', itemId);
        const isDone = localStorage.getItem(STORAGE_PREFIX + itemId) === 'true';
        if (isDone) {
          btn.classList.add('completed');
          const icon = btn.querySelector('.check-icon');
          if (icon) icon.innerHTML = '&#9679;';
        }
      }
    });
  }

  window.toggleCompleted = function(btn, itemId) {
    if (!itemId) itemId = btn.getAttribute('data-item-id');
    const isDone = btn.classList.toggle('completed');
    localStorage.setItem(STORAGE_PREFIX + itemId, isDone ? 'true' : 'false');

    const icon = btn.querySelector('.check-icon');
    if (icon) {
      icon.innerHTML = isDone ? '&#9679;' : '&#9675;';
    }

    showToast(isDone ? 'Topic marked as completed' : 'Topic reset');
    updateProgressDisplay();
  };

  function updateProgressDisplay() {
    let completed = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX) && localStorage.getItem(key) === 'true') {
        completed++;
      }
    }

    const pct = Math.min(100, Math.round((completed / TOTAL_ITEMS) * 100));

    const pill = document.getElementById('globalProgressCount');
    if (pill) pill.textContent = completed + ' / ' + TOTAL_ITEMS + ' (' + pct + '%)';

    const countStat = document.getElementById('statCompletedCount');
    if (countStat) countStat.textContent = completed;

    const pctStat = document.getElementById('statPctCount');
    if (pctStat) pctStat.textContent = pct + '%';

    const barFill = document.getElementById('statProgressBarFill');
    if (barFill) barFill.style.width = pct + '%';
  }

  let activeTrack = 'all';

  function initFilterTabs() {
    const btns = document.querySelectorAll('.filter-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', function() {
        btns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        activeTrack = this.getAttribute('data-track') || 'all';
        applyFilters();
      });
    });
  }

  function initLiveSearch() {
    const input = document.getElementById('syllabusSearch');
    if (!input) return;
    input.addEventListener('input', applyFilters);
  }

  function applyFilters() {
    const input = document.getElementById('syllabusSearch');
    const q = input ? input.value.toLowerCase().trim() : '';
    const rows = document.querySelectorAll('.module-row');

    rows.forEach(row => {
      const track = row.getAttribute('data-track') || '';
      const matchesTrack = (activeTrack === 'all' || track.includes(activeTrack));

      const title = row.querySelector('.module-row-title')?.textContent.toLowerCase() || '';
      const desc = row.querySelector('.module-row-desc')?.textContent.toLowerCase() || '';
      const tags = row.querySelector('.module-row-tags')?.textContent.toLowerCase() || '';

      const matchesQuery = (!q || title.includes(q) || desc.includes(q) || tags.includes(q));

      if (matchesTrack && matchesQuery) {
        row.style.display = 'flex';
      } else {
        row.style.display = 'none';
      }
    });
  }

  function initCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const codeBox = this.closest('.code-box');
        if (!codeBox) return;
        const codeElem = codeBox.querySelector('pre code');
        if (!codeElem) return;

        const text = codeElem.innerText || codeElem.textContent;
        navigator.clipboard.writeText(text).then(() => {
          showToast('Copied to clipboard');
          const orig = this.textContent;
          this.textContent = 'Copied';
          setTimeout(() => { this.textContent = orig; }, 2000);
        });
      });
    });
  }

  window.copySnippet = function(btn) {
    const codeBox = btn.closest('.code-box');
    if (!codeBox) return;
    const codeElem = codeBox.querySelector('pre code');
    if (!codeElem) return;
    const text = codeElem.innerText || codeElem.textContent;
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard');
      const orig = btn.textContent;
      btn.textContent = 'Copied';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    });
  };

  function showToast(msg) {
    let toast = document.getElementById('appToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'appToast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  }

  function initMobileNav() {
    const toggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.app-sidebar');
    if (!toggle || !sidebar) return;

    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  function initMermaid() {
    if (typeof mermaid !== 'undefined') {
      try {
        mermaid.initialize({
          startOnLoad: true,
          theme: 'dark',
          themeVariables: {
            darkMode: true,
            background: '#0b0e14',
            primaryColor: '#1f6feb',
            primaryTextColor: '#e6edf3',
            lineColor: '#58a6ff'
          }
        });
      } catch (e) {}
    }
  }

})();
