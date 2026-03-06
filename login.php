<?php
include('config.php');
session_start();

if (isset($_SESSION['token'])) {
    header("Location: ./index.php");
    exit();
}

$error_message = '';
$debug_message = ''; // Variable para ver errores ocultos

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_POST['cedula']) && isset($_POST['contrasena'])) {
        $datos = ['cedula' => $_POST['cedula'], 'contrasena' => $_POST['contrasena']];
        
        // --- CORRECCIÓN 1: Aseguramos que la URL tenga la barra '/' ---
        // Usamos rtrim para quitar barras extras si las hubiera, y agregamos la nuestra.
        $url = rtrim(BACKEND_API_URL, '/') . '/usuario/login';

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($datos));
        
        $response = curl_exec($ch);
        
        // --- CORRECCIÓN 2: Capturar errores de conexión (Debug) ---
        if ($response === false) {
            $debug_message = 'Error de conexión cURL: ' . curl_error($ch);
        }
        
        curl_close($ch);
        
        $response_data = json_decode($response, true);

        $puedeAcceder = isset($response_data['token']) && (isset($response_data['admin']) && $response_data['admin'] || isset($response_data['colaborador']) && $response_data['colaborador']);
        if ($puedeAcceder) {
            $_SESSION['token'] = $response_data['token'];
            $_SESSION['user_nombre'] = $response_data['nombre'];
            $_SESSION['user_admin'] = !empty($response_data['admin']);
            $_SESSION['user_colaborador'] = !empty($response_data['colaborador']);
            header("Location: ./index.php");
            exit();
        } else {
            if (isset($response_data['message'])) {
                $error_message = $response_data['message'];
            } else {
                $error_message = 'Credenciales incorrectas o sin permiso para acceder al sistema.';
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>VOSIN S.A.S | Iniciar Sesión</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
    <link rel="stylesheet" href="libs/admin-lte/plugins/fontawesome-free/css/all.min.css">
    <link rel="stylesheet" href="libs/admin-lte/dist/css/adminlte.min.css">
    <link rel="stylesheet" href="./assets/css/style.css">
</head>
<body class="hold-transition login-page">
<div class="login-box">
    <div class="card card-outline card-primary">
        <div class="card-header text-center">           
            <a href="https://vosin.co" target="_blank" rel="noopener noreferrer">
                <img src="assets/img/logo2.png" alt="Logo" class="img-fluid mb-4 logo-img">
            </a>
        </div>
        <div class="card-body">
            <p class="login-box-msg">Inicia sesión para comenzar</p>

            <?php if ($error_message): ?>
                <div class="alert alert-danger text-center">
                    <?php echo htmlspecialchars($error_message); ?>
                </div>
            <?php endif; ?>

            <?php if ($debug_message): ?>
                <div class="alert alert-warning text-center text-small">
                    <strong>Debug:</strong> <?php echo htmlspecialchars($debug_message); ?>
                </div>
            <?php endif; ?>

            <form action="login.php" method="post">
                <div class="input-group mb-3">
                    <input type="text" class="form-control" name="cedula" placeholder="N° de Documento" required>
                    <div class="input-group-append"><div class="input-group-text"><span class="fas fa-user"></span></div></div>
                </div>
                <div class="input-group mb-3">
                    <input type="password" class="form-control" name="contrasena" placeholder="Contraseña" required>
                    <div class="input-group-append"><div class="input-group-text"><span class="fas fa-lock"></span></div></div>
                </div>
                <div class="row">
                    <div class="col-12">
                        <button type="submit" class="btn btn-primary btn-block">Iniciar Sesión</button>
                    </div>
                </div>
            </form>
        </div>        
    </div>    
</div>
<script src="libs/admin-lte/plugins/jquery/jquery.min.js"></script>
<script src="libs/admin-lte/plugins/bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="libs/admin-lte/dist/js/adminlte.min.js"></script>
</body>
</html>