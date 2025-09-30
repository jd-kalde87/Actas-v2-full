// assets/js/modules/crear_acta.js

window.inicializarVista = function() {

    const mainContent = $('#main-content');

    /**
     * Función de ayuda para renumerar los campos de temario dinámicamente.
     */
    function renumerarTemarios() {
        $('#contenedor-temarios .input-group').each(function(index) {
            $(this).find('.input-group-text').text(index + 1 + '.');
        });
    }

    /**
     * Evento para agregar un nuevo campo de temario al formulario.
     */
    mainContent.on('click', '#btn-agregar-temario', function() {
        const nuevoTemario = `<div class="input-group mb-2"><span class="input-group-text"></span><input type="text" class="form-control" name="temario[]" placeholder="Siguiente punto del temario" required><button type="button" class="btn btn-outline-danger btn-remover-temario"><i class="fas fa-times"></i></button></div>`;
        $('#contenedor-temarios').append(nuevoTemario);
        renumerarTemarios();
    });

    /**
     * Evento para remover un campo de temario del formulario.
     */
    mainContent.on('click', '.btn-remover-temario', function() {
        $(this).closest('.input-group').remove();
        renumerarTemarios();
    });

    /**
     * Evento principal para guardar la nueva acta.
     */
    mainContent.on('click', '#btn-guardar-acta', function() {
        const form = document.getElementById('form-crear-acta');
        // Valida que el formulario HTML tenga todos los campos requeridos
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Recolecta los puntos del temario en un array
        const temarios = [];
        $('input[name="temario[]"]').each(function() { temarios.push($(this).val()); });

        // Decodifica el token para obtener la cédula del usuario que está creando el acta
        const payload = JSON.parse(atob(APP_CONFIG.token.split('.')[1]));
        
        // Construye el objeto de datos para enviar al backend
        const data = {
            tema: $('#tema').val(),
            tipo_reunion: $('#tiporeunion').val(),
            lugar: $('#lugar').val(),
            fecha: $('#fecha').val(),
            horaInicio: $('#HoraI').val(),
            horaFin: $('#HoraF').val(),
            cantidad_asistentes: $('#asistentes').val(),
            temario: temarios,
            create_acta_user: payload.cedula,
            usuarios: [payload.cedula], // Inicia la lista de usuarios con el creador
            firma: "Borrador" // Estado inicial
        };

        // --- INICIO DE LA MODIFICACIÓN ---
        // Se reemplaza fetch por nuestra nueva función apiFetch
        
        const options = {
            method: 'POST',
            body: JSON.stringify(data)
        };

        apiFetch('actas/crear', options)
            .then(responseData => {
                // Si la creación es exitosa, guardamos la notificación para la siguiente vista
                const notificacion = {
                    mensaje: `Acta ${responseData.codigo} creada exitosamente.`,
                    tipo: 'success'
                };
                sessionStorage.setItem('notificacionPendiente', JSON.stringify(notificacion));
                
                // Redirigimos a la lista de actas
                window.cargarVista('lista_actas');
            })
            .catch(error => {
                // apiFetch ya maneja la sesión expirada, esto atrapará otros errores del servidor
                window.mostrarNotificacion(error.message, 'danger');
                console.error(error);
            });
        // --- FIN DE LA MODIFICACIÓN ---
    });

    // Desvincula los eventos al salir de la vista para evitar duplicados
    mainContent.on('remove', function() {
        mainContent.off('click', '#btn-agregar-temario');
        mainContent.off('click', '.btn-remover-temario');
        mainContent.off('click', '#btn-guardar-acta');
    });
};