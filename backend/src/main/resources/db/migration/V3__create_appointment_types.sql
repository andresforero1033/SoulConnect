-- Create appointment_types reference table and seed 10 specialties

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS appointment_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO appointment_types (code, name, specialty, description) VALUES
    ('CONS-GEN', 'Consulta general', 'Medicina general', 'Atencion primaria y chequeos basicos'),
    ('PEDIA', 'Consulta pediatrica', 'Pediatria', 'Atencion para ninos y adolescentes'),
    ('GIN', 'Consulta ginecologica', 'Ginecologia', 'Salud reproductiva y controles'),
    ('CARD', 'Consulta cardiologica', 'Cardiologia', 'Evaluacion cardiovascular y riesgo'),
    ('DERM', 'Consulta dermatologica', 'Dermatologia', 'Lesiones de piel y controles'),
    ('TRAUMA', 'Consulta traumatologica', 'Traumatologia', 'Lesiones osteomusculares'),
    ('ODONTO', 'Consulta odontologica', 'Odontologia', 'Salud bucal y controles'),
    ('OFTAL', 'Consulta oftalmologica', 'Oftalmologia', 'Vision, lentes y examenes oculares'),
    ('PSIQ', 'Consulta psiquiatrica', 'Psiquiatria', 'Salud mental y seguimiento'),
    ('ENDO', 'Consulta endocrinologica', 'Endocrinologia', 'Metabolismo, tiroides y hormonas');
