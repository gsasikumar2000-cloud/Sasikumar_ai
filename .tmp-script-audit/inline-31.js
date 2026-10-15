
(function () {
  function restoreYouTubeSection() {
    var section = document.getElementById('skYouTubeCreativeCards');
    if (!section) return;

    var footer = document.querySelector('footer');
    if (footer && footer.parentNode && !footer.contains(section)) {
      footer.parentNode.insertBefore(section, footer);
    } else {
      document.body.appendChild(section);
    }

    section.hidden = false;
    section.removeAttribute('hidden');
    section.style.setProperty('display', 'block', 'important');
    section.style.setProperty('visibility', 'visible', 'important');
    section.style.setProperty('opacity', '1', 'important');
    section.style.setProperty('height', 'auto', 'important');
    section.style.setProperty('max-height', 'none', 'important');
    section.style.setProperty('overflow', 'visible', 'important');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restoreYouTubeSection, { once: true });
  } else {
    restoreYouTubeSection();
  }
})();
