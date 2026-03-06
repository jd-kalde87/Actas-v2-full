<?php
// Obtenemos el código del acta que se pasó como parámetro
$acta_codigo = htmlspecialchars($_POST['id'] ?? 'Error');
?>

<div class="content-header">
    <div class="container-fluid">
        <div class="row mb-2">
            <div class="col-sm-6">
                <h1 class="m-0">Gestionar Contenido del Acta</h1>
            </div>
        </div>
    </div>
</div>
<div class="content">
    <div class="container-fluid">
        <div class="row">
            <div class="col-md-6">
                <div class="card card-primary card-outline">
                    <div class="card-header">
                        <h5 class="m-0">Añadir Contenido para: <strong><?php echo $acta_codigo; ?></strong></h5>
                    </div>
                    <div class="card-body">
                        <form id="form-contenido-acta" data-acta-codigo="<?php echo $acta_codigo; ?>">
                            <div class="form-group">
                                <label for="temario-select">Seleccionar Punto del Temario</label>
                                <select id="temario-select" class="form-control" required>
                                    <option value="" selected disabled>Cargando temario...</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="intervenciones">Intervenciones</label>
                                <textarea id="intervenciones" class="form-control" rows="4" placeholder="Describa las intervenciones clave..."></textarea>
                            </div>

                            <div class="form-group">
                                <label>Compromisos</label>
                                <div id="contenedor-compromisos">
                                    </div>
                                <button type="button" class="btn btn-sm btn-success mt-2" id="btn-agregar-compromiso">
                                    <i class="fas fa-plus"></i> Añadir Compromiso
                                </button>
                            </div>
                            </form>
                    </div>
                    <div class="card-footer text-right">
                        <button type="button" class="btn btn-success" id="btn-guardar-contenido">
                            <i class="fas fa-plus"></i> Añadir al Acta
                        </button>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Contenido ya Registrado</h3>
                    </div>
                    <div class="card-body contenido-scroll" id="contenido-existente-container">
                        <p class="text-muted">Aún no se ha añadido contenido a esta acta.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>