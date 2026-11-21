(() => {
  if (window.swaggerAutofill) return;

  const firstNames = ["Adam", "Yassine", "Imane", "Salma", "Omar", "Sara", "Mehdi", "Aya"];
  const lastNames = ["Amrani", "Bennani", "Alaoui", "Idrissi", "Tazi", "Mansouri", "El Fassi", "Naciri"];
  const semanticKeys = ["immatriculation", "firstname", "lastname", "username", "telephone", "quantity", "capacity", "description", "datetime", "password", "country", "address", "amount", "montant", "quantite", "capacite", "prenom", "email", "phone", "title", "modele", "marque", "price", "prix", "tarif", "website", "uuid", "token", "status", "role", "name", "nom", "city", "ville", "age", "date", "url"];
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const choose = (items) => items[randomInt(0, items.length - 1)];

  const normalize = (text) => (text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const sampleFor = (type, format, hint = "", index = 0, runId = "") => {
    const key = normalize(hint).replace(/[^a-z0-9]+/g, " ").trim();
    const words = key.split(/\s+/).filter(Boolean);
    const match = semanticKeys.find((word) => words.includes(word));
    const field = match || "";
    const first = choose(firstNames);
    const last = choose(lastNames);
    const dayOffset = randomInt(1, 365);
    const date = new Date(Date.now() + dayOffset * 86400000).toISOString().slice(0, 10);
    // Honor Swagger's declared primitive type before using field-name guesses.
    if (["integer", "int32", "int64"].includes(type)) return randomInt(1, 9999);
    if (["number", "float", "double"].includes(type)) return Number((Math.random() * 9999 + 1).toFixed(2));
    if (type === "boolean") return Math.random() >= 0.5;
    if (field === "email" || format === "email") return `${first}.${last.replace(/\s/g, "").toLowerCase()}.${runId}${index}@example.com`.toLowerCase();
    if (["name", "nom"].includes(match)) return `${first} ${last}`;
    if (["firstname", "prenom"].includes(match)) return first;
    if (["lastname"].includes(match)) return last;
    if (match === "username") return `${first.toLowerCase()}_${randomInt(100, 9999)}`;
    if (match === "phone" || match === "telephone") return `+2126${randomInt(10000000, 99999999)}`;
    if (match === "city" || match === "ville") return choose(["Youssoufia", "Agadir", "Rabat", "Casablanca", "Marrakech", "Mirleft"]);
    if (match === "country") return choose(["Morocco", "France", "Spain", "Portugal"]);
    if (match === "address") return `${randomInt(1, 200)} Avenue ${choose(["Mohammed V", "Hassan II", "des Ecoles", "Al Massira"])}`;
    if (match === "marque") return choose(["Dacia", "Toyota", "Renault", "Peugeot", "Hyundai"]);
    if (match === "modele") return choose(["Logan", "Clio", "Corolla", "208", "i20"]);
    if (match === "immatriculation") return `${randomInt(10000, 99999)}-A-1`;
    if (match === "title") return `Evenement de test ${randomInt(100, 9999)}`;
    if (match === "description") return `Description de test numero ${randomInt(1000, 99999)}.`;
    if (["price", "prix", "tarif", "amount", "montant"].includes(match)) return Number((randomInt(10, 2000) + Math.random()).toFixed(2));
    if (["quantity", "quantite"].includes(match)) return randomInt(1, 20);
    if (["age"].includes(match)) return randomInt(18, 65);
    if (["capacity", "capacite"].includes(match)) return randomInt(20, 500);
    if (["date", "datetime"].includes(field) || format === "date-time") return field === "datetime" || format === "date-time" ? `${date}T${String(randomInt(8, 18)).padStart(2, "0")}:${choose(["00", "15", "30", "45"])}:00Z` : date;
    if (field === "uuid") return crypto.randomUUID();
    if (field === "url" || format === "url" || format === "uri") return `https://example.com/test/${runId}${index}`;
    if (field === "password") return `Test@${randomInt(10000, 99999)}!`;
    if (field === "token") return `test-token-${runId}-${index}`;
    if (match === "status") return choose(["ACTIVE", "PENDING", "INACTIVE"]);
    if (match === "role") return choose(["USER", "ADMIN", "ORGANIZER"]);
    if (type === "array") return [];
    if (type === "object") return {};
    return `Valeur de test ${runId}-${index}`;
  };

  const fireInputEvents = (element, value) => {
    const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), "value")?.set;
    if (setter) setter.call(element, value); else element.value = value;
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const fieldHint = (element) => {
    const row = element.closest("tr") || element.closest(".parameter, .parameter-row, .form-group, .property, .model-example");
    const parameterName = row?.querySelector(".parameters-col_name .parameter__name, .parameter__name, .prop-name, .property-name");
    const labels = [
      element.labels ? [...element.labels].map((label) => label.innerText).join(" ") : "",
      element.getAttribute("aria-label"), element.getAttribute("placeholder"), element.name,
      element.id ? document.querySelector(`label[for="${CSS.escape(element.id)}"]`)?.innerText : "",
      parameterName?.innerText
    ];
    return labels.filter(Boolean).join(" ").trim();
  };

  const typeFor = (element) => {
    const inputType = (element.getAttribute("type") || "").toLowerCase();
    if (["email", "date", "datetime-local", "number", "tel", "url", "password"].includes(inputType)) {
      return { type: inputType === "datetime-local" ? "string" : inputType === "tel" ? "string" : inputType, format: inputType };
    }
    const row = element.closest("tr") || element.closest(".parameter, .parameter-row, .form-group");
    const typeText = row?.querySelector(".parameters-col_description .parameter__type, .parameter__type, .prop-type, .model .prop-type")?.textContent || "";
    const formatText = row?.querySelector(".prop-format")?.textContent || "";
    const match = normalize(`${typeText} ${formatText}`).match(/\b(string|integer|number|boolean|array|object|date-time|date|email|uuid|int32|int64|double|float)\b/);
    const found = match?.[1] || "string";
    return { type: ["int32", "int64"].includes(found) ? "integer" : ["double", "float"].includes(found) ? "number" : found, format: found };
  };

  const fillJson = (value, propertyName = "", depth = 0, counter = { value: 0 }, runId = "") => {
    if (depth > 8) return value;
    if (Array.isArray(value)) return value.length ? [fillJson(value[0], propertyName, depth + 1, counter, runId)] : [];
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, fillJson(child, key, depth + 1, counter, runId)]));
    }
    const index = counter.value++;
    if (typeof value === "number") return sampleFor(Number.isInteger(value) ? "integer" : "number", "", propertyName, index, runId);
    if (typeof value === "boolean") return true;
    if (typeof value === "string") return sampleFor("string", "", `${propertyName} ${value}`, index, runId);
    return value;
  };

  const fill = () => {
    const root = document.querySelector(".swagger-ui");
    if (!root) return { filled: 0, skipped: true };
    const fields = [...root.querySelectorAll("input:not([type=submit]):not([type=button]):not([type=checkbox]):not([type=radio]), textarea")]
      .filter((el) => !el.disabled && el.getClientRects().length);
    const runId = `${Date.now().toString(36)}${randomInt(100, 999)}`;
    let filled = 0;
    for (const element of fields) {
      if (element.tagName === "TEXTAREA") {
        const existing = element.value.trim();
        try {
          const parsed = existing ? JSON.parse(existing) : {};
          fireInputEvents(element, JSON.stringify(fillJson(parsed, "", 0, { value: 0 }, runId), null, 2));
        } catch {
          fireInputEvents(element, "{}");
        }
      } else {
        const { type, format } = typeFor(element);
        fireInputEvents(element, sampleFor(type, format, fieldHint(element), filled, runId));
      }
      filled++;
    }
    return { filled, skipped: false };
  };

  window.swaggerAutofill = { fill };
})();
