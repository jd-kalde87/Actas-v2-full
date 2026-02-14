// assets/js/modules/gestionar_contenido.js

window.inicializarVista = function(actaCodigo) {
    
    // Referencias a elementos del DOM
    const mainContent = $('#main-content');
    
    /**
     * Carga y muestra el contenido ya existente para el acta actual.
     */
    function cargarContenidoExistente() {
        const contenidoContainer = $('#contenido-existente-container');
        
        apiFetch(`contenido-actas/obtener/${actaCodigo}`)
            .then(data => {
                contenidoContainer.html(''); 
                if (data && data.length > 0) {
                    data.forEach(item => {
                        let compromisosHtml = '<p class="text-muted small">No hay compromisos.</p>';
                        
                        // Renderizado de compromisos (sin cambios)
                        if (item.compromisos && item.compromisos.trim() !== '') {
                            compromisosHtml = '<table class="table table-sm table-bordered" style="font-size: 0.9em;"><thead><tr><th>Compromiso</th><th>Responsable</th><th>Fecha</th></tr></thead><tbody>';
                            // Normalizamos saltos de línea por si acaso
                            const lineas = item.compromisos.trim().split(/\r?\n/);
                            lineas.forEach(linea => {
                                // Regex ajustada para ser más flexible con espacios
                                const match = linea.match(/(.*?)\[Responsable:\s*(.*?)\s*\|\s*Fecha:\s*(.*?)\]/);
                                if (match) {
                                    compromisosHtml += `<tr><td>${match[1].replace(/^\d+\.\s/, '').trim()}</td><td>${match[2].trim()}</td><td>${match[3].trim()}</td></tr>`;
                                } else {
                                    // Si no hace match exacto, mostramos la línea tal cual para no perder info
                                    compromisosHtml += `<tr><td colspan="3">${linea}</td></tr>`;
                                }
                            });
                            compromisosHtml += '</tbody></table>';
                        }

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
                        elemento.data('itemData', item);
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
     * Carga los puntos del temario del acta en el menú desplegable.
     * CORRECCIÓN: Ahora soporta el separador '||'
     */
    function cargarTemario() {
        apiFetch(`actas/obtener/${actaCodigo}`)
            .then(data => {
                const temarioSelect = $('#temario-select');
                temarioSelect.html('<option value="" selected disabled>Seleccione un punto...</option>');
                
                if (data && data.temario) {
                    let temarioItems = [];

                    // 1. Si ya es un array, úsalo directo
                    if (Array.isArray(data.temario)) {
                        temarioItems = data.temario;
                    } 
                    // 2. Si es texto, verifica qué separador usa
                    else if (typeof data.temario === 'string') {
                        if (data.temario.includes('||')) {
                            // Nuevo formato
                            temarioItems = data.temario.split('||');
                        } else {
                            // Formato antiguo (retrocompatibilidad)
                            temarioItems = data.temario.split(',');
                        }
                    }

                    // 3. Crear las opciones en el Select
                    temarioItems.forEach(item => {
                        const valorLimpio = item.trim();
                        if (valorLimpio) { // Solo agregar si no está vacío
                            temarioSelect.append(`<option value="${valorLimpio}">${valorLimpio}</option>`);
                        }
                    });
                }
            })
            .catch(error => {
                console.error("Error al cargar el temario:", error);
                window.mostrarNotificacion('No se pudo cargar el temario.', 'danger');
            });
    }

    // ===================================================================
    //  MANEJO DE EVENTOS
    // ===================================================================

    // Agregar campo de compromiso dinámico
    mainContent.off('click', '#btn-agregar-compromiso').on('click', '#btn-agregar-compromiso', function() {
        const nuevoCompromisoHtml = `
            <div class="compromiso-item border rounded p-2 mb-2 bg-light">
                <div class="form-group mb-2">
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
                <div class="row mt-2">
                    <div class="col-md-6">
                        <div class="custom-control custom-checkbox">
                            <input type="checkbox" class="custom-control-input compromiso-sin-responsable" id="checkResp${Date.now()}">
                            <label class="custom-control-label small" for="checkResp${Date.now()}">Sin Responsable</label>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="custom-control custom-checkbox">
                            <input type="checkbox" class="custom-control-input compromiso-sin-fecha" id="checkFecha${Date.now()}">
                            <label class="custom-control-label small" for="checkFecha${Date.now()}">Sin Fecha</label>
                        </div>
                    </div>
                </div>
                <button type="button" class="btn btn-xs btn-outline-danger mt-2 btn-remover-compromiso" style="width:100%">Eliminar Compromiso</button>
            </div>`;
        $('#contenedor-compromisos').append(nuevoCompromisoHtml);
    });

    // Remover compromiso
    mainContent.off('click', '.btn-remover-compromiso').on('click', '.btn-remover-compromiso', function() { 
        $(this).closest('.compromiso-item').remove(); 
    });

    // Checkbox "Sin Responsable"
    mainContent.off('change', '.compromiso-sin-responsable').on('change', '.compromiso-sin-responsable', function() { 
        $(this).closest('.compromiso-item').find('.compromiso-responsable').prop('disabled', this.checked).val(this.checked ? '' : ''); 
    });

    // Checkbox "Sin Fecha"
    mainContent.off('change', '.compromiso-sin-fecha').on('change', '.compromiso-sin-fecha', function() { 
        $(this).closest('.compromiso-item').find('.compromiso-fecha').prop('disabled', this.checked).val(this.checked ? '' : ''); 
    });

    // Botón Guardar / Actualizar
    mainContent.off('click', '#btn-guardar-contenido').on('click', '#btn-guardar-contenido', function() {
        const boton = $(this);
        const editingId = boton.data('editing-id');
        
        let endpoint = 'contenido-actas/crear';
        let method = 'POST'; // Por defecto crear
        
        // Validación básica
        if ($('#temario-select').val() === null) {
            window.mostrarNotificacion('Por favor selecciona un punto del temario.', 'warning');
            return;
        }

        if (editingId) {
            endpoint = `contenido-actas/actualizar/${editingId}`;
            method = 'PATCH';
        }
        
        // Construir texto de compromisos
        let compromisosTexto = '';
        $('#contenedor-compromisos .compromiso-item').each(function(index) {
            const item = $(this);
            const descripcion = item.find('.compromiso-descripcion').val();
            
            if (descripcion && descripcion.trim() !== '') {
                const sinResp = item.find('.compromiso-sin-responsable').is(':checked');
                const sinFecha = item.find('.compromiso-sin-fecha').is(':checked');
                
                const responsable = sinResp ? 'N/A' : (item.find('.compromiso-responsable').val() || 'N/A');
                const fecha = sinFecha ? 'N/A' : (item.find('.compromiso-fecha').val() || 'N/A');
                
                compromisosTexto += `${index + 1}. ${descripcion} [Responsable: ${responsable} | Fecha: ${fecha}]\n`;
            }
        });
        
        const dataToSend = {
            acta_ID: actaCodigo,
            temario_code: $('#temario-select').val(),
            intervenciones: $('#intervenciones').val(),
            compromisos: compromisosTexto.trim()
        };

        // Si es edición, no enviamos el ID del acta (ya está asociado)
        if (editingId) delete dataToSend.acta_ID;

        boton.prop('disabled', true);

        apiFetch(endpoint, {
            method: method,
            body: JSON.stringify(dataToSend)
        }).then(() => {
            const notificacion = { 
                mensaje: editingId ? 'Contenido actualizado correctamente.' : 'Contenido añadido correctamente.', 
                tipo: 'success' 
            };
            sessionStorage.setItem('notificacionPendiente', JSON.stringify(notificacion));
            window.cargarVista('gestionar_contenido', actaCodigo);
        }).catch(error => {
            boton.prop('disabled', false);
            window.mostrarNotificacion(error.message, 'danger');
        });
    });

    // Botón Eliminar Contenido
    mainContent.off('click', '.btn-eliminar-contenido').on('click', '.btn-eliminar-contenido', function() {
        if (confirm('¿Estás seguro de que deseas eliminar este registro de contenido?')) {
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
    
    // Botón Editar Contenido (Cargar datos al formulario)
    mainContent.off('click', '.btn-editar-contenido').on('click', '.btn-editar-contenido', function() {
        const itemData = $(this).closest('.callout').data('itemData');
        
        // Llenar campos básicos
        $('#temario-select').val(itemData.temario_code);
        $('#intervenciones').val(itemData.intervenciones);
        
        // Llenar compromisos
        const contenedorCompromisos = $('#contenedor-compromisos');
        contenedorCompromisos.html(''); // Limpiar
        
        if (itemData.compromisos && itemData.compromisos.trim() !== '') {
            const lineas = itemData.compromisos.trim().split(/\r?\n/);
            lineas.forEach(linea => {
                // Regex para extraer datos
                const match = linea.match(/(.*?)\[Responsable:\s*(.*?)\s*\|\s*Fecha:\s*(.*?)\]/);
                
                if (match) {
                    // Simular clic en "Agregar Compromiso" para crear la estructura
                    $('#btn-agregar-compromiso').click();
                    const nuevoItem = contenedorCompromisos.find('.compromiso-item:last');
                    
                    const descripcion = match[1].replace(/^\d+\.\s/, '').trim(); // Quitar número inicial
                    const responsable = match[2].trim();
                    const fecha = match[3].trim();
                    
                    nuevoItem.find('.compromiso-descripcion').val(descripcion);
                    
                    if (responsable !== 'N/A') {
                        nuevoItem.find('.compromiso-responsable').val(responsable);
                    } else {
                        nuevoItem.find('.compromiso-sin-responsable').prop('checked', true).trigger('change');
                    }
                    
                    if (fecha !== 'N/A') {
                        nuevoItem.find('.compromiso-fecha').val(fecha);
                    } else {
                        nuevoItem.find('.compromiso-sin-fecha').prop('checked', true).trigger('change');
                    }
                }
            });
        }
        
        // Cambiar estado del botón a "Actualizar"
        $('#btn-guardar-contenido')
            .removeClass('btn-success')
            .addClass('btn-primary')
            .html('<i class="fas fa-sync-alt"></i> Actualizar Contenido')
            .data('editing-id', itemData.id);
            
        // Scroll hacia el formulario
        $('html, body').animate({
            scrollTop: $("#form-contenido-acta").offset().top - 100
        }, 500);
        
        window.mostrarNotificacion('Modo de edición activado. Realiza tus cambios y pulsa Actualizar.', 'info');
    });

    // Inicialización
    cargarTemario();
    cargarContenidoExistente();
    
    // Limpieza al salir
    mainContent.on('remove', function() {
        mainContent.off('click');
        mainContent.off('change');
    });
};