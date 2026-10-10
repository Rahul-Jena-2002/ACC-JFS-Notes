/* ==========================================================================
   CORE JAVA ENTERPRISE ROADMAP - UNIFIED INTERACTION ENGINE
   Handles LocalStorage state, mobile drawers, live progress & copy toasts
   ========================================================================== */

(function() {
  'use strict';

  const STORAGE_PREFIX = 'java_mastery_';

  // Total items registered in the full syllabus
  const TOTAL_CHECKLIST_ITEMS = 35;

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    initChecklistState();
    initCopyButtons();
    initMobileDrawer();
    initDashboardSearch();
    initMermaid();
    updateGlobalProgressDisplay();
  });

  /* --------------------------------------------------------------------------
     1. Checklist & Mastery State (localStorage)
     -------------------------------------------------------------------------- */
  function initChecklistState() {
    const buttons = document.querySelectorAll('.checklist-btn');
    buttons.forEach(btn => {
      const onclickAttr = btn.getAttribute('onclick');
      let itemId = null;
      if (onclickAttr) {
        const match = onclickAttr.match(/toggleCompleted\(this,\s*'([^']+)'\)/);
        if (match) itemId = match[1];
      }
      if (!itemId) {
        itemId = btn.getAttribute('data-item-id');
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

    showToast(isCompleted ? '&#10003; Topic marked as Mastered!' : 'Topic reset to In Progress');
    updateGlobalProgressDisplay();
  };

  /* --------------------------------------------------------------------------
     2. Global & Page Progress Calculations
     -------------------------------------------------------------------------- */
  function updateGlobalProgressDisplay() {
    let completedCount = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX) && localStorage.getItem(key) === 'true') {
        completedCount++;
      }
    }

    const pct = Math.min(100, Math.round((completedCount / TOTAL_CHECKLIST_ITEMS) * 100));

    // Update global tracker pill if present in header
    const pillCount = document.getElementById('globalProgressCount');
    if (pillCount) pillCount.textContent = completedCount + ' / ' + TOTAL_CHECKLIST_ITEMS + ' (' + pct + '%)';

    // Update dashboard stat card if on index.html
    const statMastered = document.getElementById('dashMasteredCount');
    if (statMastered) statMastered.textContent = completedCount;

    const statPct = document.getElementById('dashPctCount');
    if (statPct) statPct.textContent = pct + '%';

    const statFill = document.getElementById('dashProgressFill');
    if (statFill) statFill.style.width = pct + '%';
  }

  /* --------------------------------------------------------------------------
     3. Code Copy with Toast Notification
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
          showToast('&#128203; Code copied to clipboard!');
          const orig = this.textContent;
          this.textContent = 'Copied!';
          setTimeout(() => { this.textContent = orig; }, 2000);
        }).catch(err => {
          console.error('Failed to copy', err);
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
      showToast('&#128203; Code copied to clipboard!');
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
     4. Mobile Navigation Drawer
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

    // Close on navigation link click on mobile
    sidebar.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 860) {
          sidebar.classList.remove('open');
          if (backdrop) backdrop.classList.remove('show');
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     5. Dashboard Search & Filter
     -------------------------------------------------------------------------- */
  function initDashboardSearch() {
    const searchInput = document.getElementById('phaseSearchInput');
    if (!searchInput) return;

    const cards = document.querySelectorAll('.roadmap-card');

    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      cards.forEach(card => {
        const title = card.querySelector('.roadmap-card-title')?.textContent.toLowerCase() || '';
        const desc = card.querySelector('.roadmap-card-desc')?.textContent.toLowerCase() || '';
        const tags = card.querySelector('.topic-tags-row')?.textContent.toLowerCase() || '';

        if (!q || title.includes(q) || desc.includes(q) || tags.includes(q)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     6. Mermaid Diagrams Initialization
     -------------------------------------------------------------------------- */
  function initMermaid() {
    if (typeof mermaid !== 'undefined') {
      try {
        mermaid.initialize({
          startOnLoad: true,
          theme: 'dark',
          themeVariables: {
            darkMode: true,
            background: '#0f172a',
            primaryColor: '#6366f1',
            primaryTextColor: '#f8fafc',
            lineColor: '#06b6d4'
          }
        });
      } catch (e) {
        console.warn('Mermaid initialization deferred', e);
      }
    }
  }

})();
