const config = window.HIRU_CONFIG || {};
const celebrantName = config.celebrantName || "Hiru";
const isCloudMode = Boolean(config.supabaseUrl && config.supabaseAnonKey);

const stockWishes = [
  { id: "stock-01", author: "Marta", message: "Por todas las noches que acabaron siendo historias.", photo_url: "https://images.unsplash.com/photo-1763651963738-467583998778?auto=format&w=900&q=82" },
  { id: "stock-02", author: "Lucía", message: "Siempre haces que cualquier plan se convierta en el mejor plan.", photo_url: "https://images.unsplash.com/photo-1741886302174-9f399a034d49?auto=format&w=900&q=82" },
  { id: "stock-03", author: "Álex", message: "Que nunca nos falten motivos para celebrar contigo.", photo_url: "https://images.unsplash.com/photo-1758523981337-7508dda01c3f?auto=format&w=900&q=82" },
  { id: "stock-04", author: "Claudia", message: "Icono desde el primer día. Te quiero infinito.", photo_url: "https://images.unsplash.com/photo-1682717816107-1eea9b095c15?auto=format&w=900&q=82" },
  { id: "stock-05", author: "Irene", message: "Un archivo entero no sería suficiente para guardar todo lo vivido.", photo_url: "https://images.unsplash.com/photo-1631927703423-a55430f22c17?auto=format&w=900&q=82" },
  { id: "stock-06", author: "Sofía", message: "Gracias por estar en las buenas, en las malas y en las improvisadas.", photo_url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&w=900&q=82" },
  { id: "stock-07", author: "Dani", message: "La vida es bastante más divertida cuando apareces tú.", photo_url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&w=900&q=82" },
  { id: "stock-08", author: "Nora", message: "Por todos los conciertos, los viajes y lo que todavía queda.", photo_url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&w=900&q=82" },
  { id: "stock-09", author: "Paula", message: "Mi persona favorita para perder el tiempo.", photo_url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&w=900&q=82" },
  { id: "stock-10", author: "Marcos", message: "Ojalá seguir celebrándote durante muchísimos años.", photo_url: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&w=900&q=82" },
  { id: "stock-11", author: "Elena", message: "Tú, yo y todas esas fotos que jamás podremos enseñar.", photo_url: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&w=900&q=82" },
  { id: "stock-12", author: "Javi", message: "No cambies nunca. Bueno, quizá solo un poquito.", photo_url: "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&w=900&q=82" },
].map((wish, index) => ({ ...wish, created_at: new Date(2026, 0, index + 1).toISOString(), isStock: true }));

const galleryView = document.querySelector("#galleryView");
const uploadView = document.querySelector("#uploadView");
const form = document.querySelector("#wishForm");
const grid = document.querySelector("#memoryGrid");
const emptyState = document.querySelector("#emptyState");
const template = document.querySelector("#memoryTemplate");
const photoInput = document.querySelector("#photoInput");
const photoPreview = document.querySelector("#photoPreview");
const photoPicker = document.querySelector("#photoPicker");
const removePhotoButton = document.querySelector("#removePhoto");
const messageInput = document.querySelector("#messageInput");
const countOutput = document.querySelector("#characterCount");
const formError = document.querySelector("#formError");
const submitButton = document.querySelector("#submitButton");
const toast = document.querySelector("#toast");
const lightbox = document.querySelector("#lightbox");
let selectedPhoto = null;
let previewUrl = null;
let toastTimer = null;

document.querySelectorAll("[data-celebrant]").forEach((node) => { node.textContent = celebrantName.toUpperCase(); });
document.title = `Para ${celebrantName} — Archivo`;

function updateRoute() {
  const isUploadRoute = ["#ulpoad", "#upload"].includes(location.hash.toLowerCase());
  galleryView.hidden = isUploadRoute;
  uploadView.hidden = !isUploadRoute;
  document.body.classList.toggle("uploading", isUploadRoute);
  if (isUploadRoute) setTimeout(() => document.querySelector("#authorInput").focus(), 120);
}

window.addEventListener("hashchange", updateRoute);
messageInput.addEventListener("input", () => { countOutput.textContent = messageInput.value.length; });

photoInput.addEventListener("change", async () => {
  const file = photoInput.files?.[0];
  if (!file) return;
  if (file.size > 15 * 1024 * 1024) {
    showError("La foto pesa demasiado. Elige una de menos de 15 MB.");
    photoInput.value = "";
    return;
  }
  try { selectedPhoto = await compressImage(file); }
  catch { selectedPhoto = file; }
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(selectedPhoto);
  photoPreview.src = previewUrl;
  photoPreview.hidden = false;
  removePhotoButton.hidden = false;
  photoPicker.classList.add("has-photo");
  hideError();
});

removePhotoButton.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  clearPhoto();
});

function clearPhoto() {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = null;
  selectedPhoto = null;
  photoInput.value = "";
  photoPreview.removeAttribute("src");
  photoPreview.hidden = true;
  removePhotoButton.hidden = true;
  photoPicker.classList.remove("has-photo");
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const sourceUrl = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(sourceUrl);
      const maxSide = 1800;
      const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.naturalWidth * scale);
      canvas.height = Math.round(image.naturalHeight * scale);
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Error al comprimir")), "image/jpeg", .86);
    };
    image.onerror = () => { URL.revokeObjectURL(sourceUrl); reject(new Error("Formato no compatible")); };
    image.src = sourceUrl;
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideError();
  submitButton.disabled = true;
  submitButton.firstElementChild.textContent = "PUBLICANDO…";
  const wish = { id: createUuid(), author: form.author.value.trim(), message: form.message.value.trim(), created_at: new Date().toISOString() };
  try {
    if (!wish.author || !wish.message) throw new Error("Escribe tu nombre y un mensaje.");
    if (!selectedPhoto) throw new Error("Añade una foto para completar el recuerdo.");
    if (isCloudMode) await saveToSupabase(wish, selectedPhoto);
    else await localDatabase.add({ ...wish, photo: selectedPhoto });
    form.reset();
    countOutput.textContent = "0";
    clearPhoto();
    history.replaceState(null, "", `${location.pathname}${location.search}`);
    updateRoute();
    await loadWishes();
    showToast("RECUERDO AÑADIDO AL ARCHIVO");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    showError(error.message || "No se ha podido publicar. Inténtalo de nuevo.");
  } finally {
    submitButton.disabled = false;
    submitButton.firstElementChild.textContent = "PUBLICAR EN EL ARCHIVO";
  }
});

async function saveToSupabase(wish, photo) {
  const objectName = `${wish.id}.jpg`;
  const uploadResponse = await fetch(`${config.supabaseUrl}/storage/v1/object/felicitaciones/${objectName}`, {
    method: "POST",
    headers: supabaseHeaders({ "Content-Type": "image/jpeg", "x-upsert": "false" }),
    body: photo,
  });
  if (!uploadResponse.ok) throw new Error("No se ha podido subir la foto.");
  const photoUrl = `${config.supabaseUrl}/storage/v1/object/public/felicitaciones/${objectName}`;
  const response = await fetch(`${config.supabaseUrl}/rest/v1/felicitaciones`, {
    method: "POST",
    headers: supabaseHeaders({ "Content-Type": "application/json", Prefer: "return=minimal" }),
    body: JSON.stringify({ id: wish.id, author: wish.author, message: wish.message, photo_url: photoUrl }),
  });
  if (!response.ok) throw new Error("No se ha podido guardar el recuerdo.");
}

async function fetchFromSupabase() {
  const response = await fetch(`${config.supabaseUrl}/rest/v1/felicitaciones?select=id,author,message,photo_url,created_at&order=created_at.desc`, {
    headers: supabaseHeaders(),
  });
  if (!response.ok) throw new Error("No se ha podido cargar el archivo.");
  return response.json();
}

function supabaseHeaders(extraHeaders = {}) {
  const headers = { apikey: config.supabaseAnonKey, ...extraHeaders };
  // Las claves anon antiguas son JWT; las nuevas sb_publishable_* no lo son.
  if (!config.supabaseAnonKey.startsWith("sb_publishable_")) {
    headers.Authorization = `Bearer ${config.supabaseAnonKey}`;
  }
  return headers;
}

async function loadWishes() {
  try {
    const personalWishes = isCloudMode ? await fetchFromSupabase() : await localDatabase.getAll();
    const wishes = config.showStockPhotos === false ? personalWishes : [...personalWishes, ...stockWishes];
    renderWishes(wishes);
  } catch {
    renderWishes(config.showStockPhotos === false ? [] : stockWishes);
    showToast("NO SE HAN PODIDO CARGAR LOS RECUERDOS GUARDADOS");
  }
}

function renderWishes(wishes) {
  grid.replaceChildren();
  emptyState.hidden = wishes.length > 0;
  grid.hidden = wishes.length === 0;
  wishes.forEach((wish, index) => {
    const card = template.content.cloneNode(true);
    const article = card.querySelector(".memory-card");
    const image = card.querySelector(".memory-photo");
    const photoUrl = wish.photo_url || (wish.photo ? URL.createObjectURL(wish.photo) : "");
    image.src = photoUrl;
    image.alt = `Recuerdo compartido por ${wish.author}`;
    card.querySelector(".memory-message").textContent = wish.message;
    card.querySelector(".memory-author").textContent = wish.author;
    card.querySelector(".memory-index").textContent = String(index + 1).padStart(2, "0");
    card.querySelector(".image-button").addEventListener("click", () => openLightbox(photoUrl, wish));
    article.style.animationDelay = `${Math.min(index * 35, 280)}ms`;
    grid.append(card);
  });
}

function openLightbox(photoUrl, wish) {
  document.querySelector("#lightboxImage").src = photoUrl;
  document.querySelector("#lightboxImage").alt = `Recuerdo compartido por ${wish.author}`;
  document.querySelector("#lightboxMessage").textContent = wish.message;
  document.querySelector("#lightboxAuthor").textContent = wish.author;
  if (typeof lightbox.showModal === "function") lightbox.showModal();
  else lightbox.setAttribute("open", "");
}

function closeLightbox() {
  if (typeof lightbox.close === "function") lightbox.close();
  else lightbox.removeAttribute("open");
}

document.querySelector("#closeLightbox").addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (event) => { if (event.target === lightbox) closeLightbox(); });

function createUuid() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return [...bytes].map((byte, index) => `${[4,6,8,10].includes(index) ? "-" : ""}${byte.toString(16).padStart(2, "0")}`).join("");
}

function showError(message) { formError.textContent = message; formError.hidden = false; }
function hideError() { formError.hidden = true; }
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

const localDatabase = {
  open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("hiru-wishes", 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains("wishes")) request.result.createObjectStore("wishes", { keyPath: "id" });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
  async add(wish) {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction("wishes", "readwrite");
      transaction.objectStore("wishes").add(wish);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
  },
  async getAll() {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const request = database.transaction("wishes", "readonly").objectStore("wishes").getAll();
      request.onsuccess = () => resolve(request.result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      request.onerror = () => reject(request.error);
    });
  },
};

updateRoute();
loadWishes();
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch(() => {}));
