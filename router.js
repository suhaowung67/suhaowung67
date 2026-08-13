/**
 * router.js
 * Handles SPA navigation by fetching HTML and replacing the main content area.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize router
  initRouter();
  
  // Handle back/forward browser buttons
  window.addEventListener('popstate', (e) => {
    handleRoute(window.location.pathname, false);
  });
});

function initRouter() {
  document.body.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    
    const href = link.getAttribute('href');
    const target = link.getAttribute('target');
    
    // Ignore external links, anchor links, and target="_blank"
    if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#') || target === '_blank') {
      return;
    }

    e.preventDefault();
    handleRoute(href, true);
  });
}

async function handleRoute(path, pushState = true) {
  try {
    // Show a loading state (optional)
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.style.opacity = '0.5';
      mainContent.style.pointerEvents = 'none';
      mainContent.style.transition = 'opacity 0.2s';
    }

    // Fetch the new page
    const response = await fetch(path);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const html = await response.text();
    
    // Parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract the new main content and title
    const newMain = doc.querySelector('main');
    const newTitle = doc.querySelector('title')?.innerText;
    
    if (newMain && mainContent) {
      // Replace main content
      mainContent.innerHTML = newMain.innerHTML;
      mainContent.className = newMain.className; // Keep classes
      
      // Update title
      if (newTitle) document.title = newTitle;
      
      // Update URL
      if (pushState) {
        window.history.pushState({}, '', path);
      }
      
      // Update active navigation states
      updateNavState(path);
      
      // Re-initialize specific scripts based on path
      reinitializeScripts(path, doc);
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } catch (error) {
    console.error('Routing failed:', error);
    // Fallback to standard navigation on error
    window.location.href = path;
  } finally {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.style.opacity = '1';
      mainContent.style.pointerEvents = 'auto';
    }
  }
}

function updateNavState(path) {
  // Normalize path (e.g., '/' becomes 'index.html')
  let currentPath = path.split('/').pop() || 'index.html';
  
  // Desktop Nav
  const desktopLinks = document.querySelectorAll('nav a.nav-btn');
  desktopLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath) {
      link.className = "nav-btn px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm";
    } else {
      link.className = "nav-btn px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 text-theme-textSecondary hover:text-theme-textPrimary hover:bg-theme-cardHover";
    }
  });

  // Mobile Nav
  const mobileLinks = document.querySelectorAll('#mobile-menu a[id^="mob-nav-"]');
  mobileLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath) {
      link.className = "w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 bg-blue-600/10 text-blue-400 border border-blue-500/10";
    } else if (href && !href.startsWith('http')) {
      link.className = "w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 text-theme-textSecondary hover:bg-theme-cardHover hover:text-theme-textPrimary transition";
    }
  });
}

function reinitializeScripts(path, newDoc) {
  let currentPath = path.split('/').pop() || 'index.html';
  
  // Dispatch a custom event that page scripts can listen to
  const event = new CustomEvent('pageLoad', { detail: { path: currentPath } });
  document.dispatchEvent(event);
  
  // Explicitly call init functions based on path
  if (currentPath === 'index.html') {
    if (typeof initApp === 'function') initApp();
  } else if (currentPath === 'informatika.html') {
    if (typeof renderDocs === 'function') renderDocs();
  } else if (currentPath === 'bahasa-indonesia.html') {
    // If there is initialization logic for bahasa indonesia
  } else if (currentPath === 'mandarin-learn.html') {
    // ...
  } else if (currentPath === 'games.html') {
    if (typeof initGames === 'function') initGames();
  } else if (currentPath === 'songs.html') {
    if (typeof initSongs === 'function') initSongs();
  }
}
