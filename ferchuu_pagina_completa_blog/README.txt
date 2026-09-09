PÁGINA PERSONAL + BLOG DE FERCHUU

ARCHIVOS
- index.html       Página principal
- blog.html        Listado del blog
- post.html        Página individual de cada publicación
- admin.html       Panel privado para crear/editar/eliminar posts
- styles.css       Diseño
- foto-fer.png     Tu foto
- config.js        Configuración de Supabase
- supabase.sql     SQL para crear tabla, seguridad y bucket
- config.example.js Ejemplo de configuración

CONFIGURACIÓN
1. Crear un proyecto en Supabase.
2. En Authentication > Users, crear tu usuario con email y contraseña.
3. Abrir SQL Editor y ejecutar TODO el contenido de supabase.sql.
4. En Project Settings > API/Connect copiar:
   - Project URL
   - Publishable key (o anon key si tu panel todavía muestra ese nombre)
5. Pegarlos en config.js.
6. Subir todos los archivos al repositorio f3rchuu4.github.io.
7. Abrir /admin.html para entrar al panel.

SEGURIDAD
- NUNCA pongas la service_role key en config.js.
- La publishable/anon key puede estar en el frontend; RLS es lo que protege la base de datos.
- El panel usa Supabase Auth.
- Si agregás otros usuarios al proyecto, ajustá las policies del SQL para que solamente vos puedas administrar posts.

NOTA
GitHub Pages solamente sirve los archivos estáticos. El blog dinámico usa Supabase como backend, autenticación y almacenamiento.
