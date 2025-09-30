// assets/js/modules/lista_actas.js

/**
 * Función de ayuda que toma la URL de una imagen y la convierte
 * a formato Base64. Esto es necesario para incrustar imágenes
 * como el logo directamente en el documento PDF.
 * @param {string} url - La ruta a la imagen (ej: 'assets/img/logo.png').
 * @returns {Promise<string>} Una promesa que se resuelve con la imagen en formato Base64.
 */
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
            const dataURL = canvas.toDataURL('image/png');
            resolve(dataURL);
        };
        img.onerror = reject;
        img.src = url;
    });
}

/**
 * Función principal que se ejecuta cuando se carga la vista 'lista_actas'.
 * Se encarga de inicializar la DataTable y todos los eventos de los botones.
 */
window.inicializarVista = function() {
    
    // Referencias a elementos del DOM para manejarlos fácilmente
    const spinner = $('#spinner-actas');
    const tablaElement = $('#tabla-actas');
    const mainContent = $('#main-content'); // Contenedor principal para delegar eventos

    // Muestra el spinner y oculta la tabla mientras se cargan los datos
    tablaElement.hide();
    spinner.show();

    // Inicialización de la librería DataTables
    const tabla = tablaElement.DataTable({
        "destroy": true, // Permite reinicializar la tabla si ya existía
        "responsive": true,
        "lengthChange": false,
        "autoWidth": false,
        "language": { /* ... tu objeto de traducción ... */ },
        /**
         * Carga los datos de la tabla de forma asíncrona usando nuestra función apiFetch.
         * Esto asegura que la petición esté autenticada y maneje errores de sesión.
         */
        "ajax": function(data, callback, settings) {
            apiFetch('actas/obtener')
                .then(datos => {
                    callback({ data: datos }); // Entrega los datos a DataTables
                })
                .catch(error => {
                    console.error("Error al cargar las actas:", error);
                    $('#tabla-container').html('<p class="text-danger">No se pudieron cargar las actas.</p>');
                    callback({ data: [] }); // Informa a DataTables que no hay datos
                });
        },
        /**
         * Define la estructura y el renderizado de cada columna de la tabla.
         */
        "columns": [
            { "data": "codigo", "title": "Código" },
            { "data": "tema", "title": "Tema" },
            { "data": "lugar", "title": "Lugar" },
            { "data": "fecha", "title": "Fecha" },
            { 
                "data": "firma",
                "title": "Estado",
                "render": function(data) { // Renderiza el estado como una insignia de color
                    const estado = String(data).toLowerCase();
                    let badgeClass = 'badge-secondary';
                    if (estado === 'finalizado') badgeClass = 'badge-success';
                    else if (estado === 'borrador') badgeClass = 'badge-primary';
                    return `<span class="badge ${badgeClass}">${data}</span>`;
                }
            },
            {
                "data": null,
                "title": "Acciones",
                "orderable": false,
                /**
                 * Renderiza dinámicamente los botones de acción para cada fila.
                 * Desactiva los botones si el acta ya está finalizada.
                 */
                "render": function(data, type, row) {
                    const esFinalizado = row.firma.toLowerCase() === 'finalizado';
                    const btnEditar = `<button class="btn btn-xs btn-primary btn-editar-encabezado" title="Editar Encabezado" ${esFinalizado ? 'disabled' : ''}><i class="fas fa-pencil-alt"></i></button>`;
                    const btnContenido = `<button class="btn btn-xs btn-success btn-gestionar-contenido" title="Gestionar Contenido" ${esFinalizado ? 'disabled' : ''}><i class="fas fa-stream"></i></button>`;
                    const btnQr = `<button class="btn btn-xs btn-warning btn-generar-qr" title="Compartir (QR)" ${esFinalizado ? 'disabled' : ''}><i class="fas fa-qrcode"></i></button>`;
                    const btnFinalizar = `<button class="btn btn-xs btn-info btn-finalizar-acta" title="Finalizar Acta" ${esFinalizado ? 'disabled' : ''}><i class="fas fa-check-circle"></i></button>`;
                    const btnPdf = `<button class="btn btn-xs btn-danger btn-generar-pdf" title="Generar PDF"><i class="fas fa-file-pdf"></i></button>`;
                    return `${btnEditar} ${btnContenido} ${btnQr} ${btnFinalizar} ${btnPdf}`;
                }
            }
        ],
        "order": [[ 3, "desc" ]], // Ordena por fecha descendente por defecto
        "initComplete": function() {
            spinner.hide();
            tablaElement.show();
        }
    });

    /**
     * Manejador de eventos principal para TODOS los botones de la tabla.
     * Se usa "delegación de eventos" anclando el listener a 'mainContent'
     * para garantizar que funcione incluso si la tabla se destruye y se recrea.
     */
    mainContent.off('click', '#tabla-actas button').on('click', '#tabla-actas button', async function() {
        // Se obtiene la información de la fila correspondiente al botón presionado
        const data = tabla.row($(this).parents('tr')).data();
        if (!data) return; // Si no hay datos, no hacer nada

        // Lógica para el botón "Editar Encabezado"
        if ($(this).hasClass('btn-editar-encabezado')) {
            window.cargarVista('editar_acta', data.codigo);
        } 
        // Lógica para el botón "Gestionar Contenido"
        else if ($(this).hasClass('btn-gestionar-contenido')) {
            window.cargarVista('gestionar_contenido', data.codigo);
        } 
        // Lógica para el botón "Generar QR"
        else if ($(this).hasClass('btn-generar-qr')) {
            window.cargarVista('generar_qr', data.codigo);
        } 
        
        // Lógica para el botón "Finalizar Acta"
        else if ($(this).hasClass('btn-finalizar-acta')) {
            if (confirm(`¿Estás seguro de que deseas finalizar el acta ${data.codigo}?`)) {
                // Se usa apiFetch para la petición, que maneja errores de sesión
                apiFetch(`actas/actualizar/${data.codigo}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ firma: 'Finalizado' }) 
                })
                .then(() => {
                    // Se guarda la notificación en sessionStorage para mostrarla después de recargar la vista
                    const notificacion = { mensaje: 'Acta finalizada exitosamente.', tipo: 'success' };
                    sessionStorage.setItem('notificacionPendiente', JSON.stringify(notificacion));
                    window.cargarVista('lista_actas'); // Se recarga la vista
                })
                .catch(error => {
                    // Muestra errores de negocio (ej: faltan firmas) o de servidor
                    window.mostrarNotificacion(error.message, 'danger');
                });
            }
        } 
        
        // Lógica para el botón "Generar PDF"
        else if ($(this).hasClass('btn-generar-pdf')) {
            const boton = $(this);
            boton.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i>');
            window.mostrarNotificacion('Generando PDF, por favor espera...', 'info');

            try {
                const colorPrincipal = '#2c3e50';
                const colorSecundario = '#ff7300';

                // Se usa Promise.all con apiFetch para obtener logo y datos del PDF
                const [logoBase64, pdfData] = await Promise.all([
                    getBase64Image('assets/img/logo2.png'),
                    apiFetch(`actas/obtener-pdf-data/${data.codigo}`)
                ]);
                
                if (!pdfData || !pdfData.acta) throw new Error('El acta no tiene datos válidos.');

                const { jsPDF } = window.jspdf;
                const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
                const pageHeight = doc.internal.pageSize.height;
                const pageWidth = doc.internal.pageSize.width;

                // --- 2. Encabezado ---
                doc.autoTable({
                    startY: 10,
                    body: [[
                        { content: '', styles: { cellWidth: 50 } },
                        { content: 'ACTA DE REUNIÓN', styles: { cellWidth: 'auto', halign: 'center', fontStyle: 'bold', fontSize: 16, valign: 'middle' } },
                        { content: `Código: ${pdfData.acta.codigo}\nVersión: 1.0\nAprobado: Gerencia`, styles: { cellWidth: 50, halign: 'right', fontSize: 9, valign: 'middle' } }
                    ]],
                    theme: 'plain',
                    didDrawCell: function(data) {
                        if (data.section === 'body' && data.column.index === 0) {
                            doc.addImage(logoBase64, 'PNG', data.cell.x, data.cell.y, 45, 18);
                        }
                    }
                });

                // --- 3. Información General ---
                const infoBody = [
                    [`Tema principal:${pdfData.acta.tema || ''}`, `Tipo de reunión: ${pdfData.acta.tipo_reunion || 'N/A'}`],
                    [`Fecha: ${new Date(pdfData.acta.fecha).toLocaleDateString('es-CO')}`, `Lugar: ${pdfData.acta.lugar || ''}`],
                    [`Hora inicio: ${pdfData.acta.horaInicio || ''}`, `Hora Fin: ${pdfData.acta.horaFin || 'N/A'}`],
                    [{ content: `Número de Asistentes: ${pdfData.acta.cantidad_asistentes}`, colSpan: 2 }]
                ];
                doc.autoTable({
                    startY: doc.lastAutoTable.finalY + 5,
                    head: [[{ content: '1. Información General', colSpan: 2, styles: { fontStyle: 'bold', fillColor: colorPrincipal, textColor: 255 } }]],
                    body: infoBody,
                    theme: 'grid'
                });

                // --- 4. Desarrollo del Temario ---
                const desarrolloBody = pdfData.contenido.map((item, index) => [ index + 1, item.temario_code, item.intervenciones || 'Sin intervención registrada.']);
                doc.autoTable({
                    startY: doc.lastAutoTable.finalY + 10,
                    head: [
                        [{ content: '2. Desarrollo', colSpan: 3, styles: { fontStyle: 'bold', fillColor: colorPrincipal, textColor: 255 } }],
                        [
                            { content: 'N°', styles: { fillColor: colorSecundario, textColor: 255 } },
                            { content: 'Temario', styles: { fillColor: colorSecundario, textColor: 255 } },
                            { content: 'Intervenciones', styles: { fillColor: colorSecundario, textColor: 255 } }
                        ]
                    ],
                    body: desarrolloBody,
                    theme: 'grid'
                });

                // --- 5. Compromisos ---
                const compromisosBody = pdfData.contenido
                    .filter(item => item.compromisos && item.compromisos.trim() !== '')
                    .map(item => {
                        const match = item.compromisos.match(/\[Responsable:\s*(.*?)\s*\|\s*Fecha:\s*(.*?)\]/);
                        const detalle = item.compromisos.replace(/\[Responsable:.*\]/g, '').replace(/\d+\.\s/g, '').trim();
                        const responsable = match ? match[1] : 'No definido';
                        const fecha = match ? match[2] : 'No definida';
                        return [item.temario_code, detalle, responsable, fecha];
                    });

                if (compromisosBody.length > 0) {
                    doc.autoTable({
                        startY: doc.lastAutoTable.finalY + 10,
                        head: [
                            [{ content: '3. Compromisos', colSpan: 4, styles: { fontStyle: 'bold', fillColor: colorPrincipal, textColor: 255 } }],
                            [
                                { content: 'Temario', styles: { fillColor: colorSecundario, textColor: 255 } },
                                { content: 'Detalle', styles: { fillColor: colorSecundario, textColor: 255 } },
                                { content: 'Responsable', styles: { fillColor: colorSecundario, textColor: 255 } },
                                { content: 'Fecha', styles: { fillColor: colorSecundario, textColor: 255 } }
                            ]
                        ],
                        body: compromisosBody,
                        theme: 'grid',
                        columnStyles: {
                            0: { cellWidth: 50 },
                            1: { cellWidth: 'auto' },
                            2: { cellWidth: 35 },
                            3: { cellWidth: 25 }
                        }
                    });
                }
                
                // --- 6. Listado de Asistencia (Firmas) ---
                if (pdfData.firmas && pdfData.firmas.length > 0) {
                    const firmasBody = pdfData.firmas.map(f => [`${f.nombre} ${f.apellidos}`, f.cargo, f.empresa, '']);
                    doc.autoTable({
                        startY: doc.lastAutoTable.finalY + 10,
                        head: [
                            [{ content: '4. Listado de Asistencia', colSpan: 4, styles: { fontStyle: 'bold', fillColor: colorPrincipal, textColor: 255 } }], 
                            [
                                { content:'Nombre Completo', styles: { fillColor: colorSecundario, textColor: 255 } }, 
                                { content: 'Cargo', styles: { fillColor: colorSecundario, textColor: 255 } }, 
                                { content: 'Empresa', styles: { fillColor: colorSecundario, textColor: 255 } }, 
                                { content: 'Firma', styles: { fillColor: colorSecundario, textColor: 255 } }
                            ]
                        ],
                        body: firmasBody,
                        theme: 'grid',
                        columnStyles: {
                            0: { cellWidth: 'auto' }, 
                            1: { cellWidth: 35 }, 
                            2: { cellWidth: 40 }, 
                            3: { cellWidth: 50, minCellHeight: 20 } 
                        },
                        didDrawCell: function(data) {
                            if (data.column.index === 3 && data.cell.section === 'body') {
                                const firmaBase64 = pdfData.firmas[data.row.index].firma;
                                if (firmaBase64) {
                                    const cellWidth = data.cell.width;
                                    const cellHeight = data.cell.height;
                                    const padding = 4;
                                    const availableWidth = cellWidth - padding;
                                    const availableHeight = cellHeight - padding;
                                    const imgProps = doc.getImageProperties(firmaBase64);
                                    const aspectRatio = imgProps.width / imgProps.height;
                                    let newWidth = availableWidth;
                                    let newHeight = newWidth / aspectRatio;
                                    if (newHeight > availableHeight) {
                                        newHeight = availableHeight;
                                        newWidth = newHeight * aspectRatio;
                                    }
                                    const x = data.cell.x + (cellWidth - newWidth) / 2;
                                    const y = data.cell.y + (cellHeight - newHeight) / 2;
                                    doc.addImage(firmaBase64, 'PNG', x, y, newWidth, newHeight);
                                }
                            }
                        }
                    });
                }
                
                // --- 7. Paginación ---
                const pageCount = doc.internal.getNumberOfPages();
                for(let i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.setFontSize(8);
                    doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
                }

                // --- 8. Guardar PDF ---
                doc.save(`Acta-${data.codigo}.pdf`);

            } catch (error) {
                console.error('Error al generar PDF:', error);
                window.mostrarNotificacion(error.message, 'danger');
            } finally {
                boton.prop('disabled', false).html('<i class="fas fa-file-pdf"></i>');
            }
        }
    });
};