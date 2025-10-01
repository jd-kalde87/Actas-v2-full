// assets/js/modules/asistencia.js

document.addEventListener('DOMContentLoaded', function() {
    
    const mainContainer = document.getElementById('main-container');
    const BACKEND_URL = mainContainer.dataset.backendUrl;
    const ACTA_CODIGO = mainContainer.dataset.actaCodigo;

    const form = document.getElementById('form-asistencia');
    const btnValidar = document.getElementById('btn-validar');
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');
    const errorMessage = document.getElementById('error-message');

    // --- Elementos del modal ---
    const errorModal = document.getElementById('errorModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const okModalBtn = document.getElementById('okModalBtn');

    // --- Funciones para controlar el modal ---
    function mostrarModalError() {
        errorModal.style.display = 'flex';
    }
    function ocultarModalError() {
        errorModal.style.display = 'none';
    }

    // Eventos para cerrar el modal
    closeModalBtn.addEventListener('click', ocultarModalError);
    okModalBtn.addEventListener('click', ocultarModalError);

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const cedula = document.getElementById('cedula').value;
        if (!cedula) {
            mostrarError('Por favor, ingrese un número de documento.');
            return;
        }

        btnValidar.disabled = true;
        btnText.style.display = 'none';
        btnSpinner.style.display = 'inline-block';
        errorMessage.style.display = 'none';

        try {
            const verificacionUrl = `${BACKEND_URL}firmas-users/verificar`;
            const verificacionResponse = await fetch(verificacionUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ acta_codigo: ACTA_CODIGO, cedula: cedula })
            });

            if (!verificacionResponse.ok) {
                throw new Error('Error al verificar la firma.');
            }

            const verificacionData = await verificacionResponse.json();

            if (verificacionData.yaFirmo) {
                mostrarModalError();
                btnValidar.disabled = false;
                btnText.style.display = 'inline-block';
                btnSpinner.style.display = 'none';
                return; 
            }
            
            const tokenUrl = `${BACKEND_URL}usuario/obtener_por_cedulas`;
            const tokenResponse = await fetch(tokenUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cedula: cedula, acta_codigo: ACTA_CODIGO })
            });

            if (tokenResponse.ok) {
                const data = await tokenResponse.json();
                if (data && data[0]) {
                    const token = data[0];
                    sessionStorage.setItem('asistenciaToken', token);
                    window.location.href = `firmar_acta.php?codigo=${ACTA_CODIGO}`;
                } else {
                    throw new Error('Respuesta inesperada del servidor. No se recibió el token.');
                }
            } else {
                // --- INICIO DE LA CORRECCIÓN ---
                // Se corrigió el nombre del archivo eliminando el espacio.
                window.location.href = `crear_asistente_publico.php?codigo=${ACTA_CODIGO}`;
                // --- FIN DE LA CORRECCIÓN ---
                throw new Error('Usuario no encontrado, redirigiendo a registro.');
            }

        } catch (error) {
            if (error.message !== 'Usuario no encontrado, redirigiendo a registro.') {
                mostrarError(error.message);
                btnValidar.disabled = false;
                btnText.style.display = 'inline-block';
                btnSpinner.style.display = 'none';
            }
        }
    });

    function mostrarError(mensaje) {
        errorMessage.textContent = mensaje;
        errorMessage.style.display = 'block';
    }
});