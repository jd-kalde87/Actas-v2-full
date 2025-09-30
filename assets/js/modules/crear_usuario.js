// assets/js/modules/crear_usuario.js

window.inicializarVista = function() {
    const mainContent = $('#main-content');

    mainContent.on('click', '#btn-guardar-usuario', function() {
        // 1. Recolectar todos los datos del formulario
        const datosUsuario = {
            cedula: $('#cedula-crear').val(),
            nombre: $('#nombre-crear').val(),
            apellidos: $('#apellidos-crear').val(),
            email: $('#email-crear').val(),
            telefono: $('#telefono-crear').val(),
            empresa: $('#empresa-crear').val(),
            cargo: $('#cargo-crear').val(),
            contrasena: $('#contrasena-crear').val(),
            admin: $('#admin-crear').is(':checked'),
            estado: "activo" // Por defecto, los nuevos usuarios se crean como activos
        };

        // 2. Validar que los campos requeridos no estén vacíos
        if (!datosUsuario.cedula || !datosUsuario.nombre || !datosUsuario.apellidos || !datosUsuario.email) {
            window.mostrarNotificacion('Por favor, complete todos los campos requeridos.', 'warning');
            return;
        }

        // 3. Enviar los datos al endpoint de creación del backend
        const url = `${APP_CONFIG.backendUrl}usuario/crear`;

        const options = {
            method: 'POST',
            body: JSON.stringify(datosUsuario)
        };

        apiFetch('usuario/crear', options)
            .then(() => {
                // Si la creación es exitosa (status 201), guardamos la notificación para la siguiente vista
                const notificacion = {
                    mensaje: 'Usuario creado exitosamente.',
                    tipo: 'success'
                };
                sessionStorage.setItem('notificacionPendiente', JSON.stringify(notificacion));
                
                // Redirigir de vuelta a la lista de usuarios
                window.cargarVista('lista_usuarios');
            })
            .catch(error => {
                // apiFetch ya maneja la sesión expirada, esto atrapará otros errores
                // (ej: usuario duplicado)
                console.error('Error al crear usuario:', error);
                window.mostrarNotificacion(error.message, 'danger');
            });
        // --- FIN DE LA MODIFICACIÓN ---
    });


    // Desvincular evento al salir de la vista para evitar que se ejecute múltiples veces
    mainContent.on('remove', function() {
        mainContent.off('click', '#btn-guardar-usuario');
    });
};