/* ============================================================
   BUSINESS DETAILS
   Edit these and the whole page updates. Anything still in
   [SQUARE BRACKETS] shows as a highlighted placeholder until
   it's filled in. Also update the matching values written in
   index.html (search for "data-config") and the JSON-LD in the
   <head>, so search engines see the same details.
   ============================================================ */
const CONFIG = {
  businessName: "Daniel Hogan Electrical Contractor",
  phoneDisplay: "089 421 7655",
  phoneTel: "+353894217655",
  whatsapp: "353894217655",            // TODO: confirm the 089 is on WhatsApp
  email: "hogandanny41@gmail.com",     // from his Golden Pages listing. Confirm it's the one he wants on the site
  street: "School Street",
  locality: "Crinkill",
  town: "Birr",
  county: "Co. Offaly",
  eircode: "R42 CX82",
  mapsUrl: "https://www.google.com/maps/place/?q=place_id:ChIJMZ9M5on5XEgR1AACyTDIiPk",
  ownerName: "Daniel Hogan",
  recNumber: "A5599",                  // Safe Electric registration. Confirm against his ID card (see TODO.md)
  yearsTrading: "[YEARS TRADING]",     // TODO: confirm with client (a number, e.g. "12")
  facebookUrl: "[FACEBOOK URL]",       // TODO: confirm with client (full https:// link)

  // Opening hours (Irish time), from his Google listing. null = closed that day.
  // The "Open now" dots, the hours banner and the contact note all follow these.
  hoursText: "Mon to Sat, 8am to 5pm",
  hours: {
    mon: ["08:00", "17:00"],
    tue: ["08:00", "17:00"],
    wed: ["08:00", "17:00"],
    thu: ["08:00", "17:00"],
    fri: ["08:00", "17:00"],
    sat: ["08:00", "17:00"],
    sun: null
  },

  // Areas covered. These were picked by us as the towns within easy reach of Crinkill:
  // confirm with Daniel how far he travels (see TODO.md). Add or remove towns freely.
  areas: {
    offaly:    { label: "Co. Offaly",      towns: ["Birr", "Crinkill", "Banagher", "Kinnitty", "Shinrone", "Cloghan", "Ferbane", "Kilcormac", "Coolderry", "Clareen", "Tullamore"] },
    tipperary: { label: "North Tipperary", towns: ["Roscrea", "Nenagh", "Borrisokane", "Cloughjordan", "Moneygall", "Lorrha", "Terryglass"] },
    galway:    { label: "East Galway",     towns: ["Portumna", "Eyrecourt", "Killimor", "Ballinasloe"] },
    laois:     { label: "Co. Laois",       towns: ["Clonaslee", "Mountrath", "Borris-in-Ossory", "Rathdowney"] }
  },
  // Where Daniel is based: the area checker answers these with "that's home".
  homeTowns: ["Crinkill", "Birr"],
  // Other names people might type, pointing at a town above.
  townAliases: {
    "Crinkle": { town: "Crinkill", note: "another spelling of" },
    "Parsonstown": { town: "Birr", note: "the old name for" }
  },

  // FORM BACKEND: paste your Formspree endpoint here, e.g. "https://formspree.io/f/abcdwxyz".
  // While this is empty the form validates and shows the success message, but sends nothing.
  formEndpoint: ""
};


(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scrollBehaviour = reduced ? "auto" : "smooth";
  const isPlaceholder = (v) => !v || /^\[.*\]$/.test(String(v).trim());
  const waLink = (text) => `https://wa.me/${CONFIG.whatsapp}` + (text ? `?text=${encodeURIComponent(text)}` : "");
  const restartAnim = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

  /* ============ APPLY CONFIG ============ */
  $$("[data-config]").forEach((el) => {
    const key = el.dataset.config;
    const val = CONFIG[key];
    if (val === undefined || typeof val === "object") return;
    el.textContent = val;
    el.classList.toggle("todo", isPlaceholder(val));
  });

  $$("[data-config-href]").forEach((el) => {
    const type = el.dataset.configHref;
    let href = null;
    if (type === "tel") href = "tel:" + CONFIG.phoneTel;
    else if (type === "whatsapp") href = waLink(el.dataset.waText);
    else if (type === "email") href = isPlaceholder(CONFIG.email) ? null : "mailto:" + CONFIG.email;
    else if (type === "facebook") href = isPlaceholder(CONFIG.facebookUrl) ? null : CONFIG.facebookUrl;
    else if (type === "maps") href = CONFIG.mapsUrl || null;
    if (href) {
      el.setAttribute("href", href);
    } else {
      // no real value yet, so don't leave a dead link
      el.removeAttribute("href");
      el.removeAttribute("target");
    }
  });

  $("#year").textContent = new Date().getFullYear();

  /* ============ OPEN NOW? ============
     Works out whether Daniel is open right now (Irish time) from CONFIG.hours,
     and updates every "open" dot and status line on the page. */
  const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const toMins = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const fmtTime = (mins) => {
    const h = Math.floor(mins / 60), m = mins % 60;
    const h12 = ((h + 11) % 12) + 1;
    return h12 + (m ? ":" + String(m).padStart(2, "0") : "") + (h < 12 ? "am" : "pm");
  };
  const irishNow = () => {
    try {
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Dublin", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
      }).formatToParts(new Date());
      const get = (t) => parts.find((p) => p.type === t).value;
      const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
      return { day, mins: Number(get("hour")) * 60 + Number(get("minute")) };
    } catch (e) {
      const d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  };
  const openStatus = () => {
    const { day, mins } = irishNow();
    const today = CONFIG.hours[DAY_KEYS[day]];
    if (today && mins >= toMins(today[0]) && mins < toMins(today[1])) {
      return { open: true, until: fmtTime(toMins(today[1])) };
    }
    if (today && mins < toMins(today[0])) return { open: false, next: `${fmtTime(toMins(today[0]))} today` };
    for (let i = 1; i <= 7; i++) {
      const d = (day + i) % 7;
      const h = CONFIG.hours[DAY_KEYS[d]];
      if (h) return { open: false, next: `${fmtTime(toMins(h[0]))} ${i === 1 ? "tomorrow" : DAY_NAMES[d]}` };
    }
    return { open: false, next: null };
  };

  const status = openStatus();
  $$("[data-open-dot]").forEach((d) => {
    d.classList.toggle("is-open", status.open);
    d.classList.toggle("is-closed", !status.open);
  });
  $$("[data-open-status]").forEach((el) => {
    el.textContent = status.open
      ? `Open now · until ${status.until}`
      : status.next ? `Closed now · opens ${status.next}` : "Closed now";
  });
  $("#bandText").textContent = status.open
    ? `We're open until ${status.until} today. Ring ${CONFIG.phoneDisplay} and talk to us.`
    : `We're closed right now, back at ${status.next}. Leave a message or send a WhatsApp and we'll come back to you.`;
  $("#urgencyNote").textContent = status.open
    ? `We're open now, until ${status.until}. Ring for the quickest answer, or send the form and we'll come back to you.`
    : `We're closed right now. Send the form or a WhatsApp and we'll come back to you when we open at ${status.next}.`;

  /* ============ SCROLL LOCK (pop-ups and menu) ============ */
  const lockScroll = (on) => {
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.classList.toggle("no-scroll", on);
    document.body.style.paddingRight = on && sbw > 0 ? sbw + "px" : "";
  };

  /* ============ IMAGE PLACEHOLDERS ============
     Each <figure class="ph" data-img="images/..."> tries to load its photo.
     If the file is there, the photo fades in over the placeholder.
     If it isn't (404), the placeholder stays. Just upload the file with the right name. */
  document.addEventListener("ph:loaded", (e) => {
    const fig = e.target;
    if (!fig.closest(".g-item")) return;
    fig.tabIndex = 0;
    fig.setAttribute("role", "button");
    fig.setAttribute("aria-label", "View larger: " + (fig.dataset.alt || "photo"));
  });

  $$(".ph[data-img]").forEach((fig) => {
    const src = fig.dataset.img;
    if (!src) return;
    const img = document.createElement("img");
    img.alt = fig.dataset.alt || "";
    img.loading = fig.dataset.eager ? "eager" : "lazy";
    img.decoding = "async";
    // optional focal point, e.g. data-pos="62% 45%", so the crop keeps the subject at every screen size
    if (fig.dataset.pos) img.style.objectPosition = fig.dataset.pos;
    img.addEventListener("load", () => {
      fig.classList.add("has-img");
      fig.dispatchEvent(new CustomEvent("ph:loaded", { bubbles: true }));
    }, { once: true });
    img.addEventListener("error", () => img.remove(), { once: true });
    img.src = src;
    fig.prepend(img);
  });

  /* ============ HERO: THE LIGHT SWITCH ============
     The bulb flickers on as the page loads. The switch turns it off and on again. */
  const hero = $("#hero");
  const lightSwitch = $("#lightSwitch");
  const switchHint = $("#switchHint");
  let flickerTimer = null;
  const flicker = () => {
    if (reduced) return;
    restartAnim(hero, "flicker");
    clearTimeout(flickerTimer);
    flickerTimer = setTimeout(() => hero.classList.remove("flicker"), 1200);
  };
  const setLights = (on) => {
    hero.classList.toggle("lights-off", !on);
    lightSwitch.setAttribute("aria-pressed", String(on));
  };
  lightSwitch.addEventListener("click", () => {
    const on = lightSwitch.getAttribute("aria-pressed") !== "true";
    setLights(on);
    if (on) flicker();
    switchHint.classList.add("used");
  });
  if (!reduced) {
    setLights(false);
    setTimeout(() => { setLights(true); flicker(); }, 700);
  }

  /* ============ SCROLL-LINKED BITS (one rAF-throttled loop) ============ */
  const scrollFns = [];
  let ticking = false;
  const runScroll = () => { ticking = false; scrollFns.forEach((fn) => fn()); };
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(runScroll); }
  }, { passive: true });
  window.addEventListener("resize", runScroll);

  const header = $("#siteHeader");
  scrollFns.push(() => {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 24);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.style.setProperty("--p", max > 0 ? clamp(y / max, 0, 1).toFixed(4) : 0);
  });

  /* current runs along the wire as you scroll past the steps */
  const steps = $("#steps");
  const stepsFill = $("#stepsFill");
  scrollFns.push(() => {
    const r = steps.getBoundingClientRect();
    const vh = window.innerHeight;
    const desktop = window.innerWidth >= 1024;
    let p = desktop ? (vh * 0.9 - r.top) / (vh * 0.55) : (vh * 0.7 - r.top) / r.height;
    p = reduced ? 1 : clamp(p, 0, 1);
    stepsFill.style.width = desktop ? p * 100 + "%" : "";
    stepsFill.style.height = desktop ? "" : p * 100 + "%";
  });

  /* highlight the nav link for the section on screen */
  const navLinks = $$(".nav-link");
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      navLinks.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  navLinks.forEach((l) => { const s = $(l.getAttribute("href")); if (s) spy.observe(s); });

  /* ============ MOBILE MENU ============ */
  const menu = $("#mobileMenu");
  const menuToggle = $("#menuToggle");
  const menuClosed = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    lockScroll(false);
  };
  const closeMenu = () => { if (menu.open) menu.close(); menuClosed(); };
  menuToggle.addEventListener("click", () => {
    menu.showModal();
    menuToggle.setAttribute("aria-expanded", "true");
    lockScroll(true);
  });
  menu.addEventListener("cancel", (e) => { e.preventDefault(); closeMenu(); });
  menu.addEventListener("close", menuClosed);
  $("#mobileMenuClose").addEventListener("click", closeMenu);
  menu.addEventListener("click", (e) => { if (e.target === menu) closeMenu(); });
  $$("a", menu).forEach((a) => a.addEventListener("click", closeMenu));
  window.addEventListener("resize", () => { if (window.innerWidth >= 1180) closeMenu(); });

  /* ============ SCROLL REVEAL ============ */
  $$("[data-stagger]").forEach((group) => {
    let i = 0;
    Array.from(group.children).forEach((child) => {
      if (child.hasAttribute("data-reveal")) child.style.setProperty("--d", Math.min(i++ * 70, 420) + "ms");
    });
  });
  const revealEls = $$("[data-reveal]");
  if (reduced || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("in-view"));
  } else {
    const revealIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in-view");
        revealIO.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach((el) => revealIO.observe(el));
  }

  /* ============ CONTACT FORM PREFILL ============
     Any link to #contact with data-select="Service name" picks that service in the form.
     data-message="..." starts the message box off (only if they haven't typed anything). */
  const form = $("#quoteForm");
  const serviceSelect = $("#serviceSelect");
  const serviceField = $("#serviceField");
  const messageBox = $("#fMessage");
  const townBox = $("#fTown");

  messageBox.addEventListener("input", () => { messageBox.dataset.auto = "0"; });

  const prefill = (service, message) => {
    if (service && Array.from(serviceSelect.options).some((o) => o.value === service)) {
      serviceSelect.value = service;
      serviceSelect.removeAttribute("aria-invalid");
      $("#fServiceErr").textContent = "";
      restartAnim(serviceField, "flash");
    }
    if (message && (!messageBox.value.trim() || messageBox.dataset.auto === "1")) {
      messageBox.value = message;
      messageBox.dataset.auto = "1";
    }
  };

  const goToContact = (service, message) => {
    prefill(service, message);
    $("#contact").scrollIntoView({ behavior: scrollBehaviour, block: "start" });
    setTimeout(() => $("#fName").focus({ preventScroll: true }), reduced ? 0 : 800);
  };

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href='#contact']");
    if (!link || link.closest(".svc-modal")) return;
    prefill(link.dataset.select, link.dataset.message);
  });

  /* ============ "DOES THIS SOUND FAMILIAR?" CHECKLIST ============ */
  const symptomInputs = $$(".symptom input");
  const symptomCount = $("#symptomCount");
  const familiarBook = $("#familiarBook");
  const familiarPhoto = $("#familiarPhoto");
  const photoText = familiarPhoto.dataset.waText;
  const updateSymptoms = () => {
    const ticked = symptomInputs.filter((i) => i.checked).map((i) => i.value);
    const n = ticked.length;
    symptomCount.textContent = n === 0 ? "" : n === 1
      ? "You've ticked 1. It's worth getting looked at."
      : `You've ticked ${n}. They're worth getting looked at.`;
    const list = ticked.join(", ");
    familiarBook.dataset.message = n ? `I've noticed: ${list}. ` : "";
    familiarPhoto.href = waLink(photoText + (n ? ` I've noticed: ${list}.` : ""));
  };
  symptomInputs.forEach((i) => i.addEventListener("change", updateSymptoms));

  /* ============ SERVICE POP-UPS ============ */
  const modal = $("#svcModal");
  const smBody = $("#smBody");
  const smQuote = $("#smQuote");
  const DETAILS = {};
  $$(".svc-detail").forEach((d) => { DETAILS[d.dataset.service] = d; });
  // skip any service whose card has been hidden with data-show="false"
  const ORDER = Object.keys(DETAILS).filter((k) => {
    const btn = $(`.svc-card [data-open="${k}"]`);
    const card = btn && btn.closest(".svc-card");
    return !card || card.dataset.show !== "false";
  });
  let current = null;
  let pushed = false;
  let closing = false;
  let afterClose = null;

  const fill = (key) => {
    const d = DETAILS[key];
    current = key;
    $("#smTag").textContent = d.dataset.tag;
    $("#smTitle").textContent = d.dataset.title;
    smBody.innerHTML = d.innerHTML;
    smBody.scrollTop = 0;
    smQuote.dataset.select = d.dataset.select;
    const i = ORDER.indexOf(key);
    const prev = ORDER[(i - 1 + ORDER.length) % ORDER.length];
    const next = ORDER[(i + 1) % ORDER.length];
    $("#smPrevName").textContent = DETAILS[prev].dataset.title;
    $("#smNextName").textContent = DETAILS[next].dataset.title;
  };

  const openService = (key, fromHistory) => {
    if (!DETAILS[key]) return;
    if (modal.open) { swapService(key, !fromHistory); return; }
    fill(key);
    modal.showModal();
    lockScroll(true);
    if (!fromHistory) {
      history.pushState({ svc: key }, "", "#service-" + key);
      pushed = true;
    }
  };

  const reallyClose = () => {
    if (!modal.open || closing) return;
    closing = true;
    const finish = () => {
      modal.classList.remove("closing");
      modal.close();
      lockScroll(false);
      closing = false;
      const cb = afterClose;
      afterClose = null;
      if (cb) setTimeout(cb, 30);
    };
    if (reduced) { finish(); return; }
    modal.classList.add("closing");
    setTimeout(finish, 260);
  };

  const requestClose = (cb) => {
    if (!modal.open) return;
    afterClose = cb || null;
    if (pushed) {
      pushed = false;
      history.back();
      setTimeout(() => { if (modal.open) reallyClose(); }, 450); // in case popstate never comes
    } else {
      if (/^#service-/.test(location.hash)) history.replaceState(null, "", location.pathname + location.search);
      reallyClose();
    }
  };

  const swapService = (key, updateHistory = true) => {
    if (!DETAILS[key] || key === current) return;
    fill(key);
    restartAnim(smBody, "swap");
    if (updateHistory) history.replaceState({ svc: key }, "", "#service-" + key);
  };
  const stepService = (n) => {
    const i = ORDER.indexOf(current);
    swapService(ORDER[(i + n + ORDER.length) % ORDER.length]);
  };

  window.addEventListener("popstate", () => {
    const m = location.hash.match(/^#service-([\w-]+)$/);
    if (m && DETAILS[m[1]]) {
      if (modal.open) swapService(m[1], false);
      else openService(m[1], true);
    } else if (modal.open) {
      pushed = false;
      reallyClose();
    }
  });

  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-open]");
    if (!opener) return;
    e.preventDefault();
    openService(opener.dataset.open);
  });
  modal.addEventListener("cancel", (e) => { e.preventDefault(); requestClose(); });
  modal.addEventListener("click", (e) => { if (e.target === modal) requestClose(); });
  $("#smClose").addEventListener("click", () => requestClose());
  $("#smPrev").addEventListener("click", () => stepService(-1));
  $("#smNext").addEventListener("click", () => stepService(1));
  modal.addEventListener("keydown", (e) => {
    if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && !e.target.closest("input, textarea, select")) {
      e.preventDefault();
      stepService(e.key === "ArrowRight" ? 1 : -1);
    }
  });
  smQuote.addEventListener("click", (e) => {
    e.preventDefault();
    const service = smQuote.dataset.select;
    requestClose(() => goToContact(service));
  });

  // open straight from a shared link, e.g. index.html#service-ev
  const initial = location.hash.match(/^#service-([\w-]+)$/);
  if (initial && DETAILS[initial[1]]) setTimeout(() => openService(initial[1], true), 300);

  /* ============ FAQ ACCORDIONS (page and pop-ups) ============ */
  document.addEventListener("click", (e) => {
    const q = e.target.closest(".faq-q");
    if (!q) return;
    const item = q.closest(".faq-item");
    const open = !item.classList.contains("open");
    item.classList.toggle("open", open);
    q.setAttribute("aria-expanded", String(open));
  });

  /* ============ FAULT FINDER ============
     General guidance only. Edit the wording here. */
  const CHECK = {
    tripping: {
      title: "Trip switch keeps going", tag: "Something's leaking to earth",
      cause: "An RCD trips when it senses current leaking to earth. The usual culprits are a faulty appliance (kettles, immersions, washing machines), water in an outside light or socket, or a fault on one circuit. If it's a single breaker tripping instead, that circuit is overloaded or has a short.",
      fix: "Test the circuits and appliances to find the fault, repair it, and test the RCD. If the board is old, we'll talk you through an upgrade so one fault doesn't knock out the whole house.",
      tip: "Unplug everything on that circuit, reset the switch, then plug things back in one at a time. If it trips when one appliance goes in, that's likely your culprit. If it trips with nothing plugged in, leave it off and ring us.",
      select: "Fault finding or repair", more: "repairs"
    },
    flicker: {
      title: "Lights flickering or dimming", tag: "Often the bulb or dimmer",
      cause: "One light flickering is usually the bulb, a loose connection in the fitting, or an LED bulb on a dimmer that wasn't made for LEDs. If lights all over the house dim when the shower or kettle comes on, the circuits may be overloaded, or there's a loose connection further back.",
      fix: "Check the bulbs, fittings, drivers and dimmers, and tighten or replace any loose connections. If the whole house is affected, we test the main connections at the board, and if the problem is on the supply side, we'll tell you who to contact.",
      tip: "Try a different bulb first. If one light flickers, it's usually the fitting. If the whole house flickers, ring us.",
      select: "Fault finding or repair", more: "lighting"
    },
    hot: {
      title: "Socket warm, buzzing or scorched", tag: "Stop using it",
      cause: "Heat at a socket or switch means resistance: a loose or corroded connection, a damaged socket, or too much plugged in (heaters and adaptors are the usual suspects). Brown marks or a burning smell mean it has already overheated.",
      fix: "Replace the socket or switch, check the cable behind it for heat damage, and make sure the circuit isn't overloaded. If you're short of sockets, we'll add more so you're not relying on adaptors.",
      tip: "Stop using it. Unplug what's in it if it's safe to, and switch off that circuit at the fuse board until it's checked.",
      select: "Fault finding or repair", more: "repairs"
    },
    nopower: {
      title: "No power in part of the house", tag: "Check the board first",
      cause: "Usually a breaker or RCD that has tripped, or a blown fuse on an older board. If it won't reset, there's a fault on that circuit. If your whole house and the neighbours are out, it's a power cut, not your electrics.",
      fix: "Find the fault on the circuit, repair it, and test everything before it goes back on.",
      tip: "Look at the fuse board for a switch that's down and reset it once. If it trips straight away, leave it off and ring us. For power cuts, check powercheck.ie.",
      select: "Fault finding or repair", more: "repairs"
    },
    oldboard: {
      title: "Old fuse board with fuses", tag: "Worth upgrading",
      cause: "Boards with pull-out fuses, or breakers with no test button, usually have no RCD. That's the device that cuts the power in a split second if current leaks to earth, for example through a person. Old fuse wire can also be replaced with the wrong size.",
      fix: "Replace it with a modern consumer unit with RCD protection, test every circuit, label everything, and issue a completion certificate.",
      tip: "Not sure what you have? Try the fuse board check further down the page, or send us a photo.",
      select: "Fuse board upgrade", more: "fuseboard"
    },
    sockets: {
      title: "Not enough sockets", tag: "Common in older houses",
      cause: "Houses wired years ago were planned for a fraction of the appliances we use now. So extension leads and adaptors pile up, and that's where overloading and overheating start.",
      fix: "Add sockets where you actually need them: double sockets, USB sockets, outdoor sockets, or a new circuit for a home office or kitchen. New circuits come with a completion certificate.",
      tip: "Never plug one extension lead into another, and keep heaters out of extension leads altogether.",
      select: "Lighting, sockets or alarms", more: "lighting"
    },
    ev: {
      title: "Getting an electric car", tag: "Check your supply first",
      cause: "A home charger needs its own circuit and the right protection. How straightforward it is depends on your fuse board, your supply, and how far the board is from where you park.",
      fix: "Check your board and supply, fit the charger on a dedicated circuit with the right protection, then test, certify and set it up with you.",
      tip: "Take a photo of your fuse board and of where you'd park, and send them on WhatsApp. It helps us price the job.",
      select: "EV charger", more: "ev"
    },
    shock: {
      title: "Got a tingle or a shock", tag: "Get it checked today",
      cause: "A shock or tingle from an appliance, a tap or a metal fitting can mean a faulty appliance, a damaged cable, or a problem with the earthing or bonding in the house.",
      fix: "Test the earthing and bonding, check the appliance and the circuit, and find and fix the fault before it's used again.",
      tip: "Stop using the appliance or fitting, and switch off that circuit if it's safe to. If someone is still in contact with electricity, switch off the power before touching them. If anyone is hurt, ring 112.",
      select: "Fault finding or repair", more: "repairs"
    }
  };
  const MORE_NAME = {
    rewire: "House Rewiring", fuseboard: "Fuse Board Upgrades", newbuild: "New Builds", ev: "EV Chargers",
    lighting: "Lighting & Sockets", repairs: "Fault Finding", smart: "Smart Home", commercial: "Commercial Work"
  };
  const checkOpts = $$(".check-opt");
  const checkResult = $("#checkResult");
  const checkInner = $("#checkInner");
  const checkCta = $("#checkCta");
  const checkMore = $("#checkMore");

  const setCheck = (key, byUser) => {
    const d = CHECK[key];
    if (!d) return;
    checkOpts.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.problem === key)));
    $("#checkTag").textContent = d.tag;
    $("#checkTitle").textContent = d.title;
    $("#checkCause").textContent = d.cause;
    $("#checkFix").textContent = d.fix;
    $("#checkTip").textContent = d.tip || "";
    $("#checkTipWrap").hidden = !d.tip;
    checkCta.dataset.select = d.select;
    checkCta.dataset.message = `Fault finder: ${d.title}. `;
    checkMore.dataset.open = d.more;
    checkMore.setAttribute("href", "#service-" + d.more);
    checkMore.firstChild.textContent = `More on ${MORE_NAME[d.more]} `;
    restartAnim(checkInner, "swap");
    // on phones the answer is below the buttons, so bring it into view
    if (byUser && window.innerWidth < 1024) {
      const r = checkResult.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.55) checkResult.scrollIntoView({ behavior: scrollBehaviour, block: "start" });
    }
  };
  checkOpts.forEach((b) => b.addEventListener("click", () => setCheck(b.dataset.problem, true)));

  /* ============ FUSE BOARD CHECKER ============
     General guidance only. Edit the wording here. */
  const BOARDS = {
    fuses: {
      verdict: "bad", tag: "Time to upgrade", title: "An old fuse board",
      text: "Boards like this usually date back decades. They have no RCD, the device that cuts the power fast if current leaks to earth, through a person for example. Fuse wire can also be swapped for the wrong size. It doesn't mean there's a fault today, but it's worth upgrading, and it's often a sign the wiring needs a look too.",
      cta: "Get a Fuse Board Quote", select: "Fuse board upgrade",
      message: "Fuse board check: I have an old board with pull-out fuses. "
    },
    mcb: {
      verdict: "warn", tag: "Worth a check", title: "Breakers, but no RCD",
      text: "Breakers protect the cables from overloads, which is a big step up from fuses. But with no test button there's probably no RCD, so no fast protection against electric shock. Sometimes an RCD can be added. Often a new board makes more sense. We'll tell you which.",
      cta: "Get It Checked", select: "Fuse board upgrade",
      message: "Fuse board check: my board has breakers but no test button. "
    },
    rcd: {
      verdict: "good", tag: "Good start", title: "A board with RCD protection",
      text: "You have RCD protection. Press the test button every few months: it should trip straight away, then switch it back on. If it doesn't trip, or the board is scorched, buzzing or full, or you're adding an EV charger or an electric shower, get it checked.",
      cta: "Book a Check", select: "Not sure yet",
      message: "Fuse board check: my board has an RCD with a test button. "
    }
  };
  const fbOpts = $$(".fb-opt");
  const fbResult = $("#fbResult");
  const fbInner = $("#fbInner");
  const fbCta = $("#fbCta");
  const setBoard = (key) => {
    const b = BOARDS[key];
    if (!b) return;
    fbOpts.forEach((o) => o.setAttribute("aria-pressed", String(o.dataset.board === key)));
    fbResult.dataset.verdict = b.verdict;
    $("#fbTag").textContent = b.tag;
    $("#fbTitle").textContent = b.title;
    $("#fbText").textContent = b.text;
    fbCta.hidden = false;
    fbCta.firstChild.textContent = b.cta + " ";
    fbCta.dataset.select = b.select;
    fbCta.dataset.message = b.message;
    restartAnim(fbInner, "swap");
    if (window.innerWidth < 768) {
      const r = fbResult.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.6) fbResult.scrollIntoView({ behavior: scrollBehaviour, block: "center" });
    }
  };
  fbOpts.forEach((o) => o.addEventListener("click", () => setBoard(o.dataset.board)));

  /* ============ RECENT WORK: FILTER + LIGHTBOX ============ */
  const galleryItems = $$(".g-item");
  const filterBtns = $$(".gf-btn");
  filterBtns.forEach((btn) => btn.addEventListener("click", () => {
    const f = btn.dataset.filter;
    filterBtns.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    let shown = 0;
    galleryItems.forEach((item) => {
      const show = f === "all" || item.dataset.cat === f;
      item.classList.toggle("is-hidden", !show);
      if (show) {
        shown++;
        item.classList.add("in-view");
        restartAnim(item, "fade-in");
      }
    });
    $("#galleryEmpty").hidden = shown > 0;
    $("#galleryGrid").scrollLeft = 0; // phones: back to the first card in the swipeable row
  }));

  const lightbox = $("#lightbox");
  const lbImg = $("#lbImg");
  const lbCaption = $("#lbCaption");
  let lbList = [];
  let lbIndex = 0;
  const showLightboxItem = (i) => {
    lbIndex = (i + lbList.length) % lbList.length;
    const item = lbList[lbIndex];
    const img = $(".ph > img", item);
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    // caption: the job's title in bold, then its story
    const title = $(".g-cap h3", item);
    const story = $(".g-cap p", item);
    lbCaption.replaceChildren();
    if (title) {
      const b = document.createElement("strong");
      b.textContent = title.textContent;
      lbCaption.append(b);
    }
    if (story) lbCaption.append(story.textContent);
  };
  const openLightbox = (item) => {
    lbList = galleryItems.filter((it) => !it.classList.contains("is-hidden") && $(".ph", it).classList.contains("has-img"));
    const i = lbList.indexOf(item);
    if (i < 0) return;
    showLightboxItem(i);
    const many = lbList.length > 1;
    $("#lbPrev").hidden = !many;
    $("#lbNext").hidden = !many;
    lightbox.showModal();
    lockScroll(true);
  };
  const closeLightbox = () => { if (lightbox.open) lightbox.close(); lockScroll(false); };
  lightbox.addEventListener("close", () => lockScroll(false));
  lightbox.addEventListener("cancel", (e) => { e.preventDefault(); closeLightbox(); });
  $("#lbClose").addEventListener("click", closeLightbox);
  $("#lbPrev").addEventListener("click", () => showLightboxItem(lbIndex - 1));
  $("#lbNext").addEventListener("click", () => showLightboxItem(lbIndex + 1));
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox || e.target.classList.contains("lb-figure")) closeLightbox(); });
  lightbox.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") showLightboxItem(lbIndex + 1);
    if (e.key === "ArrowLeft") showLightboxItem(lbIndex - 1);
  });
  const galleryGrid = $("#galleryGrid");
  galleryGrid.addEventListener("click", (e) => {
    const fig = e.target.closest(".ph.has-img");
    if (fig) openLightbox(fig.closest(".g-item"));
  });
  galleryGrid.addEventListener("keydown", (e) => {
    const fig = e.target.closest(".ph.has-img");
    if (fig && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openLightbox(fig.closest(".g-item")); }
  });

  /* ============ AREAS: TOWN CHECKER ============ */
  const AREAS = CONFIG.areas;
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/&/g, "and").replace(/[^a-z]/g, "");
  // what people might type for a whole area rather than a town
  const AREA_WORDS = {
    offaly: ["offaly", "cooffaly", "countyoffaly"],
    tipperary: ["tipperary", "tipp", "northtipperary", "northtipp", "nthtipp", "cotipperary", "countytipperary"],
    galway: ["galway", "eastgalway", "cogalway", "countygalway"],
    laois: ["laois", "colaois", "countylaois"]
  };
  const areaTabs = $$(".area-tab");
  const areaChips = $("#areaChips");
  const areaResult = $("#areaResult");
  const areaInput = $("#areaInput");
  const hubParts = $$(".hub-node, .hub-wire");
  const townList = $("#townList");

  Object.values(AREAS).forEach((a) => a.towns.forEach((t) => {
    const o = document.createElement("option");
    o.value = t;
    townList.appendChild(o);
  }));

  const showRegion = (key, highlight) => {
    if (!AREAS[key]) return;
    areaTabs.forEach((t) => t.setAttribute("aria-pressed", String(t.dataset.region === key)));
    hubParts.forEach((p) => p.classList.toggle("on", p.dataset.region === key));
    areaChips.textContent = "";
    AREAS[key].towns.forEach((t, i) => {
      const li = document.createElement("li");
      li.textContent = t;
      li.style.setProperty("--ci", i);
      if (t === highlight) li.classList.add("hl");
      areaChips.appendChild(li);
    });
  };
  areaTabs.forEach((t) => t.addEventListener("click", () => showRegion(t.dataset.region)));
  $$(".hub-node").forEach((n) => n.addEventListener("click", () => showRegion(n.dataset.region)));
  showRegion("offaly");

  const setAreaResult = (ok, parts) => {
    areaResult.className = "area-result " + (ok ? "ok" : "no");
    areaResult.textContent = "";
    parts.forEach((p) => {
      if (typeof p === "string") { areaResult.appendChild(document.createTextNode(p)); return; }
      const a = document.createElement("a");
      a.href = p.href;
      a.textContent = p.text;
      if (p.onClick) a.addEventListener("click", p.onClick);
      areaResult.appendChild(a);
    });
  };
  const quoteLink = (town) => ({
    href: "#contact", text: "Get a quote",
    onClick: () => { if (town && !townBox.value.trim()) townBox.value = town; }
  });
  const ringLink = { href: "tel:" + CONFIG.phoneTel, text: "Give us a ring and ask." };

  $("#areaSearch").addEventListener("submit", (e) => {
    e.preventDefault();
    const raw = areaInput.value.trim();
    const q = norm(raw);
    if (!q) { areaInput.focus(); return; }

    // 1. exact town  2. other spelling or old name  3. a whole area ("Laois")  4. start of a town name
    const findTown = (match) => {
      for (const [key, a] of Object.entries(AREAS)) {
        const town = a.towns.find((t) => match(norm(t)));
        if (town) return { key, town };
      }
      return null;
    };
    let hit = findTown((t) => t === q);
    let alias = null;
    if (!hit) {
      const aliasName = Object.keys(CONFIG.townAliases).find((n) => norm(n) === q);
      if (aliasName) {
        const target = CONFIG.townAliases[aliasName];
        const key = Object.keys(AREAS).find((k) => AREAS[k].towns.includes(target.town));
        if (key) { hit = { key, town: target.town }; alias = { name: aliasName, note: target.note }; }
      }
    }
    if (!hit) {
      const key = Object.keys(AREA_WORDS).find((k) => AREA_WORDS[k].includes(q));
      if (key) hit = { key, town: null };
    }
    if (!hit && q.length >= 3) hit = findTown((t) => t.startsWith(q));

    if (hit && hit.town) {
      showRegion(hit.key, hit.town);
      const home = CONFIG.homeTowns.includes(hit.town);
      let lead;
      if (alias) lead = `Yes. ${alias.name} is ${alias.note} ${hit.town}, ${home ? "and that's home for us" : "and we cover it"}. `;
      else if (hit.town === CONFIG.locality) lead = `Yes, ${hit.town} is where we're based. `;
      else if (home) lead = `Yes, we're based just outside ${hit.town}. `;
      else lead = `Yes, we cover ${hit.town}. `;
      setAreaResult(true, [lead, quoteLink(hit.town)]);
    } else if (hit) {
      showRegion(hit.key);
      setAreaResult(true, [`We cover ${AREAS[hit.key].label}. Here are the main towns. Not on the list? `, ringLink]);
    } else {
      setAreaResult(false, ["Not on the list? ", ringLink]);
    }
  });

  /* ============ CONTACT FORM ============ */
  const fields = { name: $("#fName"), phone: $("#fPhone"), town: townBox, service: serviceSelect };
  const RULES = {
    name: (v) => v.trim().length >= 2 || "Please tell us your name.",
    phone: (v) => {
      const t = v.trim();
      if (!t) return "Please add a phone number so we can ring you back.";
      const digits = t.replace(/\D/g, "");
      return (/^[0-9+()\s-]+$/.test(t) && digits.length >= 7 && digits.length <= 15) || "That number doesn't look right. Please check it.";
    },
    town: (v) => v.trim().length >= 2 || "Which town or area are you in?",
    service: (v) => !!v || "Pick the closest match, or \"Not sure yet\"."
  };
  const validateField = (key) => {
    const el = fields[key];
    const res = RULES[key](el.value);
    const ok = res === true;
    if (ok) el.removeAttribute("aria-invalid");
    else el.setAttribute("aria-invalid", "true");
    $("#" + el.getAttribute("aria-describedby")).textContent = ok ? "" : res;
    return ok;
  };
  Object.keys(fields).forEach((key) => {
    const el = fields[key];
    el.addEventListener("blur", () => { if (el.value.trim()) validateField(key); });
    el.addEventListener(key === "service" ? "change" : "input", () => {
      if (el.getAttribute("aria-invalid") === "true") validateField(key);
    });
  });

  const formSuccess = $("#formSuccess");
  const formStatus = $("#formStatus");
  const formSubmit = $("#formSubmit");
  const submitLabel = formSubmit.innerHTML;

  const showSuccess = () => {
    form.reset();
    messageBox.dataset.auto = "0";
    formSuccess.hidden = false;
    formSuccess.querySelector("h3").setAttribute("tabindex", "-1");
    formSuccess.querySelector("h3").focus({ preventScroll: true });
  };
  const showFailure = () => {
    formStatus.textContent = `Sorry, that didn't send. Please try again, or ring ${CONFIG.phoneDisplay}.`;
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    formStatus.textContent = "";
    if (form.querySelector("[name=_gotcha]").value) return; // spam bot
    const bad = Object.keys(fields).filter((key) => !validateField(key));
    if (bad.length) { fields[bad[0]].focus(); return; }

    /* ---- FORM BACKEND ----
       Paste a Formspree endpoint into CONFIG.formEndpoint at the top of this file
       and enquiries will be sent there. Nothing else needs to change. */
    if (!CONFIG.formEndpoint) {
      console.info("Form not connected yet: add CONFIG.formEndpoint in script.js. Nothing was sent.");
      showSuccess();
      return;
    }
    formSubmit.disabled = true;
    formSubmit.textContent = "Sending...";
    fetch(CONFIG.formEndpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
      .then((r) => { if (r.ok) showSuccess(); else showFailure(); })
      .catch(showFailure)
      .finally(() => { formSubmit.disabled = false; formSubmit.innerHTML = submitLabel; });
  });
  $("#formAgain").addEventListener("click", () => {
    formSuccess.hidden = true;
    $("#fName").focus();
  });

  /* ============ STICKY MOBILE BAR ============
     Shows once the hero buttons scroll away, hides again over the contact form. */
  const mobileBar = $("#mobileBar");
  let pastHero = false;
  let atContact = false;
  const updateBar = () => mobileBar.classList.toggle("show", pastHero && !atContact);
  new IntersectionObserver(([e]) => {
    pastHero = !e.isIntersecting && e.boundingClientRect.top < 0;
    updateBar();
  }).observe($("#heroActions"));
  new IntersectionObserver(([e]) => {
    atContact = e.isIntersecting;
    updateBar();
  }, { threshold: 0.15 }).observe(form);

  runScroll();
})();
