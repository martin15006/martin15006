# Tema del Monarca para la interfaz de GitHub

Esto cambia **cómo ves vos GitHub** (encabezado, botones, enlaces, pestañas, gráfico de
contribuciones). Los demás ven GitHub normal; lo que ven ellos de tu perfil es el README.

## Instalar el tema

1. Instalá **Stylus** desde la tienda oficial de Chrome (busca "Stylus", de *openstyles*).
2. Con el repo ya subido, abrí este enlace y tocá **Instalar**:
   `https://raw.githubusercontent.com/martin15006/martin15006/main/tema/sistema-del-monarca.user.css`
3. Recargá `github.com`.

Sin subirlo todavía: Stylus → **Escribir un estilo nuevo** → pegá el contenido de
`sistema-del-monarca.user.css` → **Guardar**.

Para quitarlo, desactivalo en Stylus. No toca nada de tu cuenta.

## Tipografía (opcional)

GitHub bloquea fuentes externas, así que el tema usa **Oxanium** y **JetBrains Mono** solo si las tenés
instaladas en tu PC (son gratis). Si no, queda con la fuente normal y no pasa nada.

## Avatar

`avatar-monarca.png` (800×800) es el ojo del Monarca. Para ponerlo: GitHub → tu foto →
**Settings → Public profile → Profile picture → Edit → Upload a photo**. El recorte circular de GitHub
no corta nada importante. Se regenera con `node scripts/avatar.mjs`.
