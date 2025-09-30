// assets/js/app.js

$(document).ready(function() {

    const mainContent = $('#main-content');
    const contentWrapper = $('.content-wrapper');

    /**
     * Muestra una notificación de alerta en la parte superior de la página.
     * @param {string} mensaje - El texto que se mostrará en la alerta.
     * @param {string} [tipo='success'] - El tipo de alerta (success, danger, warning, info).
     */
    window.mostrarNotificacion = function(mensaje, tipo = 'success') {
        const alertaHtml = `<div class="alert alert-${tipo} alert-dismissible fade show" role="alert">${mensaje}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;
        // Usamos .content-wrapper como referencia más estable para el mensaje
        contentWrapper.find('.content-header').first().prepend(alertaHtml);
        setTimeout(() => { contentWrapper.find('.alert').first().fadeOut(500, function() { $(this).remove(); }); }, 5000);
    }

    /**
     * Carga una nueva vista (un archivo .php) en el contenedor principal
     * y luego carga su módulo de JavaScript correspondiente.
     * @param {string} vista - El nombre del archivo de la vista sin la extensión .php.
     * @param {string|null} [id=null] - Un ID opcional para pasar a la vista.
     */
    window.cargarVista = function(vista, id = null) {
        let url = 'app/' + vista + '.php';
        let dataToSend = { id: id };

        mainContent.load(url, dataToSend, function(response, status, xhr) {
            if (status == "error") {
                mainContent.html(`<div class="p-3"><div class="alert alert-danger"><strong>Error:</strong> No se pudo cargar la vista <code>${url}</code>.</div></div>`);
            } else {
                
                // --- INICIO DE LA CORRECCIÓN ---
                // Después de cargar el nuevo HTML, revisamos si hay una notificación guardada.
                const notificacionPendiente = sessionStorage.getItem('notificacionPendiente');
                if (notificacionPendiente) {
                    const { mensaje, tipo } = JSON.parse(notificacionPendiente);
                    window.mostrarNotificacion(mensaje, tipo);
                    // La borramos inmediatamente para que no se muestre de nuevo al recargar.
                    sessionStorage.removeItem('notificacionPendiente');
                }
                // --- FIN DE LA CORRECCIÓN ---

                // Carga el script asociado a la vista
                $.getScript(`assets/js/modules/${vista}.js`)
                    .done(function() {
                        console.log(`Módulo ${vista}.js cargado.`);
                        // Si el script tiene una función de inicialización, la ejecuta.
                        if (typeof window.inicializarVista === 'function') {
                            window.inicializarVista(id);
                        }
                    })
                    .fail(function(jqxhr, settings, exception) {
                        if (jqxhr.status === 404) {
                            console.log(`No se encontró un módulo JS para la vista ${vista}.`);
                        } else {
                            console.error(`Error al cargar el módulo ${vista}.js:`, exception);
                        }
                    });
            }
        });
    }

    // --- Lógica de Navegación (sin cambios) ---

    // Clics en la barra lateral para navegar
    $('.sidebar .nav-link[data-vista]').on('click', function(e) {
        e.preventDefault();
        const vistaSolicitada = $(this).data('vista');
        $('.sidebar .nav-link').removeClass('active');
        $(this).addClass('active');
        window.cargarVista(vistaSolicitada);
    });
    
    // Clics en elementos con 'data-vista' que se cargan dinámicamente
    contentWrapper.on('click', '[data-vista]', function(e) {
        e.preventDefault();
        const vistaSolicitada = $(this).data('vista');
        const linkSidebar = $(`.sidebar .nav-link[data-vista="${vistaSolicitada}"]`);
        
        if (linkSidebar.length > 0) {
             $('.sidebar .nav-link').removeClass('active');
             linkSidebar.addClass('active');
        }
        
        window.cargarVista(vistaSolicitada);
    });

    // Carga la vista inicial del dashboard al entrar
    window.cargarVista('dashboard');

});