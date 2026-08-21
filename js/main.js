/**
 * Spring Learning Hub & Visual Guides - Main JavaScript Controller (Tokyo Night Theme)
 * - Mobile-First Navigation with Slide-out Tokyo Night "Jump to Topic" Drawer
 * - Real-time Search and Filter across all topics & library guides
 * - Zero Drag/Scroll Trapping on Diagrams (Smooth Native Scrolling)
 * - Mermaid diagram initialization & high-resolution viewer
 * - Colorful Code Sandbox Enhancement & Syntax Highlighting (Tokyo Night Tokens)
 * - Copy-to-clipboard buttons with animation
 * - Light/Dark Theme Switcher (Tokyo Night / Tokyo Day)
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. TOKYO NIGHT MERMAID DIAGRAM INITIALIZATION
     ========================================================================== */
  function initMermaid() {
    if (typeof window.mermaid !== 'undefined') {
      try {
        window.mermaid.initialize({
          startOnLoad: true,
          securityLevel: 'loose',
          theme: 'dark',
          themeVariables: {
            darkMode: true,
            background: '#16161e',
            mainBkg: '#1a1b26',
            primaryColor: '#24283b',
            primaryTextColor: '#c0caf5',
            primaryBorderColor: '#3b4261',
            lineColor: '#7aa2f7',
            secondaryColor: '#1f2335',
            tertiaryColor: '#16161e',
            edgeLabelBackground: '#1f2335',
            textColor: '#c0caf5',
            nodeBorder: '#3b4261',
            nodeTextColor: '#ffffff',
            titleColor: '#bb9af7',
            arrowheadColor: '#7aa2f7',
            fontFamily: 'Inter, system-ui, sans-serif'
          },
          flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis' },
          sequence: { useMaxWidth: true, wrap: true },
          state: { useMaxWidth: true },
          er: { useMaxWidth: true }
        });
      } catch (err) {
        console.warn('Mermaid initialization warning:', err);
      }
    }
  }

  /* ==========================================================================
     2. UNIVERSAL TOKYO NIGHT "JUMP TO TOPIC" DRAWER & STICKY HEADER
     ========================================================================== */
  function setupTopicDrawer() {
    const isLandingPage = document.querySelector('.hero-landing') !== null;
    if (isLandingPage) return; // Landing page has its own top navigation

    // Check if guide header bar exists, if not create a sleek sticky header bar
    let headerBar = document.querySelector('.guide-header-bar');
    if (!headerBar) {
      headerBar = document.createElement('div');
      headerBar.className = 'guide-header-bar';
      headerBar.innerHTML = `
        <div class="guide-header-inner">
          <div class="nav-actions-left">
            <a class="home-button" href="index.html" title="Back to Hub" style="display:flex; align-items:center; gap:8px;">
              <svg class="spring-logo-svg" style="width:20px; height:20px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path fill="#8bc34a" d="M43.982,23.635c0.069-4.261-0.891-9.328-2.891-15.273l-1.568-4.662l-2.13,4.433 c-0.114,0.237-0.244,0.469-0.38,0.698C33.514,5.827,28.974,4,24,4C12.954,4,4,12.954,4,24c0,11.046,8.954,20,20,20s20-8.954,20-20 C44,23.877,43.984,23.758,43.982,23.635z"></path>
                <path fill="#fff" d="M39.385 32.558c-3.123 4.302-8.651 4.533-13.854 4.442H18.75h-1.938c4.428-1.593 7.063-1.972 9.754-3.4 5.068-2.665 10.078-8.496 11.121-14.562-1.93 5.836-7.779 10.85-13.109 12.889-3.652 1.393-10.248 2.745-10.248 2.745l-.267-.145C9.573 32.268 9.437 22.214 17.6 18.968c3.574-1.423 6.993-.641 10.854-1.593 4.122-1.012 8.89-4.208 10.83-8.375C41.456 15.667 44.07 26.106 39.385 32.558L39.385 32.558zM15.668 38.445C15.386 38.795 14.955 39 14.505 39c-.823 0-1.495-.677-1.495-1.5s.677-1.5 1.495-1.5c.341 0 .677.118.941.336C16.086 36.855 16.186 37.805 15.668 38.445L15.668 38.445z"></path>
              </svg>
              <span>Hub</span>
            </a>
          </div>
          <div class="nav-actions-right">
            <button type="button" class="theme-toggle" id="themeToggle" title="Toggle Theme">
              <span id="themeIcon">☾</span>
              <span id="themeText" style="display:none;">Theme</span>
            </button>
            <button type="button" class="jump-topic-btn" id="openDrawerBtn" aria-label="Open Topics Menu">
              <div class="hamburger-icon">
                <span></span><span></span><span></span>
              </div>
              <span>Jump to Topic</span>
            </button>
          </div>
        </div>
      `;
      document.body.insertBefore(headerBar, document.body.firstChild);
    }

    // Collect all sections / topics across the page
    const topics = [];
    const sectionNodes = document.querySelectorAll('section[id], .section[id], .card[id], .codefile[id]');
    
    if (sectionNodes.length > 0) {
      sectionNodes.forEach((sec, idx) => {
        const id = sec.getAttribute('id');
        if (!id) return;
        const heading = sec.querySelector('h2, h3, .badge') || sec;
        let text = heading.textContent.trim().replace(/^[\d.—\s]+/, '');
        if (!text) text = `Topic ${id}`;
        topics.push({ id: id, title: text, num: String(idx + 1).padStart(2, '0') });
      });
    } else {
      // Fallback: check sidebar nav or existing anchor links
      const navLinks = document.querySelectorAll('nav.sidebar-nav a, nav.toc a, nav a[href^="#"]');
      navLinks.forEach((link, idx) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#') && href.length > 1) {
          const id = href.substring(1);
          topics.push({ id: id, title: link.textContent.trim(), num: String(idx + 1).padStart(2, '0') });
        }
      });
    }

    // Build the Slide-out Drawer
    let drawerOverlay = document.getElementById('topicDrawerOverlay');
    if (!drawerOverlay) {
      drawerOverlay = document.createElement('div');
      drawerOverlay.id = 'topicDrawerOverlay';
      drawerOverlay.className = 'topic-drawer-overlay';
      drawerOverlay.innerHTML = `
        <div class="topic-drawer">
          <div class="drawer-header">
            <h3><span>📑</span> Jump to Topic</h3>
            <button type="button" class="drawer-close-btn" id="closeDrawerBtn">✕</button>
          </div>
          <div class="drawer-search-wrap">
            <input type="text" id="drawerSearchInput" placeholder="Filter topics (e.g. crud, rollback, proxy)..." autocomplete="off" />
          </div>
          <div class="drawer-list" id="drawerList"></div>
        </div>
      `;
      document.body.appendChild(drawerOverlay);

      const drawerList = document.getElementById('drawerList');
      const closeBtn = document.getElementById('closeDrawerBtn');
      const searchInput = document.getElementById('drawerSearchInput');

      const closeDrawer = () => drawerOverlay.classList.remove('open');
      const openDrawer = () => {
        drawerOverlay.classList.add('open');
        setTimeout(() => { if (searchInput) searchInput.focus(); }, 100);
      };

      closeBtn.onclick = closeDrawer;
      drawerOverlay.onclick = (e) => {
        if (e.target === drawerOverlay) closeDrawer();
      };

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawerOverlay.classList.contains('open')) closeDrawer();
      });

      const openBtn = document.getElementById('openDrawerBtn');
      if (openBtn) openBtn.onclick = openDrawer;

      // Populate topics list in drawer
      topics.forEach((t) => {
        const item = document.createElement('a');
        item.className = 'drawer-item';
        item.href = `#${t.id}`;
        item.dataset.title = t.title.toLowerCase();
        item.innerHTML = `
          <span class="item-num">${t.num}</span>
          <span>${escapeHtml(t.title)}</span>
        `;
        item.onclick = (e) => {
          closeDrawer();
          const target = document.getElementById(t.id);
          if (target) {
            e.preventDefault();
            const yOffset = -70;
            const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
            history.pushState(null, null, `#${t.id}`);
          }
        };
        drawerList.appendChild(item);
      });

      // Topic Drawer Search / Filter
      if (searchInput) {
        searchInput.addEventListener('input', () => {
          const q = searchInput.value.toLowerCase().trim();
          const items = drawerList.querySelectorAll('.drawer-item');
          items.forEach((item) => {
            const title = item.dataset.title || '';
            if (!q || title.includes(q)) {
              item.style.display = 'flex';
            } else {
              item.style.display = 'none';
            }
          });
        });
      }
    }
  }

  /* ==========================================================================
     3. COLORFUL CODE HIGHLIGHTING & CODE SANDBOX (TOKYO NIGHT)
     ========================================================================== */
  function detectLanguage(codeText, currentClass) {
    if (currentClass) {
      const match = currentClass.match(/language-([a-z0-9_-]+)/i);
      if (match) return match[1].toLowerCase();
    }

    const trimmed = codeText.trim();
    if (/^<\?xml|^<beans|^<project|^<web-app|^<servlet|^<filter/i.test(trimmed) || /<\/?[a-z0-9_:-]+(\s|>)/i.test(trimmed)) {
      return 'xml';
    }
    if (/^<%@\s*page|^<jsp:|^<!DOCTYPE html/i.test(trimmed)) {
      return 'jsp';
    }
    if (/\b(SELECT|INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM|CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE)\b/i.test(trimmed)) {
      return 'sql';
    }
    if (/\b(package\s+[a-z0-9_.]+|import\s+java|public\s+class|@Entity|@Table|@Id|@Transactional|@Autowired|@Service|@Controller|@RequestMapping|@GetMapping|@PostMapping|@RequestParam|@ResponseBody|public\s+void|private\s+|protected\s+)\b/.test(trimmed)) {
      return 'java';
    }
    if (/^[a-z0-9_.-]+\s*[:=]\s*.+$/m.test(trimmed) && !trimmed.includes('class ') && !trimmed.includes(';')) {
      return 'properties';
    }
    return 'java';
  }

  function highlightSnippet(code, lang) {
    let html = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    if (lang === 'xml' || lang === 'html' || lang === 'jsp') {
      html = html.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="token comment">$1</span>');
      html = html.replace(/(&lt;%@?[\s\S]*?%&gt;)/g, '<span class="token annotation">$1</span>');
      html = html.replace(/(&lt;\/?[a-zA-Z0-9_:-]+)(\s|>|&gt;)/g, '<span class="token tag">$1</span>$2');
      html = html.replace(/([a-zA-Z0-9_:-]+)=(&quot;.*?&quot;|".*?"|'.*?')/g, '<span class="token attr-name">$1</span>=<span class="token string">$2</span>');
      return html;
    }

    if (lang === 'sql') {
      html = html.replace(/(--.*$)/gm, '<span class="token comment">$1</span>');
      html = html.replace(/('(?:''|[^'\\]|\\.)*')/g, '<span class="token string">$1</span>');
      const sqlKeywords = /\b(SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|DROP|ALTER|ADD|CONSTRAINT|PRIMARY|KEY|FOREIGN|REFERENCES|JOIN|LEFT|RIGHT|INNER|OUTER|GROUP|BY|ORDER|ASC|DESC|AND|OR|NOT|NULL|IS|IN|LIKE|AS|ON|DISTINCT|COUNT|SUM|AVG|MIN|MAX|VARCHAR|VARCHAR2|INT|INTEGER|BIGINT|BOOLEAN|DATE|TIMESTAMP)\b/gi;
      html = html.replace(sqlKeywords, '<span class="token sql-keyword">$1</span>');
      return html;
    }

    // Java tokens
    html = html.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="token comment">$1</span>');
    html = html.replace(/(\/\/.*$)/gm, '<span class="token comment">$1</span>');
    html = html.replace(/("(?:[^"\\]|\\.)*")/g, '<span class="token string">$1</span>');
    html = html.replace(/('(?:[^'\\]|\\.)*')/g, '<span class="token string">$1</span>');
    html = html.replace(/(@[a-zA-Z0-9_]+)/g, '<span class="token annotation">$1</span>');

    const javaKeywords = /\b(abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while|record|sealed|permits|var|yield)\b/g;
    html = html.replace(javaKeywords, '<span class="token keyword">$1</span>');
    html = html.replace(/\b(true|false|null)\b/g, '<span class="token constant">$1</span>');

    const javaTypes = /\b(String|Integer|Long|Double|Float|Boolean|Object|List|Set|Map|HashMap|ArrayList|EntityManager|EntityManagerFactory|SessionFactory|Session|Transaction|EntityTransaction|PlatformTransactionManager|TransactionDefinition|TransactionStatus|TransactionTemplate|HttpServletRequest|HttpServletResponse|HttpSession|ModelAndView|Model|ModelMap|ModelAndView|User|Employee|Student|Department|Product|Order|Optional|Class)\b/g;
    html = html.replace(javaTypes, '<span class="token class-name">$1</span>');

    html = html.replace(/\b([a-zA-Z0-9_]+)\s*(?=\()/g, (match, fnName) => {
      if (['if', 'for', 'while', 'switch', 'catch'].includes(fnName)) return match;
      return `<span class="token function">${fnName}</span>`;
    });

    html = html.replace(/\b([0-9]+(?:\.[0-9]+)?(?:[fFdDlL])?)\b/g, '<span class="token number">$1</span>');
    return html;
  }

  function setupCodeSandboxes() {
    const preBlocks = document.querySelectorAll('pre');

    preBlocks.forEach((pre) => {
      if (pre.classList.contains('mermaid') || pre.closest('.diagram')) return;
      if (pre.dataset.sandboxReady) return;
      pre.dataset.sandboxReady = 'true';

      const codeElem = pre.querySelector('code') || pre;
      const rawText = codeElem.textContent || '';
      if (!rawText.trim()) return;

      const lang = detectLanguage(rawText, codeElem.className || pre.className);

      const sandbox = document.createElement('div');
      sandbox.className = 'code-sandbox';

      const header = document.createElement('div');
      header.className = 'code-header';
      header.innerHTML = `
        <div class="code-header-left">
          <div class="code-dots">
            <span class="code-dot red"></span>
            <span class="code-dot yellow"></span>
            <span class="code-dot green"></span>
          </div>
          <span class="code-lang-badge">${lang.toUpperCase()}</span>
        </div>
        <button type="button" class="code-copy-btn" title="Copy code">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span>Copy</span>
        </button>
      `;

      const copyBtn = header.querySelector('.code-copy-btn');
      copyBtn.onclick = () => {
        const copySuccess = () => {
          copyBtn.classList.add('copied');
          copyBtn.querySelector('span').textContent = 'Copied! ✓';
          setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyBtn.querySelector('span').textContent = 'Copy';
          }, 2000);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(rawText).then(copySuccess).catch(() => {
            fallbackCopy(rawText, copySuccess);
          });
        } else {
          fallbackCopy(rawText, copySuccess);
        }
      };

      pre.parentNode.insertBefore(sandbox, pre);
      sandbox.appendChild(header);
      sandbox.appendChild(pre);

      const highlightedHtml = highlightSnippet(rawText, lang);
      if (pre.querySelector('code')) {
        pre.querySelector('code').innerHTML = highlightedHtml;
      } else {
        pre.innerHTML = `<code>${highlightedHtml}</code>`;
      }
    });
  }

  function fallbackCopy(text, callback) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      if (callback) callback();
    } catch (e) {
      console.warn('Copy command failed:', e);
    }
    document.body.removeChild(ta);
  }

  /* ==========================================================================
     4. CLEAN DIAGRAM VIEWER (FULL VIEW MODAL ONLY - NO DRAG TRAPPING)
     ========================================================================== */
  function initDiagramViewer() {
    let modal = document.getElementById('diagram-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'diagram-modal';
      modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-box">
          <div class="modal-bar">
            <span class="modal-title">🔍 High-Resolution Diagram</span>
            <div class="modal-actions">
              <button class="m-btn m-close" id="m-close" title="Close (Esc)">✕ Close</button>
            </div>
          </div>
          <div class="modal-view" id="modal-view">
            <div class="modal-stage" id="modal-stage"></div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('m-close').onclick = () => modal.classList.remove('open');
      modal.querySelector('.modal-backdrop').onclick = () => modal.classList.remove('open');

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) {
          modal.classList.remove('open');
        }
      });
    }

    const targets = document.querySelectorAll('.diagram, pre.mermaid');
    targets.forEach((container) => {
      if (container.dataset.zoomReady) return;
      const svg = container.querySelector('svg');
      if (!svg) return;

      container.dataset.zoomReady = 'true';

      const toolbar = document.createElement('div');
      toolbar.className = 'diagram-ctrl-bar';
      toolbar.innerHTML = `
        <button type="button" class="d-btn d-modal" title="Fullscreen View">⛶ Full View</button>
      `;

      toolbar.querySelector('.d-modal').onclick = (e) => {
        e.stopPropagation();
        const stage = document.getElementById('modal-stage');
        stage.innerHTML = svg.outerHTML;
        modal.classList.add('open');
      };

      container.insertBefore(toolbar, container.firstChild);
    });
  }

  /* ==========================================================================
     5. DYNAMIC PAGE MANAGER & PAGINATION WITH SEARCH INDEXING
     ========================================================================== */
  const STORAGE_KEY = 'springHubCustomPages_v1';
  const PAGE_SIZE = 6; // Cards per page in library view
  let currentPage = 1;
  let currentSearchQuery = '';

  function getCustomPages() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveCustomPages(pages) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
  }

  function renderCustomPages() {
    const grid = document.getElementById('topicsGrid');
    if (!grid) return;

    const existingCustom = grid.querySelectorAll('.custom-card');
    existingCustom.forEach(card => card.remove());

    const customPages = getCustomPages();
    const totalBuiltin = grid.querySelectorAll('a.card:not(.custom-card)').length;

    customPages.forEach((page, idx) => {
      const cardNum = String(totalBuiltin + idx + 1).padStart(2, '0');
      const card = document.createElement('a');
      card.className = 'card custom-card';
      card.href = page.fileName;
      card.dataset.title = (page.title || '').toLowerCase();
      card.dataset.desc = (page.description || '').toLowerCase();
      card.dataset.file = (page.fileName || '').toLowerCase();

      card.innerHTML = `
        <div class="num">${cardNum}</div>
        <div style="flex: 1;">
          <h3>${escapeHtml(page.title)}</h3>
          <p>${escapeHtml(page.description || 'Custom added guide')}</p>
          <span class="file-tag">${escapeHtml(page.fileName)}</span>
        </div>
        <button type="button" class="card-delete-btn" title="Remove page from list">✕ Remove</button>
        <span class="arrow">↗</span>
      `;

      const delBtn = card.querySelector('.card-delete-btn');
      delBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm(`Remove "${page.title}" from your library list?`)) {
          const current = getCustomPages();
          const filtered = current.filter(p => p.id !== page.id);
          saveCustomPages(filtered);
          renderCustomPages();
        }
      };

      grid.appendChild(card);
    });

    updateCardNumbers();
    applySearchAndPagination();
  }

  function updateCardNumbers() {
    const grid = document.getElementById('topicsGrid');
    if (!grid) return;
    const cards = grid.querySelectorAll('a.card');
    cards.forEach((card, idx) => {
      const numElem = card.querySelector('.num');
      if (numElem) {
        numElem.textContent = String(idx + 1).padStart(2, '0');
      }
    });
  }

  function applySearchAndPagination() {
    const grid = document.getElementById('topicsGrid');
    const paginationContainer = document.getElementById('paginationContainer');
    const paginationInfo = document.getElementById('paginationInfo');
    const paginationControls = document.getElementById('paginationControls');
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll('a.card'));
    const tokens = currentSearchQuery.split(/\s+/).filter(t => t.length > 0);

    // 1. Search Indexing Filter
    const matchedCards = cards.filter((card) => {
      if (tokens.length === 0) return true;

      const title = (card.querySelector('h3')?.textContent || card.dataset.title || '').toLowerCase();
      const desc = (card.querySelector('p')?.textContent || card.dataset.desc || '').toLowerCase();
      const file = (card.getAttribute('href') || card.dataset.file || '').toLowerCase();
      const textCorpus = `${title} ${desc} ${file}`;

      return tokens.every(token => textCorpus.includes(token));
    });

    // 2. Pagination Calculations
    const totalMatched = matchedCards.length;
    const totalPages = Math.max(1, Math.ceil(totalMatched / PAGE_SIZE));

    if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;

    // 3. Render visible cards
    cards.forEach((card) => {
      const isMatched = matchedCards.includes(card);
      const matchIndex = matchedCards.indexOf(card);
      const isCurrentPage = matchIndex >= startIndex && matchIndex < endIndex;

      if (isMatched && isCurrentPage) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });

    // 4. Update No-match message
    let noMatchMsg = document.getElementById('noMatchMessage');
    if (totalMatched === 0) {
      if (!noMatchMsg) {
        noMatchMsg = document.createElement('div');
        noMatchMsg.id = 'noMatchMessage';
        noMatchMsg.className = 'note';
        noMatchMsg.style.gridColumn = '1 / -1';
        noMatchMsg.style.textAlign = 'center';
        noMatchMsg.style.padding = '32px 16px';
        noMatchMsg.innerHTML = `
          <p style="margin:0; font-size:1.05rem; color:var(--text-bright);">No topics found matching "<strong>${escapeHtml(currentSearchQuery)}</strong>"</p>
          <p style="margin:8px 0 0; font-size:0.88rem; color:var(--muted);">Try another keyword or click <strong>+ Add Page</strong> to create a new guide card.</p>
        `;
        grid.appendChild(noMatchMsg);
      }
    } else if (noMatchMsg) {
      noMatchMsg.remove();
    }

    // 5. Render Pagination Bar
    if (paginationContainer && paginationInfo && paginationControls) {
      if (totalMatched === 0) {
        paginationContainer.style.display = 'none';
        return;
      }

      paginationContainer.style.display = 'flex';
      const rangeStart = startIndex + 1;
      const rangeEnd = Math.min(endIndex, totalMatched);
      paginationInfo.innerHTML = `Showing <strong>${rangeStart}-${rangeEnd}</strong> of <strong>${totalMatched}</strong> guides`;

      paginationControls.innerHTML = '';

      if (totalPages > 1) {
        // Prev Button
        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'pagination-btn';
        prevBtn.innerHTML = '‹ Prev';
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => {
          if (currentPage > 1) {
            currentPage--;
            applySearchAndPagination();
            grid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        };
        paginationControls.appendChild(prevBtn);

        // Page Number Buttons
        for (let p = 1; p <= totalPages; p++) {
          const pageBtn = document.createElement('button');
          pageBtn.type = 'button';
          pageBtn.className = `pagination-btn ${p === currentPage ? 'active' : ''}`;
          pageBtn.textContent = p;
          pageBtn.onclick = () => {
            currentPage = p;
            applySearchAndPagination();
            grid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          };
          paginationControls.appendChild(pageBtn);
        }

        // Next Button
        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'pagination-btn';
        nextBtn.innerHTML = 'Next ›';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.onclick = () => {
          if (currentPage < totalPages) {
            currentPage++;
            applySearchAndPagination();
            grid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        };
        paginationControls.appendChild(nextBtn);
      }
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function setupAddPageModal() {
    let overlay = document.getElementById('addPageModal');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'addPageModal';
      overlay.className = 'page-modal-overlay';
      overlay.innerHTML = `
        <div class="page-modal-card">
          <div class="modal-header">
            <h3>+ Add New Guide / Topic Page</h3>
            <button type="button" class="modal-close-btn" id="closeAddModal">✕</button>
          </div>
          <form id="addPageForm">
            <div class="form-group">
              <label for="pageTitle">Heading / Title *</label>
              <input type="text" id="pageTitle" placeholder="e.g. Unit 25: Spring Security & JWT" required />
            </div>
            <div class="form-group">
              <label for="pageFileName">File Name or Path in Workspace *</label>
              <input type="text" id="pageFileName" placeholder="e.g. spring-security-guide.html" required />
              <div class="hint">Specify the HTML filename in your project root.</div>
            </div>
            <div class="form-group">
              <label for="pageDescription">Description</label>
              <textarea id="pageDescription" placeholder="Brief summary of concepts, architecture, and interview prep topics..."></textarea>
            </div>
            <div class="modal-footer">
              <button type="button" class="button" id="cancelAddModal">Cancel</button>
              <button type="submit" class="button primary">Add to Library</button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(overlay);

      const closeBtn = document.getElementById('closeAddModal');
      const cancelBtn = document.getElementById('cancelAddModal');
      const form = document.getElementById('addPageForm');

      const closeModal = () => overlay.classList.remove('open');
      closeBtn.onclick = closeModal;
      cancelBtn.onclick = closeModal;
      overlay.onclick = (e) => {
        if (e.target === overlay) closeModal();
      };

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
      });

      form.onsubmit = (e) => {
        e.preventDefault();
        const title = document.getElementById('pageTitle').value.trim();
        let fileName = document.getElementById('pageFileName').value.trim();
        const description = document.getElementById('pageDescription').value.trim();

        if (!title || !fileName) {
          alert('Please provide both a Title and File Name.');
          return;
        }

        if (!fileName.endsWith('.html') && !fileName.includes('#') && !fileName.includes('://')) {
          fileName += '.html';
        }

        const newPage = {
          id: Date.now().toString(),
          title: title,
          fileName: fileName,
          description: description
        };

        const pages = getCustomPages();
        pages.push(newPage);
        saveCustomPages(pages);

        renderCustomPages();
        form.reset();
        closeModal();
      };
    }

    const triggerBtns = document.querySelectorAll('.open-add-page-modal');
    triggerBtns.forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        overlay.classList.add('open');
        setTimeout(() => {
          const input = document.getElementById('pageTitle');
          if (input) input.focus();
        }, 50);
      };
    });
  }

  function setupSearchFilter() {
    const searchInput = document.getElementById('librarySearch');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
      currentSearchQuery = searchInput.value.toLowerCase().trim();
      currentPage = 1;
      applySearchAndPagination();
    });
  }

  /* ==========================================================================
     6. SEGMENTED STUDY / INTERVIEW TAB SWITCHER (ON FORMS & GUIDES)
     ========================================================================== */
  function setupContentSwitcher() {
    const sw = document.getElementById('contentSwitcher');
    const a = document.getElementById('studyTab');
    const b = document.getElementById('interviewTab');
    const p1 = document.getElementById('studyPanel');
    const p2 = document.getElementById('interviewPanel');

    if (!sw || !a || !b || !p1 || !p2) return;

    function show(which) {
      const interview = which === 'interview';
      sw.classList.toggle('interview-active', interview);
      a.classList.toggle('active', !interview);
      b.classList.toggle('active', interview);
      a.setAttribute('aria-selected', String(!interview));
      b.setAttribute('aria-selected', String(interview));
      p1.classList.toggle('active', !interview);
      p2.classList.toggle('active', interview);

      // Re-render Mermaid flowcharts and initialize toolbar on newly visible panel
      setTimeout(() => {
        if (typeof window.mermaid !== 'undefined' && window.mermaid.run) {
          try {
            window.mermaid.run({ querySelector: '.mermaid, pre.mermaid', suppressErrors: true });
          } catch (e) {
            console.warn('Mermaid re-run notice:', e);
          }
        }
        initDiagramViewer();
      }, 60);

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    a.addEventListener('click', () => show('study'));
    b.addEventListener('click', () => show('interview'));
    if (location.hash === '#interview-mode') show('interview');
  }

  /* ==========================================================================
     7. THEME TOGGLE (TOKYO NIGHT DARK / DAY)
     ========================================================================== */
  function setupThemeToggle() {
    const toggleBtns = document.querySelectorAll('.theme-toggle, #themeToggle');

    function applyTheme(isDark) {
      document.body.classList.toggle('light', !isDark);
      toggleBtns.forEach((btn) => {
        btn.setAttribute('aria-pressed', String(isDark));
        const icon = btn.querySelector('#themeIcon') || btn.querySelector('span:first-child');
        const text = btn.querySelector('#themeText');
        if (icon) icon.textContent = isDark ? '☀' : '☾';
        if (text) text.textContent = isDark ? 'Tokyo Day' : 'Tokyo Night';
      });
      localStorage.setItem('springHubTheme', isDark ? 'dark' : 'light');
    }

    const savedTheme = localStorage.getItem('springHubTheme') || localStorage.getItem('springMvcTheme');
    if (savedTheme === 'light') {
      applyTheme(false);
    } else {
      applyTheme(true);
    }

    toggleBtns.forEach((btn) => {
      btn.onclick = () => {
        const isCurrentlyLight = document.body.classList.contains('light');
        applyTheme(isCurrentlyLight);
      };
    });
  }

  /* ==========================================================================
     8. BOOTSTRAP ON LOAD
     ========================================================================== */
  function init() {
    initMermaid();
    setupTopicDrawer();
    setupCodeSandboxes();
    setupContentSwitcher();
    setupAddPageModal();
    renderCustomPages();
    setupSearchFilter();
    setupThemeToggle();

    setTimeout(initDiagramViewer, 400);
    setTimeout(initDiagramViewer, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', () => {
    setTimeout(initDiagramViewer, 500);
  });

})();
