(function () {
  window.PrePa = window.PrePa || {};
  window.PrePa.services = window.PrePa.services || {};

  const DEFAULT_FORMSPREE_URL = "https://formspree.io/f/xdapblez";

  async function submitSignup({ name, email }, endpoint = DEFAULT_FORMSPREE_URL) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ name, email })
    });

    return response.ok;
  }

  window.PrePa.services.formspree = {
    submitSignup
  };
})();
