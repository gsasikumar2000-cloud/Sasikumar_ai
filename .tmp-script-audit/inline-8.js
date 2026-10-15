
(function(){
  const sample = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:Arial,sans-serif;padding:24px;background:#eff6ff;color:#172554}h1{color:#4338ca}button{padding:10px 16px;border:0;border-radius:10px;background:#4f46e5;color:white}</style>
<!-- SK_ALL_CARDS_UNIFORM_SIZE_V1 -->
<style id="SK_ALL_CARDS_UNIFORM_SIZE_V1">
/* Consistent sizing for card grids */
:is(
  .dash-grid,
  .service-grid,
  .newSmartHomeGrid,
  .skGrid,
  .loan-grid,
  #skYouTubeCreativeCards .sk-yt-grid,
  #skLiveBookCardsRow
) {
  display: flex !important;
  flex-flow: row nowrap !important;
  align-items: stretch !important;
  gap: 14px !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  padding: 10px 4px 16px !important;
  scroll-snap-type: x proximity;
  -webkit-overflow-scrolling: touch;
}

:is(
  .dash-grid,
  .service-grid,
  .newSmartHomeGrid,
  .skGrid,
  .loan-grid,
  #skYouTubeCreativeCards .sk-yt-grid,
  #skLiveBookCardsRow
) > * {
  box-sizing: border-box !important;
  flex: 0 0 260px !important;
  width: 260px !important;
  min-width: 0;
  min-height: 250px !important;
  max-width: 260px !important;
  height: auto !important;
  scroll-snap-align: start;
}

:is(
  .dash-grid,
  .service-grid,
  .newSmartHomeGrid,
  .skGrid,
  .loan-grid,
  #skYouTubeCreativeCards .sk-yt-grid,
  #skLiveBookCardsRow
) > * > * {
  box-sizing: border-box;
}

@media (max-width: 600px) {
  :is(
    .dash-grid,
    .service-grid,
    .newSmartHomeGrid,
    .skGrid,
    .loan-grid,
    #skYouTubeCreativeCards .sk-yt-grid,
    #skLiveBookCardsRow
  ) > * {
    flex-basis: 76vw !important;
    width: 76vw !important;
    max-width: 320px !important;
    min-height: 220px !important;
  }
}
</style>

</head><body><h1>SASIKUMAR AI</h1><p>Your creative design starts here.</p><button onclick="document.querySelector('p').textContent='Preview is working!'">Test Design</button>






<style id="SK_UNIFORM_HORIZONTAL_BOOK_CARDS_V1">
/* Uniform book-style horizontal swipe for card groups */
.dash-grid,
.service-grid,
.newSmartHomeGrid,
#skYouTubeCreativeCards .sk-yt-grid,
.skGrid,
.loan-grid,
#skLiveBookCardsRow {
  box-sizing: border-box;
  display: flex !important;
  flex-flow: row nowrap !important;
  gap: 14px !important;
  width: 100%;
  max-width: 100%;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  padding: 10px 8px 18px !important;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  touch-action: pan-x pan-y;
  scrollbar-width: thin;
}

.dash-grid > *,
.service-grid > *,
.newSmartHomeGrid > *,
#skYouTubeCreativeCards .sk-yt-card,
.skGrid > *,
.loan-grid > *,
#skLiveBookCardsRow > * {
  box-sizing: border-box;
  flex: 0 0 270px !important;
  width: 270px !important;
  min-width: 270px !important;
  max-width: 270px !important;
  min-height: 260px;
  height: auto;
  align-self: stretch;
  scroll-snap-align: start;
  overflow-wrap: anywhere;
}

#skYouTubeCreativeCards .sk-yt-card {
  display: flex;
  flex-direction: column;
}

#skYouTubeCreativeCards .sk-yt-video {
  width: 100%;
  aspect-ratio: 16 / 9;
  min-height: 150px;
}

@media (max-width: 600px) {
  .dash-grid,
  .service-grid,
  .newSmartHomeGrid,
  #skYouTubeCreativeCards .sk-yt-grid,
  .skGrid,
  .loan-grid,
  #skLiveBookCardsRow {
    gap: 12px !important;
  }

  .dash-grid > *,
  .service-grid > *,
  .newSmartHomeGrid > *,
  #skYouTubeCreativeCards .sk-yt-card,
  .skGrid > *,
  .loan-grid > *,
  #skLiveBookCardsRow > * {
    flex-basis: 82vw !important;
    width: 82vw !important;
    min-width: 82vw !important;
    max-width: 82vw !important;
  }
}
</style>


<style id="SK_CALL_CARD_UNIFORM_SIZE_V1">
/* Uniform size for the Communication / Call button */
a.skBtn[href^="tel:"] {
  box-sizing: border-box !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-height: 48px !important;
  min-width: 180px !important;
  max-width: 100% !important;
  padding: 12px 18px !important;
  text-align: center !important;
  white-space: normal !important;
  overflow-wrap: anywhere !important;
  border-radius: 12px !important;
}
@media (max-width: 480px) {
  a.skBtn[href^="tel:"] {
    min-width: 0 !important;
    width: 100% !important;
  }
}
</style>


<!-- SK_AUTO_HORIZONTAL_CARDS_V1 -->
<style id="SK_AUTO_HORIZONTAL_CARDS_V1">
/* Uniform horizontal card rows */
:is(
  .dash-grid,
  .service-grid,
  .newSmartHomeGrid,
  .skGrid,
  .loan-grid,
  #skYouTubeCreativeCards .sk-yt-grid,
  #skLiveBookCardsRow
) {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  align-items: stretch !important;
  gap: 14px !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  scroll-behavior: smooth !important;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

:is(
  .dash-grid,
  .service-grid,
  .newSmartHomeGrid,
  .skGrid,
  .loan-grid,
  #skYouTubeCreativeCards .sk-yt-grid,
  #skLiveBookCardsRow
) > * {
  box-sizing: border-box !important;
  flex: 0 0 260px !important;
  width: 260px !important;
  max-width: 260px !important;
  min-height: 250px !important;
}

@media(max-width:600px) {
  :is(
    .dash-grid,
    .service-grid,
    .newSmartHomeGrid,
    .skGrid,
    .loan-grid,
    #skYouTubeCreativeCards .sk-yt-grid,
    #skLiveBookCardsRow
  ) > * {
    flex-basis: 76vw !important;
    width: 76vw !important;
    max-width: 320px !important;
  }
}

/* Center the existing SASIKUMAR AI logo without moving its whole header */
img[src*="sasikumar-ai-logo"] {
  display: block;
  margin-left: auto !important;
  margin-right: auto !important;
}
</style>

<script id="SK_AUTO_HORIZONTAL_CARDS_SCRIPT">
(function () {
  if (window.__skAutoHorizontalCardsStarted) return;
  window.__skAutoHorizontalCardsStarted = true;

  const selectors = [
    '.dash-grid',
    '.service-grid',
    '.newSmartHomeGrid',
    '.skGrid',
    '.loan-grid',
    '#skLiveBookCardsRow'
  ];

  const active = new WeakMap();

  function setup() {
    document.querySelectorAll(selectors.join(',')).forEach(row => {
      if (active.has(row) || row.scrollWidth <= row.clientWidth + 5) return;

      const state = { paused: false, timer: null };
      active.set(row, state);

      const pause = () => { state.paused = true; };
      const resume = () => {
        state.paused = false;
      };

      row.addEventListener('touchstart', pause, { passive: true });
      row.addEventListener('touchend', () => {
        setTimeout(resume, 1800);
      }, { passive: true });
      row.addEventListener('pointerdown', pause);
      row.addEventListener('pointerup', () => {
        setTimeout(resume, 1800);
      });
      row.addEventListener('mouseenter', pause);
      row.addEventListener('mouseleave', resume);
      row.addEventListener('focusin', pause);
      row.addEventListener('focusout', resume);

      state.timer = setInterval(() => {
        if (state.paused ||
            document.hidden ||
            row.matches(':hover') ||
            row.scrollWidth <= row.clientWidth + 5) return;

        const max = row.scrollWidth - row.clientWidth;
        if (row.scrollLeft >= max - 3) {
          row.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          row.scrollBy({ left: 1, behavior: 'auto' });
        }
      }, 35);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }

  setInterval(setup, 2500);
})();
