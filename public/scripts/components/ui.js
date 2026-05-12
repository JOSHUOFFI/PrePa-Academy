(function () {
  window.PrePa = window.PrePa || {};
  window.PrePa.components = window.PrePa.components || {};

  function createDismissibleAlert(message, type = "info") {
    const wrapper = document.createElement("div");
    wrapper.className = `alert alert-${type} alert-dismissible fade show`;
    wrapper.setAttribute("role", "alert");
    wrapper.textContent = message;

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "btn-close";
    closeButton.setAttribute("data-bs-dismiss", "alert");
    closeButton.setAttribute("aria-label", "Close");
    wrapper.append(closeButton);

    return wrapper;
  }

  function setButtonLoading(button, isLoading, loadingText) {
    if (!button) return;

    if (!button.dataset.originalText) {
      button.dataset.originalText = button.textContent;
    }

    button.disabled = isLoading;
    button.textContent = isLoading ? loadingText : button.dataset.originalText;
  }

  window.PrePa.components.ui = {
    createDismissibleAlert,
    setButtonLoading
  };
})();
