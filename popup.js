document.getElementById("fill").addEventListener("click", async () => {
  const status = document.getElementById("status");
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("Aucun onglet actif.");
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.swaggerAutofill?.fill() ?? { filled: 0, skipped: true }
    });
    status.textContent = result?.skipped
      ? "Swagger UI introuvable sur cette page."
      : `${result.filled} champ(s) rempli(s).`;
  } catch (error) {
    status.textContent = error.message || "Impossible de remplir cette page.";
  }
});
