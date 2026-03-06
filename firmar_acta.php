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
    <title>Firma de Acta | VOSIN S.A.S</title>
    <link rel="icon" href="assets/img/Logo.png" type="image/x-icon">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
    <link rel="stylesheet" href="libs/admin-lte/plugins/fontawesome-free/css/all.min.css">
    <link rel="stylesheet" href="libs/admin-lte/dist/css/adminlte.min.css">
    
    <link rel="stylesheet" href="libs/admin-lte/plugins/sweetalert2-theme-bootstrap-4/bootstrap-4.min.css">
    <link rel="stylesheet" href="./assets/css/style.css">
</head>
<body class="firma-page">

<div id="main-container" 
     data-backend-url="<?php echo BACKEND_API_URL; ?>" 
     data-acta-codigo="<?php echo $codigo_acta; ?>">

    <div class="container mt-4">
        <div class="row justify-content-center">
            <div class="col-md-10 col-lg-8">
                <div class="text-center mb-4">
                    <img src="assets/img/logo2.png" alt="Logo VOSIN" class="logo-img logo-img-thanks">
                </div>

                <div class="card card-primary card-outline" id="acta-container">
                    <div class="card-header">
                        <h3 class="card-title"><strong>Acta de Reunión:</strong> <span><?php echo $codigo_acta; ?></span></h3>
                    </div>
                    <div class="card-body">
                        <div id="loading-spinner" class="text-center p-4">
                            <div class="spinner-border text-primary" role="status">
                                <span class="sr-only">Cargando...</span>
                            </div>
                            <p class="mt-2">Cargando datos del acta...</p>
                        </div>
                        <div id="acta-content" class="hidden">
                            </div>
                    </div>
                </div>

                <div class="card card-primary card-outline hidden" id="firma-container">
                    <div class="card-header">
                        <h3 class="card-title">Confirmación y Firma</h3>
                    </div>
                    <div class="card-body">
                        <div class="signature-wrapper">
                             <p class="text-muted signature-confirmation-text">Por favor, firme en el siguiente recuadro:</p>
                            <div class="form-group text-center">
                                <canvas id="signature-pad" class="signature-pad" width="400" height="200"></canvas>
                                <div>
                                    <button id="clear-signature" class="btn btn-secondary btn-sm mt-2">Limpiar Firma</button>
                                </div>
                            </div>
                            <p class="text-muted signature-confirmation-text">
                                Yo, <strong id="user-name"></strong>, identificado(a) con cédula de ciudadanía N° <strong id="user-cedula"></strong>, confirmo mi asistencia y estoy de acuerdo con el contenido de esta acta.
                            </p>
                        </div>
                    </div>
                    <div class="card-footer text-right">
                        <button id="save-signature" class="btn btn-primary">Guardar y Enviar Firma</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="libs/admin-lte/plugins/sweetalert2/sweetalert2.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/signature_pad@4.0.0/dist/signature_pad.umd.min.js"></script>
<script src="assets/js/modules/firmar_acta.js"></script>
</body>
</html>