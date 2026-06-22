// Shared utilities and page-specific init

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function getRestaurantById(id) {
  for (const passport of Object.values(PASSPORTS)) {
    const found = passport.restaurants.find(r => r.id === id);
    if (found) return { restaurant: found, passport };
    // Also check custom restaurants for this passport
    const custom = getCustomRestaurants(passport.id);
    const customFound = custom.find(r => r.id === id);
    if (customFound) return { restaurant: customFound, passport };
  }
  return null;
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Index page ───────────────────────────────────────────────────────────────
function initIndexPage() {
  const grid = document.getElementById("passport-grid");
  if (!grid) return;

  Object.values(PASSPORTS).forEach(passport => {
    const stampCount = getStampCount(passport.id);
    const total = passport.restaurants.length;

    const card = document.createElement("div");
    card.className = `passport-card${passport.available ? "" : " passport-card--coming-soon"}`;

    card.innerHTML = `
      <div class="passport-card__emoji">${passport.emoji}</div>
      <div class="passport-card__label">DMV Food Passport · Series 1</div>
      <h2 class="passport-card__name">${passport.name}</h2>
      <p class="passport-card__desc">${passport.description}</p>
      ${passport.available
        ? `<div class="passport-card__progress" style="margin-bottom:16px">
             <div class="progress-bar"><div class="progress-bar__fill" style="width:${total ? Math.round((stampCount/total)*100) : 0}%"></div></div>
             <span class="progress-label">${stampCount} / ${total} stamps collected</span>
           </div>
           <a href="passport.html?type=${passport.id}" class="btn btn--primary">Open Passport</a>`
        : `<span class="coming-soon-badge">Coming Soon</span>`
      }
    `;
    grid.appendChild(card);
  });
}

// ── Passport page ────────────────────────────────────────────────────────────
function initPassportPage() {
  const passportId = getParam("type") || "pizza";
  const passport = PASSPORTS[passportId];
  if (!passport) return;

  document.getElementById("passport-title").textContent = `${passport.emoji} ${passport.name}`;

  // Map
  initMap("map", 38.9072, -77.0369, 12);

  // Merge built-in + custom restaurants for map
  const custom = getCustomRestaurants(passportId);
  const allRestaurants = [...passport.restaurants, ...custom];
  loadPizzaPins(allRestaurants);

  // Stamp sidebar
  renderStampSidebar(passport, custom);

  // XP bar
  renderXPBar();

  // Modal
  initRestaurantModal(passportId, passport);

  // Handle stamp animation after returning from check-in
  const justCheckedIn = getParam("stamped");
  if (justCheckedIn) {
    const allResults = allRestaurants.find(r => r.id === justCheckedIn);
    if (allResults) {
      showStampAnimation(allResults.name);
      flyToRestaurant(justCheckedIn);
    }
    history.replaceState({}, "", `passport.html?type=${passportId}`);
  }
}

function renderStampSidebar(passport, custom = []) {
  const list = document.getElementById("stamp-list");
  if (!list) return;
  list.innerHTML = "";

  const visits = getVisits();
  const allRestaurants = [...passport.restaurants, ...custom];

  allRestaurants.forEach(r => {
    const visited = visits[r.id]?.checkedIn;
    const gold = isGoldStamp(r.id);
    const isCustom = !!r.custom;

    const item = document.createElement("div");
    item.className = `stamp-item${visited ? (gold ? " stamp-item--gold" : " stamp-item--visited") : ""}${isCustom ? " stamp-item--custom" : ""}`;

    const sealIcon = gold ? "⭐" : visited ? "✓" : "·";
    item.innerHTML = `
      <div class="stamp-seal">${sealIcon}</div>
      <div class="stamp-info">
        <div class="stamp-name">${r.name}</div>
        <div class="stamp-neighborhood">${r.neighborhood}</div>
      </div>
      ${isCustom ? `<button class="stamp-edit-btn" data-id="${r.id}" title="Edit">✏️</button>` : ""}
    `;

    // Click row → fly to pin (only if restaurant has coordinates)
    item.addEventListener("click", e => {
      if (e.target.classList.contains("stamp-edit-btn")) return;
      if (r.lat && r.lng) flyToRestaurant(r.id);
    });

    // Edit button
    const editBtn = item.querySelector(".stamp-edit-btn");
    if (editBtn) {
      editBtn.addEventListener("click", e => {
        e.stopPropagation();
        openEditModal(r);
      });
    }

    list.appendChild(item);
  });

  const total = allRestaurants.length;
  const count = getStampCountWithCustom(passport.id);
  const counter = document.getElementById("stamp-counter");
  if (counter) counter.textContent = `${count} / ${total} stamps collected`;
}

// ── Add / Edit Restaurant Modal ───────────────────────────────────────────────
let _currentPassportId = null;
let _currentPassport = null;

function initRestaurantModal(passportId, passport) {
  _currentPassportId = passportId;
  _currentPassport = passport;

  document.getElementById("open-add-modal").addEventListener("click", () => openAddModal());
  document.getElementById("close-modal").addEventListener("click", closeModal);
  document.getElementById("modal-backdrop").addEventListener("click", e => {
    if (e.target === document.getElementById("modal-backdrop")) closeModal();
  });
  document.getElementById("custom-restaurant-form").addEventListener("submit", e => {
    e.preventDefault();
    saveModalRestaurant();
  });
  document.getElementById("modal-delete-btn").addEventListener("click", deleteModalRestaurant);
}

function openAddModal() {
  document.getElementById("modal-title").textContent = "Add a Pizza Place";
  document.getElementById("edit-restaurant-id").value = "";
  document.getElementById("custom-restaurant-form").reset();
  document.getElementById("modal-delete-btn").style.display = "none";
  document.getElementById("modal-save-btn").textContent = "Save Place";
  document.getElementById("modal-backdrop").classList.add("modal-backdrop--visible");
  document.getElementById("input-name").focus();
}

function openEditModal(restaurant) {
  document.getElementById("modal-title").textContent = "Edit Pizza Place";
  document.getElementById("edit-restaurant-id").value = restaurant.id;
  document.getElementById("input-name").value = restaurant.name || "";
  document.getElementById("input-neighborhood").value = restaurant.neighborhood || "";
  document.getElementById("input-city").value = restaurant.city || "";
  document.getElementById("input-address").value = restaurant.address || "";
  document.getElementById("input-description").value = restaurant.description || "";
  document.getElementById("input-tags").value = (restaurant.tags || []).join(", ");
  document.getElementById("modal-delete-btn").style.display = "inline-block";
  document.getElementById("modal-save-btn").textContent = "Save Changes";
  document.getElementById("modal-backdrop").classList.add("modal-backdrop--visible");
  document.getElementById("input-name").focus();
}

function closeModal() {
  document.getElementById("modal-backdrop").classList.remove("modal-backdrop--visible");
}

function saveModalRestaurant() {
  const existingId = document.getElementById("edit-restaurant-id").value;
  const name = document.getElementById("input-name").value.trim();
  const neighborhood = document.getElementById("input-neighborhood").value.trim();
  const city = document.getElementById("input-city").value.trim();
  const address = document.getElementById("input-address").value.trim();
  const description = document.getElementById("input-description").value.trim();
  const tagsRaw = document.getElementById("input-tags").value.trim();
  const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean) : [];

  const data = {
    id: existingId || undefined,
    passportId: _currentPassportId,
    name, neighborhood, city, address, description, tags,
    difficulty: "easy",
    lat: null, lng: null
  };

  saveCustomRestaurant(data);
  closeModal();

  // Refresh sidebar and map
  const custom = getCustomRestaurants(_currentPassportId);
  renderStampSidebar(_currentPassport, custom);

  // Re-load all pins
  const allRestaurants = [..._currentPassport.restaurants, ...custom];
  loadPizzaPins(allRestaurants);
}

function deleteModalRestaurant() {
  const id = document.getElementById("edit-restaurant-id").value;
  if (!id) return;
  if (!confirm("Remove this place from your passport?")) return;

  deleteCustomRestaurant(id);
  closeModal();

  const custom = getCustomRestaurants(_currentPassportId);
  renderStampSidebar(_currentPassport, custom);

  const allRestaurants = [..._currentPassport.restaurants, ...custom];
  loadPizzaPins(allRestaurants);
}

function renderXPBar() {
  const xp = getXP();
  const level = getCurrentLevel();
  const progress = getXPProgress();
  const next = getNextLevel();

  const levelEl = document.getElementById("level-name");
  const xpEl = document.getElementById("xp-value");
  const barEl = document.getElementById("xp-bar-fill");
  const nextEl = document.getElementById("next-level");

  if (levelEl) levelEl.textContent = `${level.icon} ${level.name}`;
  if (xpEl) xpEl.textContent = `${xp} XP`;
  if (barEl) barEl.style.width = `${progress.percent}%`;
  if (nextEl) nextEl.textContent = next ? `${progress.xpNeeded - progress.xpInLevel} XP to ${next.name}` : "Max level reached!";
}

function showStampAnimation(restaurantName) {
  const overlay = document.getElementById("stamp-overlay");
  const nameEl = document.getElementById("stamp-overlay-name");
  if (!overlay) return;
  if (nameEl) nameEl.textContent = restaurantName;
  overlay.classList.add("stamp-overlay--visible");
  setTimeout(() => overlay.classList.remove("stamp-overlay--visible"), 3000);
}

// ── Restaurant page ──────────────────────────────────────────────────────────
function initRestaurantPage() {
  const id = getParam("id");
  if (!id) { window.location.href = "index.html"; return; }

  const result = getRestaurantById(id);
  if (!result) { window.location.href = "index.html"; return; }

  const { restaurant, passport } = result;
  const existingVisit = getVisit(id);

  document.getElementById("restaurant-name").textContent = restaurant.name;
  document.getElementById("restaurant-neighborhood").textContent = `${restaurant.neighborhood} · ${restaurant.city}`;
  document.getElementById("restaurant-address").textContent = restaurant.address;
  document.getElementById("restaurant-description").textContent = restaurant.description;
  document.getElementById("restaurant-emoji").textContent = passport.emoji;

  // Tags
  const tagsEl = document.getElementById("restaurant-tags");
  if (tagsEl) tagsEl.innerHTML = restaurant.tags.map(t => `<span class="tag">${t}</span>`).join("");

  // Ranking sliders (built before unlock logic runs)
  setupSliders(passport.attributes || []);

  // Photo upload
  setupPhotoUpload(existingVisit);

  // If already visited — unlock everything and prefill
  if (existingVisit?.checkedIn) {
    unlockAllSteps(existingVisit);
    prefillRankingForm(existingVisit);
  } else {
    // Fresh visit — wire up progressive unlock
    setupProgressiveUnlock(id, restaurant, passport);
  }

  // Submit
  const form = document.getElementById("ranking-form");
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      handleCheckIn(id, restaurant, passport);
    });
  }
}

function setStepProgress(step) {
  // step 1–4: 0%, 33%, 66%, 100%
  const percents = { 1: 0, 2: 33, 3: 66, 4: 100 };
  const fill = document.getElementById("step-progress-fill");
  if (fill) fill.style.width = percents[step] + "%";

  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById(`step-label-${i}`);
    if (!el) continue;
    el.classList.remove("step-label--active", "step-label--done");
    if (i < step) el.classList.add("step-label--done");
    else if (i === step) el.classList.add("step-label--active");
  }
}

function unlockSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (!el) return;
  el.classList.remove("step-section--locked");
  el.classList.add("step-section--unlocking");
  el.addEventListener("animationend", () => {
    el.classList.remove("step-section--unlocking");
    el.classList.add("step-section--active");
  }, { once: true });
  // Smooth scroll to unlocked section
  setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
}

function markSectionDone(sectionId, message) {
  const el = document.getElementById(sectionId);
  if (!el) return;
  el.classList.add("step-section--done");
  // Add done banner if not already there
  if (!el.querySelector(".step-done-banner")) {
    const banner = document.createElement("div");
    banner.className = "step-done-banner";
    banner.innerHTML = `✅ ${message}`;
    el.appendChild(banner);
  }
}

function setupProgressiveUnlock(id, restaurant, passport) {
  setStepProgress(1);

  // ── Step 1: Check In ─────────────────────────────────────────────
  const manualBtn = document.getElementById("checkin-manual");
  const photoTriggerBtn = document.getElementById("checkin-photo-trigger");

  function completeCheckIn(method) {
    // Visually mark chosen option
    document.querySelectorAll(".checkin-option").forEach(o => o.classList.remove("checkin-option--selected"));
    const chosen = method === "manual" ? manualBtn : photoTriggerBtn;
    chosen.classList.add("checkin-option--selected");
    // Mark step 1 done
    markSectionDone("checkin-section", method === "manual" ? "Checked in!" : "Photo added for check-in!");
    setStepProgress(2);
    unlockSection("rating-section");
    // Show the "looks good" button
    const doneRatingBtn = document.getElementById("done-rating-btn");
    if (doneRatingBtn) doneRatingBtn.style.display = "block";
  }

  manualBtn.addEventListener("click", () => completeCheckIn("manual"));

  photoTriggerBtn.addEventListener("click", () => {
    document.getElementById("photo-input").click();
    completeCheckIn("photo");
  });

  // ── Step 2: Rate It ──────────────────────────────────────────────
  const doneRatingBtn = document.getElementById("done-rating-btn");
  if (doneRatingBtn) {
    doneRatingBtn.addEventListener("click", () => {
      const overall = parseFloat(document.getElementById("overall-score")?.textContent || 3);
      markSectionDone("rating-section", `Rated ${overall.toFixed(1)} overall`);
      setStepProgress(3);
      unlockSection("return-section");
    });
  }

  // ── Step 3: Would you return? ────────────────────────────────────
  setupReturnButtons(null, () => {
    const yesActive = document.getElementById("return-yes")?.classList.contains("return-btn--active");
    markSectionDone("return-section", yesActive ? "You'd go back!" : "Noted!");
    setStepProgress(4);
    unlockSection("photos-section");
  });

  // ── Step 4: Photos → show submit ────────────────────────────────
  const skipBtn = document.getElementById("skip-photos-btn");
  if (skipBtn) skipBtn.addEventListener("click", revealSubmit);

  const photoInput = document.getElementById("photo-input");
  if (photoInput) {
    photoInput.addEventListener("change", () => {
      if (photoInput.files.length > 0) revealSubmit();
    });
  }

  function revealSubmit() {
    markSectionDone("photos-section", "Photos added!");
    const submitSection = document.getElementById("submit-section");
    if (submitSection) {
      submitSection.style.display = "block";
      submitSection.style.animation = "sectionUnlock 0.5s ease forwards";
      setTimeout(() => submitSection.scrollIntoView({ behavior: "smooth", block: "nearest" }), 150);
    }
    const skipBtn = document.getElementById("skip-photos-btn");
    if (skipBtn) skipBtn.style.display = "none";
  }
}

function unlockAllSteps(existingVisit) {
  // Already visited — show everything open, show submit
  ["checkin-section", "rating-section", "return-section", "photos-section"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove("step-section--locked");
      el.classList.add("step-section--active", "step-section--done");
    }
  });

  // Replace check-in section content for returning visitor
  const checkinSection = document.getElementById("checkin-section");
  if (checkinSection) {
    const existing = checkinSection.querySelector(".checkin-btn-group");
    if (existing) existing.innerHTML = `<div class="already-visited">✅ You've stamped this spot! <span>${formatDate(existingVisit.date)}</span></div>`;
  }

  // Show submit, hide skip/done helpers
  const submitSection = document.getElementById("submit-section");
  if (submitSection) submitSection.style.display = "block";

  const skipBtn = document.getElementById("skip-photos-btn");
  if (skipBtn) skipBtn.style.display = "none";

  const doneRatingBtn = document.getElementById("done-rating-btn");
  if (doneRatingBtn) doneRatingBtn.style.display = "none";

  setStepProgress(4);
  setupReturnButtons(existingVisit, null);
}

function setupSliders(attributes) {
  const container = document.getElementById("sliders-container");
  if (!container) return;
  container.innerHTML = "";
  attributes.forEach(attr => {
    const attrId = attr.toLowerCase();
    container.innerHTML += `
      <div class="slider-row">
        <label class="slider-label" for="slider-${attrId}">${attr}</label>
        <input type="range" id="slider-${attrId}" name="${attrId}" min="1" max="5" step="0.5" value="3" class="slider">
        <span class="slider-value" id="val-${attrId}">3.0</span>
      </div>
    `;
  });
  // Overall is always last and auto-calculated
  container.innerHTML += `
    <div class="slider-row slider-row--overall">
      <label class="slider-label">Overall</label>
      <div class="overall-score" id="overall-score">3.0</div>
    </div>
  `;

  // Live update
  attributes.forEach(attr => {
    const attrId = attr.toLowerCase();
    const slider = document.getElementById(`slider-${attrId}`);
    const valEl = document.getElementById(`val-${attrId}`);
    slider.addEventListener("input", () => {
      valEl.textContent = parseFloat(slider.value).toFixed(1);
      updateOverallScore(attributes);
    });
  });
}

function updateOverallScore(attributes) {
  const scores = attributes.map(attr => parseFloat(document.getElementById(`slider-${attr.toLowerCase()}`)?.value || 3));
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const el = document.getElementById("overall-score");
  if (el) el.textContent = avg.toFixed(1);
}

function prefillRankingForm(visit) {
  if (!visit?.scores) return;
  Object.entries(visit.scores).forEach(([key, val]) => {
    const slider = document.getElementById(`slider-${key}`);
    const valEl = document.getElementById(`val-${key}`);
    if (slider) { slider.value = val; }
    if (valEl) valEl.textContent = parseFloat(val).toFixed(1);
  });
  const overall = document.getElementById("overall-score");
  if (overall && visit.scores.overall) overall.textContent = parseFloat(visit.scores.overall).toFixed(1);
}

function setupReturnButtons(existingVisit, onSelect) {
  const yesBtn = document.getElementById("return-yes");
  const noBtn = document.getElementById("return-no");
  if (!yesBtn || !noBtn) return;

  if (existingVisit?.wouldReturn !== undefined) {
    (existingVisit.wouldReturn ? yesBtn : noBtn).classList.add("return-btn--active");
  }

  yesBtn.addEventListener("click", () => {
    yesBtn.classList.add("return-btn--active");
    noBtn.classList.remove("return-btn--active");
    if (onSelect) onSelect();
  });
  noBtn.addEventListener("click", () => {
    noBtn.classList.add("return-btn--active");
    yesBtn.classList.remove("return-btn--active");
    if (onSelect) onSelect();
  });
}

function setupPhotoUpload(existingVisit) {
  const input = document.getElementById("photo-input");
  const preview = document.getElementById("photo-preview");
  if (!input || !preview) return;

  if (existingVisit?.photos?.length) {
    existingVisit.photos.forEach(src => {
      const img = document.createElement("img");
      img.src = src;
      img.className = "photo-thumb";
      preview.appendChild(img);
    });
  }

  input.addEventListener("change", () => {
    Array.from(input.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.className = "photo-thumb photo-thumb--new";
        preview.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  });
}

function handleCheckIn(id, restaurant, passport) {
  const attributes = passport.attributes || [];
  const scores = {};
  attributes.forEach(attr => {
    const attrId = attr.toLowerCase();
    scores[attrId] = parseFloat(document.getElementById(`slider-${attrId}`)?.value || 3);
  });
  const overallText = document.getElementById("overall-score")?.textContent;
  scores.overall = parseFloat(overallText || 3);

  const yesBtn = document.getElementById("return-yes");
  const noBtn = document.getElementById("return-no");
  const wouldReturn = yesBtn?.classList.contains("return-btn--active") ? true
    : noBtn?.classList.contains("return-btn--active") ? false : null;

  const existingVisit = getVisit(id) || {};
  const isNewVisit = !existingVisit.checkedIn;

  // Collect new photos from file input
  const photoInput = document.getElementById("photo-input");
  const newPhotos = [];
  if (photoInput?.files?.length) {
    const photoPromises = Array.from(photoInput.files).map(file =>
      new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.readAsDataURL(file);
      })
    );
    Promise.all(photoPromises).then(photos => {
      finishCheckIn(id, restaurant, passport, scores, wouldReturn, isNewVisit, photos, existingVisit);
    });
  } else {
    finishCheckIn(id, restaurant, passport, scores, wouldReturn, isNewVisit, [], existingVisit);
  }
}

function finishCheckIn(id, restaurant, passport, scores, wouldReturn, isNewVisit, newPhotos, existingVisit) {
  const allPhotos = [...(existingVisit.photos || []), ...newPhotos];

  saveVisit(id, {
    checkedIn: true,
    date: existingVisit.date || new Date().toISOString().split("T")[0],
    scores,
    wouldReturn,
    photos: allPhotos
  });

  let xpGained = 0;
  if (isNewVisit) xpGained += XP_REWARDS.checkIn;
  if (newPhotos.length > 0) xpGained += XP_REWARDS.photo;
  xpGained += XP_REWARDS.ranking;

  const neighborhoods = passport.restaurants.map(r => r.neighborhood);
  const uniqueNeighborhoods = [...new Set(neighborhoods)];
  uniqueNeighborhoods.forEach(n => {
    if (checkNeighborhoodComplete(passport.id, n)) {
      xpGained += XP_REWARDS.neighborhoodComplete;
    }
  });

  addXP(xpGained);

  window.location.href = `passport.html?type=${passport.id}&stamped=${id}`;
}

// ── Profile page ─────────────────────────────────────────────────────────────
function initProfilePage() {
  const xp = getXP();
  const level = getCurrentLevel();
  const progress = getXPProgress();
  const next = getNextLevel();
  const visits = getVisits();

  document.getElementById("profile-level").textContent = `${level.icon} ${level.name}`;
  document.getElementById("profile-xp").textContent = `${xp} XP total`;

  const barEl = document.getElementById("profile-xp-bar-fill");
  if (barEl) barEl.style.width = `${progress.percent}%`;

  const nextEl = document.getElementById("profile-next-level");
  if (nextEl) nextEl.textContent = next ? `${progress.xpNeeded - progress.xpInLevel} XP to ${next.name}` : "Max level reached! 👑";

  // Pizza stamp book
  renderProfileStamps();

  // Photo journal
  renderPhotoJournal();

  // Stats
  const allVisited = Object.values(visits).filter(v => v.checkedIn);
  const neighborhoods = new Set();
  Object.entries(visits).forEach(([id, v]) => {
    if (!v.checkedIn) return;
    const result = getRestaurantById(id);
    if (result) neighborhoods.add(result.restaurant.neighborhood);
  });

  const stampCountEl = document.getElementById("stat-stamps");
  const neighborhoodEl = document.getElementById("stat-neighborhoods");
  if (stampCountEl) stampCountEl.textContent = allVisited.length;
  if (neighborhoodEl) neighborhoodEl.textContent = neighborhoods.size;
}

function renderProfileStamps() {
  const pizza = PASSPORTS.pizza;
  const container = document.getElementById("stamp-book");
  if (!container) return;
  container.innerHTML = "";

  pizza.restaurants.forEach(r => {
    const visit = getVisit(r.id);
    const visited = visit?.checkedIn;
    const gold = isGoldStamp(r.id);

    const stamp = document.createElement("div");
    stamp.className = `profile-stamp${visited ? (gold ? " profile-stamp--gold" : " profile-stamp--visited") : " profile-stamp--empty"}`;
    stamp.innerHTML = `
      <div class="profile-stamp__seal">${visited ? "🍕" : "·"}</div>
      <div class="profile-stamp__name">${r.name}</div>
      <div class="profile-stamp__neighborhood">${r.neighborhood}</div>
      ${visited && visit.date ? `<div class="profile-stamp__date">${formatDate(visit.date)}</div>` : ""}
      ${gold ? `<div class="profile-stamp__gold-badge">★ Top Rated</div>` : ""}
    `;
    if (visited) {
      stamp.addEventListener("click", () => window.location.href = `restaurant.html?id=${r.id}`);
    }
    container.appendChild(stamp);
  });
}

function renderPhotoJournal() {
  const grid = document.getElementById("photo-journal");
  if (!grid) return;
  grid.innerHTML = "";
  const visits = getVisits();

  let hasPhotos = false;
  Object.entries(visits).forEach(([id, visit]) => {
    if (!visit.photos?.length) return;
    const result = getRestaurantById(id);
    visit.photos.forEach(src => {
      hasPhotos = true;
      const wrap = document.createElement("div");
      wrap.className = "journal-photo";
      wrap.innerHTML = `
        <img src="${src}" alt="${result?.restaurant?.name || "Food photo"}" class="journal-photo__img">
        <div class="journal-photo__caption">${result?.restaurant?.name || ""}</div>
      `;
      grid.appendChild(wrap);
    });
  });

  if (!hasPhotos) {
    grid.innerHTML = `<p class="empty-state">No photos yet — check in at a restaurant to add your first food photo.</p>`;
  }
}

// ── Init on load ──────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (page === "index") initIndexPage();
  else if (page === "passport") initPassportPage();
  else if (page === "restaurant") initRestaurantPage();
  else if (page === "profile") initProfilePage();
});
