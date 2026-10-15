
/* SASIKUMAR GLOBAL SEARCH API CONNECTOR */
(() => {
  const input = document.getElementById("sasikumarGlobalSearchInput");
  const box = document.getElementById("sasikumar-search-results");
  if (!input || !box) {
    console.error("SASIKUMAR AI Search: input/results box not found");
    return;
  }

  /* Ensure search results remain readable in light and dark themes */
  box.style.color = "#1f2937";
  box.style.backgroundColor = "#ffffff";

  let timer;
  let controller;

  input.addEventListener("input", () => {
    clearTimeout(timer);
    if (controller) controller.abort();

    const q = input.value.trim();

    if (!q) {
      box.replaceChildren();
      box.style.display = "none";
      return;
    }

    timer = setTimeout(async () => {
      controller = new AbortController();
      box.replaceChildren();
      const status = document.createElement("div");
      status.textContent = "Searching...";
      box.appendChild(status);
      box.style.display = "block";

      try {
        const response = await fetch(
          "/api/global-search?q=" + encodeURIComponent(q),
          { signal: controller.signal }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Search unavailable");
        }

        box.replaceChildren();
        const results = Array.isArray(data.results) ? data.results : [];

        if (!results.length) {
          const empty = document.createElement("div");
          empty.textContent = "No results found.";
          box.appendChild(empty);
          return;
        }

        results.forEach(item => {
          const card = document.createElement("div");
          card.style.cssText =
            "padding:10px;margin:6px 0;border-radius:10px;" +
            "background:rgba(128,128,128,.10);overflow-wrap:anywhere;";

          const title = document.createElement("a");
          title.textContent = item.title || "Search result";
          title.href = item.url || "#";
          title.style.cssText =
            "display:block;font-weight:700;color:inherit;";

          try {
            const url = new URL(title.href, location.origin);
            if (!["http:", "https:"].includes(url.protocol)) {
              title.href = "#";
            } else {
              title.href = url.href;
              title.target = "_blank";
              title.rel = "noopener noreferrer";
            }
          } catch {
            title.href = "#";
          }

          const description = document.createElement("div");
          description.textContent = item.content || "";
          description.style.cssText =
            "margin-top:5px;font-size:13px;white-space:normal;";

          card.append(title, description);
          box.appendChild(card);
        });
      } catch (error) {
        if (error.name === "AbortError") return;
        box.replaceChildren();
        const message = document.createElement("div");
        message.textContent = "Search unavailable. Please try again.";
        box.appendChild(message);
      }
    }, 350);
  });
})();
