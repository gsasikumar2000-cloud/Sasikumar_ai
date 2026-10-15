
(function () {
  "use strict";
  function initSKLiveBookCards() {
    if (document.getElementById("skLiveBookCardsRow")) return;

    var kural = document.getElementById("dailyThirukkural");
    var ponmozhigal = document.getElementById("livePonmozhigal");
    if (!kural || !ponmozhigal || !kural.parentNode) {
      console.warn("SASIKUMAR AI Live Cards: existing Thirukkural/Ponmozhi sections not found.");
      return;
    }

    /* Keep the card row's section parent visible when legacy CSS hides sections. */
    /* Fix every ancestor section hidden by legacy CSS. */
    var liveHost = kural.parentElement;
    while (liveHost && liveHost !== document.body) {
      if (liveHost.tagName && liveHost.tagName.toLowerCase() === "section") {
        liveHost.classList.add("skMainFeatureCard");
        liveHost.style.setProperty("display", "block", "important");
        liveHost.style.setProperty("visibility", "visible", "important");
        liveHost.style.setProperty("opacity", "1", "important");
        liveHost.style.setProperty("width", "100%", "important");
        liveHost.style.setProperty("max-width", "100%", "important");
        liveHost.style.setProperty("box-sizing", "border-box", "important");
      }
      liveHost = liveHost.parentElement;
    }

    var row = document.createElement("div");
    row.id = "skLiveBookCardsRow";
    row.setAttribute("aria-label", "SASIKUMAR AI live book cards");
    row.setAttribute("role", "region");
    row.setAttribute("tabindex", "0");

    kural.parentNode.insertBefore(row, kural);
    kural.classList.add("skMainFeatureCard");
    ponmozhigal.classList.add("skMainFeatureCard");

    var news = document.createElement("article");
    news.className = "skLiveBookExtra";
    news.id = "skLiveNewsBookCard";
    news.innerHTML =
      '<h2>📰 LIVE NEWS</h2>' +
      '<div class="skLiveBookText" id="skLiveNewsBookText">செய்திகளைப் பெறுகிறது...</div>' +
      '<a class="skLiveBookLink" target="_blank" rel="noopener noreferrer" href="/live-news.html">📰 புதிய window-ல் செய்திகள் பார்க்க ↗</a>';

    /* Tap the card body to open the news page in a new tab. */
    news.style.setProperty("cursor", "pointer");
    news.addEventListener("click", function (event) {
      var link = event.target.closest("a");
      if (link && news.contains(link)) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        return;
      }
      window.open(
        "/live-news.html",
        "_blank",
        "noopener,noreferrer"
      );
    });

    var sports = document.createElement("article");
    sports.className = "skLiveBookExtra";
    sports.id = "skLiveSportsBookCard";
    sports.innerHTML =
      '<h2>🏏 LIVE SPORTS</h2>' +
      '<div class="skLiveBookText">விளையாட்டு செய்திகள், போட்டிகள் மற்றும் விளையாட்டு தகவல்கள்.</div>' +
      '<a class="skLiveBookLink" href="/sports/">Open Sports</a>';

    var kavithai = document.createElement("article");
    kavithai.className = "skLiveBookExtra";
    kavithai.id = "skLiveKavithaiBookCard";
    kavithai.innerHTML =
      '<h2>✍️ LIVE KAVITHAI</h2>' +
      '<div class="skLiveBookText" id="skLiveKavithaiBookText"></div>';

    row.appendChild(sports);
    row.appendChild(kural);
    row.appendChild(ponmozhigal);
    row.appendChild(kavithai);

    /* Place LIVE NEWS immediately after the Login section. */
    var loginSection = document.getElementById("sasikumarLoginScreen");
    if (loginSection && loginSection.parentNode) {
      loginSection.insertAdjacentElement("afterend", news);
      news.style.setProperty("display", "block", "important");
      news.style.setProperty("width", "calc(100% - 24px)");
      news.style.setProperty("max-width", "900px");
      news.style.setProperty("margin", "16px auto");
      news.style.setProperty("box-sizing", "border-box");
    } else {
      row.appendChild(news);
    }

    var poems = [
      "புதிய காலை புதிய நம்பிக்கை; முயற்சி தொடர்ந்தால் வெற்றி மலரும்.",
      "சிறு முயற்சியும் பெரிய மாற்றத்தின் தொடக்கமாகும்.",
      "அறிவை வளர்த்து, அன்பைப் பகிர்ந்து, நாளை அழகாக்குவோம்.",
      "தடைகள் வந்தாலும் தளராத மனமே வெற்றியின் முதல் படி.",
      "நல்ல எண்ணம் விதையாய் விழட்டும்; நல்ல செயல் வாழ்வில் மலரட்டும்."
    ];
    var poemIndex = 0;
    var newsBusy = false;

    function refreshSKNews() {
      if (newsBusy) return;
      var target = document.getElementById("skLiveNewsBookText");
      if (!target) return;

      newsBusy = true;
      target.setAttribute("aria-live", "polite");

      fetch("/api/breaking-news?category=Tamil%20Nadu&language=ta", {
        cache: "no-store"
      })
      .then(function (response) {
        if (!response.ok) throw new Error("News request failed: " + response.status);
        return response.json();
      })
      .then(function (data) {
        var items = Array.isArray(data) ? data :
          (data.articles || data.news || data.results || data.items || []);

        var validItems = items.filter(function (item) {
          return item && typeof item === "object" &&
            String(item.title || item.headline || "").trim();
        }).slice(0, 3);

        target.replaceChildren();

        if (!validItems.length) {
          target.textContent = "📰 புதிய செய்திகள் கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்.";
          return;
        }

        validItems.forEach(function (item, index) {
          var entry = document.createElement("article");
          entry.style.cssText =
            "padding:10px 0;border-bottom:1px solid #cbd5e1;overflow-wrap:anywhere;";

          var title = document.createElement("a");
          title.textContent = (index + 1) + ". " +
            String(item.title || item.headline || "").trim();
          title.style.cssText =
            "display:block;font-weight:800;color:#1d4ed8;text-decoration:underline;line-height:1.5;";

          var url = String(item.url || "").trim();
          try {
            var parsed = new URL(url);
            if ((parsed.protocol === "https:" || parsed.protocol === "http:") &&
                parsed.hostname && parsed.hostname.indexOf(".") > 0) {
              title.href = parsed.href;
              title.target = "_blank";
              title.rel = "noopener noreferrer";
            } else {
              title.removeAttribute("href");
              title.style.textDecoration = "none";
            }
          } catch (e) {
            title.removeAttribute("href");
            title.style.textDecoration = "none";
          }
          entry.appendChild(title);

          var details = [];
          if (item.published_date) {
            var date = new Date(item.published_date);
            if (!isNaN(date.getTime())) {
              details.push("📅 " + date.toLocaleDateString("ta-IN", {
                day: "numeric", month: "short", year: "numeric"
              }));
            }
          }

          try {
            if (url) details.push("🌐 " + new URL(url).hostname.replace(/^www\./, ""));
          } catch (e) {}

          var meta = document.createElement("div");
          meta.textContent = details.join(" • ") || "📰 செய்தி மூலம்";
          meta.style.cssText = "font-size:12px;color:#475569;margin-top:4px;";
          entry.appendChild(meta);

          var description = String(item.description || item.content || "").trim();
          if (description) {
            var summary = document.createElement("p");
            summary.textContent = description.length > 140
              ? description.slice(0, 140) + "…"
              : description;
            summary.style.cssText =
              "font-size:13px;color:#334155;line-height:1.5;margin:5px 0 0;";
            entry.appendChild(summary);
          }

          target.appendChild(entry);
        });

        var updated = document.createElement("div");
        updated.textContent = "🔄 புதுப்பிப்பு: " +
          new Date().toLocaleTimeString("ta-IN", {
            hour: "2-digit", minute: "2-digit"
          });
        updated.style.cssText =
          "font-size:11px;color:#64748b;margin-top:7px;";
        target.appendChild(updated);
      })
      .catch(function () {
        target.textContent = "செய்திகளை இப்போது பெற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.";
      })
      .finally(function () {
        newsBusy = false;
      });
    }

    function rotateSKPoem() {
      var target = document.getElementById("skLiveKavithaiBookText");
      if (!target) return;
      target.textContent = poems[poemIndex % poems.length];
      poemIndex++;
    }

    refreshSKNews();
    rotateSKPoem();

    /* Update live content every two minutes. */
    window.setInterval(function () {
      refreshSKNews();
      rotateSKPoem();
    }, 120000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSKLiveBookCards, { once: true });
  } else {
    initSKLiveBookCards();
  }
})();
