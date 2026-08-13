/**
 * player.js
 * Handles the global Dual Source Audio Player (Spotify & Local MP3 Playlist).
 */

document.addEventListener("DOMContentLoaded", () => {
  initPlayer();
});

function initPlayer() {
  const playerHTML = `
    <div id="global-player" class="fixed bottom-6 right-6 z-50 transition-all duration-500 transform translate-y-32 opacity-0 flex flex-col gap-2">
      
      <!-- Minimized/Toggle Button -->
      <button id="player-toggle" class="self-end w-12 h-12 rounded-full glass bg-theme-darker border border-theme-border flex items-center justify-center text-emerald-500 shadow-xl hover:scale-105 hover:bg-theme-cardHover transition-all z-50">
        <i class="fa-solid fa-music text-xl"></i>
      </button>

      <!-- Player Container -->
      <div id="player-container" class="glass rounded-2xl w-80 shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-right scale-0 opacity-0 absolute bottom-14 right-0">
        
        <!-- Header -->
        <div class="px-4 py-3 bg-theme-darker border-b border-theme-border flex items-center justify-between">
          <div class="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-widest">
            <i class="fa-solid fa-compact-disc"></i> Now Playing
          </div>
          <button id="player-close" class="text-theme-textSecondary hover:text-rose-500 transition-colors">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        
        <!-- Source Switcher -->
        <div class="px-4 py-2 bg-theme-darker border-b border-theme-border flex justify-center gap-2">
          <button id="btn-source-local" class="flex-1 text-[10px] font-bold py-1.5 rounded-lg bg-theme-cardHover border border-theme-border hover:border-indigo-500 hover:text-indigo-500 transition-colors">Local MP3</button>
          <button id="btn-source-spotify" class="flex-1 text-[10px] font-bold py-1.5 rounded-lg bg-theme-cardHover border border-emerald-500/50 text-emerald-500 transition-colors">Spotify</button>
        </div>

        <!-- Spotify Embed -->
        <div id="spotify-container" class="p-4 flex flex-col items-center justify-center bg-theme-card">
          <iframe 
            id="spotify-iframe"
            style="border-radius:12px" 
            src="https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ?utm_source=generator&theme=0" 
            width="100%" 
            height="152" 
            frameBorder="0" 
            allowfullscreen="" 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy">
          </iframe>
        </div>

        <!-- Local Audio Player -->
        <div id="local-container" class="p-4 flex flex-col items-center justify-center bg-theme-card hidden">
          
          <!-- File Input for User Upload -->
          <div class="w-full mb-4 flex flex-col gap-1">
             <label for="local-file-input" class="text-[10px] text-theme-textSecondary uppercase tracking-wider font-bold">Upload Lagu Sendiri</label>
             <input type="file" id="local-file-input" accept="audio/*" multiple class="w-full text-[10px] text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-500/20 file:text-indigo-400 hover:file:bg-indigo-500/30 transition-all cursor-pointer">
          </div>

          <div class="w-full flex items-center gap-4 mb-4">
            <div id="local-artwork" class="w-16 h-16 rounded-lg bg-indigo-600 flex items-center justify-center text-2xl shadow-lg shrink-0 transition-transform duration-300">
              🎵
            </div>
            <div class="flex-1 overflow-hidden">
              <h3 id="local-title" class="text-white font-bold truncate text-sm">Belum ada lagu</h3>
              <p id="local-artist" class="text-theme-textSecondary text-xs truncate">Playlist kosong</p>
            </div>
          </div>
          
          <!-- Progress Bar -->
          <div class="w-full flex items-center gap-2 mb-3 px-1 text-[9px] text-theme-textSecondary">
            <span id="local-time-current">0:00</span>
            <input type="range" id="local-progress" class="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-500" value="0" step="0.1" min="0" max="100">
            <span id="local-time-duration">0:00</span>
          </div>

          <!-- Controls -->
          <div class="w-full flex justify-center items-center gap-5">
            <button id="btn-local-prev" class="w-8 h-8 rounded-full flex items-center justify-center text-theme-textSecondary hover:text-white hover:bg-indigo-500/20 transition-all">
              <i class="fa-solid fa-backward-step"></i>
            </button>
            <button id="btn-local-play" class="w-12 h-12 rounded-full bg-indigo-500 hover:bg-indigo-400 flex items-center justify-center text-white transition-all transform hover:scale-105 shadow-lg shadow-indigo-500/30">
              <i id="icon-local-play" class="fa-solid fa-play ml-0.5"></i>
              <i id="icon-local-pause" class="fa-solid fa-pause hidden"></i>
            </button>
            <button id="btn-local-next" class="w-8 h-8 rounded-full flex items-center justify-center text-theme-textSecondary hover:text-white hover:bg-indigo-500/20 transition-all">
              <i class="fa-solid fa-forward-step"></i>
            </button>
          </div>
          
          <div id="local-error" class="text-rose-500 text-[10px] mt-3 hidden text-center w-full">Gagal memuat audio.</div>
          <audio id="local-audio" preload="metadata"></audio>
        </div>
      </div>
      
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', playerHTML);

  const player = document.getElementById('global-player');
  const toggleBtn = document.getElementById('player-toggle');
  const container = document.getElementById('player-container');
  const closeBtn = document.getElementById('player-close');
  
  // Dual Source Elements
  const btnSourceLocal = document.getElementById('btn-source-local');
  const btnSourceSpotify = document.getElementById('btn-source-spotify');
  const spotifyContainer = document.getElementById('spotify-container');
  const localContainer = document.getElementById('local-container');
  const iframe = document.getElementById('spotify-iframe');
  
  // Local Player Elements
  const audio = document.getElementById('local-audio');
  const btnLocalPlay = document.getElementById('btn-local-play');
  const btnLocalPrev = document.getElementById('btn-local-prev');
  const btnLocalNext = document.getElementById('btn-local-next');
  const localProgress = document.getElementById('local-progress');
  const localTimeCurrent = document.getElementById('local-time-current');
  const localTimeDuration = document.getElementById('local-time-duration');
  const iconLocalPlay = document.getElementById('icon-local-play');
  const iconLocalPause = document.getElementById('icon-local-pause');
  const localArtwork = document.getElementById('local-artwork');
  const localError = document.getElementById('local-error');
  const localFileInput = document.getElementById('local-file-input');

  // Global State (exposed to window for songs.html to access)
  window.localPlaylist = [];
  window.currentSongIndex = 0;
  
  // Internal State
  let activeSource = 'spotify';
  let isLocalPlaying = false;

  // Animate in after a short delay
  setTimeout(() => {
    player.classList.remove('translate-y-32', 'opacity-0');
  }, 1000);

  // Toggle player open/close
  toggleBtn.addEventListener('click', () => {
    const isOpen = container.classList.contains('scale-100');
    if (isOpen) {
      container.classList.remove('scale-100', 'opacity-100');
      container.classList.add('scale-0', 'opacity-0');
    } else {
      container.classList.remove('scale-0', 'opacity-0');
      container.classList.add('scale-100', 'opacity-100');
    }
  });

  closeBtn.addEventListener('click', () => {
    container.classList.remove('scale-100', 'opacity-100');
    container.classList.add('scale-0', 'opacity-0');
  });

  // Dual Source Switcher Logic
  btnSourceLocal.addEventListener('click', () => switchSource('local'));
  btnSourceSpotify.addEventListener('click', () => switchSource('spotify'));

  function switchSource(source) {
    if (activeSource === source) return;
    activeSource = source;

    if (source === 'local') {
      spotifyContainer.classList.add('hidden');
      localContainer.classList.remove('hidden');
      btnSourceLocal.classList.add('border-indigo-500', 'text-indigo-500');
      btnSourceSpotify.classList.remove('border-emerald-500/50', 'text-emerald-500');
      toggleBtn.classList.remove('text-emerald-500');
      toggleBtn.classList.add('text-indigo-500');
      
      const currentSrc = iframe.src;
      iframe.src = currentSrc;
    } else {
      localContainer.classList.add('hidden');
      spotifyContainer.classList.remove('hidden');
      btnSourceSpotify.classList.add('border-emerald-500/50', 'text-emerald-500');
      btnSourceLocal.classList.remove('border-indigo-500', 'text-indigo-500');
      toggleBtn.classList.remove('text-indigo-500');
      toggleBtn.classList.add('text-emerald-500');
      
      if (isLocalPlaying) toggleLocalPlay();
    }
  }

  // --- Playlist & Local Logic ---

  localFileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      window.localPlaylist.push(...files);
      
      document.dispatchEvent(new CustomEvent('playlistUpdated'));
      
      // If it's the first batch, play the first song immediately
      if (window.localPlaylist.length === files.length) {
        window.playSong(0);
      }
    }
  });

  window.playSong = function(index) {
    if (index < 0 || index >= window.localPlaylist.length) return;
    window.currentSongIndex = index;
    const file = window.localPlaylist[index];
    
    audio.src = URL.createObjectURL(file);
    
    document.getElementById('local-title').innerText = file.name.replace(/\.[^/.]+$/, "");
    document.getElementById('local-artist').innerText = "Playlist Track " + (index + 1);
    
    audio.play().then(() => {
      isLocalPlaying = true;
      updateLocalUI();
      document.dispatchEvent(new CustomEvent('songChanged', { detail: { index } }));
    }).catch(err => {
      console.error("Local Audio Playback Error:", err);
      localError.classList.remove('hidden');
    });
  }

  btnLocalPlay.addEventListener('click', toggleLocalPlay);

  btnLocalPrev.addEventListener('click', () => {
    if (window.localPlaylist.length === 0) return;
    // Go to previous song or loop to end
    const prevIndex = window.currentSongIndex - 1 < 0 ? window.localPlaylist.length - 1 : window.currentSongIndex - 1;
    window.playSong(prevIndex);
  });
  
  btnLocalNext.addEventListener('click', () => {
    if (window.localPlaylist.length === 0) return;
    // Go to next song or loop to start
    const nextIndex = (window.currentSongIndex + 1) % window.localPlaylist.length;
    window.playSong(nextIndex);
  });

  function toggleLocalPlay() {
    if (window.localPlaylist.length === 0) return; // Do nothing if no songs

    if (audio.paused) {
      audio.play().then(() => {
        isLocalPlaying = true;
        updateLocalUI();
      }).catch(err => {
        console.error("Local Audio Playback Error:", err);
        localError.classList.remove('hidden');
      });
    } else {
      audio.pause();
      isLocalPlaying = false;
      updateLocalUI();
    }
  }

  function updateLocalUI() {
    if (isLocalPlaying) {
      iconLocalPlay.classList.add('hidden');
      iconLocalPause.classList.remove('hidden');
      localArtwork.classList.add('scale-105');
    } else {
      iconLocalPlay.classList.remove('hidden');
      iconLocalPause.classList.add('hidden');
      localArtwork.classList.remove('scale-105');
    }
  }

  audio.addEventListener('error', () => {
    if(window.localPlaylist.length > 0) localError.classList.remove('hidden');
    isLocalPlaying = false;
    updateLocalUI();
  });

  audio.addEventListener('playing', () => {
    localError.classList.add('hidden');
  });
  
  audio.addEventListener('ended', () => {
    // Auto next
    if (window.currentSongIndex < window.localPlaylist.length - 1) {
      window.playSong(window.currentSongIndex + 1);
    } else {
      isLocalPlaying = false;
      updateLocalUI();
      // Reset to beginning
      window.currentSongIndex = 0;
      audio.src = URL.createObjectURL(window.localPlaylist[0]);
    }
  });

  // Time formatting helper
  function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return min + ":" + sec.toString().padStart(2, '0');
  }

  // Progress Bar updates
  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      localProgress.value = (audio.currentTime / audio.duration) * 100;
      localTimeCurrent.innerText = formatTime(audio.currentTime);
      localTimeDuration.innerText = formatTime(audio.duration);
    }
  });

  audio.addEventListener('loadedmetadata', () => {
      localTimeDuration.innerText = formatTime(audio.duration);
  });

  // Seeking
  localProgress.addEventListener('input', (e) => {
    if (audio.duration) {
      const seekTime = (e.target.value / 100) * audio.duration;
      audio.currentTime = seekTime;
    }
  });
}
