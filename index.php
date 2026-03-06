<?php
include('config.php');
session_start();
if (!isset($_SESSION['token'])) {
    header("Location: ./login.php");
    exit();
}
$user_nombre = $_SESSION['user_nombre'] ?? 'Usuario';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Panel de Actas v2.1 | VOSIN S.A.S</title>
    <link rel="icon" href="./assets/img/favicon16x16.png" type="image/x-icon">
    
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
    <link rel="stylesheet" href="libs/admin-lte/plugins/fontawesome-free/css/all.min.css">
    <link rel="stylesheet" href="libs/datatables/datatables.min.css">
    <link rel="stylesheet" href="libs/admin-lte/dist/css/adminlte.min.css">
    <link rel="stylesheet" href="libs/admin-lte/plugins/sweetalert2-theme-bootstrap-4/bootstrap-4.min.css">
    <link rel="stylesheet" href="assets/css/style.css">

    <script>
    const APP_CONFIG = {
        token: <?php echo json_encode($_SESSION['token'] ?? null); ?>,
        backendUrl: <?php echo json_encode(BACKEND_API_URL); ?>,
        userAdmin: <?php echo !empty($_SESSION['user_admin']) ? 'true' : 'false'; ?>,
        userColaborador: <?php echo !empty($_SESSION['user_colaborador']) ? 'true' : 'false'; ?>
    };
    </script>
</head>
<body class="hold-transition sidebar-mini layout-fixed">
<div class="wrapper">

    <nav class="main-header navbar navbar-expand navbar-white navbar-light shadow-sm">
        <ul class="navbar-nav">
            <li class="nav-item d-none d-sm-inline-block">
                <span class="nav-link font-weight-bold text-secondary">Sistema de Gestión de Actas</span>
            </li>
        </ul>
        
        <ul class="navbar-nav ml-auto">
            <li class="nav-item">
                <a class="nav-link" href="logout.php" role="button" title="Cerrar Sesión">
                    <i class="fas fa-power-off text-danger"></i>
                </a>
            </li>
        </ul>
    </nav>
    <aside class="main-sidebar sidebar-dark-primary elevation-4">
        <a href="index.php" class="brand-link">
            <img src="assets/img/logo bombillo.png" alt="VOSIN Logo" class="brand-image img-circle elevation-3 brand-logo-img">
            <span class="brand-text font-weight-light">VOSIN S.A.S</span>
        </a>
        <div class="sidebar-toggle-wrapper">
            <a class="nav-link sidebar-toggle-btn" data-widget="pushmenu" href="#" role="button" title="Contraer barra lateral" id="btn-toggle-sidebar">
                <i class="fas fa-chevron-left sidebar-toggle-arrow"></i>
                <span class="sidebar-toggle-text">Contraer barra</span>
                <span class="sidebar-toggle-text expandir-text">Expandir barra</span>
            </a>
        </div>

        <div class="sidebar">
            <div class="user-panel mt-3 pb-3 mb-3 d-flex align-items-center">
                <div class="image">
                    <div class="user-icon-wrapper">
                        <i class="fas fa-user-circle"></i>
                    </div>
                </div>
                <div class="info">
                    <a href="#" class="d-block font-weight-bold"><?php echo htmlspecialchars($user_nombre); ?></a>
                    <span class="text-xs text-muted">Conectado</span>
                </div>
            </div>

            <nav class="mt-2">
                <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
                    
                    <li class="nav-item">
                        <a href="#" class="nav-link active" data-vista="dashboard">
                            <i class="nav-icon fas fa-tachometer-alt"></i>
                            <p>Dashboard</p>
                        </a>
                    </li>

                    <li class="nav-header text-uppercase text-secondary font-weight-bold">Gestión de Actas</li>
                    
                    <li class="nav-item">
                        <a href="#" class="nav-link" data-vista="crear_acta">
                            <i class="nav-icon fas fa-plus-circle text-success"></i>
                            <p>Nueva Acta</p>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link" data-vista="lista_actas">
                            <i class="nav-icon fas fa-list-alt text-info"></i>
                            <p>Listado de Actas</p>
                        </a>
                    </li>

                    <li class="nav-header text-uppercase text-secondary font-weight-bold">Configuración</li>

                    <?php if (!empty($_SESSION['user_admin'])): ?>
                    <li class="nav-item">
                        <a href="#" class="nav-link" data-vista="lista_usuarios">
                            <i class="nav-icon fas fa-users-cog"></i>
                            <p>Usuarios</p>
                        </a>
                    </li>
                    <?php endif; ?>
                    
                    <li class="nav-item mt-4">
                        <a href="logout.php" class="nav-link bg-danger text-white">
                            <i class="nav-icon fas fa-sign-out-alt"></i>
                            <p>Cerrar Sesión</p>
                        </a>
                    </li>
                </ul>
            </nav>
            </div>
        </aside>

    <div class="content-wrapper">
        <main class="content p-3" id="main-content">
            </main>
    </div>
    <footer class="main-footer text-sm">
        <div class="float-right d-none d-sm-inline-block">
            <b>Versión</b> 2.1
        </div>
        <strong>Copyright &copy; 2024-<?php echo date('Y'); ?> <a href="https://vosin.co" target="_blank">VOSIN S.A.S</a>.</strong> Todos los derechos reservados.
    </footer>

</div>
<script src="libs/admin-lte/plugins/jquery/jquery.min.js"></script>
<script src="libs/admin-lte/plugins/bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="libs/admin-lte/dist/js/adminlte.min.js"></script>
<script>
(function() {
    var btn = document.getElementById('btn-toggle-sidebar');
    if (!btn) return;
    function setTitle() {
        btn.setAttribute('title', document.body.classList.contains('sidebar-collapse') ? 'Expandir barra' : 'Contraer barra');
    }
    setTitle();
    $(document).on('collapsed.lte.pushmenu shown.lte.pushmenu', '[data-widget="pushmenu"]', setTitle);
})();
</script>
<script src="libs/datatables/datatables.min.js"></script> 
<script src="libs/html2canvas/html2canvas.min.js"></script>
<script src="libs/admin-lte/plugins/sweetalert2/sweetalert2.min.js"></script>
<script src="libs/jspdf/jspdf.umd.min.js"></script>
<script src="libs/jspdf.plugin.autotable.min.js"></script>
<script src="libs/qrcode/qrcode.min.js"></script>
<script src="assets/js/api.js"></script>
<script src="assets/js/app.js"></script>
</body>
</html>