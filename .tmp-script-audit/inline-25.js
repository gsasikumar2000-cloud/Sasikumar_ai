
(function () {
  function unifyReplyToolbar() {
    const oldBar = document.querySelector('.toolbar');
    const newBar = document.getElementById('skReplyToolsBar');

    if (!oldBar || !newBar) {
      console.warn('Reply toolbar elements not found.');
      return;
    }

    const duplicate = /camera|upload|voice|copy|paste|web search|remove file/i;
    const buttons = Array.from(oldBar.querySelectorAll('button'));

    buttons.forEach(function (button) {
      const label = (button.innerText || button.textContent || '').trim();

      if (!label || duplicate.test(label)) return;

      button.style.display = 'inline-flex';
      button.style.flex = '0 0 auto';
      button.style.margin = '0';
      newBar.appendChild(button);
    });

    oldBar.style.display = 'none';
    newBar.style.display = 'flex';
    newBar.style.flexWrap = 'wrap';
    newBar.style.gap = '7px';
    newBar.style.width = '100%';

    console.log('SASIKUMAR AI: Legacy tools merged into unified reply toolbar.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', unifyReplyToolbar, { once: true });
  } else {
    unifyReplyToolbar();
  }
})();
