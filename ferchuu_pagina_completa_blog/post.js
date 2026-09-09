document.getElementById("year").textContent = new Date().getFullYear();
const root = document.getElementById("post");
const id = new URLSearchParams(location.search).get("id");

async function loadPost() {
  if (!id || !window.SUPABASE_URL || !window.SUPABASE_PUBLISHABLE_KEY) {
    root.innerHTML = '<div class="empty">No se encontró la publicación.</div>'; return;
  }
  const client = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_PUBLISHABLE_KEY);
  const { data, error } = await client.from("posts").select("*").eq("id", id).eq("published", true).single();
  if (error || !data) { root.innerHTML = '<div class="empty">No se encontró la publicación.</div>'; return; }
  document.title = data.title + " — Ferchuu";
  const date = data.published_at ? new Date(data.published_at).toLocaleDateString("es-AR", {day:"2-digit",month:"long",year:"numeric"}) : "";
  const image = data.image_url ? `<img class="article-image" src="${escapeHtml(data.image_url)}" alt="">` : "";
  root.innerHTML = `<a class="back-link" href="blog.html">← Volver al blog</a><p class="eyebrow">PUBLICACIÓN</p><h1>${escapeHtml(data.title)}</h1><p class="article-date">${date}</p>${image}<div class="article-content">${formatContent(data.content)}</div>`;
}
function formatContent(text) {
  return escapeHtml(text).split(/\n{2,}/).map(p => `<p>${p.replace(/\n/g,"<br>")}</p>`).join("");
}
function escapeHtml(s) { return String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
loadPost();