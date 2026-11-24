(function () {
  var navBtn = document.getElementById("mobileNavToggle");
  var nav = document.getElementById("mainNav");
  if (navBtn && nav) {
    navBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      navBtn.setAttribute("aria-expanded", String(open));
    });
  }

  // Instant guide filter on homepage / archive
  var searchInput = document.getElementById("guideSearchInput");
  var searchBtn = document.getElementById("guideSearchBtn");
  function filterCards() {
    if (!searchInput) return;
    var q = searchInput.value.trim().toLowerCase();
    var cards = document.querySelectorAll("[data-guide-card]");
    var shown = 0;
    cards.forEach(function (card) {
      var hay = (card.getAttribute("data-search") || "").toLowerCase();
      var match = !q || hay.indexOf(q) !== -1;
      card.style.display = match ? "" : "none";
      if (match) shown++;
    });
    var status = document.getElementById("searchResultHint");
    if (status) {
      status.textContent = q ? ("匹配到 " + shown + " 篇实用指南") : "";
    }
  }
  if (searchInput) {
    searchInput.addEventListener("input", filterCards);
  }
  if (searchBtn) {
    searchBtn.addEventListener("click", filterCards);
  }

  // Cookie preference bar
  var KEY = "vooqqqm_cookie_pref_v1";
  var bar = document.getElementById("cookieBar");
  function hideBar() { if (bar) bar.classList.remove("visible"); }
  if (bar && !localStorage.getItem(KEY)) {
    bar.classList.add("visible");
  }
  var btnAccept = document.getElementById("cookieAcceptBtn");
  var btnNecessary = document.getElementById("cookieNecessaryBtn");
  var btnReopen = document.getElementById("openCookieSettings");
  if (btnAccept) {
    btnAccept.addEventListener("click", function () {
      localStorage.setItem(KEY, "all");
      hideBar();
    });
  }
  if (btnNecessary) {
    btnNecessary.addEventListener("click", function () {
      localStorage.setItem(KEY, "necessary");
      hideBar();
    });
  }
  if (btnReopen && bar) {
    btnReopen.addEventListener("click", function (e) {
      e.preventDefault();
      bar.classList.add("visible");
    });
  }

  // Compound Savings Calculator
  var compBtn = document.getElementById("runCompoundCalc");
  if (compBtn) {
    var calcCompound = function () {
      var init = parseFloat(document.getElementById("cInit").value) || 0;
      var pmt = parseFloat(document.getElementById("cMonthly").value) || 0;
      var years = Math.min(50, Math.max(1, parseFloat(document.getElementById("cYears").value) || 1));
      var rate = (parseFloat(document.getElementById("cRate").value) || 0) / 100;
      var freq = parseInt(document.getElementById("cFreq").value, 10) || 12;
      var timing = document.getElementById("cTiming").value;
      var n = years * freq;
      var r = rate / freq;
      var fv = 0;
      if (r === 0) {
        fv = init + pmt * n;
      } else {
        var factor = Math.pow(1 + r, n);
        var annuity = pmt * ((factor - 1) / r);
        if (timing === "begin") annuity *= (1 + r);
        fv = init * factor + annuity;
      }
      var principal = init + pmt * n;
      var interest = fv - principal;
      document.getElementById("resCompTotal").textContent = "¥" + fv.toFixed(2);
      document.getElementById("resCompPrincipal").textContent = "¥" + principal.toFixed(2);
      document.getElementById("resCompInterest").textContent = "¥" + interest.toFixed(2);
    };
    compBtn.addEventListener("click", calcCompound);
    calcCompound();
  }

  // Simple Interest Calculator
  var simpBtn = document.getElementById("runSimpleCalc");
  if (simpBtn) {
    var calcSimple = function () {
      var p = parseFloat(document.getElementById("sPrincipal").value) || 0;
      var r = (parseFloat(document.getElementById("sRate").value) || 0) / 100;
      var term = parseFloat(document.getElementById("sTerm").value) || 0;
      var unit = document.getElementById("sUnit").value;
      var years = unit === "months" ? (term / 12) : unit === "days" ? (term / 360) : term;
      var interest = p * r * years;
      var total = p + interest;
      document.getElementById("resSimpInterest").textContent = "¥" + interest.toFixed(2);
      document.getElementById("resSimpTotal").textContent = "¥" + total.toFixed(2);
    };
    simpBtn.addEventListener("click", calcSimple);
    calcSimple();
  }

  // FX & DCC Cost Calculator
  var dccBtn = document.getElementById("runDccCalc");
  if (dccBtn) {
    var calcDcc = function () {
      var amt = parseFloat(document.getElementById("dAmount").value) || 0;
      var fx = parseFloat(document.getElementById("dRate").value) || 0;
      var dccMarkup = (parseFloat(document.getElementById("dMarkup").value) || 0) / 100;
      var cashback = (parseFloat(document.getElementById("dCashback").value) || 0) / 100;
      var cleanCost = amt * fx * (1 - cashback);
      var dccCost = amt * fx * (1 + dccMarkup);
      var diff = dccCost - cleanCost;
      document.getElementById("resCleanCny").textContent = "¥" + cleanCost.toFixed(2);
      document.getElementById("resDccCny").textContent = "¥" + dccCost.toFixed(2);
      document.getElementById("resDccSaved").textContent = "¥" + diff.toFixed(2);
    };
    dccBtn.addEventListener("click", calcDcc);
    calcDcc();
  }
})();
