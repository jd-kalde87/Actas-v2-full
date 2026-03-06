<?php
// Obtenemos la cédula del usuario que se pasó como parámetro
$usuario_cedula = htmlspecialchars($_POST['id'] ?? 'Error');
?>

<div class="content-header">
    <div class="container-fluid">
        <div class="row mb-2">
            <div class="col-sm-6">
                <h1 class="m-0">Editar Usuario</h1>
            </div>
        </div>
    </div>
</div>
<div class="content">
    <div class="container-fluid">
        <div class="card card-primary card-outline">
            <div class="card-header">
                <h5 class="m-0">Modificando datos del usuario: <strong><?php echo $usuario_cedula; ?></strong></h5>
            </div>
            <div class="card-body">
                <form id="form-editar-usuario" data-cedula="<?php echo $usuario_cedula; ?>">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="nombre-editar">Nombres</label>
                                <input type="text" class="form-control" id="nombre-editar" required>
                            </div>
                             <div class="form-group">
                                <label for="apellidos-editar">Apellidos</label>
                                <input type="text" class="form-control" id="apellidos-editar" required>
                            </div>
                             <div class="form-group">
                                <label for="email-editar">Correo Electrónico</label>
                                <input type="email" class="form-control" id="email-editar" required>
                            </div>
                            <div class="form-group">
                                <label for="telefono-editar">Teléfono</label>
                                <input type="text" class="form-control" id="telefono-editar" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="empresa-editar">Empresa</label>
                                <input type="text" class="form-control" id="empresa-editar" required>
                            </div>
                            <div class="form-group">
                                <label for="cargo-editar">Cargo</label>
                                <input type="text" class="form-control" id="cargo-editar" required>
                            </div>
                            <div class="form-group">
                                <label for="estado-editar">Estado</label>
                                <select id="estado-editar" class="form-control" required>
                                    <option value="activo">Activo</option>
                                    <option value="inactivo">Inactivo</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="rol-editar">Rol</label>
                                <select class="form-control" id="rol-editar" required>
                                    <option value="asistente">Asistente</option>
                                    <option value="colaborador">Colaborador</option>
                                    <option value="administrador">Administrador</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="card-footer text-right">
                <button type="button" class="btn btn-secondary" data-vista="lista_usuarios">Cancelar</button>
                <button type="button" class="btn btn-primary" id="btn-actualizar-usuario">
                    <i class="fas fa-save"></i> Actualizar Usuario
                </button>
            </div>
        </div>
    </div>
</div>