// assets/js/api.js

let sesionExpiradaEnProgreso = false;

async function apiFetch(endpoint, options = {}) {
    // --- CORRECCIÓN CLAVE AQUÍ ---
    // Ahora leemos el token desde la variable global en lugar de localStorage
    const token = APP_CONFIG.token; 

    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
    // ... el resto de la función (config, fetch, manejo de errores) se mantiene igual ...
    const config = { ...defaultOptions, ...options, headers: { ...defaultOptions.headers, ...options.headers }};
    const response = await fetch(`${APP_CONFIG.backendUrl}${endpoint}`, config);
    if (response.status === 401) {
        if (sesionExpiradaEnProgreso) { return new Promise(() => {}); }
        sesionExpiradaEnProgreso = true;
        APP_CONFIG.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('nombre_usuario');
        Swal.fire({ title: 'Sesión Expirada', text: 'Tu sesión ha terminado. Por favor, inicia sesión de nuevo.', icon: 'warning', confirmButtonText: 'Aceptar', allowOutsideClick: false, allowEscapeKey: false })
        .then(() => {
            window.location.href = 'logout.php';
        });
        return new Promise(() => {}); 
    }
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ocurrió un error en el servidor.');
    }
    return response.json();
}   