const loginPanel = document.getElementById("login-panel");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("login-form");
const postForm = document.getElementById("post-form");
const loginMessage = document.getElementById("login-message");
const formMessage = document.getElementById("form-message");
const postsBox = document.getElementById("admin-posts");
const cancelEdit = document.getElementById("cancel-edit");
const logoutBtn = document.getElementById("logout");
const formTitle = document.getElementById("form-title");
let client = null;
let editingId = null;
let currentImageUrl = null;

if (window.SUPABASE_URL && window.SUPABASE_PUBLISHABLE_KEY) {
  client = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_PUBLISHABLE_KEY);
  init();
} else {
  loginMessage.textContent = "Primero completá config.js con los datos de Supabase.";
  loginMessage.className = "message error";
  loginForm.querySelector("button").disabled = true;
}

async function init() {
  const { data } = await client.auth.getSession();
  if (data.session) showDashboard();
  client.auth.onAuthStateChange((_event, session) => session ? showDashboard() : showLogin());
}

loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  loginMessage.textContent = "Entrando...";
  const { error } = await client.auth.signInWithPassword({
    email: document.getElementById("email").value,
    password: document.getElementById("password").value
  });
  loginMessage.textContent = error ? error.message : "";
  if (error) loginMessage.className = "message error";
});

logoutBtn.addEventListener("click", async () => {
  await client.auth.signOut({scope:"local"});
});

postForm.addEventListener("submit", async e => {
  e.preventDefault();
  formMessage.textContent = "Guardando...";
  formMessage.className = "message";
  const title = document.getElementById("title").value.trim();
  const excerpt = document.getElementById("excerpt").value.trim();
  const content = document.getElementById("content").value.trim();
  const file = document.getElementById("image").files[0];
  let imageUrl = currentImageUrl;

  try {
    if (file) {
      const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
      const path = `${crypto.randomUUID()}-${safeName}`;
      const upload = await client.storage.from("blog-images").upload(path, file, {upsert:false});
      if (upload.error) throw upload.error;
      imageUrl = client.storage.from("blog-images").getPublicUrl(path).data.publicUrl;
    }

    const payload = {title, excerpt, content, image_url:imageUrl, published:true};
    if (editingId) {
      const { error } = await client.from("posts").update(payload).eq("id", editingId);
      if (error) throw error;
      formMessage.textContent = "Publicación actualizada.";
    } else {
      const { error } = await client.from("posts").insert(payload);
      if (error) throw error;
      formMessage.textContent = "¡Publicación creada!";
    }
    resetForm();
    await loadAdminPosts();
  } catch (err) {
    formMessage.textContent = err.message || "Ocurrió un error.";
    formMessage.className = "message error";
  }
});

cancelEdit.addEventListener("click", resetForm);

async function loadAdminPosts() {
  postsBox.innerHTML = '<div class="empty">Cargando...</div>';
  const { data, error } = await client.from("posts").select("*").order("published_at", {ascending:false});
  if (error) { postsBox.innerHTML = `<div class="empty">${escapeHtml(error.message)}</div>`; return; }
  postsBox.innerHTML = data?.length ? data.map(adminCard).join("") : '<div class="empty">Todavía no publicaste nada.</div>';
}

function adminCard(p) {
  const date = p.published_at ? new Date(p.published_at).toLocaleDateString("es-AR") : "";
  return `<div class="admin-post"><div><small>${date}</small><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.excerpt || "")}</p></div><div class="admin-actions"><button class="btn secondary" onclick="editPost('${p.id}')">Editar</button><button class="btn danger" onclick="deletePost('${p.id}')">Eliminar</button></div></div>`;
}

window.editPost = async function(id) {
  const { data, error } = await client.from("posts").select("*").eq("id", id).single();
  if (error) return;
  editingId = id; currentImageUrl = data.image_url || null;
  document.getElementById("post-id").value = id;
  document.getElementById("title").value = data.title || "";
  document.getElementById("excerpt").value = data.excerpt || "";
  document.getElementById("content").value = data.content || "";
  formTitle.textContent = "Editar publicación";
  cancelEdit.classList.remove("hidden");
  document.querySelector("#post-form .primary").textContent = "Guardar cambios";
  window.scrollTo({top:0, behavior:"smooth"});
};

window.deletePost = async function(id) {
  if (!confirm("¿Seguro que querés eliminar esta publicación?")) return;
  const { error } = await client.from("posts").delete().eq("id", id);
  if (error) { alert(error.message); return; }
  await loadAdminPosts();
};

function resetForm() {
  editingId = null; currentImageUrl = null; postForm.reset();
  formTitle.textContent = "Nueva publicación";
  cancelEdit.classList.add("hidden");
  document.querySelector("#post-form .primary").textContent = "Publicar";
  formMessage.textContent = "";
}
function showDashboard() { loginPanel.classList.add("hidden"); dashboard.classList.remove("hidden"); loadAdminPosts(); }
function showLogin() { dashboard.classList.add("hidden"); loginPanel.classList.remove("hidden"); }
function escapeHtml(s) { return String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }