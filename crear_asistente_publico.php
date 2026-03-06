<?php
include('config.php');
$codigo_acta = htmlspecialchars($_GET['codigo'] ?? '');
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Registro de Nuevo Asistente | VOSIN S.A.S</title>
    <link rel="icon" href="./assets/img/Logo.png" type="image/x-icon">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
    <link rel="stylesheet" href="libs/admin-lte/plugins/fontawesome-free/css/all.min.css">
    <link rel="stylesheet" href="libs/admin-lte/dist/css/adminlte.min.css">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="hold-transition register-page">
<div class="register-box">
    <div class="card card-outline card-primary">
        <div class="card-header text-center">
            <a href="https://vosin.co" target="_blank" rel="noopener noreferrer">
                <img src="assets/img/logo2.png" alt="Logo VOSIN" class="img-fluid mb-4 logo-img">
            </a>
            <h4>Registro de Nuevo Asistente</h4>
        </div>
        <div class="card-body">
            <p class="login-box-msg">Parece que eres nuevo. Por favor, completa tus datos para registrarte.</p>
            <form id="form-registro">
                <input type="text" class="form-control mb-3" id="nombre" placeholder="Nombres" required>
                <input type="text" class="form-control mb-3" id="apellido" placeholder="Apellidos" required>
                <input type="number" class="form-control mb-3" id="num_documento" placeholder="N° de documento" required>
                <input type="number" class="form-control mb-3" id="num_cel" placeholder="N° de celular" required>
                <input type="email" class="form-control mb-3" id="correo" placeholder="Correo electrónico" required>
                <input type="text" class="form-control mb-3" id="empresa" placeholder="Empresa" required>
                <input type="text" class="form-control mb-3" id="cargo" placeholder="Cargo" required>
                <button type="submit" id="btn-registrar" class="btn btn-primary btn-block">Registrarme</button>
            </form>
            <div id="message" class="alert mt-3 text-center message-feedback hidden" role="alert"></div>
        </div>
    </div>
</div>

<script>
    const BACKEND_URL = '<?php echo BACKEND_API_URL; ?>';
    const ACTA_CODIGO = '<?php echo $codigo_acta; ?>';

    document.getElementById('form-registro').addEventListener('submit', function(e) {
        e.preventDefault();
        const messageDiv = document.getElementById('message');
        const submitButton = document.getElementById('btn-registrar');

        // Ocultar mensajes de error anteriores
        messageDiv.classList.add('hidden');
        messageDiv.classList.remove('visible');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';
        
        // CORRECCIÓN 1: Los campos 'contrasena', 'admin' y 'estado' los define el backend por seguridad.
        // El frontend solo debe enviar los datos que el usuario ingresa.
        const datos = {
            nombre: document.getElementById('nombre').value,
            apellidos: document.getElementById('apellido').value,
            cedula: document.getElementById('num_documento').value,
            telefono: document.getElementById('num_cel').value,
            email: document.getElementById('correo').value,
            empresa: document.getElementById('empresa').value,
            cargo: document.getElementById('cargo').value,
        };

        const endpoint = `${BACKEND_URL}usuario/crear-asistente`;

        fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // CORRECCIÓN 2: El nombre de la variable era incorrecto (datosDelFormulario -> datos)
            body: JSON.stringify(datos)
        })
        .then(response => {
            // CORRECCIÓN 3: Mejoramos el manejo de errores para leer el mensaje del backend.
            if (!response.ok) { // response.ok es false para errores como 401, 409, 500
                return response.json().then(errorData => {
                    throw new Error(errorData.message || 'Ocurrió un error desconocido.');
                });
            }
            return response.json();
        })
        .then(data => {
            // Esto solo se ejecuta si el registro fue exitoso (status 201)
            submitButton.disabled = true;
            messageDiv.className = 'alert alert-success mt-3 text-center message-feedback visible';
            messageDiv.innerHTML = `¡Registro exitoso! <br> Serás redirigido para que valides tu documento de nuevo.`;
            messageDiv.classList.remove('hidden');
            messageDiv.classList.add('visible');

            // Redirigir de vuelta a la página de asistencia después de 3 segundos
            setTimeout(() => {
                window.location.href = `asistencia.php?codigo=${ACTA_CODIGO}`;
            }, 3000);
        })
        .catch(error => {
            // Ahora este 'catch' recibirá el mensaje de error específico del backend
            messageDiv.className = 'alert alert-danger mt-3 text-center message-feedback visible';
            messageDiv.textContent = `Error: ${error.message}`;
            messageDiv.classList.remove('hidden');
            messageDiv.classList.add('visible');
            
            // Habilitar el botón de nuevo si hay un error
            submitButton.disabled = false;
            submitButton.textContent = 'Registrarme';
        });
    });
</script>
</body>
</html>