// assets/js/modules/generar_pdf.js

window.inicializarVista = function(actaCodigo) {
    
    window.mostrarNotificacion('Generando PDF del acta, por favor espera...', 'info');

    // 1. Cargar la plantilla HTML
    const tempContainer = $('<div>').hide().appendTo('body');
    
    tempContainer.load(`app/plantilla_pdf.php`, { id: actaCodigo }, function() {
        
        const url = `${APP_CONFIG.backendUrl}actas/obtener-pdf-data/${actaCodigo}`;
        
        fetch(url, { headers: { 'Authorization': `Bearer ${APP_CONFIG.token}` }})
        .then(response => {
            if (!response.ok) throw new Error('No se pudieron obtener los datos para el PDF.');
            return response.json();
        })
        .then(data => {
            // 3. Poblar la plantilla con los datos recibidos
            const acta = data.acta;
            const contenido = data.contenido || [];
            const firmas = data.firmas || [];

            $('#pdf-codigo').text(acta.codigo);
            
            // --- MODIFICACIÓN 1: Añadir todos los campos a "Información General" ---
            $('#pdf-info-general').append(`
                <p><strong>Tema principal:</strong> ${acta.tema || 'N/A'}</p>
                <p><strong>Tipo de Reunión:</strong> ${acta.tipo_reunion_descripcion || acta.tipo_reunion || 'N/A'}</p>
                <p><strong>Lugar:</strong> ${acta.lugar || 'N/A'}</p>
                <p><strong>Fecha:</strong> ${acta.fecha ? new Date(acta.fecha).toLocaleDateString('es-CO') : 'N/A'}</p>
                <p><strong>Hora Inicio:</strong> ${acta.horaInicio || 'N/A'}</p>
                <p><strong>Hora Fin:</strong> ${acta.horaFin || 'N/A'}</p>
                <p><strong>Número de Asistentes:</strong> ${acta.numeroParticipantes !== undefined ? acta.numeroParticipantes : 'N/A'}</p>
            `);

            // Poblar Temario (sin cambios)
            if (acta.temario) {
                let temarioHtml = '<ol>';
                const temarioItems = Array.isArray(acta.temario) ? acta.temario : acta.temario.split(',');
                temarioItems.forEach(item => { temarioHtml += `<li>${item.trim()}</li>`; });
                temarioHtml += '</ol>';
                $('#pdf-contenido-temario').append(temarioHtml);
            }

            // Poblar Desarrollo y Compromisos (sin cambios)
            let desarrolloHtml = '<ol>';
            let compromisosHtml = '<table class="asistencia-table"><thead><tr><th>Detalle</th><th>Responsable</th><th>Fecha</th></tr></thead><tbody>';
            contenido.forEach(item => {
                desarrolloHtml += `<li><strong>${item.temario_code}:</strong> ${item.intervenciones || ''}</li>`;
                if(item.compromisos) {
                    const lineas = item.compromisos.trim().split(/\\n|\n/);
                    lineas.forEach(linea => {
                        const match = linea.match(/(.*)\[Responsable:\s(.*)\s\|\sFecha:\s(.*)\]/);
                        if (match) {
                            compromisosHtml += `<tr><td>${match[1].replace(/^\d+\.\s/, '').trim()}</td><td>${match[2].trim()}</td><td>${match[3].trim()}</td></tr>`;
                        }
                    });
                }
            });
            desarrolloHtml += '</ol>';
            compromisosHtml += '</tbody></table>';
            $('#pdf-desarrollo').append(desarrolloHtml);
            $('#pdf-compromisos').append(compromisosHtml);

            // --- MODIFICACIÓN 2: Corregir nombres de campos para Asistentes y Firmas ---
            let firmasHtml = '';
            firmas.forEach(firma => {
                // Corrección: Usamos 'nombre' y 'apellidos' en lugar de 'nombreCompleto'
                // Corrección: Usamos 'firma' en lugar de 'firmaData' para que coincida con el backend
                firmasHtml += `
                    <tr>
                        <td>${firma.nombre || ''} ${firma.apellidos || ''}</td>
                        <td>${firma.empresa || 'N/A'}</td>
                        <td>${firma.cargo || 'N/A'}</td>
                        <td><img src="${firma.firma}" class="firma-img"></td>
                    </tr>
                `;
            });
            $('#pdf-asistencia tbody').html(firmasHtml);

            // 4. Usar html2canvas (sin cambios)
            const pdfTemplate = document.getElementById('pdf-template');
            html2canvas(pdfTemplate, { scale: 2 }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jspdf.jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                const imgProps= pdf.getImageProperties(imgData);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                let heightLeft = pdfHeight;
                let position = 0;

                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pdf.internal.pageSize.getHeight();

                while (heightLeft >= 0) {
                  position = heightLeft - pdfHeight;
                  pdf.addPage();
                  pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                  heightLeft -= pdf.internal.pageSize.getHeight();
                }
                
                // 5. Descargar el PDF
                pdf.save(`Acta-${actaCodigo}.pdf`);
                
                // Limpiar y volver
                tempContainer.remove();
                window.mostrarNotificacion('PDF generado exitosamente.', 'success');
                window.cargarVista('lista_actas');
            });
        })
        .catch(error => {
            console.error("Error al generar el PDF:", error);
            window.mostrarNotificacion(`Error: ${error.message}`, 'danger');
            tempContainer.remove();
            window.cargarVista('lista_actas');
        });
    });
};