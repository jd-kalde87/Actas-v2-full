// assets/js/modules/firmar_acta.js

document.addEventListener('DOMContentLoaded', function() {
    console.log("Inicializando página de firma...");
    const mainContainer = document.getElementById('main-container');
    
    if (!mainContainer) {
        console.error("Error crítico: No se encontró el main-container.");
        return;
    }
    
    const BACKEND_URL = mainContainer.dataset.backendUrl;
    const ACTA_CODIGO = mainContainer.dataset.actaCodigo;
    const token = sessionStorage.getItem('asistenciaToken');

    if (!token) {
        alert('Acceso denegado. Por favor, valide su documento primero.');
        window.location.href = `asistencia.php?codigo=${ACTA_CODIGO}`;
        return;
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        document.getElementById('user-name').textContent = payload.nombre || 'Usuario';
        document.getElementById('user-cedula').textContent = payload.cedula || 'N/A';
        
        cargarDatosActa(token, BACKEND_URL, ACTA_CODIGO);
    } catch (e) {
        console.error("Error al decodificar token:", e);
        alert("Sesión inválida.");
        window.location.href = `asistencia.php?codigo=${ACTA_CODIGO}`;
    }

    // Inicializar SignaturePad
    const canvas = document.getElementById('signature-pad');
    if(canvas) {
        const signaturePad = new SignaturePad(canvas);
        
        document.getElementById('clear-signature').addEventListener('click', () => signaturePad.clear());

        document.getElementById('save-signature').addEventListener('click', () => {
            if (signaturePad.isEmpty()) {
                return alert("Por favor, provea su firma antes de guardar.");
            }
            
            const btnGuardar = document.getElementById('save-signature');
            btnGuardar.disabled = true;
            btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

            const signatureData = signaturePad.toDataURL('image/png');
            enviarFirma(token, signatureData, BACKEND_URL, ACTA_CODIGO);
        });
    }
});

async function cargarDatosActa(token, backendUrl, actaCodigo) {
    const loadingSpinner = document.getElementById('loading-spinner');
    const actaContent = document.getElementById('acta-content');
    const firmaContainer = document.getElementById('firma-container');

    try {
        // 1. Obtener encabezado
        const respActa = await fetch(`${backendUrl}actas/obtener/${actaCodigo}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!respActa.ok) throw new Error('No se pudo cargar la información del acta.');
        const acta = await respActa.json();

        // 2. Obtener contenido
        let contenido = [];
        try {
            const respCont = await fetch(`${backendUrl}contenido-actas/obtener/${actaCodigo}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (respCont.ok) contenido = await respCont.json();
        } catch (e) {
            console.warn("Sin contenido detallado:", e);
        }

        // 3. Renderizar
        renderizarActa(acta, contenido);
        
        if(loadingSpinner) loadingSpinner.style.display = 'none';
        if(actaContent) actaContent.style.display = 'block';
        if(firmaContainer) firmaContainer.style.display = 'block';

    } catch (error) {
        console.error("Error carga:", error);
        if(loadingSpinner) loadingSpinner.innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
    }
}

function renderizarActa(acta, contenido) {
    const container = document.getElementById('acta-content');
    if(!container) return;

    // --- LOGICA DE TEMARIO CORREGIDA (Soporte para '||') ---
    let temarioHtml = '';
    let temarioItems = [];

    if (acta.temario) {
        if (Array.isArray(acta.temario)) {
            temarioItems = acta.temario;
        } else if (typeof acta.temario === 'string') {
            // Detectamos si usa el nuevo separador o la coma antigua
            if (acta.temario.includes('||')) {
                temarioItems = acta.temario.split('||');
            } else {
                temarioItems = acta.temario.split(',');
            }
        }
    }

    if (temarioItems.length > 0) {
        temarioHtml = `<div class="mb-3"><h6><strong>Temario:</strong></h6><ol>`;
        temarioItems.forEach(item => {
            const texto = String(item).trim();
            if(texto) temarioHtml += `<li>${texto}</li>`;
        });
        temarioHtml += `</ol></div><hr>`;
    }
    // -------------------------------------------------------

    // Construcción del HTML
    let html = `
        <div class="text-center mb-4">
            <h4 class="font-weight-bold">${acta.tema || 'Sin Tema'}</h4>
            <p class="text-muted mb-0">Código: ${acta.codigo}</p>
        </div>
        <div class="row mb-3" style="font-size: 0.95em;">
            <div class="col-6">
                <p class="mb-1"><strong>Fecha:</strong> ${acta.fecha || 'N/A'}</p>
                <p class="mb-1"><strong>Lugar:</strong> ${acta.lugar || 'N/A'}</p>
            </div>
            <div class="col-6 text-right">
                <p class="mb-1"><strong>Inicio:</strong> ${acta.horaInicio || 'N/A'}</p>
                <p class="mb-1"><strong>Fin:</strong> ${acta.horaFin || 'N/A'}</p>
            </div>
        </div>
        <hr>
        ${temarioHtml}
    `;

    // Renderizado del contenido detallado
    if (contenido && contenido.length > 0) {
        html += '<h5 class="mt-4 mb-3">Desarrollo de la Reunión</h5>';
        contenido.forEach(item => {
            // Parseo de compromisos
            let compromisosHtml = '<p class="text-muted small ml-3"><i>No hay compromisos registrados.</i></p>';
            if (item.compromisos && item.compromisos.trim()) {
                compromisosHtml = '<ul class="list-group list-group-flush mb-2">';
                const lineas = item.compromisos.split(/\r?\n/);
                lineas.forEach(l => {
                    // Intento de extraer info estructurada
                    const match = l.match(/(.*?)\[Responsable:\s*(.*?)\s*\|\s*Fecha:\s*(.*?)\]/);
                    if(match) {
                        const desc = match[1].replace(/^\d+\.\s/, '').trim();
                        compromisosHtml += `
                            <li class="list-group-item p-2 small">
                                <strong>${desc}</strong><br>
                                <span class="text-info"><i class="fas fa-user"></i> ${match[2]}</span> &nbsp;|&nbsp; 
                                <span class="text-warning"><i class="fas fa-calendar"></i> ${match[3]}</span>
                            </li>`;
                    } else {
                        compromisosHtml += `<li class="list-group-item p-2 small">${l}</li>`;
                    }
                });
                compromisosHtml += '</ul>';
            }

            html += `
                <div class="card mb-3 shadow-sm">
                    <div class="card-header bg-light py-2">
                        <strong>${item.temario_code || 'Punto sin título'}</strong>
                    </div>
                    <div class="card-body py-2">
                        <p class="card-text mb-2 text-justify">${item.intervenciones || 'Sin intervenciones.'}</p>
                        <h6 class="text-primary mt-3" style="font-size: 0.9em;">Compromisos:</h6>
                        ${compromisosHtml}
                    </div>
                </div>`;
        });
    } else {
        html += '<div class="alert alert-info">Aún no se ha registrado el desarrollo detallado de esta acta.</div>';
    }

    container.innerHTML = html;
}

function enviarFirma(token, signatureData, backendUrl, actaCodigo) {
    const btnGuardar = document.getElementById('save-signature');
    
    // Convertir la imagen base64 a un blob si fuera necesario, 
    // pero el backend actual parece aceptar el string base64 directo en el JSON.
    const payload = {
        firma: signatureData,
        acta_codigo: actaCodigo
    };

    fetch(`${backendUrl}firmas-users/crear`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    })
    .then(async response => {
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Error al guardar la firma.');
        }
        return data;
    })
    .then(data => {
        sessionStorage.removeItem('asistenciaToken'); // Limpiar token usado
        window.location.href = 'gracias.php'; // Redirigir a página de agradecimiento
    })
    .catch(error => {
        console.error("Error firma:", error);
        alert(error.message);
        btnGuardar.disabled = false;
        btnGuardar.textContent = 'Guardar Firma';
    });
}