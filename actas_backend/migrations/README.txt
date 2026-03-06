Migración: rol Colaborador
==========================
Ejecutar una sola vez en la base de datos (por ejemplo desde phpMyAdmin o línea de comandos):

  source 001_add_colaborador.sql

o copiar y ejecutar el contenido de 001_add_colaborador.sql.

Esto añade la columna "colaborador" a la tabla "usuario". Sin ella, el login con rol Colaborador y la gestión de roles fallarán.
