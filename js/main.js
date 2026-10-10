const fs = require('fs');

const updatedJs = `/* ==========================================================================
   DEVELOPER PORTAL ENGINE (Clean Enterprise Edition)
   ========================================================================== */

(function() {
  'use strict';

  const STORAGE_PREFIX = 'java_mastery_';
  const TOTAL_ITEMS = 44;

  document.addEventListener('DOMContentLoaded', () => {
    initChecklist();
    initCopyButtons();
    initMobileNav();
    initFilterTabs();
    initLiveSearch();
    initMermaid();
    updateProgressDisplay();
  });

  // 1. Checklist State
  function initChecklist() {
    document.querySelectorAll('.checklist-btn').forEach(btn => {
      let itemId = btn.getAttribute('data-item-id');
      if (!itemId) {
        const onclickAttr = btn.getAttribute('onclick');
        if (onclickAttr) {
          const match = onclickAttr.match(/toggleCompleted\\(this,\\s*'([^']+)'\\)/);
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
    if (pill) {
      pill.textContent = \`\${completed} / \${TOTAL_ITEMS} (\${pct}%)\`;
    }

    const counter = document.getElementById('milestoneCounter');
    if (counter) {
      counter.textContent = \`\${completed} / \${TOTAL_ITEMS} Completed\`;
    }
  }

  // 2. Filter Pills & Live Search
  let activeTrack = 'all';

  function initFilterTabs() {
    const pills = document.querySelectorAll('.filter-pill');
    pills.forEach(btn => {
      btn.addEventListener('click', function() {
        pills.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        activeTrack = this.getAttribute('data-filter') || 'all';
        applyFilters();
      });
    });
  }

  function initLiveSearch() {
    const searchInput = document.getElementById('curriculumSearch') || document.getElementById('syllabusSearch');
    if (!searchInput) return;
    searchInput.addEventListener('input', applyFilters);
  }

  function applyFilters() {
    const searchInput = document.getElementById('curriculumSearch') || document.getElementById('syllabusSearch');
    const q = searchInput ? searchInput.value.toLowerCase().trim() : '';

    // Filter track sections & matrix cards
    const trackSections = document.querySelectorAll('.track-section');
    trackSections.forEach(sec => {
      const trackId = sec.getAttribute('data-track-id');
      const matchesTrack = (activeTrack === 'all' || activeTrack === trackId);

      const cards = sec.querySelectorAll('.matrix-card');
      let visibleCards = 0;

      cards.forEach(card => {
        const title = card.querySelector('.matrix-title')?.textContent.toLowerCase() || '';
        const desc = card.querySelector('.matrix-desc')?.textContent.toLowerCase() || '';
        const tag = card.querySelector('.matrix-tag')?.textContent.toLowerCase() || '';
        const matchesQuery = (!q || title.includes(q) || desc.includes(q) || tag.includes(q));

        if (matchesTrack && matchesQuery) {
          card.style.display = 'flex';
          visibleCards++;
        } else {
          card.style.display = 'none';
        }
      });

      if (matchesTrack && visibleCards > 0) {
        sec.style.display = 'block';
      } else {
        sec.style.display = 'none';
      }
    });

    // Filter milestones
    const milestones = document.querySelectorAll('.milestone-item');
    milestones.forEach(item => {
      const itemTrack = item.getAttribute('data-track');
      const matchesTrack = (activeTrack === 'all' || activeTrack === itemTrack);
      const title = item.querySelector('.milestone-title')?.textContent.toLowerCase() || '';
      const matchesQuery = (!q || title.includes(q));

      if (matchesTrack && matchesQuery) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  }

  // 3. Copy Code Buttons
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

  // 4. Toast Notification
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

  // 5. Mobile Navigation Drawer
  function initMobileNav() {
    const toggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.app-sidebar');
    if (!toggle || !sidebar) return;

    let backdrop = document.getElementById('drawerBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'drawerBackdrop';
      backdrop.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);backdrop-filter:blur(3px);z-index:98;display:none;';
      document.body.appendChild(backdrop);
    }

    toggle.addEventListener('click', () => {
      const isOpen = sidebar.classList.toggle('open');
      backdrop.style.display = isOpen ? 'block' : 'none';
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('open');
      backdrop.style.display = 'none';
      document.body.style.overflow = '';
    });

    sidebar.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 900) {
          sidebar.classList.remove('open');
          backdrop.style.display = 'none';
          document.body.style.overflow = '';
        }
      });
    });
  }

  // 6. Mermaid Init
  function initMermaid() {
    if (typeof mermaid !== 'undefined') {
      try {
        mermaid.initialize({
          startOnLoad: true,
          theme: 'dark',
          themeVariables: {
            darkMode: true,
            background: '#161b22',
            primaryColor: '#1f6feb',
            primaryTextColor: '#e6edf3',
            lineColor: '#58a6ff',
            secondaryColor: '#238636',
            tertiaryColor: '#21262d'
          }
        });
      } catch(e) {}
    }
  }

})();
`;

['g:/ACC Backend/js/main.js', 'G:/Projects/ACC ALV Learn/js/main.js'].forEach(p => {
  fs.writeFileSync(p, updatedJs, 'utf8');
  console.log('Saved updated js in', p);
});
`;

fs.writeFileSync('C:/Users/rahul/.gemini/antigravity-ide/brain/89e13bcf-e481-4ed6-9a86-9b98a2012962/scratch/upgrade_js.js', updatedJs, 'utf8');
