# ImproveMe — Aplicación de Desarrollo Personal

**ImproveMe** es una aplicación web de bienestar personal que combina la gestión de hábitos con el seguimiento del estado emocional. La idea es sencilla: ayudarte a ver cómo tu disciplina diaria impacta en tu descanso, tu ánimo y tu progreso personal.

El proyecto está **completamente desarrollado** y listo para usar.

---

## ✨ Qué puedes hacer con ImproveMe

**Hábitos**
- Crear, editar y eliminar hábitos personalizados con categorías e iconos
- Marcar hábitos como completados cada día
- Consultar el historial de cumplimiento a lo largo del tiempo

**Diario de bienestar**
- Registrar tu estado de ánimo diario (mood score)
- Anotar las horas de sueño
- Escribir reflexiones personales y adjuntar multimedia

**Estadísticas y progreso**
- Gráficos y métricas de evolución personal
- Sistema de puntos XP con rangos de progresión (Novato → Maestro de la Disciplina)
- Página de registros y calendario de actividad

**Meditación y enfoque**
- Sesiones guiadas de meditación integradas en la app

**Perfil de usuario**
- Gestión completa de la cuenta: datos personales, contraseña y preferencias
- Soporte y contacto desde dentro de la aplicación

**Autenticación segura**
- Registro e inicio de sesión con JWT
- Contraseñas encriptadas con bcrypt

---

## 🛠️ Stack tecnológico

### Backend
| Tecnología | Uso |
|---|---|
| Node.js + Express | Servidor web y API REST |
| Prisma ORM | Acceso a base de datos |
| PostgreSQL | Base de datos relacional |
| JWT | Autenticación sin sesiones |
| Bcrypt | Encriptación de contraseñas |
| Multer | Gestión de archivos multimedia |

### Frontend
| Tecnología | Uso |
|---|---|
| React 19 | Librería de UI |
| Vite | Bundler de desarrollo |
| Context API | Estado global de la aplicación |
| Chart.js | Gráficos de estadísticas |

---

## 📁 Estructura del proyecto

```
ImproveMe/
├── backend/
│   ├── src/
│   │   ├── servidor.js                      # Punto de entrada principal
│   │   ├── inicio.js                        # Configuración de Express
│   │   ├── configuracion/
│   │   │   ├── baseDatos.js                 # Instancia de Prisma
│   │   │   └── jwt.js                       # Generación y validación de tokens
│   │   ├── middleware/
│   │   │   └── autenticacion.js             # Verificación JWT
│   │   ├── rutas/
│   │   │   ├── rutasAutenticacion.js
│   │   │   ├── rutasDiario.js
│   │   │   ├── rutasCalendario.js
│   │   │   ├── rutasEstadisticas.js
│   │   │   ├── rutasMeditacion.js
│   │   │   ├── rutasTareas.js
│   │   │   └── rutasSoporte.js
│   │   ├── controladores/                   # Lógica HTTP por módulo
│   │   ├── servicios/                       # Lógica de negocio
│   │   └── utilidades/                      # Validadores y helpers
│   ├── prisma/
│   │   └── schema.prisma                    # Modelo de datos
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── Aplicacion.jsx                   # Componente raíz y rutas
│   │   ├── Principal.jsx                    # Punto de entrada
│   │   ├── paginas/
│   │   │   ├── LandingPage.jsx              # Página de inicio pública
│   │   │   ├── LandingSections.jsx          # Secciones de la landing
│   │   │   ├── Autenticacion.jsx            # Login y registro
│   │   │   ├── PaginaHabitos.jsx
│   │   │   ├── PaginaDiario.jsx
│   │   │   ├── PaginaEstadisticas.jsx
│   │   │   ├── PaginaCalendario.jsx
│   │   │   ├── PaginaMeditacion.jsx
│   │   │   ├── PaginaRangos.jsx
│   │   │   ├── PaginaRegistros.jsx
│   │   │   └── PaginaUsuario.jsx
│   │   ├── componentes/                     # Componentes reutilizables
│   │   ├── contextos/                       # Estado global (auth, etc.)
│   │   ├── servicios/                       # Cliente HTTP y llamadas a la API
│   │   ├── estilos/                         # CSS por componente/página
│   │   └── utilidades/                      # Funciones auxiliares
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## 🔒 Seguridad

- Contraseñas encriptadas con bcrypt (10 rondas)
- Autenticación stateless con JWT
- CORS configurado en el servidor
- Validación de inputs en cliente y servidor
- Variables sensibles en `.env`, excluidas del repositorio

---

## 🚀 Cómo ejecutar el proyecto

**Backend**
```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

Asegúrate de configurar las variables de entorno en `backend/.env` y `frontend/.env` antes de arrancar.

---

## 👤 Autor

**Adrian** — Desarrollador del proyecto

---

*Proyecto personal © 2026. Todos los derechos reservados.*
