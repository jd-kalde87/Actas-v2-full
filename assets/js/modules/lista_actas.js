// assets/js/modules/lista_actas.js

function getBase64Image(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve(null);
        img.src = url;
    });
}

var mapaTiposReunion = {
    '1': 'Comité Mensual',
    '2': 'Verificación en Campo',
    '3': 'Virtual',
    '10': 'Otros'
};

// Estados posibles del acta (deben coincidir con la BD / backend: columna 'firma' en tabla acta)
var ESTADOS_ACTA = ['Borrador', 'Activo', 'Finalizado'];

function normalizarEstadoActa(valor) {
    if (!valor || !String(valor).trim()) return ESTADOS_ACTA[0];
    var v = String(valor).trim();
    var found = ESTADOS_ACTA.find(function(e) { return e.toLowerCase() === v.toLowerCase(); });
    return found || v;
}

function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function buildPreviewActaHtml(pdfData) {
    var acta = pdfData.acta || {};
    var contenido = pdfData.contenido || [];
    var firmas = pdfData.firmas || [];
    var tipoReunion = mapaTiposReunion[acta.tipo_reunion] || acta.tipo_reunion || 'N/A';
    var temarioItems = (acta.temario || '').split('||').filter(Boolean);

    var html = '<div class="preview-acta">';

    html += '<div class="preview-header">';
    html += '<h4 class="preview-title">ACTA DE REUNIÓN</h4>';
    html += '<p class="preview-subtitle">' + escapeHtml(acta.tema || 'Sin tema') + '</p>';
    html += '<div class="preview-meta"><span class="preview-meta-item"><strong>Código:</strong> ' + escapeHtml(acta.codigo || '') + '</span>';
    html += '<span class="preview-meta-badge">' + escapeHtml(acta.firma || 'Borrador') + '</span></div>';
    html += '</div>';

    html += '<div class="preview-section">';
    html += '<h5 class="preview-section-title"><span class="preview-section-num">1</span> Información general</h5>';
    html += '<div class="preview-card">';
    html += '<div class="preview-grid">';
    html += '<div class="preview-field"><label>Lugar</label><p>' + escapeHtml(acta.lugar || '—') + '</p></div>';
    html += '<div class="preview-field"><label>Fecha</label><p>' + (acta.fecha ? new Date(acta.fecha).toLocaleDateString('es-CO') : '—') + '</p></div>';
    html += '<div class="preview-field"><label>Tipo de reunión</label><p>' + escapeHtml(tipoReunion) + '</p></div>';
    html += '<div class="preview-field"><label>Horario</label><p>' + escapeHtml(acta.horaInicio || '') + ' - ' + escapeHtml(acta.horaFin || '') + '</p></div>';
    html += '<div class="preview-field"><label>Asistentes esperados</label><p>' + (acta.cantidad_asistentes || acta.numeroParticipantes || '—') + '</p></div>';
    html += '</div></div></div>';

    html += '<div class="preview-section">';
    html += '<h5 class="preview-section-title"><span class="preview-section-num">2</span> Temario</h5>';
    html += '<div class="preview-card"><ol class="preview-temario">';
    temarioItems.forEach(function(punto, i) {
        html += '<li>' + escapeHtml(punto.trim()) + '</li>';
    });
    html += '</ol></div></div>';

    if (contenido.length > 0) {
        html += '<div class="preview-section">';
        html += '<h5 class="preview-section-title"><span class="preview-section-num">3</span> Desarrollo</h5>';
        contenido.forEach(function(item) {
            html += '<div class="preview-card preview-card-block">';
            html += '<h6 class="preview-block-title">' + escapeHtml(item.temario_code || 'Punto') + '</h6>';
            html += '<p class="preview-label">Intervenciones</p><p class="preview-text">' + escapeHtml((item.intervenciones || '—').trim()) + '</p>';
            if (item.compromisos && item.compromisos.trim()) {
                html += '<p class="preview-label">Compromisos</p><pre class="preview-pre">' + escapeHtml((item.compromisos || '').trim()) + '</pre>';
            }
            html += '</div>';
        });
        html += '</div>';
    }

    html += '<div class="preview-section">';
    html += '<h5 class="preview-section-title"><span class="preview-section-num">4</span> Listado de asistencia y firmas</h5>';
    var placeholderHtml = '<span class="firma-placeholder" title="Sin firma registrada"><i class="fas fa-user"></i><em>Sin firma</em></span>';
    var placeholderErrorHtml = '<span class="firma-placeholder firma-placeholder-error" title="Firma no disponible"><i class="fas fa-exclamation-triangle"></i><em>No disponible</em></span>';
    if (firmas.length > 0) {
        html += '<div class="table-responsive"><table class="preview-table"><thead><tr><th>#</th><th>Nombre completo</th><th>Empresa</th><th>Cargo</th><th>Firma</th></tr></thead><tbody>';
        firmas.forEach(function(f, idx) {
            var nombreCompleto = (f.nombre || '').trim() + ' ' + (f.apellidos || '').trim();
            var tieneFirma = f.firma && String(f.firma).length > 50 && (f.firma.indexOf('data:image') === 0 || f.firma.indexOf('/') !== 0);
            var celdaFirma;
            if (!tieneFirma) {
                celdaFirma = placeholderHtml;
            } else {
                celdaFirma = '<span class="firma-cell-wrap"><img src="' + f.firma.replace(/"/g, '&quot;') + '" alt="Firma" class="firma-thumb" onerror="var w=this.parentNode;var s=w.querySelector(\'.firma-placeholder-fallback\');if(s)s.style.display=\'flex\';this.style.display=\'none\';"><span class="firma-placeholder firma-placeholder-fallback firma-placeholder-error" style="display:none" title="Firma no disponible"><i class="fas fa-exclamation-triangle"></i><em>No disponible</em></span></span>';
            }
            html += '<tr><td class="preview-num">' + (idx + 1) + '</td><td>' + escapeHtml(nombreCompleto) + '</td><td>' + escapeHtml(f.empresa || '—') + '</td><td>' + escapeHtml(f.cargo || '—') + '</td><td class="firma-td">' + celdaFirma + '</td></tr>';
        });
        html += '</tbody></table></div>';
    } else {
        html += '<div class="preview-card preview-empty"><span class="firma-placeholder firma-placeholder-empty"><i class="fas fa-users"></i><em>Aún no hay firmas registradas</em></span></div>';
    }
    html += '</div></div>';
    return html;
}

window.inicializarVista = function() {
    
    const spinner = $('#spinner-actas');
    const tablaElement = $('#tabla-actas');
    const mainContent = $('#main-content');

    tablaElement.addClass('hidden');
    spinner.removeClass('hidden');

    const tabla = tablaElement.DataTable({
        "destroy": true,
        "responsive": true,
        "lengthChange": false,
        "autoWidth": false,
        "language": {
            "search": "Buscar:",
            "zeroRecords": "No se encontraron resultados",
            "info": "Mostrando _START_ a _END_ de _TOTAL_ actas",
            "infoEmpty": "Mostrando 0 a 0 de 0 actas",
            "infoFiltered": "(filtrado de _MAX_ actas totales)",
            "paginate": { "first": "Primero", "last": "Último", "next": "Siguiente", "previous": "Anterior" }
        },
        "ajax": function(data, callback, settings) {
            apiFetch('actas/obtener')
                .then(datos => {
                    spinner.addClass('hidden');
                    tablaElement.removeClass('hidden');
                    callback({ data: datos });
                })
                .catch(error => {
                    console.error("Error al cargar las actas:", error);
                    spinner.addClass('hidden');
                    tablaElement.removeClass('hidden');
                    $('#tabla-container').html('<p class="text-danger">No se pudieron cargar las actas.</p>');
                    callback({ data: [] });
                });
        },
        "columns": [
            { "data": "codigo", "title": "Código" },
            { "data": "tema", "title": "Tema" },
            { "data": "lugar", "title": "Lugar" },
            { 
                "data": "fecha", "title": "Fecha",
                "render": function(data) { return data ? new Date(data).toLocaleDateString('es-CO') : ''; }
            },
            { 
                "data": "firma", "title": "Estado",
                "render": function(data) {
                    const estado = String(data || '').toLowerCase();
                    let badgeClass = 'badge-secondary';
                    if (estado === 'finalizado') badgeClass = 'badge-success';
                    else if (estado === 'borrador' || estado === 'activo') badgeClass = 'badge-primary';
                    return `<span class="badge ${badgeClass}">${data || 'Desconocido'}</span>`;
                }
            },
            {
                "data": null, "title": "Acciones", "orderable": false,
                "render": function(data, type, row) {
                    var esFinalizado = String(row.firma).toLowerCase() === 'finalizado';
                    var esAdmin = typeof APP_CONFIG !== 'undefined' && APP_CONFIG.userAdmin;
                    var d = esFinalizado ? ' disabled' : '';
                    var items = [
                        '<a class="dropdown-item accion-acta' + d + '" href="#" data-accion="editar-encabezado"><i class="fas fa-pen mr-2"></i>Editar encabezado</a>',
                        '<a class="dropdown-item accion-acta' + d + '" href="#" data-accion="gestionar-contenido"><i class="fas fa-list-ul mr-2"></i>Gestionar contenido</a>',
                        '<a class="dropdown-item accion-acta" href="#" data-accion="previsualizar"><i class="fas fa-eye mr-2"></i>Previsualizar acta</a>',
                        '<a class="dropdown-item accion-acta' + d + '" href="#" data-accion="generar-qr"><i class="fas fa-qrcode mr-2"></i>Compartir (QR)</a>',
                        '<a class="dropdown-item accion-acta' + d + '" href="#" data-accion="finalizar"><i class="fas fa-check mr-2"></i>Finalizar acta</a>'
                    ];
                    if (esAdmin) items.push('<a class="dropdown-item accion-acta" href="#" data-accion="cambiar-estado" title="' + (esFinalizado ? 'Solo el administrador puede cambiar el estado de un acta finalizada.' : 'Cambiar estado del acta') + '"><i class="fas fa-exchange-alt mr-2"></i>Cambiar estado' + (esFinalizado ? ' <span class="badge badge-warning badge-sm ml-1">Solo admin</span>' : '') + '</a>');
                    items.push('<a class="dropdown-item accion-acta" href="#" data-accion="generar-pdf"><i class="fas fa-file-pdf mr-2"></i>Generar PDF</a>');
                    if (esAdmin) items.push('<div class="dropdown-divider"></div><a class="dropdown-item accion-acta text-danger" href="#" data-accion="eliminar"><i class="fas fa-trash mr-2"></i>Eliminar acta</a>');
                    var menu = '<ul class="dropdown-menu dropdown-menu-right dropdown-menu-acciones">' + items.join('') + '</ul>';
                    return '<div class="dropdown">' +
                        '<button class="btn btn-sm btn-outline-primary dropdown-toggle btn-acciones-acta" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                        '<i class="fas fa-bars mr-1"></i> Acciones</button>' + menu + '</div>';
                }
            }
        ],
        "order": [[ 3, "desc" ]]
    });

    // Manejador del menú Acciones (dropdown)
    mainContent.off('click', '#tabla-actas .accion-acta').on('click', '#tabla-actas .accion-acta', function(e) {
        e.preventDefault();
        if ($(this).hasClass('disabled')) return;
        var tr = $(this).closest('tr');
        var data = tabla.row(tr).data();
        if (!data) return;
        var accion = $(this).data('accion');

        var ejecutarAccion = function() {
        if (accion === 'editar-encabezado') {
            window.cargarVista('editar_acta', data.codigo);
        } else if (accion === 'gestionar-contenido') {
            window.cargarVista('gestionar_contenido', data.codigo);
        } else if (accion === 'generar-qr') {
            window.cargarVista('generar_qr', data.codigo);
        } else if (accion === 'finalizar') {
            Swal.fire({
                title: '¿Finalizar acta?',
                text: '¿Estás seguro de que deseas finalizar el acta ' + data.codigo + '?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, finalizar',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#2C3E50'
            }).then(function(result) {
                if (result.isConfirmed) {
                    apiFetch('actas/actualizar/' + data.codigo, { method: 'PATCH', body: JSON.stringify({ firma: 'Finalizado' }) })
                        .then(function() {
                            Swal.fire({ title: 'Listo', text: 'Acta finalizada exitosamente.', icon: 'success', confirmButtonColor: '#2C3E50' });
                            window.cargarVista('lista_actas');
                        })
                        .catch(function(err) { Swal.fire({ title: 'Error', text: err.message, icon: 'error', confirmButtonColor: '#2C3E50' }); });
                }
            });
        } else if (accion === 'eliminar') {
            Swal.fire({
                title: '¿Eliminar acta?',
                html: 'Se eliminará permanentemente el acta <strong>' + data.codigo + '</strong> y todo su contenido. Esta acción no se puede deshacer.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#dc3545'
            }).then(function(result) {
                if (result.isConfirmed) {
                    apiFetch('actas/eliminar/' + data.codigo, { method: 'DELETE' })
                        .then(function() {
                            Swal.fire({ title: 'Eliminada', text: 'El acta ha sido eliminada.', icon: 'success', confirmButtonColor: '#2C3E50' });
                            window.cargarVista('lista_actas');
                        })
                        .catch(function(err) { Swal.fire({ title: 'Error', text: err.message || 'No se pudo eliminar el acta.', icon: 'error', confirmButtonColor: '#2C3E50' }); });
                }
            });
        } else if (accion === 'previsualizar') {
            var $modal = $('#modal-preview-acta');
            var $body = $('#modal-preview-acta-body');
            $body.html('<div class="text-center text-muted py-4"><span class="fas fa-spinner fa-spin"></span> Cargando...</div>');
            $modal.find('.modal-title').text('Previsualización: ' + data.codigo);
            $modal.modal('show');
            apiFetch('actas/obtener-pdf-data/' + data.codigo)
                .then(function(pdfData) { $body.html(buildPreviewActaHtml(pdfData)); })
                .catch(function(err) { $body.html('<div class="alert alert-danger mb-0">No se pudo cargar el acta: ' + (err.message || 'Error desconocido') + '</div>'); });
        } else if (accion === 'cambiar-estado') {
            var estadoActual = normalizarEstadoActa(data.firma);
            var inputOptions = {};
            ESTADOS_ACTA.forEach(function(e) { inputOptions[e] = e; });
            Swal.fire({
                title: 'Cambiar estado del acta',
                text: 'Seleccione el nuevo estado para ' + data.codigo,
                input: 'select',
                inputOptions: inputOptions,
                inputValue: estadoActual,
                showCancelButton: true,
                confirmButtonText: 'Actualizar',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#2C3E50'
            }).then(function(result) {
                if (result.isConfirmed && result.value) {
                    apiFetch('actas/actualizar/' + data.codigo, { method: 'PATCH', body: JSON.stringify({ firma: result.value }) })
                        .then(function() {
                            Swal.fire({ title: 'Estado actualizado', text: 'El acta ahora está en estado: ' + result.value, icon: 'success', confirmButtonColor: '#2C3E50' });
                            window.cargarVista('lista_actas');
                        })
                        .catch(function(err) { Swal.fire({ title: 'Error', text: err.message || 'No se pudo actualizar el estado.', icon: 'error', confirmButtonColor: '#2C3E50' }); });
                }
            });
        } else if (accion === 'generar-pdf') {
            ejecutarGenerarPdf(data, tabla);
        }
        };
        ejecutarAccion();
    });

    async function ejecutarGenerarPdf(data, tabla) {
            window.mostrarNotificacion('Generando PDF...', 'info');
            try {
                const [logoBase64, pdfData] = await Promise.all([
                    getBase64Image('assets/img/logo2.png'),
                    apiFetch(`actas/obtener-pdf-data/${data.codigo}`)
                ]);

                if (!pdfData || !pdfData.acta) throw new Error('No se encontraron datos para generar el PDF.');

                // --- MAPEO DE TIPOS DE REUNIÓN ---
                const mapaTipos = {
                    '1': 'Comité Mensual',
                    '2': 'Verificación en Campo',
                    '3': 'Virtual',
                    '10': 'Otros'
                };
                // Si el código existe en el mapa, usa el texto. Si no, usa el original.
                const tipoReunionTexto = mapaTipos[pdfData.acta.tipo_reunion] || pdfData.acta.tipo_reunion || 'N/A';

                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                const colorPrincipal = [44, 62, 80]; 
                const colorSecundario = [255, 115, 0];

                // 1. Encabezado
                doc.autoTable({
                    startY: 10,
                    body: [[
                        { content: '', styles: { cellWidth: 40 } },
                        { content: 'ACTA DE REUNIÓN', styles: { halign: 'center', fontSize: 16, fontStyle: 'bold', valign: 'middle' } },
                        { content: `Código: ${pdfData.acta.codigo}\nVersión: 1.0\nAprobado: Gerencia`, styles: { halign: 'right', fontSize: 8 } }
                    ]],
                    theme: 'plain',
                    didDrawCell: function(data) {
                        if (data.section === 'body' && data.column.index === 0 && logoBase64) {
                            doc.addImage(logoBase64, 'PNG', data.cell.x + 2, data.cell.y + 2, 35, 12);
                        }
                    }
                });

                // 2. Información General (USANDO EL TEXTO TRADUCIDO)
                doc.autoTable({
                    startY: doc.lastAutoTable.finalY + 5,
                    head: [[{ content: '1. Información General', colSpan: 2, styles: { fillColor: colorPrincipal, textColor: 255, fontStyle: 'bold' } }]],
                    body: [
                        [`Tema: ${pdfData.acta.tema}`, `Tipo: ${tipoReunionTexto}`],
                        [`Lugar: ${pdfData.acta.lugar}`, `Fecha: ${new Date(pdfData.acta.fecha).toLocaleDateString('es-CO')}`],
                        [`Hora Inicio: ${pdfData.acta.horaInicio}`, `Hora Fin: ${pdfData.acta.horaFin}`],
                        [{ content: `Asistentes: ${pdfData.acta.cantidad_asistentes}`, colSpan: 2 }]
                    ],
                    theme: 'grid'
                });

                // 3. Desarrollo
                const desarrolloData = pdfData.contenido.map((item, i) => [
                    i + 1, 
                    item.temario_code || 'Sin tema', 
                    item.intervenciones || 'Sin observaciones'
                ]);
                
                doc.autoTable({
                    startY: doc.lastAutoTable.finalY + 5,
                    head: [
                        [{ content: '2. Desarrollo', colSpan: 3, styles: { fillColor: colorPrincipal, textColor: 255, fontStyle: 'bold' } }],
                        ['#', 'Temario', 'Intervenciones']
                    ],
                    body: desarrolloData.length ? desarrolloData : [['-', '-', 'Sin contenido registrado']],
                    theme: 'grid',
                    headStyles: { fillColor: colorSecundario }
                });

                // 4. Compromisos
                const compromisosData = pdfData.contenido
                    .filter(c => c.compromisos && c.compromisos.trim())
                    .map(c => {
                        const texto = c.compromisos;
                        const respMatch = texto.match(/Responsable:\s*(.*?)\s*\|/);
                        const fechaMatch = texto.match(/Fecha:\s*(.*?)]/);
                        const detalle = texto.replace(/\[.*?\]/, '').replace(/^\d+\.\s/, '').trim(); // Limpia números iniciales
                        
                        return [
                            c.temario_code,
                            detalle,
                            respMatch ? respMatch[1] : 'S/N',
                            fechaMatch ? fechaMatch[1] : 'S/N'
                        ];
                    });

                if (compromisosData.length > 0) {
                    doc.autoTable({
                        startY: doc.lastAutoTable.finalY + 5,
                        head: [
                            [{ content: '3. Compromisos', colSpan: 4, styles: { fillColor: colorPrincipal, textColor: 255, fontStyle: 'bold' } }],
                            ['Tema', 'Compromiso', 'Responsable', 'Fecha']
                        ],
                        body: compromisosData,
                        theme: 'grid',
                        headStyles: { fillColor: colorSecundario }
                    });
                }

                // 5. Firmas (PROTEGIDO)
                if (pdfData.firmas && pdfData.firmas.length > 0) {
                    const firmasData = pdfData.firmas.map(f => [
                        `${f.nombre} ${f.apellidos}`,
                        f.cargo || '',
                        f.empresa || '',
                        '' 
                    ]);

                    doc.autoTable({
                        startY: doc.lastAutoTable.finalY + 10,
                        head: [
                            [{ content: '4. Listado de Asistencia', colSpan: 4, styles: { fillColor: colorPrincipal, textColor: 255, fontStyle: 'bold' } }],
                            ['Nombre', 'Cargo', 'Empresa', 'Firma']
                        ],
                        body: firmasData,
                        theme: 'grid',
                        headStyles: { fillColor: colorSecundario },
                        columnStyles: { 3: { cellWidth: 40, minCellHeight: 20 } },
                        
                        didDrawCell: function(data) {
                            if (data.section === 'body' && data.column.index === 3) {
                                const firmante = pdfData.firmas[data.row.index];
                                if (firmante && firmante.firma) {
                                    try {
                                        const imgProps = doc.getImageProperties(firmante.firma);
                                        const imgWidth = data.cell.width - 4;
                                        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
                                        const yPos = data.cell.y + (data.cell.height - imgHeight) / 2;
                                        doc.addImage(firmante.firma, 'PNG', data.cell.x + 2, yPos, imgWidth, imgHeight);
                                    } catch (e) {
                                        console.warn('Firma inválida');
                                    }
                                }
                            }
                        }
                    });
                }

                doc.save(`Acta_${pdfData.acta.codigo}.pdf`);

            } catch (error) {
                console.error("Error PDF:", error);
                Swal.fire({ title: 'Error', text: 'Error al generar el PDF: ' + error.message, icon: 'error', confirmButtonColor: '#2C3E50' });
            }
    }
};