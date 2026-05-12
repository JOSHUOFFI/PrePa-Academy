(function () {
  window.PrePa = window.PrePa || {};
  window.PrePa.firebase = window.PrePa.firebase || {};

  function getFirebaseApp() {
    if (!window.firebase || !window.firebase.initializeApp) {
      return null;
    }

    if (window.PrePa.firebase.app) return window.PrePa.firebase.app;

    const config = window.PrePa.firebase.config;
    if (!config || Object.keys(config).length === 0) return null;

    window.PrePa.firebase.app = window.firebase.initializeApp(config);
    return window.PrePa.firebase.app;
  }

  window.PrePa.firebase.getApp = getFirebaseApp;
})();
