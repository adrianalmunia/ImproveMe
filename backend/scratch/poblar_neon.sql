-- ================================================================================
-- SCRIPT DE INICIALIZACIÓN Y POBLACIÓN PARA SUPABASE / NEON.TECH
-- ================================================================================
-- Este script crea las tablas necesarias en la base de datos si no existen,
-- vacía las tablas previas con RESTART IDENTITY CASCADE para evitar duplicados,
-- e inserta 20 usuarios variados con historiales realistas de hábitos, tareas, 
-- meditaciones y diario.

-- 1. CREACIÓN DE TABLAS (DDL)
CREATE TABLE IF NOT EXISTS "usuarios" (
    id SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    alias VARCHAR(50),
    contrasena_hash TEXT NOT NULL,
    metodo_auth VARCHAR(50) DEFAULT 'local' NOT NULL,
    puntos_experiencia INTEGER DEFAULT 0,
    racha_meditacion INTEGER DEFAULT 0,
    fecha_registro TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "entradas_diario" (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES "usuarios"(id) ON DELETE CASCADE,
    fecha DATE DEFAULT CURRENT_DATE,
    puntuacion_animo INTEGER,
    horas_sueno DECIMAL(4, 2),
    contenido_texto TEXT,
    CONSTRAINT usuario_id_fecha_unique UNIQUE (usuario_id, fecha)
);

CREATE TABLE IF NOT EXISTS "habitos" (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES "usuarios"(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    racha INTEGER DEFAULT 0 NOT NULL,
    racha_anterior INTEGER DEFAULT 0 NOT NULL,
    estado VARCHAR(20),
    fecha_creacion TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    frecuencia_semanal INTEGER DEFAULT 7
);

CREATE TABLE IF NOT EXISTS "registros_habitos" (
    id SERIAL PRIMARY KEY,
    habito_id INTEGER REFERENCES "habitos"(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    estado VARCHAR(20),
    CONSTRAINT habito_id_fecha_unique UNIQUE (habito_id, fecha)
);

CREATE TABLE IF NOT EXISTS "tareas_diarias" (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES "usuarios"(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    completada BOOLEAN DEFAULT false,
    racha INTEGER DEFAULT 0 NOT NULL,
    fecha_creacion TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "registros_diarias" (
    id SERIAL PRIMARY KEY,
    diaria_id INTEGER REFERENCES "tareas_diarias"(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    fue_completada BOOLEAN DEFAULT false,
    CONSTRAINT diaria_id_fecha_unique UNIQUE (diaria_id, fecha)
);

CREATE TABLE IF NOT EXISTS "tareas_pendientes" (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES "usuarios"(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    prioridad VARCHAR(20) DEFAULT 'media',
    completada BOOLEAN DEFAULT false,
    fecha_creacion TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "rangos_referencia" (
    id SERIAL PRIMARY KEY,
    nombre_rango VARCHAR(50) NOT NULL,
    xp_minima INTEGER NOT NULL,
    ruta_icono TEXT
);

CREATE TABLE IF NOT EXISTS "multimedia" (
    id SERIAL PRIMARY KEY,
    entrada_id INTEGER REFERENCES "entradas_diario"(id) ON DELETE CASCADE,
    tipo_archivo VARCHAR(10),
    url_archivo TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "sesiones_meditacion" (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES "usuarios"(id) ON DELETE CASCADE NOT NULL,
    duracion_segundos INTEGER NOT NULL,
    segundos_completados INTEGER NOT NULL,
    tecnica_respiracion VARCHAR(50) NOT NULL,
    pista_musica VARCHAR(50),
    fecha TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. LIMPIEZA DE TABLAS
TRUNCATE TABLE 
  "sesiones_meditacion", 
  "tareas_pendientes", 
  "registros_diarias", 
  "tareas_diarias", 
  "registros_habitos", 
  "habitos", 
  "multimedia", 
  "entradas_diario", 
  "usuarios" 
RESTART IDENTITY CASCADE;

-- 3. REGISTRAR LOS 20 USUARIOS (Contraseña de todos es 'Adrianprueba1', encriptada con bcrypt)
INSERT INTO "usuarios" (id, nombre_usuario, correo, alias, contrasena_hash, metodo_auth, puntos_experiencia, racha_meditacion, fecha_registro) VALUES
(1, 'adrianprueba', 'adrian@prueba.com', 'Adrián (Exposición)', '$2b$10$.ea1oTacXZbnhvNLKls5muZAYS6GJtJxW/FTsgbVtW2qcF00zwGVO', 'local', 850, 12, CURRENT_DATE - INTERVAL '30 days'),
(2, 'sofia_growth', 'sofia@growth.com', 'Sofía Mente Sana', '$2b$10$.ea1oTacXZbnhvNLKls5muZAYS6GJtJxW/FTsgbVtW2qcF00zwGVO', 'local', 1150, 18, CURRENT_DATE - INTERVAL '30 days'),
(3, 'carlos_fit', 'carlos@fit.com', 'Carlos Guerrero', '$2b$10$.ea1oTacXZbnhvNLKls5muZAYS6GJtJxW/FTsgbVtW2qcF00zwGVO', 'local', 980, 8, CURRENT_DATE - INTERVAL '30 days'),
(4, 'laura_mindful', 'laura@mindful.com', 'Laura Armonía', '$2b$10$.ea1oTacXZbnhvNLKls5muZAYS6GJtJxW/FTsgbVtW2qcF00zwGVO', 'local', 820, 14, CURRENT_DATE - INTERVAL '30 days'),
(5, 'javier_focus', 'javier@focus.com', 'Javi Productivo', '$2b$10$.ea1oTacXZbnhvNLKls5muZAYS6GJtJxW/FTsgbVtW2qcF00zwGVO', 'local', 790, 5, CURRENT_DATE - INTERVAL '30 days'),
(6, 'maria_zen', 'maria@zen.com', 'María Paz', '$2b$10$.ea1oTacXZbnhvNLKls5muZAYS6GJtJxW/FTsgbVtW2qcF00zwGVO', 'local', 680, 9, CURRENT_DATE - INTERVAL '30 days'),
(7, 'pablo_running', 'pablo@running.com', 'Pablo Maratón', '$2b$10$.ea1oTacXZbnhvNLKls5muZAYS6GJtJxW/FTsgbVtW2qcF00zwGVO', 'local', 590, 4, CURRENT_DATE - INTERVAL '30 days'),
(8, 'elena_habits', 'elena@habits.com', 'Elena Constancia', '$2b$10$.ea1oTacXZbnhvNLKls5muZAYS6GJtJxW/FTsgbVtW2qcF00zwGVO', 'local', 510, 7, CURRENT_DATE - INTERVAL '30 days'),
(9, 'diego_dev', 'diego@dev.com', 'Diego Programador', '$2b$10$.ea1oTacXZbnhvNLKls5muZAYS6GJtJxW/FTsgbVtW2qcF00zwGVO', 'local', 420, 3, CURRENT_DATE - INTERVAL '30 days'),
(10, 'lucia_books', 'lucia@books.com', 'Lucía Lectora', '$2b$10$.ea1oTacXZbnhvNLKls5muZAYS6GJtJxW/FTsgbVtW2qcF00zwGVO', 'local', 390, 6, CURRENT_DATE - INTERVAL '30 days'),
(11, 'mateo_disciplina', 'mateo@disciplina.com', 'Mateo Disciplina', '$2b$10$.ea1oTacXZbnhvNLKls5muZAYS6GJtJxW/FTsgbVtW2qcF00zwGVO', 'local', 310, 2, CURRENT_DATE - INTERVAL '30 days'),
(12, 'valeria_calm', 'valeria@calm.com', 'Valeria Serenidad', '$2b$10$.ea1oTacXZbnhvNLKls5muZAYS6GJtJxW/FTsgbVtW2qcF00zwGVO', 'local', 280, 5, CURRENT_DATE - INTERVAL '30 days'),
(13, 'alex_fuerza', 'alex@fuerza.com', 'Álex Fuerza', '$2b$10$.ea1oTacXZbnhvNLKls5muZAYS6GJtJxW/FTsgbVtW2qcF00zwGVO', 'local', 220, 0, CURRENT_DATE - INTERVAL '30 days'),
(14, 'sara_creative', 'sara@creative.com', 'Sara Creativa', '$2b$10$.ea1oTacXZbnhvNLKls5muZAYS6GJtJxW/FTsgbVtW2qcF00zwGVO', 'local', 180, 3, CURRENT_DATE - INTERVAL '30 days'),
(15, 'dani_stoic', 'dani@stoic.com', 'Dani Estoico', '$2b$10$.ea1oTacXZbnhvNLKls5muZAYS6GJtJxW/FTsgbVtW2qcF00zwGVO', 'local', 120, 2, CURRENT_DATE - INTERVAL '30 days'),
(16, 'marta_yoga', 'marta@yoga.com', 'Marta Flexibilidad', '$2b$10$.ea1oTacXZbnhvNLKls5muZAYS6GJtJxW/FTsgbVtW2qcF00zwGVO', 'local', 90, 1, CURRENT_DATE - INTERVAL '30 days'),
(17, 'hugo_water', 'hugo@water.com', 'Hugo Hidratado', '$2b$10$.ea1oTacXZbnhvNLKls5muZAYS6GJtJxW/FTsgbVtW2qcF00zwGVO', 'local', 60, 0, CURRENT_DATE - INTERVAL '30 days'),
(18, 'alba_gratitude', 'alba@gratitude.com', 'Alba Agradecida', '$2b$10$.ea1oTacXZbnhvNLKls5muZAYS6GJtJxW/FTsgbVtW2qcF00zwGVO', 'local', 40, 0, CURRENT_DATE - INTERVAL '30 days'),
(19, 'ruben_early', 'ruben@early.com', 'Rubén Madrugador', '$2b$10$.ea1oTacXZbnhvNLKls5muZAYS6GJtJxW/FTsgbVtW2qcF00zwGVO', 'local', 20, 0, CURRENT_DATE - INTERVAL '30 days'),
(20, 'clara_nature', 'clara@nature.com', 'Clara Aire Libre', '$2b$10$.ea1oTacXZbnhvNLKls5muZAYS6GJtJxW/FTsgbVtW2qcF00zwGVO', 'local', 10, 0, CURRENT_DATE - INTERVAL '30 days');

-- 4. ENTRADAS DE DIARIO DE ADRIÁN (ID 1)
INSERT INTO "entradas_diario" (id, usuario_id, fecha, puntuacion_animo, horas_sueno, contenido_texto) VALUES
(1, 1, CURRENT_DATE - INTERVAL '5 days', 5, 8.5, 'Hoy ha sido un día fantástico. Terminé de pulir la interfaz del diario de ImproveMe y los gráficos de estadísticas emocionales cargan a la perfección.'),
(2, 1, CURRENT_DATE - INTERVAL '4 days', 4, 7.0, 'Avances importantes en la base de datos de Neon. La racha de meditación de 12 días sigue intacta y me siento enfocado.'),
(3, 1, CURRENT_DATE - INTERVAL '3 days', 3, 6.5, 'Día bastante ocupado con las pruebas finales. Tuve que resolver un problema con el scrollbar, pero quedó solucionado y muy elegante.'),
(4, 1, CURRENT_DATE - INTERVAL '2 days', 5, 8.0, '¡Todo listo! Implementé el envío seguro de reportes mediante FormSubmit y unifiqué las imágenes persistentes con Supabase Storage. El proyecto se ve súper premium.'),
(5, 1, CURRENT_DATE - INTERVAL '1 days', 4, 7.5, 'Último ensayo general de la exposición del proyecto. Las ligas de clasificación de usuarios le dan muchísima vida visual a la app.');

-- 5. MULTIMEDIA DE ADRIÁN (ID 1)
INSERT INTO "multimedia" (id, entrada_id, tipo_archivo, url_archivo) VALUES
(1, 4, 'imagen', 'https://rhbszkbngkaakymmmqsg.supabase.co/storage/v1/object/public/multimedia/imagenes/ejemplo_exposicion.png'),
(2, 4, 'audio', 'https://rhbszkbngkaakymmmqsg.supabase.co/storage/v1/object/public/multimedia/audios/ejemplo_audio.mp3');

-- 6. HÁBITOS DE ADRIÁN (ID 1)
INSERT INTO "habitos" (id, usuario_id, nombre, racha, racha_anterior, estado, fecha_creacion, frecuencia_semanal) VALUES
(1, 1, 'Meditar 10 minutos', 12, 10, 'positivo', CURRENT_DATE - INTERVAL '30 days', 7),
(2, 1, 'Hacer ejercicio diario', 5, 4, 'positivo', CURRENT_DATE - INTERVAL '30 days', 5),
(3, 1, 'Beber 2L de agua', 15, 15, 'positivo', CURRENT_DATE - INTERVAL '30 days', 7),
(4, 1, 'Evitar comida rápida', 8, 3, 'positivo', CURRENT_DATE - INTERVAL '30 days', 7);

-- 7. REGISTROS DE HÁBITOS DE ADRIÁN (Historial de los últimos 5 días)
INSERT INTO "registros_habitos" (id, habito_id, fecha, estado) VALUES
-- Meditación (ID 1)
(1, 1, CURRENT_DATE - INTERVAL '4 days', 'positivo'),
(2, 1, CURRENT_DATE - INTERVAL '3 days', 'positivo'),
(3, 1, CURRENT_DATE - INTERVAL '2 days', 'positivo'),
(4, 1, CURRENT_DATE - INTERVAL '1 days', 'positivo'),
(5, 1, CURRENT_DATE, 'positivo'),
-- Ejercicio (ID 2)
(6, 2, CURRENT_DATE - INTERVAL '4 days', 'positivo'),
(7, 2, CURRENT_DATE - INTERVAL '3 days', 'positivo'),
(8, 2, CURRENT_DATE - INTERVAL '2 days', 'positivo'),
(9, 2, CURRENT_DATE - INTERVAL '1 days', 'positivo'),
(10, 2, CURRENT_DATE, 'positivo'),
-- Agua (ID 3)
(11, 3, CURRENT_DATE - INTERVAL '4 days', 'positivo'),
(12, 3, CURRENT_DATE - INTERVAL '3 days', 'positivo'),
(13, 3, CURRENT_DATE - INTERVAL '2 days', 'positivo'),
(14, 3, CURRENT_DATE - INTERVAL '1 days', 'positivo'),
(15, 3, CURRENT_DATE, 'positivo'),
-- Comida (ID 4)
(16, 4, CURRENT_DATE - INTERVAL '4 days', 'positivo'),
(17, 4, CURRENT_DATE - INTERVAL '3 days', 'positivo'),
(18, 4, CURRENT_DATE - INTERVAL '2 days', 'positivo'),
(19, 4, CURRENT_DATE - INTERVAL '1 days', 'positivo'),
(20, 4, CURRENT_DATE, 'positivo');

-- 8. TAREAS DIARIAS DE ADRIÁN (ID 1)
INSERT INTO "tareas_diarias" (id, usuario_id, nombre, completada, racha, fecha_creacion) VALUES
(1, 1, 'Hacer la cama', true, 12, CURRENT_DATE - INTERVAL '30 days'),
(2, 1, 'Leer 10 páginas', true, 5, CURRENT_DATE - INTERVAL '30 days'),
(3, 1, 'Repasar vocabulario', false, 0, CURRENT_DATE - INTERVAL '30 days');

-- 9. REGISTROS DE TAREAS DIARIAS DE ADRIÁN (Últimos 3 días)
INSERT INTO "registros_diarias" (id, diaria_id, fecha, fue_completada) VALUES
-- Hacer la cama (ID 1)
(1, 1, CURRENT_DATE - INTERVAL '2 days', true),
(2, 1, CURRENT_DATE - INTERVAL '1 days', true),
(3, 1, CURRENT_DATE, true),
-- Leer 10 páginas (ID 2)
(4, 2, CURRENT_DATE - INTERVAL '2 days', true),
(5, 2, CURRENT_DATE - INTERVAL '1 days', true),
(6, 2, CURRENT_DATE, true),
-- Repasar vocabulario (ID 3)
(7, 3, CURRENT_DATE - INTERVAL '2 days', false),
(8, 3, CURRENT_DATE - INTERVAL '1 days', false),
(9, 3, CURRENT_DATE, false);

-- 10. TAREAS PENDIENTES DE ADRIÁN (ID 1)
INSERT INTO "tareas_pendientes" (id, usuario_id, nombre, prioridad, completada, fecha_creacion) VALUES
(1, 1, 'Completar diapositivas de la exposición', 'alta', false, CURRENT_DATE - INTERVAL '2 days'),
(2, 1, 'Preparar la demo en vivo', 'alta', false, CURRENT_DATE - INTERVAL '1 days'),
(3, 1, 'Configurar las variables de entorno de Render', 'media', true, CURRENT_DATE - INTERVAL '3 days'),
(4, 1, 'Revisar la responsividad en móviles', 'baja', true, CURRENT_DATE - INTERVAL '4 days');

-- 11. SESIONES DE MEDITACIÓN DE ADRIÁN (ID 1)
INSERT INTO "sesiones_meditacion" (id, usuario_id, duracion_segundos, segundos_completados, tecnica_respiracion, pista_musica, fecha) VALUES
(1, 1, 600, 600, 'equilibrio', 'mar_calmo', CURRENT_DATE - INTERVAL '4 days'),
(2, 1, 600, 600, 'cuadrada', 'lluvia_suave', CURRENT_DATE - INTERVAL '3 days'),
(3, 1, 600, 600, 'relajacion', 'bosque_zen', CURRENT_DATE - INTERVAL '2 days'),
(4, 1, 600, 600, 'equilibrio', 'mar_calmo', CURRENT_DATE - INTERVAL '1 days'),
(5, 1, 600, 600, 'cuadrada', NULL, CURRENT_DATE);

-- 12. RANGOS DE REFERENCIA
INSERT INTO "rangos_referencia" (id, nombre_rango, xp_minima, ruta_icono) VALUES
(1, 'Hierro', 0, '/assets/rangos/hierro.png'),
(2, 'Bronce', 100, '/assets/rangos/bronce.png'),
(3, 'Plata', 300, '/assets/rangos/plata.png'),
(4, 'Oro', 600, '/assets/rangos/oro.png'),
(5, 'Platino', 1000, '/assets/rangos/platino.png'),
(6, 'Diamante', 1500, '/assets/rangos/diamante.png'),
(7, 'Maestro', 2100, '/assets/rangos/maestro.png'),
(8, 'Gran Maestro', 2800, '/assets/rangos/gran_maestro.png'),
(9, 'Celestial', 3600, '/assets/rangos/celestial.png');

-- 13. AJUSTAR SECUENCIAS (Reiniciar autoincrementales para que sigan a partir de las IDs insertadas)
SELECT setval(pg_get_serial_sequence('usuarios', 'id'), COALESCE(MAX(id), 1)) FROM "usuarios";
SELECT setval(pg_get_serial_sequence('entradas_diario', 'id'), COALESCE(MAX(id), 1)) FROM "entradas_diario";
SELECT setval(pg_get_serial_sequence('habitos', 'id'), COALESCE(MAX(id), 1)) FROM "habitos";
SELECT setval(pg_get_serial_sequence('registros_habitos', 'id'), COALESCE(MAX(id), 1)) FROM "registros_habitos";
SELECT setval(pg_get_serial_sequence('tareas_diarias', 'id'), COALESCE(MAX(id), 1)) FROM "tareas_diarias";
SELECT setval(pg_get_serial_sequence('registros_diarias', 'id'), COALESCE(MAX(id), 1)) FROM "registros_diarias";
SELECT setval(pg_get_serial_sequence('tareas_pendientes', 'id'), COALESCE(MAX(id), 1)) FROM "tareas_pendientes";
SELECT setval(pg_get_serial_sequence('multimedia', 'id'), COALESCE(MAX(id), 1)) FROM "multimedia";
SELECT setval(pg_get_serial_sequence('sesiones_meditacion', 'id'), COALESCE(MAX(id), 1)) FROM "sesiones_meditacion";
SELECT setval(pg_get_serial_sequence('rangos_referencia', 'id'), COALESCE(MAX(id), 1)) FROM "rangos_referencia";
