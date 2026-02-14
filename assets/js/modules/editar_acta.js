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
        // Usamos apiFetch para proteger la petición
        apiFetch(`actas/obtener/${actaCodigo}`)
            .then(data => {
                // Rellenar el formulario
                $('#tema-editar').val(data.tema);
                $('#lugar-editar').val(data.lugar);
                $('#fecha-editar').val(data.fecha); // Asegúrate que el input type="date" reciba YYYY-MM-DD
                $('#HoraI-editar').val(data.horaInicio);
                $('#HoraF-editar').val(data.horaFin);
                $('#asistentes-editar').val(data.cantidad_asistentes);

                // Configuración del select de tipo de reunión
                const tipoSelect = $('#tiporeunion-editar');
                tipoSelect.html(`<option value="1">Comite mensual</option><option value="2">Verificacion en campo</option><option value="10">Otros</option>`);
                tipoSelect.val(data.tipo_reunion);

                const contenedorTemarios = $('#contenedor-temarios-editar');
                contenedorTemarios.html('');
                
                // --- CORRECCIÓN CRÍTICA: DETECCIÓN INTELIGENTE DE SEPARADOR ---
                if (data.temario && typeof data.temario === 'string') {
                    let temarioItems = [];
                    
                    // Si contiene el nuevo separador '||', lo usamos. Si no, usamos la coma (compatibilidad actas viejas)
                    if (data.temario.includes('||')) {
                        temarioItems = data.temario.split('||');
                    } else {
                        temarioItems = data.temario.split(',');
                    }

                    temarioItems.forEach(item => {
                        // Limpiamos espacios en blanco extra
                        const valorLimpio = item.trim();
                        if(valorLimpio) {
                            const nuevoTemario = `
                                <div class="input-group mb-2">
                                    <span class="input-group-text"></span>
                                    <input type="text" class="form-control" name="temario-editar[]" value="${valorLimpio}" required>
                                    <button type="button" class="btn btn-outline-danger btn-remover-temario-editar">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>`;
                            contenedorTemarios.append(nuevoTemario);
                        }
                    });
                }
                renumerarTemariosEditar();
            })
            .catch(error => {
                window.mostrarNotificacion('No se pudieron cargar los datos del acta.', 'danger');
                console.error(error);
            });
    }

    // Botón "Agregar Temario"
    mainContent.off('click', '#btn-agregar-temario-editar').on('click', '#btn-agregar-temario-editar', function() {
        const nuevoTemario = `<div class="input-group mb-2"><span class="input-group-text"></span><input type="text" class="form-control" name="temario-editar[]" placeholder="Nuevo punto" required><button type="button" class="btn btn-outline-danger btn-remover-temario-editar"><i class="fas fa-times"></i></button></div>`;
        $('#contenedor-temarios-editar').append(nuevoTemario);
        renumerarTemariosEditar();
    });

    // Botón "Remover Temario"
    mainContent.off('click', '.btn-remover-temario-editar').on('click', '.btn-remover-temario-editar', function() {
        $(this).closest('.input-group').remove();
        renumerarTemariosEditar();
    });

    // Botón "Actualizar Acta"
    mainContent.off('click', '#btn-actualizar-acta').on('click', '#btn-actualizar-acta', function() {
        const actaCodigo = $('#form-editar-acta').data('acta-codigo');
        const temarios = [];
        $('input[name="temario-editar[]"]').each(function() { temarios.push($(this).val()); });

        const data = {
            tema: $('#tema-editar').val(),
            lugar: $('#lugar-editar').val(),
            fecha: $('#fecha-editar').val(),
            horaInicio: $('#HoraI-editar').val(),
            horaFin: $('#HoraF-editar').val(),
            cantidad_asistentes: $('#asistentes-editar').val(),
            tipo_reunion: $('#tiporeunion-editar').val(),
            temario: temarios // Se envía como Array, el backend lo convertirá a String con ||
        };

        apiFetch(`actas/actualizar/${actaCodigo}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        })
        .then((response) => {
            const notificacion = { 
                mensaje: response.message || 'Acta actualizada exitosamente.', 
                tipo: 'success' 
            };
            sessionStorage.setItem('notificacionPendiente', JSON.stringify(notificacion));
            window.cargarVista('lista_actas');
        })
        .catch(error => { 
            window.mostrarNotificacion(error.message, 'danger'); 
            console.error(error); 
        });
    });

    inicializarEdicion();
};