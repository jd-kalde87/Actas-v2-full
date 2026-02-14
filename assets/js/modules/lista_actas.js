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
        img.onerror = () => resolve(null); // Si falla, resolvemos null para no romper el flujo
        img.src = url;
    });
}

window.inicializarVista = function() {
    
    const spinner = $('#spinner-actas');
    const tablaElement = $('#tabla-actas');
    const mainContent = $('#main-content');

    tablaElement.hide();
    spinner.show();

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
                .then(datos => { callback({ data: datos }); })
                .catch(error => {
                    console.error("Error al cargar las actas:", error);
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
                    const esFinalizado = String(row.firma).toLowerCase() === 'finalizado';
                    const disabledAttr = esFinalizado ? 'disabled' : '';
                    
                    return `
                        <button class="btn btn-xs btn-primary btn-editar-encabezado" title="Editar Encabezado" ${disabledAttr}><i class="fas fa-pencil-alt"></i></button>
                        <button class="btn btn-xs btn-success btn-gestionar-contenido" title="Gestionar Contenido" ${disabledAttr}><i class="fas fa-stream"></i></button>
                        <button class="btn btn-xs btn-warning btn-generar-qr" title="Compartir (QR)" ${disabledAttr}><i class="fas fa-qrcode"></i></button>
                        <button class="btn btn-xs btn-info btn-finalizar-acta" title="Finalizar Acta" ${disabledAttr}><i class="fas fa-check-circle"></i></button>
                        <button class="btn btn-xs btn-danger btn-generar-pdf" title="Generar PDF"><i class="fas fa-file-pdf"></i></button>
                    `;
                }
            }
        ],
        "order": [[ 3, "desc" ]],
        "initComplete": function() {
            spinner.hide();
            tablaElement.show();
        }
    });

    // Manejador de eventos
    mainContent.off('click', '#tabla-actas button').on('click', '#tabla-actas button', async function() {
        const tr = $(this).closest('tr');
        const row = tabla.row(tr);
        const data = row.data() || tabla.row(tr.prev()).data();
        
        if (!data) return;

        // --- EDITAR ENCABEZADO ---
        if ($(this).hasClass('btn-editar-encabezado')) {
            window.cargarVista('editar_acta', data.codigo);
        } 
        // --- GESTIONAR CONTENIDO ---
        else if ($(this).hasClass('btn-gestionar-contenido')) {
            window.cargarVista('gestionar_contenido', data.codigo);
        } 
        // --- GENERAR QR ---
        else if ($(this).hasClass('btn-generar-qr')) {
            window.cargarVista('generar_qr', data.codigo);
        } 
        // --- FINALIZAR ACTA ---
        else if ($(this).hasClass('btn-finalizar-acta')) {
            if (confirm(`¿Estás seguro de que deseas finalizar el acta ${data.codigo}?`)) {
                apiFetch(`actas/actualizar/${data.codigo}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ firma: 'Finalizado' }) 
                })
                .then(() => {
                    sessionStorage.setItem('notificacionPendiente', JSON.stringify({ mensaje: 'Acta finalizada exitosamente.', tipo: 'success' }));
                    window.cargarVista('lista_actas');
                })
                .catch(error => window.mostrarNotificacion(error.message, 'danger'));
            }
        } 
        // --- GENERAR PDF (TRADUCCIÓN APLICADA) ---
        else if ($(this).hasClass('btn-generar-pdf')) {
            const boton = $(this);
            const iconoOriginal = boton.html();
            boton.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i>');
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
                window.mostrarNotificacion("Error al generar el PDF: " + error.message, 'danger');
            } finally {
                boton.prop('disabled', false).html(iconoOriginal);
            }
        }
    });
};