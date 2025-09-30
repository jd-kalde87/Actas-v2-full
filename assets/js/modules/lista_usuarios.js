// assets/js/modules/lista_usuarios.js

window.inicializarVista = function() {
    
    // ****** INICIO DE LAS MODIFICACIONES ******
    const spinner = $('#spinner-usuarios');
    const tablaElement = $('#tabla-usuarios');
    const mainContent = $('#main-content');

    // Ocultamos la tabla al inicio para que solo se vea el spinner
    tablaElement.hide();
    spinner.show();

    const tabla = tablaElement.DataTable({
        "destroy": true,
        "responsive": true,
        "lengthChange": false,
        "autoWidth": false,
        "language": { /* ... objeto de traducción ... */ },
        "ajax": function(data, callback, settings) {
            apiFetch('usuario/obtener')
                .then(datos => {
                    callback({ data: datos });
                })
                .catch(error => {
                    console.error("Error al cargar los usuarios:", error);
                    $('#tabla-container').html('<p class="text-danger">No se pudieron cargar los datos de los usuarios.</p>');
                    callback({ data: [] }); 
                });
        },
        "columns": [
            { "data": "cedula" },
            { "data": null, "render": function(data, type, row) { return `${row.nombre || ''} ${row.apellidos || ''}`; }},
            { "data": "email" },
            { "data": "empresa" },
            { "data": "cargo" },
            { "data": "admin", "render": function(data) { return data ? '<span class="badge badge-success">Admin</span>' : '<span class="badge badge-secondary">Asistente</span>'; }},
            { "data": "estado", "render": function(data) { const estado = String(data).toLowerCase(); return estado === 'activo' ? `<span class="badge badge-primary">${data}</span>` : `<span class="badge badge-danger">${data}</span>`; }},
            {
                "data": null,
                "defaultContent": `
                    <button class="btn btn-xs btn-primary btn-editar-usuario" title="Editar Usuario"><i class="fas fa-pencil-alt"></i></button>
                    <button class="btn btn-xs btn-danger btn-eliminar-usuario" title="Eliminar Usuario"><i class="fas fa-trash"></i></button>
                `,
                "orderable": false
            }
        ],
        // Esta función se ejecuta cuando DataTables ha terminado de cargar y dibujar la tabla
        "initComplete": function(settings, json) {
            // Ocultamos el spinner y mostramos la tabla
            spinner.hide();
            tablaElement.show();
        },
    });
    // ****** FIN DE LAS MODIFICACIONES ******

        // --- INICIO DE LA CORRECCIÓN ---
    // Movemos los listeners para que "escuchen" desde '#main-content'.
    // Esto garantiza que funcionen aunque la tabla se regenere.
    mainContent.off('click', '.btn-editar-usuario').on('click', '.btn-editar-usuario', function() {
        const data = tabla.row($(this).parents('tr')).data();
        window.cargarVista('editar_usuario', data.cedula);
    });

    mainContent.off('click', '.btn-eliminar-usuario').on('click', '.btn-eliminar-usuario', function() {
        const data = tabla.row($(this).parents('tr')).data();
        if (confirm(`¿Estás seguro de que deseas eliminar al usuario ${data.nombre}?`)) {
            // Usamos nuestra nueva función apiFetch para la consistencia
            apiFetch(`usuario/eliminar/${data.cedula}`, { method: 'DELETE' })
                .then(() => {
                    window.mostrarNotificacion('Usuario eliminado exitosamente.', 'success');
                    tabla.ajax.reload();
                })
                .catch(error => {
                    window.mostrarNotificacion(`No se pudo eliminar el usuario. ${error.message}`, 'danger');
                });
        }
    });
};