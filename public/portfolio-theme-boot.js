// Theme boot: applies the saved preset/mode before paint so returning visitors
// never see a flash of the wrong theme. Keys must stay in sync with
// lib/portfolio-theme.ts (PF_THEME_KEY / PF_MODE_KEY).
(function () {
  try {
    var t = localStorage.getItem("gitfolio:portfolio-theme");
    var m = localStorage.getItem("gitfolio:portfolio-mode");
    var r = document.documentElement;
    if (t) r.setAttribute("data-pf-theme", t);
    if (m) r.setAttribute("data-pf-mode", m);
  } catch {}
})();
