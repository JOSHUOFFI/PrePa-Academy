(function () {
  window.PrePa = window.PrePa || {};
  window.PrePa.firebase = window.PrePa.firebase || {};

  function getFirestore() {
    const app = window.PrePa.firebase.getApp && window.PrePa.firebase.getApp();
    if (!app || !window.firebase.firestore) return null;
    return window.firebase.firestore(app);
  }

  window.PrePa.firebase.getFirestore = getFirestore;
})();
