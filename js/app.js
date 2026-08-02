/* ==========================================================================
   Copper & Clove — App logic
   All menu content is loaded from js/menu.json. Do not hardcode dishes here.
   ========================================================================== */
(function () {
  "use strict";

  const state = {
    data: null,
    activeCategory: "all",
    query: "",
  };

  const els = {};

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    cacheEls();
    bindStaticEvents();

    try {
      const res = await fetch("js/menu.json", { cache: "no-store" });
      if (!res.ok) throw new Error("menu.json request failed: " + res.status);
      state.data = await res.json();
    } catch (err) {
      console.error("Could not load menu data:", err);
      els.menuGrid.innerHTML =
        '<div class="empty-state"><h3>Menu unavailable</h3><p>We could not load the menu right now. Please refresh, or ask a member of staff for a printed copy.</p></div>';
      return;
    }

    renderRestaurantInfo(state.data.restaurant);
    renderCategoryChips(state.data.categories);
    renderStats(state.data);
    renderGrid();
  }

  function cacheEls() {
    els.navToggle = document.getElementById("navToggle");
    els.navLinks = document.getElementById("navLinks");
    els.searchToggle = document.getElementById("searchToggle");
    els.searchBar = document.getElementById("searchBar");
    els.searchInput = document.getElementById("searchInput");
    els.searchClear = document.getElementById("searchClear");
    els.categoryScroller = document.getElementById("categoryScroller");
    els.menuGrid = document.getElementById("menuGrid");
    els.resultsMeta = document.getElementById("resultsMeta");
    els.statItems = document.getElementById("statItems");
    els.statCats = document.getElementById("statCats");

    els.footerName = document.getElementById("footerName");
    els.footerTagline = document.getElementById("footerTagline");
    els.footerContact = document.getElementById("footerContact");
    els.footerHours = document.getElementById("footerHours");
    els.footerMap = document.getElementById("footerMap");
    els.footerCopyright = document.getElementById("footerCopyright");
    els.socialWhatsapp = document.getElementById("socialWhatsapp");
    els.socialFacebook = document.getElementById("socialFacebook");
    els.socialInstagram = document.getElementById("socialInstagram");
    els.whatsappFab = document.getElementById("whatsappFab");

    els.modalOverlay = document.getElementById("modalOverlay");
    els.modalClose = document.getElementById("modalClose");
    els.modalImage = document.getElementById("modalImage");
    els.modalCategory = document.getElementById("modalCategory");
    els.modalTitle = document.getElementById("modalTitle");
    els.modalPrice = document.getElementById("modalPrice");
    els.modalMeta = document.getElementById("modalMeta");
    els.modalDesc = document.getElementById("modalDesc");
    els.modalIngredientsWrap = document.getElementById("modalIngredientsWrap");
    els.modalIngredients = document.getElementById("modalIngredients");
    els.modalAvailability = document.getElementById("modalAvailability");
  }

  function bindStaticEvents() {
    // Mobile nav
    els.navToggle.addEventListener("click", () => {
      const isOpen = els.navLinks.classList.toggle("open");
      els.navToggle.setAttribute("aria-expanded", String(isOpen));
    });
    els.navLinks.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        els.navLinks.classList.remove("open");
        els.navToggle.setAttribute("aria-expanded", "false");
      })
    );

    // Search toggle scrolls to + focuses search
    els.searchToggle.addEventListener("click", () => {
      document.getElementById("menu").scrollIntoView({ behavior: "smooth" });
      setTimeout(() => els.searchInput.focus(), 400);
    });

    // Search input (debounced, instant client-side filter)
    let debounce;
    els.searchInput.addEventListener("input", (e) => {
      clearTimeout(debounce);
      const value = e.target.value;
      els.searchBar.classList.toggle("has-value", value.length > 0);
      debounce = setTimeout(() => {
        state.query = value.trim().toLowerCase();
        renderGrid();
      }, 120);
    });
    els.searchClear.addEventListener("click", () => {
      els.searchInput.value = "";
      els.searchBar.classList.remove("has-value");
      state.query = "";
      renderGrid();
      els.searchInput.focus();
    });

    // Modal close interactions
    els.modalClose.addEventListener("click", closeModal);
    els.modalOverlay.addEventListener("click", (e) => {
      if (e.target === els.modalOverlay) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }

  function renderRestaurantInfo(r) {
    document.title = `${r.name} — ${r.tagline}`;
    els.footerName.textContent = r.name;
    els.footerTagline.textContent = r.tagline + ". Scan the code on your table any time you want to see today's menu.";
    els.footerCopyright.textContent = `\u00A9 ${new Date().getFullYear()} ${r.name}. All rights reserved.`;

    els.footerContact.innerHTML = `
      <li><svg class="icon"><use href="icons/sprite.svg#icon-pin"></use></svg><span>${escapeHtml(r.address)}</span></li>
      <li><svg class="icon"><use href="icons/sprite.svg#icon-phone"></use></svg><a href="tel:${r.phone.replace(/\s+/g, "")}">${escapeHtml(r.phone)}</a></li>
      <li><svg class="icon"><use href="icons/sprite.svg#icon-mail"></use></svg><a href="mailto:${r.email}">${escapeHtml(r.email)}</a></li>
    `;

    els.footerHours.innerHTML = r.hours
      .map(
        (h) => `<li><svg class="icon"><use href="icons/sprite.svg#icon-clock"></use></svg><span>${escapeHtml(h.days)}<br>${escapeHtml(h.time)}</span></li>`
      )
      .join("");

    els.footerMap.src = r.mapEmbed || "";

    const waLink = `https://wa.me/${r.whatsapp}?text=${encodeURIComponent("Hi! I'd like to know more about your menu.")}`;
    els.socialWhatsapp.href = waLink;
    els.whatsappFab.href = waLink;
    els.socialFacebook.href = r.social.facebook;
    els.socialInstagram.href = r.social.instagram;
  }

  function renderStats(data) {
    els.statItems.textContent = data.items.length;
    els.statCats.textContent = data.categories.length;
  }

  function renderCategoryChips(categories) {
    const all = [{ id: "all", label: "All Dishes" }, ...categories];
    els.categoryScroller.innerHTML = all
      .map(
        (c, i) => `
      <button class="chip${c.id === "all" ? " active" : ""}" data-cat="${c.id}" role="tab" aria-selected="${c.id === "all"}">
        ${escapeHtml(c.label)}
      </button>`
      )
      .join("");

    els.categoryScroller.querySelectorAll(".chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        state.activeCategory = chip.dataset.cat;
        els.categoryScroller.querySelectorAll(".chip").forEach((c) => {
          c.classList.toggle("active", c === chip);
          c.setAttribute("aria-selected", String(c === chip));
        });
        renderGrid();
      });
    });
  }

  function getFilteredItems() {
    const { items } = state.data;
    const q = state.query;
    return items.filter((item) => {
      const matchesCategory = state.activeCategory === "all" || item.category === state.activeCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      const haystack = [item.name, item.category, ...(item.tags || []), ...(item.ingredients || [])]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  function renderGrid() {
    const items = getFilteredItems();
    const catLabel =
      state.activeCategory === "all"
        ? "All dishes"
        : state.data.categories.find((c) => c.id === state.activeCategory)?.label || "Menu";

    els.resultsMeta.textContent = `${items.length} ${items.length === 1 ? "dish" : "dishes"} \u2014 ${catLabel}${
      state.query ? ` \u2014 matching \u201c${state.query}\u201d` : ""
    }`;

    if (items.length === 0) {
      els.menuGrid.innerHTML = `
        <div class="empty-state">
          <h3>No dishes found</h3>
          <p>Try a different search term or browse another category.</p>
        </div>`;
      return;
    }

    els.menuGrid.innerHTML = items.map(cardTemplate).join("");

    els.menuGrid.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("click", () => openModal(card.dataset.id));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal(card.dataset.id);
        }
      });
    });
  }

  function cardTemplate(item, index) {
    const dietIcon = item.veg ? "icon-veg" : "icon-nonveg";
    return `
    <article class="card" data-id="${item.id}" tabindex="0" role="button" aria-label="View details for ${escapeHtml(
      item.name
    )}" style="animation-delay:${Math.min(index, 10) * 35}ms">
      <div class="card-media">
        <img src="${item.image}" alt="${escapeHtml(item.name)}" loading="lazy" width="400" height="400">
        <div class="card-badge">
          <svg class="icon diet-icon"><use href="icons/sprite.svg#${dietIcon}"></use></svg>
        </div>
        ${!item.available ? '<div class="card-unavailable">Currently Unavailable</div>' : ""}
        <div class="card-seal">&#8377;${item.price}<small>PRICE</small></div>
      </div>
      <div class="card-body">
        <span class="card-category">${escapeHtml(labelForCategory(item.category))}</span>
        <h3 class="card-name">${escapeHtml(item.name)}</h3>
        <p class="card-desc">${escapeHtml(item.description)}</p>
      </div>
    </article>`;
  }

  function labelForCategory(id) {
    return state.data.categories.find((c) => c.id === id)?.label || id;
  }

  function openModal(id) {
    const item = state.data.items.find((i) => i.id === id);
    if (!item) return;

    els.modalImage.src = item.image;
    els.modalImage.alt = item.name;
    els.modalCategory.textContent = labelForCategory(item.category);
    els.modalTitle.textContent = item.name;
    els.modalPrice.textContent = `\u20B9${item.price}`;
    els.modalDesc.textContent = item.description;

    const metaPills = [];
    metaPills.push(
      `<span class="meta-pill"><svg class="icon"><use href="icons/sprite.svg#${
        item.veg ? "icon-veg" : "icon-nonveg"
      }"></use></svg>${item.veg ? "Vegetarian" : "Non-Vegetarian"}</span>`
    );
    if (item.spiceLevel > 0) {
      metaPills.push(
        `<span class="meta-pill"><svg class="icon"><use href="icons/sprite.svg#icon-chili"></use></svg>${"Mild, Medium, Hot, Extra Hot".split(", ")[
          Math.min(item.spiceLevel, 3) - 1
        ] || "Spiced"}</span>`
      );
    }
    if (item.prepTime) {
      metaPills.push(
        `<span class="meta-pill"><svg class="icon"><use href="icons/sprite.svg#icon-clock"></use></svg>${escapeHtml(
          item.prepTime
        )}</span>`
      );
    }
    els.modalMeta.innerHTML = metaPills.join("");

    if (item.ingredients && item.ingredients.length) {
      els.modalIngredientsWrap.style.display = "";
      els.modalIngredients.innerHTML = item.ingredients.map((ing) => `<span>${escapeHtml(ing)}</span>`).join("");
    } else {
      els.modalIngredientsWrap.style.display = "none";
    }

    els.modalAvailability.innerHTML = item.available
      ? '<span class="dot on"></span> Available now'
      : '<span class="dot off"></span> Currently unavailable';

    els.modalOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
    els.modalClose.focus();
  }

  function closeModal() {
    els.modalOverlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  function escapeHtml(str) {
    if (str === undefined || str === null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
