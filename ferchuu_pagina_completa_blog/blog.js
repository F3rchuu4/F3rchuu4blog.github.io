document.getElementById("year").textContent = new Date().getFullYear();
const box = document.getElementById("all-posts");

async function loadPosts() {
  if (!window.SUPABASE_URL || !window.SUPABASE_PUBLISHABLE_KEY) {
    box.innerHTML = '<div class="empty">Primero configurá Supabase en <strong>config.js</strong>.</div>'; return;
  }
  const client = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_PUBLISHABLE_KEY);
  const { data, error } = await client.from("posts").select("id,title,excerpt,image_url,published_at").eq("published", true).order("published_at", {ascending:false});
  if (error) { box.innerHTML = '<div class="empty">No se pudieron cargar las publicaciones.</div>'; return; }
  box.innerHTML = data?.length ? data.map(postCard).join("") : '<div class="empty">Todavía no hay publicaciones.</div>';
}
function postCard(p) {
  const image = p.image_url ? `<img src="${escapeHtml(p.image_url)}" alt="" loading="lazy">` : `<div class="post-placeholder">✦</div>`;
  const date = p.published_at ? new Date(p.published_at).toLocaleDateString("es-AR", {day:"2-digit",month:"long",year:"numeric"}) : "";
  return `<a class="post-card" href="post.html?id=${encodeURIComponent(p.id)}">${image}<div class="post-body"><small>${date}</small><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.excerpt || "")}</p><span>Leer más →</span></div></a>`;
}
function escapeHtml(s) { return String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
loadPosts();