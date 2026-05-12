(function () {
  window.PrePa = window.PrePa || {};
  window.PrePa.firebase = window.PrePa.firebase || {};

  function getAuth() {
    const app = window.PrePa.firebase.getApp && window.PrePa.firebase.getApp();
    if (!app || !window.firebase.auth) return null;
    return window.firebase.auth(app);
  }

  window.PrePa.firebase.getAuth = getAuth;
})();
