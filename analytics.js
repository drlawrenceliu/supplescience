// Google Analytics 4 — anonymous page-view statistics only.
// Health entries (weight, doses, check-ins, visit prep) live in localStorage and are never sent.
// To use a separate GA property for Evidence for Living, change GA_ID here only.
(function () {
  var GA_ID = "G-9FHJZ0YG7J";
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, {
    allow_google_signals: false, // no cross-device / demographics signals
    allow_ad_personalization_signals: false, // no ad personalisation
  });
})();
