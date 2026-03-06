<div class="content-header">
    <div class="container-fluid">
        <div class="row mb-2">
            <div class="col-sm-6">
                <h1 class="m-0">Gestión de Usuarios</h1>
            </div>
            <div class="col-sm-6">
                <button class="btn btn-primary float-right" data-vista="crear_usuario">
                    <i class="fas fa-plus"></i> Nuevo Usuario
                </button>
            </div>
        </div>
    </div>
</div>
<div class="content">
    <div class="container-fluid">
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Listado de Usuarios Registrados</h3>
            </div>
            <div class="card-body table-responsive">

                <div id="spinner-usuarios" class="text-center p-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="sr-only">Cargando...</span>
                    </div>
                    <p class="mt-2">Cargando datos de los usuarios...</p>
                </div>

                <table id="tabla-usuarios" class="table table-bordered table-striped w-100 hidden">
                    <thead>
                        <tr>
                            <th>Cédula</th>
                            <th>Nombre Completo</th>
                            <th>Email</th>
                            <th>Empresa</th>
                            <th>Cargo</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        </tbody>
                </table>
                </div>
        </div>
    </div>
</div>