// assets/js/modules/editar_usuario.js

window.inicializarVista = function(cedulaUsuario) {
    const form = $('#form-editar-usuario');
    // Asumiré que tienes un spinner. Si no, esta línea no hará nada.
    const spinner = $('#spinner-editar-usuario'); 
    
    spinner.show();
    form.hide();

    // 1. CONSTRUIMOS LA URL CORRECTA (GET con la cédula al final)
        // --- MODIFICACIÓN 1: Usamos apiFetch para obtener los datos ---
    // La función ya maneja el token y los errores 401 automáticamente.
    apiFetch(`usuario/obtener/${cedulaUsuario}`)
        .then(usuario => {
            // POBLAMOS EL FORMULARIO CON LOS IDs DE TU HTML
            if (usuario && usuario.cedula) {
                $('h5.m-0 strong').text(usuario.cedula);
                $('#nombre-editar').val(usuario.nombre);
                $('#apellidos-editar').val(usuario.apellidos);
                $('#email-editar').val(usuario.email);
                $('#telefono-editar').val(usuario.telefono);
                $('#empresa-editar').val(usuario.empresa);
                $('#cargo-editar').val(usuario.cargo);
                $('#estado-editar').val(usuario.estado);
                $('#admin-editar').prop('checked', usuario.admin === 1);
                
                spinner.hide();
                form.show();
            } else {
                throw new Error('No se encontraron datos para este usuario.');
            }
        })
        .catch(error => {
            // apiFetch ya maneja el error de sesión. Esto atrapará otros errores.
            console.error('Error al cargar datos del usuario:', error);
            window.mostrarNotificacion(error.message, 'danger');
            spinner.hide();
            $('.card-body').html('<p class="text-danger">Error: No se pudieron cargar los datos del usuario.</p>');
        });

    // --- MODIFICACIÓN 2: Usamos apiFetch para enviar la actualización ---
    $('#btn-actualizar-usuario').on('click', function() {
        const datosActualizados = {
            nombre: $('#nombre-editar').val(),
            apellidos: $('#apellidos-editar').val(),
            email: $('#email-editar').val(),
            telefono: $('#telefono-editar').val(),
            empresa: $('#empresa-editar').val(),
            cargo: $('#cargo-editar').val(),
            estado: $('#estado-editar').val(),
            admin: $('#admin-editar').is(':checked') ? 1 : 0
        };

        // La configuración es más simple: solo indicamos el método y el cuerpo.
        // apiFetch se encarga de las cabeceras, el token y la URL base.
        const options = {
            method: 'PATCH',
            body: JSON.stringify(datosActualizados)
        };

        apiFetch(`usuario/actualizar/${cedulaUsuario}`, options)
            .then(data => {
                    const notificacion = {
                        mensaje: data.message,
                        tipo: 'success'
                    };
                     // --- INICIO DE LA CORRECCIÓN ---
                // Faltaba guardar la notificación en sessionStorage...
                sessionStorage.setItem('notificacionPendiente', JSON.stringify(notificacion));
                // ...y faltaba cargar la nueva vista.
                window.cargarVista('lista_usuarios');
                // --- FIN DE LA CORRECCIÓN ---
            })
            
            .catch(error => {
                window.mostrarNotificacion(error.message, 'danger');
            });
    });
    // Lógica para el botón Cancelar
    $('button[data-vista="lista_usuarios"]').on('click', function() {
        window.cargarVista('lista_usuarios');
    });
};