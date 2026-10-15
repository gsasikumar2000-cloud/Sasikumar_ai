
(function(){
  const form = document.getElementById('skDesignBelowSearchForm');
  const input = document.getElementById('skDesignBelowSearchInput');
  const out = document.getElementById('skDesignBelowSearchResults');
  if (!form || !input || !out || form.dataset.ready) return;
  form.dataset.ready = '1';
  form.addEventListener('submit', async function(event){
    event.preventDefault();
    const query = input.value.trim();
    if (!query) {
      out.textContent = 'Please enter a search query.';
      input.focus();
      return;
    }
    out.textContent = 'Searching the web...';
    try {
      const response = await fetch('/api/global-search?q=' + encodeURIComponent(query));
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Search failed');
      out.replaceChildren();
      const heading = document.createElement('p');
      heading.textContent = 'Results for: ' + (data.query || query);
      out.appendChild(heading);
      (data.results || []).forEach(function(item){
        const card = document.createElement('article');
        card.style.cssText = 'padding:12px;margin:8px 0;border-radius:10px;background:#ffffff18;border:1px solid #ffffff30;';
        const link = document.createElement('a');
        link.textContent = item.title || item.url || 'Open result';
        link.href = item.url || '#';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.style.cssText = 'color:#bae6fd;font-weight:800;';
        card.appendChild(link);
        const desc = document.createElement('p');
        desc.textContent = item.content || '';
        card.appendChild(desc);
        out.appendChild(card);
      });
      if (!(data.results || []).length) out.append('No results found.');
    } catch (error) {
      out.textContent = 'Web search error: ' + error.message;
    }
  });
})();
