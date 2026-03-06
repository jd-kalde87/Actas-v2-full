<div class="content-header">
    <div class="container-fluid">
        <div class="row mb-2">
            <div class="col-sm-6">
                <h1 class="m-0">Lista de Actas</h1>
            </div>
            <div class="col-sm-6">
                <button class="btn btn-primary float-right" data-vista="crear_acta">
                    <i class="fas fa-plus"></i> Nueva Acta
                </button>
            </div>
        </div>
    </div>
</div>
<div class="content">
    <div class="container-fluid">
        <div class="card">
            <div class="card-body table-responsive">

                <div id="spinner-actas" class="text-center p-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="sr-only">Cargando...</span>
                    </div>
                    <p class="mt-2">Cargando datos de las actas...</p>
                </div>

                <table id="tabla-actas" class="table table-bordered table-striped w-100 hidden">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Tema</th>
                            <th>Lugar</th>
                            <th>Fecha</th>
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

<!-- Modal previsualización acta -->
<div class="modal fade modal-preview-acta" id="modal-preview-acta" tabindex="-1" aria-labelledby="modal-preview-acta-label" aria-hidden="true">
    <div class="modal-dialog modal-xl">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modal-preview-acta-label">Previsualización del acta</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Cerrar"><span aria-hidden="true">&times;</span></button>
            </div>
            <div class="modal-body" id="modal-preview-acta-body">
                <div class="text-center text-muted py-4"><span class="fas fa-spinner fa-spin"></span> Cargando...</div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>
            </div>
        </div>
    </div>
</div>