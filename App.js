let foods = [];
let supplements = JSON.parse(localStorage.getItem("supplements")) || [];

fetch("foods-db.json").then(r => r.json()).then(d => foods = d);

const results = document.getElementById("results");

document.getElementById("search").oninput = e => {
  const q = e.target.value.toLowerCase();
  results.innerHTML = foods
    .filter(f => f.name.toLowerCase().includes(q))
    .slice(0, 20)
    .map(f => `<li>${f.name} – ${f.kcal} kcal</li>`)
    .join("");
};

// 🎤 WYSZUKIWANIE GŁOSOWE
function voiceSearch() {
  const r = new webkitSpeechRecognition();
  r.lang = "pl-PL";
  r.onresult = e => {
    document.getElementById("search").value = e.results[0][0].transcript;
    document.getElementById("search").dispatchEvent(new Event("input"));
  };
  r.start();
}

// 📷 SKAN KODU (OpenFoodFacts)
async function scanBarcode() {
  const code = prompt("Wklej kod kreskowy:");
  if (!code) return;

  const r = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
  const d = await r.json();

  if (d.product) {
    const p = {
      name: d.product.product_name,
      kcal: d.product.nutriments["energy-kcal_100g"] || 0
    };
    foods.push(p);
    localStorage.setItem("foods-db", JSON.stringify(foods));
    alert("Produkt dodany do bazy");
  }
}

// 💊 SUPLEMENTY
function renderSupplements() {
  const ul = document.getElementById("supplementList");
  ul.innerHTML = supplements.map((s,i) => `
    <li>
      ${s.name} – ${s.when}
      <button onclick="editSupplement(${i})">✏️</button>
      <button onclick="deleteSupplement(${i})">❌</button>
    </li>
  `).join("");
}

function addSupplement() {
  const name = prompt("Nazwa suplementu:");
  const when = prompt("Z czym? (na czczo / z posiłkiem / z tłuszczem / wieczorem)");
  const time = prompt("Godzina (HH:MM)");
  supplements.push({name, when, time, notify:true});
  saveSupplements();
}

function editSupplement(i) {
  supplements[i].name = prompt("Nazwa:", supplements[i].name);
  supplements[i].when = prompt("Z czym:", supplements[i].when);
  supplements[i].time = prompt("Godzina:", supplements[i].time);
  saveSupplements();
}

function deleteSupplement(i) {
  supplements.splice(i,1);
  saveSupplements();
}

function saveSupplements() {
  localStorage.setItem("supplements", JSON.stringify(supplements));
  renderSupplements();
}

renderSupplements();

// 🔔 POWIADOMIENIA
function enableNotifications() {
  Notification.requestPermission().then(p => {
    if (p === "granted") alert("Powiadomienia włączone");
  });
}
function samsungReminder({ title, description, time }) {
  // time: "HH:MM"
  const [h, m] = time.split(":");

  const text = `${title}\n${description}\nGodzina: ${time}`;

  // Samsung Reminder reaguje na intent tekstowy
  const url =
    "intent:#Intent;" +
    "action=android.intent.action.SEND;" +
    "type=text/plain;" +
    `S.android.intent.extra.TEXT=${encodeURIComponent(text)};` +
    "end";

  window.location.href = url;
}
