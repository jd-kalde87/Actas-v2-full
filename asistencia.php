<?php
include('config.php');
$codigo_acta = htmlspecialchars($_GET['codigo'] ?? '');

if (empty($codigo_acta)) {
    die("Error: No se ha especificado un código de acta.");
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Registro de Asistencia | VOSIN S.A.S</title>
    <link rel="icon" href="./assets/img/Logo.png" type="image/x-icon">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
    <link rel="stylesheet" href="libs/admin-lte/plugins/fontawesome-free/css/all.min.css">
    <link rel="stylesheet" href="libs/admin-lte/dist/css/adminlte.min.css">
    <link rel="stylesheet" href="./assets/css/style.css">
</head>
<body class="hold-transition login-page">

<div id="main-container" 
     data-backend-url="<?php echo BACKEND_API_URL; ?>" 
     data-acta-codigo="<?php echo $codigo_acta; ?>">

    <div class="login-box">
        <div class="card card-outline card-primary">
            <div class="card-header text-center">
                <a href="https://vosin.co" target="_blank" rel="noopener noreferrer">
                    <img src="assets/img/logo2.png" alt="Logo VOSIN" class="img-fluid mb-4 logo-img">
                </a>
                <h4>Registro de Asistencia</h4>
            </div>
            <div class="card-body">
                <p class="login-box-msg">Por favor, ingrese su número de documento para continuar con la firma del acta:</p>
                <h5 class="text-center mb-3"><strong>ACTA: <?php echo $codigo_acta; ?></strong></h5>

                <form id="form-asistencia">
                    <div class="input-group mb-3">
                        <input type="number" class="form-control" id="cedula" placeholder="N° de Documento" required>
                        <div class="input-group-append">
                            <div class="input-group-text"><span class="fas fa-id-card"></span></div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-12">
                            <button type="submit" id="btn-validar" class="btn btn-primary btn-block">
                                <span id="btn-text">Validar e Ingresar</span>
                                <span id="btn-spinner" class="spinner-border spinner-border-sm hidden" role="status" aria-hidden="true"></span>
                            </button>
                        </div>
                    </div>
                </form>
                <div id="error-message" class="alert alert-danger mt-3 text-center hidden" role="alert"></div>
            </div>
        </div>
    </div>
<div id="errorModal" class="modal-overlay hidden" aria-hidden="true">
    <div class="modal-content">
        <div class="modal-header">
            <h4>Acción no permitida</h4>
            <span id="closeModalBtn" class="modal-close">&times;</span>
        </div>
        <div class="modal-body">
            <p>Nuestro sistema indica que usted ya ha registrado una firma para esta acta.</p>
            <p>No es posible firmar más de una vez. Si cree que esto es un error, por favor, contacte al administrador.</p>
        </div>
        <div class="modal-footer">
            <button id="okModalBtn" class="btn-modal">Entendido</button>
        </div>
    </div>
</div>
<script src="assets/js/modules/asistencia.js" defer></script>
</body>
</html>