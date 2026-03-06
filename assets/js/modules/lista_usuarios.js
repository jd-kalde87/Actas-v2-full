// assets/js/modules/lista_usuarios.js

window.inicializarVista = function() {
    
    // ****** INICIO DE LAS MODIFICACIONES ******
    const spinner = $('#spinner-usuarios');
    const tablaElement = $('#tabla-usuarios');
    const mainContent = $('#main-content');

    // Ocultamos la tabla al inicio para que solo se vea el spinner
    tablaElement.addClass('hidden');
    spinner.removeClass('hidden');

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
            { "data": null, "render": function(data) {
                if (data.admin) return '<span class="badge badge-success">Administrador</span>';
                if (data.colaborador) return '<span class="badge badge-info">Colaborador</span>';
                return '<span class="badge badge-secondary">Asistente</span>';
            }},
            { "data": "estado", "render": function(data) { const estado = String(data).toLowerCase(); return estado === 'activo' ? `<span class="badge badge-primary">${data}</span>` : `<span class="badge badge-danger">${data}</span>`; }},
            {
                "data": null,
                "defaultContent": `
                    <button class="btn btn-act btn-outline-primary btn-editar-usuario" title="Editar usuario"><i class="fas fa-pen"></i></button>
                    <button class="btn btn-act btn-outline-info btn-cambiar-contrasena" title="Cambiar / restablecer contraseña"><i class="fas fa-key"></i></button>
                    <button class="btn btn-act btn-outline-danger btn-eliminar-usuario" title="Eliminar usuario"><i class="fas fa-trash"></i></button>
                `,
                "orderable": false
            }
        ],
        // Esta función se ejecuta cuando DataTables ha terminado de cargar y dibujar la tabla
        "initComplete": function(settings, json) {
            // Ocultamos el spinner y mostramos la tabla
            spinner.addClass('hidden');
            tablaElement.removeClass('hidden');
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

    mainContent.off('click', '.btn-cambiar-contrasena').on('click', '.btn-cambiar-contrasena', function() {
        const data = tabla.row($(this).parents('tr')).data();
        const nombreCompleto = `${data.nombre || ''} ${data.apellidos || ''}`.trim() || data.cedula;
        Swal.fire({
            title: 'Cambiar contraseña',
            html: `<p class="mb-2">Usuario: <strong>${nombreCompleto}</strong> (${data.cedula})</p>
                   <input type="password" id="nueva-contrasena" class="swal2-input" placeholder="Nueva contraseña" minlength="4" autocomplete="new-password">
                   <input type="password" id="confirmar-contrasena" class="swal2-input mt-2" placeholder="Confirmar contraseña" autocomplete="new-password">`,
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#2C3E50',
            preConfirm: () => {
                const nueva = document.getElementById('nueva-contrasena').value;
                const conf = document.getElementById('confirmar-contrasena').value;
                if (!nueva || nueva.length < 4) {
                    Swal.showValidationMessage('La contraseña debe tener al menos 4 caracteres.');
                    return false;
                }
                if (nueva !== conf) {
                    Swal.showValidationMessage('Las contraseñas no coinciden.');
                    return false;
                }
                return { nuevaContrasena: nueva };
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                apiFetch(`usuario/cambiar-contrasena/${data.cedula}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ nuevaContrasena: result.value.nuevaContrasena }),
                    headers: { 'Content-Type': 'application/json' }
                })
                    .then(() => {
                        Swal.fire({ title: 'Listo', text: 'Contraseña actualizada correctamente.', icon: 'success', confirmButtonColor: '#2C3E50' });
                    })
                    .catch(err => {
                        Swal.fire({ title: 'Error', text: err.message || 'No se pudo cambiar la contraseña.', icon: 'error', confirmButtonColor: '#2C3E50' });
                    });
            }
        });
    });

    mainContent.off('click', '.btn-eliminar-usuario').on('click', '.btn-eliminar-usuario', function() {
        const data = tabla.row($(this).parents('tr')).data();
        Swal.fire({
            title: '¿Eliminar usuario?',
            text: `¿Estás seguro de que deseas eliminar a ${data.nombre}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#dc3545'
        }).then((result) => {
            if (result.isConfirmed) {
                apiFetch(`usuario/eliminar/${data.cedula}`, { method: 'DELETE' })
                    .then(() => {
                        Swal.fire({ title: 'Eliminado', text: 'Usuario eliminado exitosamente.', icon: 'success', confirmButtonColor: '#2C3E50' });
                        tabla.ajax.reload();
                    })
                    .catch(error => {
                        Swal.fire({ title: 'Error', text: 'No se pudo eliminar: ' + error.message, icon: 'error', confirmButtonColor: '#2C3E50' });
                    });
            }
        });
    });
};