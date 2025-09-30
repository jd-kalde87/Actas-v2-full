// assets/js/modules/editar_acta.js

window.inicializarVista = function(actaCodigo) {

    const mainContent = $('#main-content');

    // Función para renumerar los campos de temario
    function renumerarTemariosEditar() {
        $('#contenedor-temarios-editar .input-group').each(function(index) {
            $(this).find('.input-group-text').text(index + 1 + '.');
        });
    }

    // Función para cargar los datos del acta en el formulario
    function inicializarEdicion() {
        // --- MODIFICACIÓN 1: Se reemplaza fetch por apiFetch ---
        // Esto asegura que la petición esté protegida contra sesiones expiradas.
        apiFetch(`actas/obtener/${actaCodigo}`)
            .then(data => {
                // Rellenar el formulario con los datos recibidos
                $('#tema-editar').val(data.tema);
                $('#lugar-editar').val(data.lugar);
                $('#fecha-editar').val(data.fecha);
                $('#HoraI-editar').val(data.horaInicio);
                $('#HoraF-editar').val(data.horaFin);
                $('#asistentes-editar').val(data.cantidad_asistentes);

                const tipoSelect = $('#tiporeunion-editar');
                tipoSelect.html(`<option value="1">Comite mensual</option><option value="2">Verificacion en campo</option><option value="10">Otros</option>`);
                tipoSelect.val(data.tipo_reunion);

                const contenedorTemarios = $('#contenedor-temarios-editar');
                contenedorTemarios.html('');
                
                // Aseguramos que el temario (que es un string) se convierta en array
                if (data.temario && typeof data.temario === 'string') {
                    const temarioItems = data.temario.split(',');
                    temarioItems.forEach(item => {
                        const nuevoTemario = `<div class="input-group mb-2"><span class="input-group-text"></span><input type="text" class="form-control" name="temario-editar[]" value="${item.trim()}" required><button type="button" class="btn btn-outline-danger btn-remover-temario-editar"><i class="fas fa-times"></i></button></div>`;
                        contenedorTemarios.append(nuevoTemario);
                    });
                }
                renumerarTemariosEditar();
            })
            .catch(error => {
                window.mostrarNotificacion('No se pudieron cargar los datos del acta.', 'danger');
                console.error(error);
            });
    }

    // Listener para el botón "Agregar Temario" (sin cambios)
    mainContent.on('click', '#btn-agregar-temario-editar', function() {
        const nuevoTemario = `<div class="input-group mb-2"><span class="input-group-text"></span><input type="text" class="form-control" name="temario-editar[]" placeholder="Nuevo punto" required><button type="button" class="btn btn-outline-danger btn-remover-temario-editar"><i class="fas fa-times"></i></button></div>`;
        $('#contenedor-temarios-editar').append(nuevoTemario);
        renumerarTemariosEditar();
    });

    // Listener para el botón "Remover Temario" (sin cambios)
    mainContent.on('click', '.btn-remover-temario-editar', function() {
        $(this).closest('.input-group').remove();
        renumerarTemariosEditar();
    });

    // Listener para el botón "Actualizar Acta"
    mainContent.on('click', '#btn-actualizar-acta', function() {
        const actaCodigo = $('#form-editar-acta').data('acta-codigo');
        const temarios = [];
        $('input[name="temario-editar[]"]').each(function() { temarios.push($(this).val()); });

        const data = {
            tema: $('#tema-editar').val(), lugar: $('#lugar-editar').val(), fecha: $('#fecha-editar').val(),
            horaInicio: $('#HoraI-editar').val(), horaFin: $('#HoraF-editar').val(), cantidad_asistentes: $('#asistentes-editar').val(),
            tipo_reunion: $('#tiporeunion-editar').val(), temario: temarios
        };

        // --- MODIFICACIÓN 2: Se reemplaza fetch por apiFetch y se usa sessionStorage ---
        apiFetch(`actas/actualizar/${actaCodigo}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        })
        .then((response) => {
            // Guardamos la notificación para que se muestre en la siguiente pantalla
            const notificacion = { 
                mensaje: response.message || 'Acta actualizada exitosamente.', 
                tipo: 'success' 
            };
            sessionStorage.setItem('notificacionPendiente', JSON.stringify(notificacion));
            
            // Redirigimos a la lista de actas
            window.cargarVista('lista_actas');
        })
        .catch(error => { 
            window.mostrarNotificacion(error.message, 'danger'); 
            console.error(error); 
        });
    });

    // Carga inicial de los datos del acta
    inicializarEdicion();

    // Limpieza de eventos al salir de la vista
    mainContent.on('remove', function() {
        mainContent.off('click', '#btn-agregar-temario-editar');
        mainContent.off('click', '.btn-remover-temario-editar');
        mainContent.off('click', '#btn-actualizar-acta');
    });
};