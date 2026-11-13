\getenv usuarios_password DB_USUARIOS_PASSWORD
\getenv pacientes_password DB_PACIENTES_PASSWORD
\getenv citas_password DB_CITAS_PASSWORD

BEGIN;

CREATE ROLE app_usuarios LOGIN PASSWORD :'usuarios_password';
CREATE ROLE app_pacientes LOGIN PASSWORD :'pacientes_password';
CREATE ROLE app_citas LOGIN PASSWORD :'citas_password';

REVOKE ALL ON SCHEMA public FROM PUBLIC;

COMMIT;
