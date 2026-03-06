-- Rol Colaborador: puede ingresar al sistema y gestionar actas, pero no usuarios ni finalizar/eliminar actas.
-- Ejecutar una sola vez en la base de datos.

ALTER TABLE usuario
ADD COLUMN colaborador TINYINT(1) NOT NULL DEFAULT 0
COMMENT '1 = puede acceder al panel (rol Colaborador)';
