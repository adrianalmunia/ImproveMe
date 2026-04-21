# 🚀 ImproveMe - Aplicación de Desarrollo Personal

**ImproveMe** es una aplicación holística de bienestar personal que fusiona **productividad** (gestión de hábitos) con **bienestar emocional** (diario personal) para ayudarte a ver cómo tu disciplina afecta tu estado mental y descanso.

## 📋 Características Principales

✅ **Gestión de Hábitos**
- CRUD completo para hábitos personalizados
- Categorías e iconos
- Seguimiento diario de cumplimiento
- Histórico de progreso

✅ **Diario de Bienestar**
- Registro diario de estado de ánimo (mood score)
- Horas de sueño registradas
- Notas y reflexiones personales
- Multimedia asociada (fotos, etc.)

✅ **Gamificación**
- Sistema de puntos XP
- Rangos de progresión (Novato → Maestro de la Disciplina)
- Visualización de progreso

✅ **Autenticación Segura**
- Registro de nuevos usuarios
- Login con JWT
- Contraseñas encriptadas con bcrypt

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** + **Express** - servidor web
- **Prisma ORM** - acceso a base de datos
- **PostgreSQL** - base de datos relacional
- **JWT** - autenticación sin sesiones
- **Bcrypt** - encriptación de contraseñas

### Frontend
- **React 19** - librería de UI
- **JavaScript (ES6+)** - lógica del cliente
- **Vite** - bundler de desarrollo rápido
- **Tailwind CSS** - estilos (próximamente)
- **Context API** - estado global

## 📁 Estructura del Proyecto

```
ImproveMe/
├── backend/
│   ├── src/
│   │   ├── servidor.js                 # Punto de entrada
│   │   ├── configuracion/
│   │   │   ├── baseDatos.js            # Instancia Prisma
│   │   │   └── jwt.js                  # Generación y validación de tokens
│   │   ├── middleware/
│   │   │   └── autenticacion.js        # Verificación JWT
│   │   ├── rutas/
│   │   │   └── rutasAutenticacion.js   # Endpoints de auth
│   │   ├── controladores/
│   │   │   └── controladorAutenticacion.js  # Lógica HTTP
│   │   ├── servicios/
│   │   │   └── servicioAutenticacion.js     # Lógica de negocio
│   │   └── utilidades/
│   │       └── validadores.js          # Validación de datos
│   ├── prisma/
│   │   └── schema.prisma               # Modelo de datos
│   ├── .env                            # Variables de entorno
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                     # Componente raíz
│   │   ├── main.jsx                    # Punto de entrada
│   │   ├── componentes/
│   │   │   ├── CampoFormulario.jsx     # Input reutilizable
│   │   │   └── Boton.jsx               # Botón reutilizable
│   │   ├── paginas/
│   │   │   ├── PaginaLogin.jsx         # Login
│   │   │   └── PaginaRegistro.jsx      # Registro
│   │   ├── servicios/
│   │   │   └── servicioAPI.js          # Cliente HTTP
│   │   ├── contextos/
│   │   │   └── ContextoAutenticacion.jsx  # Estado global auth
│   │   ├── estilos/
│   │   │   ├── App.css
│   │   │   ├── CampoFormulario.css
│   │   │   ├── Boton.css
│   │   │   ├── PaginaLogin.css
│   │   │   └── PaginaRegistro.css
│   │   └── utilidades/                 # Funciones auxiliares
│   ├── .env                            # Variables de entorno
│   └── package.json
│
└── README.md (este archivo)
```

## 📚 Estructura de Capas

### Backend
```
Rutas (Express) 
    ↓
Controladores (manejo HTTP)
    ↓
Servicios (lógica de negocio)
    ↓
Base de Datos (Prisma)
```

### Frontend
```
Componentes de Página
    ↓
Componentes Reutilizables
    ↓
Servicios de API
    ↓
Contextos (estado global)
```

## 🔒 Seguridad

- ✅ Contraseñas encriptadas con bcrypt (10 vueltas)
- ✅ JWT para autenticación sin sesiones
- ✅ CORS configurado
- ✅ Validación de inputs
- ✅ Variables sensibles en .env (nunca en Git)

## 🚧 Próximas Funcionalidades

- [ ] Dashboard principal con widgets
- [ ] CRUD de hábitos en frontend
- [ ] Página de diario de bienestar
- [ ] Gráficos de progreso (Chart.js)
- [ ] Sistema de notificaciones
- [ ] Sincronización offline-first
- [ ] Temas oscuro/claro
- [ ] Responsive design mejorado

## 👤 Contribuidores

- **Adrian** - Desarrollador principal

## 📄 Licencia

Proyecto personal - Todos los derechos reservados © 2026

---

**¡Gracias por usar ImproveMe! 🌟**

¿Preguntas? Revisa la memoria del proyecto o contacta al desarrollador.
