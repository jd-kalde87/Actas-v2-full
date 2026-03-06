# Archivos a reemplazar en el servidor Hostinger

Sube o reemplaza estos archivos en tu hosting manteniendo la misma estructura de carpetas.

---

## 1. Backend (Node.js) – carpeta `actas_backend/`

| Archivo | Acción |
|---------|--------|
| `actas_backend/controllers/usuarioController.js` | Reemplazar |
| `actas_backend/controllers/actaController.js` | Reemplazar |
| `actas_backend/controllers/firmaController.js` | Reemplazar |
| `actas_backend/routes/usuarios.js` | Reemplazar |
| `actas_backend/routes/actas.js` | Reemplazar |
| `actas_backend/middleware/adminMiddleware.js` | Reemplazar |

**Carpeta nueva (crear si no existe):**
| Archivo | Acción |
|---------|--------|
| `actas_backend/migrations/001_add_colaborador.sql` | Subir (nuevo) |
| `actas_backend/migrations/README.txt` | Subir (nuevo) |

---

## 2. PHP (raíz y app/)

| Archivo | Acción |
|---------|--------|
| `index.php` | Reemplazar |
| `login.php` | Reemplazar |
| `logout.php` | Reemplazar (si lo modificaste) |
| `app/dashboard.php` | Reemplazar |
| `app/crear_acta.php` | Reemplazar |
| `app/crear_usuario.php` | Reemplazar |
| `app/editar_usuario.php` | Reemplazar |
| `app/lista_actas.php` | Reemplazar |
| `app/lista_usuarios.php` | Reemplazar |
| `app/plantilla_pdf.php` | Reemplazar |
| `firmar_acta.php` | Reemplazar (si lo modificaste) |

---

## 3. JavaScript – carpeta `assets/js/`

| Archivo | Acción |
|---------|--------|
| `assets/js/app.js` | Reemplazar |
| `assets/js/api.js` | Reemplazar (si lo modificaste) |
| `assets/js/modules/lista_actas.js` | Reemplazar |
| `assets/js/modules/lista_usuarios.js` | Reemplazar |
| `assets/js/modules/crear_usuario.js` | Reemplazar |
| `assets/js/modules/editar_usuario.js` | Reemplazar |
| `assets/js/modules/gestionar_contenido.js` | Reemplazar |
| `assets/js/modules/generar_pdf.js` | Reemplazar |
| `assets/js/modules/firmar_acta.js` | Reemplazar (si lo modificaste) |

---

## 4. CSS

| Archivo | Acción |
|---------|--------|
| `assets/css/style.css` | Reemplazar |

---

## 5. Base de datos en Hostinger

Ejecuta **una sola vez** en la base de datos (phpMyAdmin o MySQL de Hostinger):

```sql
ALTER TABLE usuario
ADD COLUMN colaborador TINYINT(1) NOT NULL DEFAULT 0
COMMENT '1 = puede acceder al panel (rol Colaborador)';
```

Si la columna `colaborador` ya existe, no ejecutes de nuevo el `ALTER` (puede dar error).

---

## 6. Después de subir

1. **Backend Node:** En Hostinger, reinicia el servicio/script de Node (o el proceso que ejecuta `server.js`) para que cargue los cambios.
2. **PHP:** No suele hacer falta reiniciar nada; con subir los archivos basta.
3. **Cache:** Si usas caché en el hosting o en el navegador, vacía caché o prueba en ventana privada.

---

## Resumen rápido (solo lo imprescindible)

Si quieres subir solo lo mínimo para que funcione todo lo que hemos tocado:

- **Backend:**  
  `usuarioController.js`, `actaController.js`, `firmaController.js`, `usuarios.js`, `actas.js`, `adminMiddleware.js`  
  y la carpeta `migrations/` con el `.sql` y el `README.txt`.

- **PHP:**  
  `index.php`, `login.php`, `app/dashboard.php`, `app/crear_usuario.php`, `app/editar_usuario.php`, `app/crear_acta.php`, `app/lista_actas.php`, `app/lista_usuarios.php`, `app/plantilla_pdf.php`.

- **Frontend:**  
  `assets/js/app.js`, `assets/js/modules/lista_actas.js`, `assets/js/modules/lista_usuarios.js`, `assets/js/modules/crear_usuario.js`, `assets/js/modules/editar_usuario.js`, `assets/js/modules/generar_pdf.js`, `assets/js/modules/gestionar_contenido.js`, `assets/css/style.css`.

- **Base de datos:**  
  Ejecutar el `ALTER TABLE usuario ... colaborador ...` en la BD de Hostinger.

Con esto tendrás en Hostinger los mismos cambios que en tu entorno local (rol Colaborador, tipos de reunión en PDF, restablecer contraseña, etc.).
