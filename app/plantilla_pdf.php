<?php
// Este archivo es solo una plantilla, no necesita lógica PHP compleja.
$acta_codigo = htmlspecialchars($_POST['id'] ?? 'ACTA-XXXX');
?>

<style>
    /* Estilos generales del documento */
    #pdf-template {
        width: 210mm; 
        padding: 15mm;
        font-family: Arial, sans-serif;
        font-size: 11pt;
        background-color: white;
        color: black;
    }
    .pdf-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #444;
        padding-bottom: 10px;
    }
    .header-col.logo { width: 25%; }
    .header-col.title {
        width: 50%;
        text-align: center;
        font-size: 16pt;
        font-weight: bold;
    }
    .header-col.info {
        width: 25%;
        font-size: 9pt;
        border: 1px solid #888;
    }
    .info-table {
        width: 100%;
        border-collapse: collapse;
    }
    .info-table td {
        border: 1px solid #888;
        padding: 2px 5px;
    }
    .info-table td:first-child {
        font-weight: bold;
        width: 40%;
    }
    .pdf-body {
        margin-top: 20px;
    }
    .pdf-section h3 {
        font-size: 13pt;
        border-bottom: 1px solid #ccc;
        padding-bottom: 5px;
        margin-top: 20px;
    }
    /* --- MODIFICACIÓN DE ESTILOS DE TABLA --- */
    .asistencia-table {
        width: 100%;
        margin-top: 15px;
        border-collapse: collapse;
        font-size: 9pt;
    }
    .asistencia-table th, .asistencia-table td {
        border: 1px solid #888;
        padding: 5px;
        text-align: left;
    }
    .asistencia-table th {
        /* Alineado con assets/css/style.css --color-gris-texto (#2C3E50) */
        background-color: #2C3E50;
        color: white;
    }
    .firma-img {
        max-width: 120px;
        max-height: 40px;
    }
    .img-full-width {
        width: 100%;
    }
</style>

<div id="pdf-template">
    <div class="pdf-header">
        <div class="header-col logo">
            <img src="assets/img/logo2.png" alt="Logo VOSIN" class="img-full-width">
        </div>
        <div class="header-col title">
            ACTA DE REUNIÓN
        </div>
        <div class="header-col info">
            <table class="info-table">
                <tr><td>Código:</td><td id="pdf-codigo"></td></tr>
                <tr><td>Versión:</td><td id="pdf-version">1.0</td></tr>
                <tr><td>Aprobado:</td><td id="pdf-aprobado">Gerencia</td></tr>
                <tr><td>Página:</td><td id="pdf-pagina">1 de 1</td></tr>
            </table>
        </div>
    </div>

    <div class="pdf-body">
        <div class="pdf-section" id="pdf-info-general">
            <h3>1. Información General</h3>
        </div>

        <div class="pdf-section" id="pdf-contenido-temario">
            <h3>2. Contenido (Temario)</h3>
        </div>
        
        <div class="pdf-section" id="pdf-desarrollo">
            <h3>3. Desarrollo</h3>
        </div>

        <div class="pdf-section" id="pdf-compromisos">
            <h3>4. Compromisos</h3>
        </div>

        <div class="pdf-section" id="pdf-asistencia">
            <h3>5. Listado de Asistencia</h3>
            <table class="asistencia-table">
                <thead>
                    <tr>
                        <th>Nombres y Apellidos</th>
                        <th>Empresa</th>
                        <th>Cargo</th>
                        <th>Firma</th>
                    </tr>
                </thead>
                <tbody>
                    </tbody>
            </table>
        </div>
    </div>
</div>