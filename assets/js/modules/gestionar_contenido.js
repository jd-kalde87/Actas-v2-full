// assets/js/modules/gestionar_contenido.js

window.inicializarVista = function(actaCodigo) {
    
    // Referencias a elementos del DOM
    const mainContent = $('#main-content');
    const form = $('#form-contenido-acta');

    /**
     * Carga y muestra el contenido ya existente para el acta actual desde el backend.
     * Utiliza la función apiFetch para una comunicación segura y manejo de sesión.
     */
    function cargarContenidoExistente() {
        const contenidoContainer = $('#contenido-existente-container');
        
        apiFetch(`contenido-actas/obtener/${actaCodigo}`)
            .then(data => {
                contenidoContainer.html(''); // Limpia el contenedor antes de añadir nuevo contenido
                if (data && data.length > 0) {
                    data.forEach(item => {
                        // Lógica para parsear y mostrar los compromisos en una tabla HTML
                        let compromisosHtml = '<p class="text-muted small">No hay compromisos.</p>';
                        if (item.compromisos && item.compromisos.trim() !== '') {
                            compromisosHtml = '<table class="table table-sm table-bordered" style="font-size: 0.9em;"><thead><tr><th>Compromiso</th><th>Responsable</th><th>Fecha</th></tr></thead><tbody>';
                            const lineas = item.compromisos.trim().split(/\n/);
                            lineas.forEach(linea => {
                                const match = linea.match(/(.*)\[Responsable:\s(.*)\s\|\sFecha:\s(.*)\]/);
                                if (match) {
                                    compromisosHtml += `<tr><td>${match[1].replace(/^\d+\.\s/, '').trim()}</td><td>${match[2].trim()}</td><td>${match[3].trim()}</td></tr>`;
                                }
                            });
                            compromisosHtml += '</tbody></table>';
                        }

                        // Construye el bloque HTML para cada item de contenido
                        const contenidoHtml = `
                            <div class="callout callout-info" data-item-id="${item.id}">
                                <div class="float-right">
                                    <button class="btn btn-xs btn-primary btn-editar-contenido" title="Editar"><i class="fas fa-pencil-alt"></i></button>
                                    <button class="btn btn-xs btn-danger btn-eliminar-contenido" title="Eliminar"><i class="fas fa-trash"></i></button>
                                </div>
                                <h5>${item.temario_code}</h5>
                                <strong>Intervenciones:</strong>
                                <p>${item.intervenciones || 'No registradas.'}</p>
                                <strong>Compromisos:</strong>
                                ${compromisosHtml} 
                            </div>`;
                        const elemento = $(contenidoHtml);
                        elemento.data('itemData', item); // Almacena los datos del item en el elemento del DOM
                        contenidoContainer.append(elemento);
                    });
                } else {
                    contenidoContainer.html('<p class="text-muted">Aún no se ha añadido contenido a esta acta.</p>');
                }
            })
            .catch(error => {
                console.error("Error al cargar contenido:", error);
                window.mostrarNotificacion('No se pudo cargar el contenido del acta.', 'danger');
            });
    }

    /**
     * Carga los puntos del temario del acta en el menú desplegable del formulario.
     */
    function cargarTemario() {
        apiFetch(`actas/obtener/${actaCodigo}`)
            .then(data => {
                const temarioSelect = $('#temario-select');
                temarioSelect.html('<option value="" selected disabled>Seleccione un punto...</option>');
                if (data && data.temario) {
                    const temarioItems = Array.isArray(data.temario) ? data.temario : data.temario.split(',');
                    temarioItems.forEach(item => {
                        temarioSelect.append(`<option value="${item.trim()}">${item.trim()}</option>`);
                    });
                }
            })
            .catch(error => {
                console.error("Error al cargar el temario:", error);
                window.mostrarNotificacion('No se pudo cargar el temario.', 'danger');
            });
    }

    // ===================================================================
    //  MANEJO DE EVENTOS (Listeners para los botones y formularios)
    // ===================================================================

    /**
     * Evento para agregar un nuevo bloque de formulario para un compromiso.
     */
    mainContent.off('click', '#btn-agregar-compromiso').on('click', '#btn-agregar-compromiso', function() {
        // --- CÓDIGO HTML RESTAURADO Y COMPLETO ---
        const nuevoCompromisoHtml = `
            <div class="compromiso-item border rounded p-2 mb-2">
                <div class="form-group">
                    <textarea class="form-control compromiso-descripcion" rows="2" placeholder="Descripción del compromiso..." required></textarea>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <input type="text" class="form-control compromiso-responsable" placeholder="Responsable">
                    </div>
                    <div class="col-md-6">
                        <input type="date" class="form-control compromiso-fecha">
                    </div>
                </div>
                <div class="row mt-1">
                    <div class="col-md-6">
                        <div class="form-check">
                            <input class="form-check-input compromiso-sin-responsable" type="checkbox">
                            <label class="form-check-label small">Sin Responsable</label>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-check">
                            <input class="form-check-input compromiso-sin-fecha" type="checkbox">
                            <label class="form-check-label small">Sin Fecha</label>
                        </div>
                    </div>
                </div>
                <button type="button" class="btn btn-xs btn-danger mt-2 btn-remover-compromiso">Eliminar</button>
            </div>`;
        $('#contenedor-compromisos').append(nuevoCompromisoHtml);
    });

    // --- Eventos para el formulario dinámico de compromisos (con corrección .off()) ---
    mainContent.off('click', '.btn-remover-compromiso').on('click', '.btn-remover-compromiso', function() { $(this).closest('.compromiso-item').remove(); });
    mainContent.off('change', '.compromiso-sin-responsable').on('change', '.compromiso-sin-responsable', function() { $(this).closest('.compromiso-item').find('.compromiso-responsable').prop('disabled', this.checked).val(''); });
    mainContent.off('change', '.compromiso-sin-fecha').on('change', '.compromiso-sin-fecha', function() { $(this).closest('.compromiso-item').find('.compromiso-fecha').prop('disabled', this.checked).val(''); });

    /**
     * Evento para el botón principal de Guardar o Actualizar contenido.
     */
    mainContent.off('click', '#btn-guardar-contenido').on('click', '#btn-guardar-contenido', function() {
        const editingId = $(this).data('editing-id');
        let endpoint = 'contenido-actas/crear';
        let method = 'POST';
        if (editingId) {
            endpoint = `contenido-actas/actualizar/${editingId}`;
            method = 'PATCH';
        }
        
        let compromisosTexto = '';
        $('#contenedor-compromisos .compromiso-item').each(function(index) {
            const item = $(this);
            const descripcion = item.find('.compromiso-descripcion').val();
            if (descripcion) {
                const responsable = item.find('.compromiso-sin-responsable').is(':checked') ? 'N/A' : item.find('.compromiso-responsable').val() || 'N/A';
                const fecha = item.find('.compromiso-sin-fecha').is(':checked') ? 'N/A' : item.find('.compromiso-fecha').val() || 'N/A';
                compromisosTexto += `${index + 1}. ${descripcion} [Responsable: ${responsable} | Fecha: ${fecha}]\n`;
            }
        });
        
        const dataToSend = {
            acta_ID: actaCodigo,
            temario_code: $('#temario-select').val(),
            intervenciones: $('#intervenciones').val(),
            compromisos: compromisosTexto.trim()
        };
        if (editingId) {
            delete dataToSend.acta_ID;
        }

        apiFetch(endpoint, {
            method: method,
            body: JSON.stringify(dataToSend)
        }).then(() => {
            const notificacion = { 
                mensaje: editingId ? 'Contenido actualizado.' : 'Contenido añadido.', 
                tipo: 'success' 
            };
            sessionStorage.setItem('notificacionPendiente', JSON.stringify(notificacion));
            window.cargarVista('gestionar_contenido', actaCodigo);
        }).catch(error => {
            window.mostrarNotificacion(error.message, 'danger');
        });
    });

    /**
     * Evento para el botón de Eliminar un registro de contenido.
     */
    mainContent.off('click', '.btn-eliminar-contenido').on('click', '.btn-eliminar-contenido', function() {
        if (confirm('¿Estás seguro de que deseas eliminar este registro?')) {
            const itemId = $(this).closest('.callout').data('item-id');
            apiFetch(`contenido-actas/eliminar/${itemId}`, {
                method: 'DELETE'
            }).then(() => {
                window.mostrarNotificacion('Registro eliminado.', 'success');
                cargarContenidoExistente();
            }).catch(error => {
                window.mostrarNotificacion('Error al eliminar.', 'danger');
            });
        }
    });
    
    /**
     * Evento para el botón de Editar, que puebla el formulario con datos existentes.
     */
    mainContent.off('click', '.btn-editar-contenido').on('click', '.btn-editar-contenido', function() {
        const itemData = $(this).closest('.callout').data('itemData');
        $('#temario-select').val(itemData.temario_code);
        $('#intervenciones').val(itemData.intervenciones);
        
        const contenedorCompromisos = $('#contenedor-compromisos');
        contenedorCompromisos.html('');
        if (itemData.compromisos && itemData.compromisos.trim() !== '') {
            const lineas = itemData.compromisos.trim().split(/\n/);
            lineas.forEach(linea => {
                const match = linea.match(/(.*)\[Responsable:\s(.*)\s\|\sFecha:\s(.*)\]/);
                if (match) {
                    $('#btn-agregar-compromiso').click();
                    const nuevoItem = contenedorCompromisos.find('.compromiso-item:last');
                    const descripcion = match[1].replace(/^\d+\.\s/, '').trim();
                    const responsable = match[2].trim();
                    const fecha = match[3].trim();
                    nuevoItem.find('.compromiso-descripcion').val(descripcion);
                    if (responsable !== 'N/A') nuevoItem.find('.compromiso-responsable').val(responsable);
                    else nuevoItem.find('.compromiso-sin-responsable').prop('checked', true).trigger('change');
                    if (fecha !== 'N/A') nuevoItem.find('.compromiso-fecha').val(fecha);
                    else nuevoItem.find('.compromiso-sin-fecha').prop('checked', true).trigger('change');
                }
            });
        }
        $('#btn-guardar-contenido').html('<i class="fas fa-sync-alt"></i> Actualizar Contenido').data('editing-id', itemData.id);
        window.mostrarNotificacion('Modo de edición activado.', 'info');
    });

    // --- INICIALIZACIÓN Y LIMPIEZA DE EVENTOS ---
    cargarTemario();
    cargarContenidoExistente();
    
    // Al salir de la vista, limpiamos todos los listeners de click para evitar duplicados.
    mainContent.on('remove', function() {
        mainContent.off('click');
    });
};