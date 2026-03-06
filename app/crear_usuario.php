<div class="content-header">
    <div class="container-fluid">
        <div class="row mb-2">
            <div class="col-sm-6">
                <h1 class="m-0">Crear Nuevo Usuario</h1>
            </div>
        </div>
    </div>
</div>
<div class="content">
    <div class="container-fluid">
        <div class="card card-primary card-outline">
            <div class="card-header">
                <h5 class="m-0">Datos del Nuevo Usuario</h5>
            </div>
            <div class="card-body">
                <form id="form-crear-usuario">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="cedula-crear">Cédula</label>
                                <input type="number" class="form-control" id="cedula-crear" required>
                            </div>
                            <div class="form-group">
                                <label for="nombre-crear">Nombres</label>
                                <input type="text" class="form-control" id="nombre-crear" required>
                            </div>
                             <div class="form-group">
                                <label for="apellidos-crear">Apellidos</label>
                                <input type="text" class="form-control" id="apellidos-crear" required>
                            </div>
                             <div class="form-group">
                                <label for="email-crear">Correo Electrónico</label>
                                <input type="email" class="form-control" id="email-crear" required>
                            </div>
                            <div class="form-group">
                                <label for="telefono-crear">Teléfono</label>
                                <input type="text" class="form-control" id="telefono-crear" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="empresa-crear">Empresa</label>
                                <input type="text" class="form-control" id="empresa-crear" required>
                            </div>
                            <div class="form-group">
                                <label for="cargo-crear">Cargo</label>
                                <input type="text" class="form-control" id="cargo-crear" required>
                            </div>
                            <div class="form-group">
                                <label for="contrasena-crear">Contraseña</label>
                                <input type="password" class="form-control" id="contrasena-crear" placeholder="Requerida para Administrador y Colaborador">
                                <small class="form-text text-muted">Obligatoria para quienes acceden al sistema (Administrador y Colaborador).</small>
                            </div>
                            <div class="form-group">
                                <label for="rol-crear">Rol</label>
                                <select class="form-control" id="rol-crear" required>
                                    <option value="asistente">Asistente (solo firma actas, no accede al panel)</option>
                                    <option value="colaborador">Colaborador (crea y gestiona actas, sin eliminar/finalizar ni gestionar usuarios)</option>
                                    <option value="administrador">Administrador (acceso completo)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="card-footer text-right">
                <button type="button" class="btn btn-secondary" data-vista="lista_usuarios">Cancelar</button>
                <button type="button" class="btn btn-primary" id="btn-guardar-usuario">
                    <i class="fas fa-save"></i> Guardar Usuario
                </button>
            </div>
        </div>
    </div>
</div>