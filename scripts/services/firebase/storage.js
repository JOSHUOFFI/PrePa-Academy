(function () {
  window.PrePa = window.PrePa || {};
  window.PrePa.firebase = window.PrePa.firebase || {};

  function getStorage() {
    const app = window.PrePa.firebase.getApp && window.PrePa.firebase.getApp();
    if (!app || !window.firebase.storage) return null;
    return window.firebase.storage(app);
  }

  window.PrePa.firebase.getStorage = getStorage;
})();
