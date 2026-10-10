/* ==========================================================================
   ENTERPRISE DEVELOPER PORTAL INTERACTION ENGINE (V2.0)
   ========================================================================== */

(function() {
  'use strict';

  const STORAGE_PREFIX = 'java_mastery_';
  const TOTAL_CHECKLIST_ITEMS = 35;

  document.addEventListener('DOMContentLoaded', () => {
    initChecklistState();
    initCopyButtons();
    initMobileDrawer();
    initCategoryFilters();
    initSearch();
    initKeyboardShortcuts();
    initMermaid();
    updateProgressDisplays();
  });

  /* --------------------------------------------------------------------------
     1. Checklist State & LocalStorage
     -------------------------------------------------------------------------- */
  function initChecklistState() {
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
    const isCompleted = btn.classList.toggle('completed');
    localStorage.setItem(STORAGE_PREFIX + itemId, isCompleted ? 'true' : 'false');

    const icon = btn.querySelector('.check-icon');
    if (icon) {
      icon.innerHTML = isCompleted ? '&#9679;' : '&#9675;';
    }

    showToast(isCompleted ? '&#10003; Milestone marked as Mastered!' : 'Milestone marked In Progress');
    updateProgressDisplays();
  };

  /* --------------------------------------------------------------------------
     2. Progress Displays (Header + Hero Cards)
     -------------------------------------------------------------------------- */
  function updateProgressDisplays() {
    let completedCount = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX) && localStorage.getItem(key) === 'true') {
        completedCount++;
      }
    }

    const pct = Math.min(100, Math.round((completedCount / TOTAL_CHECKLIST_ITEMS) * 100));

    // Update Top Header Pill
    const headerPill = document.getElementById('globalProgressCount');
    if (headerPill) headerPill.textContent = completedCount + ' / ' + TOTAL_CHECKLIST_ITEMS + ' (' + pct + '%)';

    // Update Header Mini Progress Ring (circumference = 2 * PI * 7 ≈ 44)
    const ringBar = document.getElementById('headerRingBar');
    if (ringBar) {
      const offset = 44 - (44 * (pct / 100));
      ringBar.style.strokeDashoffset = offset;
    }

    // Update Dashboard Hero KPIs
    const heroMastered = document.getElementById('heroMasteredCount');
    if (heroMastered) heroMastered.textContent = completedCount;

    const heroPct = document.getElementById('heroPctCount');
    if (heroPct) heroPct.textContent = pct + '%';

    const heroBar = document.getElementById('heroProgressBar');
    if (heroBar) heroBar.style.width = pct + '%';
  }

  /* --------------------------------------------------------------------------
     3. Category Filter Tabs & Live Search
     -------------------------------------------------------------------------- */
  let activeCategory = 'all';

  function initCategoryFilters() {
    const chips = document.querySelectorAll('.filter-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', function() {
        chips.forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        activeCategory = this.getAttribute('data-filter') || 'all';
        applyCardFilters();
      });
    });
  }

  function initSearch() {
    const searchInput = document.getElementById('phaseSearchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
      applyCardFilters();
    });
  }

  function applyCardFilters() {
    const searchInput = document.getElementById('phaseSearchInput');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const cards = document.querySelectorAll('.enterprise-card');

    cards.forEach(card => {
      const cat = card.getAttribute('data-category') || '';
      const matchesCat = (activeCategory === 'all' || cat.includes(activeCategory));

      const title = card.querySelector('.card-heading')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('.card-summary')?.textContent.toLowerCase() || '';
      const keywords = card.querySelector('.card-keywords-flex')?.textContent.toLowerCase() || '';

      const matchesSearch = (!query || title.includes(query) || desc.includes(query) || keywords.includes(query));

      if (matchesCat && matchesSearch) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  /* --------------------------------------------------------------------------
     4. Keyboard Shortcuts (Cmd+K / Ctrl+K)
     -------------------------------------------------------------------------- */
  function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        const searchInput = document.getElementById('phaseSearchInput');
        if (searchInput) {
          e.preventDefault();
          searchInput.focus();
          searchInput.select();
        }
      }
    });
  }

  /* --------------------------------------------------------------------------
     5. Copy Code with Toast
     -------------------------------------------------------------------------- */
  function initCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const codeBox = this.closest('.code-box');
        if (!codeBox) return;
        const codeElem = codeBox.querySelector('pre code');
        if (!codeElem) return;

        const textToCopy = codeElem.innerText || codeElem.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast('&#128203; Snippet copied to clipboard!');
          const orig = this.textContent;
          this.textContent = 'Copied!';
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
    const textToCopy = codeElem.innerText || codeElem.textContent;
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast('&#128203; Snippet copied to clipboard!');
      const orig = btn.textContent;
      btn.textContent = 'Copied!';
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
    toast.innerHTML = msg;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  /* --------------------------------------------------------------------------
     6. Mobile Drawer
     -------------------------------------------------------------------------- */
  function initMobileDrawer() {
    const toggleBtn = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar-toc');
    const backdrop = document.getElementById('sidebarBackdrop');

    if (!toggleBtn || !sidebar) return;

    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      if (backdrop) backdrop.classList.toggle('show');
    });

    if (backdrop) {
      backdrop.addEventListener('click', () => {
        sidebar.classList.remove('open');
        backdrop.classList.remove('show');
      });
    }
  }

  /* --------------------------------------------------------------------------
     7. Mermaid Init
     -------------------------------------------------------------------------- */
  function initMermaid() {
    if (typeof mermaid !== 'undefined') {
      try {
        mermaid.initialize({
          startOnLoad: true,
          theme: 'dark',
          themeVariables: {
            darkMode: true,
            background: '#090d18',
            primaryColor: '#6366f1',
            primaryTextColor: '#f8fafc',
            lineColor: '#06b6d4',
            secondaryColor: '#1e293b'
          }
        });
      } catch (e) {
        console.warn('Mermaid initialization deferred', e);
      }
    }
  }

})();
