(function () {
  var navBtn = document.getElementById("mobileNavToggle");
  var nav = document.getElementById("mainNav");
  if (navBtn && nav) {
    navBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      navBtn.setAttribute("aria-expanded", String(open));
    });
  }

  // Bilingual Traditional <-> Simplified normalization for instant search
  var T2S_PAIRS = [
    ["滙豐", "汇丰"], ["中銀", "中银"], ["中國銀行", "中国银行"], ["信銀國際", "信银国际"],
    ["東亞", "东亚"], ["銀聯", "银联"], ["雲閃付", "云闪付"], ["回贈", "回赠"],
    ["簽賬", "签账"], ["優惠", "优惠"], ["扣賬卡", "扣账卡"], ["扣帳卡", "扣账卡"],
    ["雙幣", "双币"], ["獎賞錢", "奖赏钱"], ["網購", "网购"], ["電匯", "电汇"],
    ["轉數快", "转数快"], ["離境稅", "离境税"], ["退稅", "退税"], ["積分", "积分"],
    ["萬事達", "万事达"], ["賬戶", "账户"], ["帳戶", "账户"], ["手續費", "手续费"],
    ["迎新", "新户"], ["高鐵", "高铁"], ["機票", "机票"], ["訂房", "订房"]
  ];
  function normText(str) {
    var s = (str || "").toLowerCase();
    for (var i = 0; i < T2S_PAIRS.length; i++) {
      s = s.split(T2S_PAIRS[i][0].toLowerCase()).join(T2S_PAIRS[i][1].toLowerCase());
    }
    return s;
  }

  var searchInput = document.getElementById("guideSearchInput");
  var searchBtn = document.getElementById("guideSearchBtn");
  function filterCards() {
    if (!searchInput) return;
    var q = normText(searchInput.value.trim());
    var tokens = q ? q.split(/\s+/).filter(Boolean) : [];
    var cards = document.querySelectorAll("[data-guide-card]");
    var shown = 0;
    cards.forEach(function (card) {
      var hay = normText(card.getAttribute("data-search") || "");
      var match = tokens.every(function (tk) { return hay.indexOf(tk) !== -1; });
      card.style.display = match ? "" : "none";
      if (match) shown++;
    });
    var status = document.getElementById("searchResultHint");
    if (status) {
      status.textContent = tokens.length
        ? ("已匹配到 " + shown + " 篇相關指南（支援繁簡雙語搜尋）")
        : "";
    }
  }
  if (searchInput) {
    var urlQ = new URLSearchParams(window.location.search).get("q");
    if (urlQ) {
      searchInput.value = urlQ;
      filterCards();
    }
    searchInput.addEventListener("input", filterCards);
  }
  if (searchBtn) {
    searchBtn.addEventListener("click", function () {
      if (searchInput && window.location.pathname === "/") {
        var val = searchInput.value.trim();
        if (val) {
          window.location.href = "/guides/?q=" + encodeURIComponent(val);
          return;
        }
      }
      filterCards();
    });
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
  if (btnAccept) btnAccept.addEventListener("click", function () { localStorage.setItem(KEY, "all"); hideBar(); });
  if (btnNecessary) btnNecessary.addEventListener("click", function () { localStorage.setItem(KEY, "necessary"); hideBar(); });
  if (btnReopen && bar) {
    btnReopen.addEventListener("click", function (e) { e.preventDefault(); bar.classList.add("visible"); });
  }

  // 1. Compound Savings Calculator
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

  // 2. Simple Interest Calculator
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

  // 3. FX & DCC Cost Calculator
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

  // 4. HK Credit Card Rebate Comparison Calculator
  var hkBtn = document.getElementById("runHkCardCalc");
  if (hkBtn) {
    var calcHk = function () {
      var online = parseFloat(document.getElementById("hkOnline").value) || 0;
      var dining = parseFloat(document.getElementById("hkDining").value) || 0;
      var mobile = parseFloat(document.getElementById("hkMobile").value) || 0;
      var fx = parseFloat(document.getElementById("hkOverseas").value) || 0;
      var total = online + dining + mobile + fx;

      // HSBC Red: 4% first $10k online, 1% rest (minus 1.95% FX fee on overseas)
      var redOnline = Math.min(online, 10000) * 0.04 + Math.max(0, online - 10000) * 0.01;
      var redOther = (dining + mobile + fx) * 0.01 - fx * 0.0195;
      var redNet = redOnline + redOther;

      // CITIC Motion: 6% on online + dining (extra 5.45% capped at $200/mo), 0.55% base (minus 1.95% FX on overseas)
      var motionBase = total * 0.0055;
      var motionExtra = Math.min(200, (online + dining) * 0.0545);
      var motionNet = motionBase + motionExtra - fx * 0.0195;

      // BOC Chill: 0.4% base + up to $150 extra on online/mobile/overseas (~4.6% extra)
      var chillBase = total * 0.004;
      var chillExtra = Math.min(150, (online + mobile + fx) * 0.046);
      var chillNet = chillBase + chillExtra - fx * 0.0195;

      // BEA GOAL: if total >= 2000, ~4% extra capped at $200 on online + mobile, 0.4% base
      var beaBase = total * 0.004;
      var beaExtra = total >= 2000 ? Math.min(200, (online + mobile) * 0.04) : 0;
      var beaNet = beaBase + beaExtra - fx * 0.0195;

      // EarnMORE / UnionPay 0% FX: flat 2% & 0% FX fee
      var unionNet = total * 0.02;

      document.getElementById("resHkRed").textContent = "HK$" + redNet.toFixed(1);
      document.getElementById("resHkMotion").textContent = "HK$" + motionNet.toFixed(1);
      document.getElementById("resHkChill").textContent = "HK$" + chillNet.toFixed(1);
      document.getElementById("resHkBea").textContent = "HK$" + beaNet.toFixed(1);
      document.getElementById("resHkUnion").textContent = "HK$" + unionNet.toFixed(1);
    };
    hkBtn.addEventListener("click", calcHk);
    calcHk();
  }

  // 5. Mainland Bank Payment Limit & Risk Unblock Checker
  var limBtn = document.getElementById("runLimitChecker");
  if (limBtn) {
    var BANK_DATA = {
      icbc: {
        name: "中国工商银行（工行）",
        sms: "95588",
        limit: "一类卡常见单笔 1万—5万元、单日 5万—10万元（二类卡日限 1万元）",
        path: "中国工商银行 App → 我的 → 银行卡 → 点选对应卡片 → 快捷支付管理 / 支付限额（可按财付通、支付宝、京东、美团分别上调）",
        unblock: "若在微信/支付宝提示风控拒付，立即查看 95588 核实短信并按提示回复确认本人交易，或进入工行 App「消息中心—工银信使风险提醒」刷脸一键放行。"
      },
      abc: {
        name: "中国农业银行（农行）",
        sms: "95599",
        limit: "常见单笔 1万—5万元，但新卡或久未动账卡默认非柜面常锁在 2,000—5,000元/日",
        path: "中国农业银行 App → 我的账户 → 安全锁与限额设置 → 网络支付限额 & 非柜面支出限额",
        unblock: "农行在支付宝、拼多多或抖音提示交易风险时，查看 95599 短信回复确认，或在农行掌银搜索「账户状态/解除管控」完成人脸识别验证。"
      },
      boc: {
        name: "中国银行（中行）",
        sms: "95566",
        limit: "常见单笔 1万—5万元、单日 5万—10万元",
        path: "中国银行 App → 账户管理 → 交易限额设置 → 快捷支付限额（单独调高微信、支付宝、京东、拼多多上限）",
        unblock: "中行卡在京东或拼多多支付失败，除回复 95566 确认短信外，若曾换卡或改过免密，请在京东/拼多多钱包内先解绑该卡再重新绑定验证一次即可恢复。"
      },
      ccb: {
        name: "中国建设银行（建行）",
        sms: "95533",
        limit: "一类卡单笔常见 1万—5万元、单日 5万—10万元（二类卡日累计硬上限 1万元）",
        path: "中国建设银行 App → 账户 → 安全中心 → 快捷支付管理",
        unblock: "留意 95533 短信提醒，或在建行 App 搜索「安全中心—交易风险确认」自助人脸核身。"
      },
      bocom: {
        name: "交通银行（交行）",
        sms: "95559",
        limit: "单笔常见 1万—5万元、单日 5万元；绑拼多多（多多支付）或抖音支付首次大额常触发 5,000—10,000元保护阈值",
        path: "交通银行 App（储蓄卡）/ 买单吧 App（信用卡）→ 银行卡 → 支付管理 → 第三方支付限额修改",
        unblock: "交行微信或拼多多拦截时，按 95559 短信提示回复确认，或在交通银行 App 消息通知中完成刷脸核实。"
      },
      psbc: {
        name: "中国邮政储蓄银行（邮储）",
        sms: "95580",
        limit: "小额防诈保护较严，常见默认单笔 5,000—2万元、单日 1万—5万元",
        path: "邮储银行 App → 我的账户 → 安全中心 / 电子支付管理 → 修改各渠道单笔及日累计限额",
        unblock: "邮储卡在美团、拼多多、抖音、微信、支付宝高频连刷极易触发保护性风控：第一时间查收 95580 短信回复确认，并合并购物车减少深夜连续小额试刷。"
      },
      cmb: {
        name: "招商银行（招行）",
        sms: "95555",
        limit: "额度普遍宽裕，一类卡常见单笔/单日 5万—20万元",
        path: "招商银行 App（储蓄卡）/ 掌上生活 App（信用卡）→ 银行卡 → 卡片限额 → 网上支付/快捷支付限额",
        unblock: "招行在美团或境外线上拦截时，会同步推送招行 App / 掌上生活弹窗与 95555 短信，点击「确认本人交易」秒级放行，立即可重付。"
      }
    };
    var PLAT_TIPS = {
      pdd: "拼多多大额家电数码若卡在多多支付单笔限额，可在收银台改选「微信支付」或先分两笔充值进微信零钱再全额合并付款。",
      douyin: "抖音直播间抢购超限时，可在抖音钱包绑定页核对是否绑成了二类储蓄卡，切换一类卡或支付宝跳转支付。",
      meituan: "美团点外卖或订酒店连下多单同金额订单易触发反盗刷拦截，建议间隔数分钟或回复银行短信放行。",
      jd: "京东大促买手机电脑超限时，可在京东收银台底部展开选择「中国银联（云闪付）」拉起银行 App 原生网关付款，额度更高还能叠银联立减。",
      wechat: "注意区分「微信零钱每年 20 万总额度」与「银行卡快捷限额」：零钱满 20 万直接切银行卡直扣即可继续支付。",
      alipay: "若单笔超限，可分两笔转入支付宝余额宝后再一次性合并支付大额订单。"
    };
    var runLim = function () {
      var bk = BANK_DATA[document.getElementById("limBank").value] || BANK_DATA.icbc;
      var pl = PLAT_TIPS[document.getElementById("limPlat").value] || "";
      document.getElementById("resLimRange").textContent = bk.limit;
      document.getElementById("resLimPath").textContent = bk.path;
      document.getElementById("resLimUnblock").textContent = "官方核实短信号码 " + bk.sms + "：" + bk.unblock + " " + pl;
    };
    limBtn.addEventListener("click", runLim);
    runLim();
  }
})();
