<div class="content-header">
    <div class="container-fluid">
        <div class="row mb-2">
            <div class="col-sm-6">
                <h1 class="m-0">Dashboard</h1>
            </div>
        </div>
    </div>
</div>
<div class="content">
    <div class="container-fluid">
        <div class="row">
            <div class="col-lg-3 col-6">
                <div class="small-box bg-info">
                    <div class="inner">
                        <p>Actas Creadas</p>
                    </div>
                    <div class="icon">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <a href="#" class="small-box-footer" data-vista="lista_actas">Ver listado <i class="fas fa-arrow-circle-right"></i></a>
                </div>
            </div>
            <?php if (!empty($_SESSION['user_admin'])): ?>
            <div class="col-lg-3 col-6">
                <div class="small-box bg-success">
                    <div class="inner">
                        <p>Usuarios Registrados</p>
                    </div>
                    <div class="icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <a href="#" class="small-box-footer" data-vista="lista_usuarios">Gestionar usuarios <i class="fas fa-arrow-circle-right"></i></a>
                </div>
            </div>
            <?php endif; ?>
        </div>
        <div class="row">
            <div class="col-12">
                <div class="card card-primary card-outline">
                    <div class="card-header">
                        <h5 class="m-0">¡Bienvenido!</h5>
                    </div>
                    <div class="card-body">
                        <h6 class="card-title">Sistema de Gestión de Actas VOSIN S.A.S</h6>
                        <p class="card-text">Desde este panel podrás administrar todas las funcionalidades del sistema. Utiliza el menú lateral izquierdo para navegar entre las diferentes secciones.</p>
                        <a href="#" class="btn btn-primary" data-vista="crear_acta">Crear una Nueva Acta</a>
                    </div>
                </div>
            </div>
        </div>

    </div>
</div>