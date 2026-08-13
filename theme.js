/**
 * theme.js
 * Handles Dark/Light/Auto theme switching.
 */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
});

function initTheme() {
  // If the user already has inline theme logic in index.html, we can augment it here
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  updateThemeIcon();

  // Listen for system theme changes if set to auto
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      updateThemeIcon();
    }
  });
}

function toggleDarkMode() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateThemeIcon();
  
  // Show toast if showToast is available
  if (typeof showToast === 'function') {
    showToast(`Tema diubah ke mode ${isDark ? 'Gelap' : 'Terang'}`);
  }
}

function updateThemeIcon() {
  const isDark = document.documentElement.classList.contains('dark');
  const icon = document.getElementById('theme-toggle-icon');
  if (icon) {
    if (isDark) {
      icon.className = "fa-solid fa-sun text-sm animate-pulse";
    } else {
      icon.className = "fa-solid fa-moon text-sm animate-pulse";
    }
  }
}

window.toggleDarkMode = toggleDarkMode;
