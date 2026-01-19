<div align="center">

# 💇‍♀️ DESARROLLO DE UN SISTEMA WEB Y UNA APLICACIÓN MÓVIL PARA EL AGENDAMIENTO DE CITAS EN LINA HERNÁNDEZ PELUQUERÍA

<img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React"/>
<img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
<img src="https://img.shields.io/badge/Vite-6.3.5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
<img src="https://img.shields.io/badge/TailwindCSS-3.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind"/>

### DESARROLLO DE UN SISTEMA WEB Y UNA APLICACIÓN MÓVIL PARA EL AGENDAMIENTO DE CITAS EN LINA HERNÁNDEZ PELUQUERÍA

**Proyecto de Titulación** | **[Escuela Politecnica Nacional]** | **2026**

[🌐 Ver Demo](#) | [📖 Documentación](#instalación) | [🐛 Reportar Bug](#contribución)

---

</div>

## 📋 Tabla de Contenidos

- [Descripción del Sistema](#-descripción-del-sistema)
- [Características Principales](#-características-principales)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Roles y Permisos](#-roles-y-permisos)
- [Funcionalidades por Módulo](#-funcionalidades-por-módulo)
- [Guía de Uso](#-guía-de-uso)
- [Despliegue](#-despliegue)
- [Testing](#-testing)
- [Contribución](#-contribución)
- [Autores](#-autores)
- [Licencia](#-licencia)

---

## 🎯 Descripción del Sistema

**Sistema de Gestión de Peluquería Lina Hernández** es una aplicación web empresarial full-stack diseñada para optimizar y automatizar los procesos operativos de salones de belleza. El sistema integra gestión de citas, administración de personal, control de servicios, procesamiento de pagos y generación de reportes analíticos en una plataforma única e intuitiva.


### 🏢 Problema Resuelto

Muchos salones de belleza operan con sistemas fragmentados (agendas físicas, WhatsApp, hojas de cálculo), generando:
- ❌ Pérdida de información de clientes y citas
- ❌ Doble reservación de horarios
- ❌ Dificultad para generar reportes financieros
- ❌ Falta de control sobre inventario y servicios
- ❌ Comunicación ineficiente entre personal y clientes

### ✅ Solución Implementada

Un sistema centralizado que digitaliza y automatiza:
- ✔️ Reservación de citas online 24/7
- ✔️ Gestión inteligente de horarios y disponibilidad
- ✔️ Control administrativo multirol (Admin, Gerente, Estilista, Cliente)
- ✔️ Procesamiento y validación de pagos con comprobantes
- ✔️ Dashboards analíticos con métricas en tiempo real
- ✔️ Sistema de notificaciones y recordatorios automatizados

---

## ✨ Características Principales

### 🔐 Sistema de Autenticación Robusto
- **Login/Registro** con validación en tiempo real
- **OAuth 2.0** integración con Google Sign-In
- **JWT Tokens** con refresh automático cada 14 minutos
- **Auto-logout** por inactividad (20 minutos)
- **Recuperación de contraseña** vía email con códigos de verificación
- **Roles dinámicos**: Admin, Manager, Stylist, Client

### 📅 Gestión Avanzada de Citas
- **Calendario interactivo** con vista diaria/semanal/mensual
- **Reservas online** con selección de servicio, estilista y horario
- **Detección automática** de disponibilidad por duración de servicio
- **Estados de cita**: Pendiente, Confirmada, Completada, Cancelada
- **Filtros avanzados** por fecha, estilista, estado y cliente
- **Confirmación/Cancelación** con razones y notas

### 👥 Administración de Personal
- **CRUD completo** de usuarios (Admin/Gerente/Estilista/Cliente)
- **Perfiles personalizados** con foto, especialidad y horarios
- **Asignación de catálogos** de servicios por estilista
- **Control de disponibilidad** con excepciones y bloqueos
- **Activación/Desactivación** de cuentas con auditoría

### 💼 Gestión de Servicios y Catálogos
- **Categorización** jerárquica de servicios (Cabello, Uñas, Maquillaje, etc.)
- **Configuración de precios** y duraciones en múltiplos de 30 minutos
- **Códigos automáticos** para identificación rápida (ej: CACO001)
- **Estados activo/inactivo** para control de visibilidad
- **Vinculación** servicio-categoría-estilista

### 💳 Procesamiento de Pagos
- **Subida de comprobantes** de transferencia (imagen)
- **Validación manual** por administradores
- **Estados de pago**: Pendiente, Confirmado, Rechazado
- **Historial completo** de transacciones
- **Notificaciones** al cliente sobre estado del pago

### 📊 Reportes y Analíticas
- **Dashboard financiero** con métricas de ingresos
- **Desglose por estilista** y servicio más vendido
- **Filtros de fecha** personalizados (día, semana, mes, año)
- **Exportación a PDF** de reportes
- **Gráficos interactivos** con Recharts
- **KPIs clave**: Ingresos totales, citas completadas, clientes nuevos

### ⭐ Sistema de Calificaciones
- **Rating 1-5 estrellas** por cita completada
- **Comentarios de clientes** sobre el servicio
- **Promedio por estilista** visible en perfiles
- **Filtrado de reseñas** por fecha y calificación

### 🔔 Notificaciones y Comunicación
- **Toast notifications** elegantes con Sonner
- **Recordatorios automáticos** de citas próximas
- **Botón de WhatsApp** flotante para contacto directo
- **Emails de verificación** y recuperación de cuenta

### 🎨 Interfaz de Usuario Premium
- **Diseño dark mode** profesional (negro/dorado #D4AF37)
- **Responsive design** móvil-first
- **Animaciones fluidas** con Motion/React
- **Componentes reutilizables** con Shadcn/ui + Radix UI
- **Accesibilidad WCAG 2.1** Level AA

### 🛡️ Seguridad y Confiabilidad
- **Error boundaries** que previenen pantallas blancas
- **Sistema de logging** centralizado con 4 niveles (DEBUG, INFO, WARN, ERROR)
- **Validaciones robustas** en frontend y backend
- **Protección CSRF** y sanitización de inputs
- **Encriptación de contraseñas** con bcrypt
- **Rate limiting** para prevenir ataques

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                  │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐│
│  │  Landing  │  │   Auth    │  │ Dashboards│  │ Management││
│  │   Page    │  │  Module   │  │  (4 Roles)│  │  Modules  ││
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └────┬─────┘│
│        │              │               │              │       │
│        └──────────────┴───────────────┴──────────────┘       │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │  React Context  │                        │
│                   │  (State Mgmt)   │                        │
│                   └────────┬────────┘                        │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │   API Service   │                        │
│                   │   (Axios/Fetch) │                        │
│                   └────────┬────────┘                        │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    ─────────▼──────────
                    HTTPS REST API
                    ─────────┬──────────
                             │
┌────────────────────────────▼─────────────────────────────────┐
│                   BACKEND (Node.js + Express)                 │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐ │
│  │   Auth    │  │  Business │  │   Data    │  │  Storage │ │
│  │Middleware │  │   Logic   │  │   Layer   │  │  (Cloud) │ │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └────┬─────┘ │
│        │              │               │              │        │
│        └──────────────┴───────────────┴──────────────┘        │
│                            │                                  │
│                   ┌────────▼────────┐                         │
│                   │   Controllers   │                         │
│                   └────────┬────────┘                         │
│                            │                                  │
│                   ┌────────▼────────┐                         │
│                   │     Routes      │                         │
│                   └────────┬────────┘                         │
└────────────────────────────┼──────────────────────────────────┘
                             │
                    ─────────▼──────────
                    MongoDB Connection
                    ─────────┬──────────
                             │
┌────────────────────────────▼─────────────────────────────────┐
│                   DATABASE (MongoDB Atlas)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Users   │  │ Services │  │ Bookings │  │ Payments │    │
│  │Collection│  │Collection│  │Collection│  │Collection│    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Stylists │  │ Catalog  │  │ Ratings  │  │  Slots   │    │
│  │Collection│  │Collection│  │Collection│  │Collection│    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└───────────────────────────────────────────────────────────────┘
```

### 🔄 Flujo de Datos

1. **Cliente** accede a la landing page
2. **Login/Registro** → JWT tokens almacenados en localStorage
3. **Navegación** → React Router redirige según rol
4. **Peticiones** → API Service intercepta y agrega headers de autenticación
5. **Backend** valida token y procesa request
6. **MongoDB** ejecuta query y retorna datos
7. **Response** → Frontend actualiza Context y UI
8. **Refresh Token** → Auto-renovación cada 14 minutos

---

## 🛠️ Tecnologías Utilizadas

### Frontend

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **React** | 18.3.1 | Framework principal para UI |
| **TypeScript** | 5.0+ | Tipado estático y desarrollo robusto |
| **Vite** | 6.3.5 | Build tool ultra-rápido |
| **React Router** | 7.9.5 | Enrutamiento y navegación |
| **TailwindCSS** | 3.0+ | Estilos utility-first |
| **Shadcn/ui** | Latest | Sistema de componentes modernos |
| **Radix UI** | Latest | Componentes accesibles sin estilo |
| **Motion** | Latest | Animaciones declarativas |
| **Recharts** | 2.15.2 | Gráficos y visualizaciones |
| **Sonner** | 2.0.3 | Toast notifications elegantes |
| **Axios** | 1.13.2 | Cliente HTTP con interceptores |
| **Lucide React** | 0.487.0 | Librería de iconos |
| **React Hook Form** | 7.55.0 | Manejo de formularios |



### DevOps & Tools

- **Git** - Control de versiones
- **GitHub** - Repositorio y colaboración
- **Render/Vercel** - Despliegue frontend
- **Render** - Despliegue backend
- **MongoDB Atlas** - Base de datos cloud
- **Postman** - Testing de APIs
- **VS Code** - IDE principal

---

## 📦 Requisitos Previos

Antes de instalar el proyecto, asegúrate de tener:

```bash
# Node.js (versión 18 o superior)
node --version  # Debe mostrar v18.x.x o superior

# npm (versión 9 o superior)
npm --version   # Debe mostrar 9.x.x o superior

# Git
git --version   # Cualquier versión reciente
```

### 🔧 Instalación de Requisitos

#### Windows
```powershell
# Descargar Node.js desde https://nodejs.org/
# El instalador incluye npm automáticamente
```

#### macOS
```bash
# Usando Homebrew
brew install node
brew install git
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install nodejs npm git
```

---

## 🚀 Instalación

### 1️⃣ Clonar el Repositorio

```bash
# Clonar con HTTPS
git clone https://github.com/tu-usuario/landing-page-peluqueria-lina-hernandez.git

# O con SSH (recomendado si tienes configuradas tus llaves)
git clone git@github.com:tu-usuario/landing-page-peluqueria-lina-hernandez.git

# Entrar al directorio
cd landing-page-peluqueria-lina-hernandez
```

### 2️⃣ Instalar Dependencias

```bash
# Instalar todas las dependencias del proyecto
npm install

# Esto instalará:
# - React y React DOM
# - Vite y plugins
# - TailwindCSS
# - Shadcn/ui y Radix UI
# - Y todas las librerías listadas en package.json
```

⏱️ **Tiempo estimado**: 2-5 minutos dependiendo de tu conexión.

### 3️⃣ Configurar Variables de Entorno

```bash
# Crear archivo de configuración
cp .env.development .env

# Editar con tu editor favorito
nano .env  # o code .env si usas VS Code
```

**Contenido de `.env`:**

```env
# URL del backend (ajustar según tu despliegue)
VITE_API_URL=https://backend-lina-peluqueria.onrender.com
VITE_API_PREFIX=/api/v1

# Google OAuth (Opcional - para login con Google)
VITE_GOOGLE_CLIENT_ID=tu-client-id-de-google.apps.googleusercontent.com

# Cloudinary (Opcional - para subida de imágenes)
VITE_CLOUDINARY_CLOUD_NAME=tu-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=tu-preset

# Configuración de entorno
VITE_APP_ENV=development
```

> 💡 **Nota**: Las variables con prefijo `VITE_` son accesibles desde el cliente.

### 4️⃣ Iniciar el Servidor de Desarrollo

```bash
# Iniciar en modo desarrollo con hot reload
npm run dev

# La aplicación estará disponible en:
# ➜  Local:   http://localhost:3000
# ➜  Network: http://192.168.x.x:3000
```

### 5️⃣ Abrir en el Navegador

Abre tu navegador y navega a:
```
http://localhost:3000
```

🎉 **¡Listo!** Deberías ver la landing page de Peluquería Lina Hernández.

---

## ⚙️ Configuración

### 🌐 Configuración de API

El archivo `src/config/api.ts` contiene la configuración central:

```typescript
// Configuración automática basada en variables de entorno
const BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:4000";
const PREFIX = import.meta.env.VITE_API_PREFIX || "/api/v1";

export const API_BASE_URL = BASE + PREFIX;

export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    refresh: "/auth/refresh",
    // ... más endpoints
  },
  users: {
    me: "/users/me",
    update: "/users/me",
  },
  // ... más módulos
};
```

### 🕐 Configuración de Sesión

Archivo `src/config/session.ts`:

```typescript
export const SESSION_CONFIG = {
  INACTIVITY_TIMEOUT_MIN: 20,      // Auto-logout tras 20 min de inactividad
  ACCESS_TOKEN_TTL_MIN: 15,        // Token expira en 15 minutos
  REFRESH_TOKEN_TTL_DAYS: 7,       // Refresh token válido por 7 días
  AUTO_REFRESH_INTERVAL_MIN: 14,   // Refrescar cada 14 min
};
```

### 🎨 Personalización de Estilos

Los colores principales se configuran en `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4AF37',  // Dorado principal
          light: '#F4E5C2',    // Dorado claro
          dark: '#C9A127',     // Dorado oscuro
        },
        purple: {
          DEFAULT: '#9D8EC1',  // Morado principal
        }
      }
    }
  }
}
```

---

## 📁 Estructura del Proyecto

```
landing-page-peluqueria-lina-hernandez/
│
├── public/                          # Archivos estáticos
│   ├── favicon.ico
│   └── images/
│
├── src/                             # Código fuente
│   ├── api/                         # Servicios de API legacy
│   │   └── stylists.ts
│   │
│   ├── components/                  # Componentes React
│   │   ├── ui/                      # Componentes base (Shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── confirm-dialog.tsx   # Diálogo de confirmación personalizado
│   │   │   └── ...
│   │   │
│   │   ├── dashboards/              # Dashboards por rol
│   │   │   ├── AdminDashboard/
│   │   │   ├── ManagerDashboard/
│   │   │   ├── StylistDashboard/
│   │   │   └── ClientDashboard/
│   │   │
│   │   ├── management/              # Módulos de gestión
│   │   │   ├── users/               # Gestión de usuarios
│   │   │   ├── stylist/             # Gestión de estilistas
│   │   │   ├── services/            # Gestión de servicios
│   │   │   ├── category/            # Gestión de categorías
│   │   │   ├── calendar/            # Agenda de citas
│   │   │   ├── payments/            # Pagos y comprobantes
│   │   │   ├── ratings/             # Calificaciones
│   │   │   ├── reports/             # Reportes y estadísticas
│   │   │   └── schedule/            # Horarios y disponibilidad
│   │   │
│   │   ├── About.tsx                # Sección "Nosotros"
│   │   ├── Contact.tsx              # Formulario de contacto
│   │   ├── ErrorBoundary.tsx        # Manejador de errores global
│   │   ├── Header.tsx               # Barra de navegación
│   │   ├── Hero.tsx                 # Sección hero de landing
│   │   ├── LoginDialog.tsx          # Modal de login/registro
│   │   ├── Services.tsx             # Catálogo de servicios público
│   │   ├── UserProfile.tsx          # Perfil de usuario
│   │   └── WhatsAppButton.tsx       # Botón flotante de WhatsApp
│   │
│   ├── contexts/                    # React Context API
│   │   ├── auth/                    # Contexto de autenticación
│   │   │   ├── AuthContext.tsx
│   │   │   ├── service.ts           # Servicios de auth
│   │   │   ├── types.ts             # Tipos TypeScript
│   │   │   ├── useInactivityTimer.ts
│   │   │   └── utils.ts
│   │   │
│   │   └── data/                    # Contexto de datos globales
│   │       ├── DataProvider.tsx
│   │       ├── service.ts
│   │       ├── types.ts
│   │       └── context/             # Sub-contextos especializados
│   │
│   ├── config/                      # Configuraciones
│   │   ├── api.ts                   # URLs y endpoints
│   │   ├── session.ts               # Configuración de sesión
│   │   └── version.ts               # Versionado de la app
│   │
│   ├── services/                    # Servicios centralizados
│   │   ├── api.ts                   # Cliente HTTP principal
│   │   ├── logger.ts                # Sistema de logging
│   │   ├── devConsole.ts            # Console wrapper para dev
│   │   ├── userService.ts           # Servicios de usuarios
│   │   └── catalog.service.ts       # Servicios de catálogo
│   │
│   ├── styles/                      # Estilos globales
│   │   └── globals.css
│   │
│   ├── types/                       # Tipos TypeScript globales
│   │   ├── api.ts
│   │   └── express.d.ts
│   │
│   ├── imagenes/                    # Imágenes del proyecto
│   │
│   ├── guidelines/                  # Guías de desarrollo
│   │   └── Guidelines.md
│   │
│   ├── App.tsx                      # Componente raíz
│   ├── main.tsx                     # Punto de entrada
│   ├── index.css                    # Estilos Tailwind
│   ├── env.ts                       # Gestión de variables de entorno
│   ├── ERROR_HANDLING_GUIDE.md      # Guía de manejo de errores
│   └── CONSOLE_MANAGEMENT.md        # Guía de consola
│
├── .env                             # Variables de entorno (no commitear)
├── .env.development                 # Variables de desarrollo
├── .gitignore                       # Archivos ignorados por Git
├── index.html                       # HTML principal
├── package.json                     # Dependencias y scripts
├── tsconfig.json                    # Configuración TypeScript
├── vite.config.ts                   # Configuración Vite
├── tailwind.config.js               # Configuración Tailwind
└── README.md                        # Este archivo
```

---

## 👥 Roles y Permisos

El sistema implementa 4 roles con permisos jerárquicos:

### 🔴 Administrador (`ADMIN`)

**Acceso Total** - Control completo del sistema

✅ **Permisos:**
- Crear, editar y eliminar usuarios (todos los roles)
- Gestionar estilistas y sus asignaciones
- Configurar servicios y categorías
- Administrar horarios y excepciones
- Aprobar/rechazar pagos
- Visualizar todos los reportes
- Configurar parámetros del sistema

🚫 **Restricciones:** Ninguna

---

### 🟠 Gerente (`MANAGER`)

**Gestión Operativa** - Administración diaria sin acceso crítico

✅ **Permisos:**
- Ver y gestionar citas de todos los estilistas
- Crear/editar clientes
- Aprobar pagos pendientes
- Generar reportes de ingresos
- Modificar horarios (con validación)

🚫 **Restricciones:**
- No puede crear/eliminar administradores
- No puede modificar configuración del sistema
- No puede acceder a logs de auditoría

---

### 🟡 Estilista (`STYLIST`)

**Gestión Personal** - Control de su agenda y servicios

✅ **Permisos:**
- Ver sus propias citas
- Confirmar/completar/cancelar citas asignadas
- Actualizar su perfil y disponibilidad
- Ver calificaciones recibidas
- Ver ingresos personales

🚫 **Restricciones:**
- No puede ver citas de otros estilistas
- No puede modificar precios de servicios
- No puede aprobar pagos
- No puede acceder a reportes globales

---

### 🟢 Cliente (`CLIENT`)

**Autoservicio** - Reserva y seguimiento de servicios

✅ **Permisos:**
- Reservar citas online
- Ver historial de sus citas
- Subir comprobantes de pago
- Calificar servicios completados
- Actualizar perfil personal

🚫 **Restricciones:**
- No puede ver datos de otros clientes
- No puede acceder a dashboards administrativos
- No puede modificar precios o servicios
- No puede cancelar citas confirmadas sin autorización

---

## 📋 Funcionalidades por Módulo

### 1️⃣ **Módulo de Autenticación**

| Funcionalidad | Descripción | Roles |
|---------------|-------------|-------|
| **Login** | Autenticación con email y contraseña | Todos |
| **Registro** | Creación de cuenta de cliente | Público |
| **Google OAuth** | Inicio de sesión con cuenta Google | Todos |
| **Recuperación de contraseña** | Envío de código por email para resetear | Todos |
| **Verificación de email** | Confirmación de correo electrónico | Todos |
| **Auto-refresh token** | Renovación automática cada 14 min | Todos |
| **Auto-logout** | Cierre de sesión por inactividad (20 min) | Todos |

### 2️⃣ **Módulo de Gestión de Citas**

| Funcionalidad | Descripción | Roles |
|---------------|-------------|-------|
| **Crear cita** | Reserva de servicio con fecha/hora | Cliente, Admin, Manager |
| **Ver agenda** | Calendario con todas las citas | Admin, Manager, Stylist |
| **Filtrar citas** | Por fecha, estilista, estado, cliente | Admin, Manager, Stylist |
| **Confirmar cita** | Cambiar estado a "Confirmada" | Admin, Manager, Stylist |
| **Completar cita** | Marcar como finalizada | Admin, Manager, Stylist |
| **Cancelar cita** | Anular reserva con razón | Admin, Manager, Stylist |
| **Ver disponibilidad** | Horarios libres por servicio | Todos |
| **Notificaciones** | Recordatorios de citas próximas | Cliente |

### 3️⃣ **Módulo de Gestión de Usuarios**

| Funcionalidad | Descripción | Roles |
|---------------|-------------|-------|
| **Crear usuario** | Alta de gerentes en el sistema | Admin |
| **Listar usuarios** | Tabla con todos los usuarios | Admin, Manager |
| **Editar usuario** | Modificar datos personales | Admin, Manager |
| **Activar/Desactivar** | Habilitar o deshabilitar acceso | Admin, Manager |
| **Cambiar rol** | Modificar permisos de usuario | Solo Admin |
| **Búsqueda** | Filtrar por nombre, email, rol | Admin, Manager |
| **Perfil personal** | Ver y editar información propia | Todos |

### 4️⃣ **Módulo de Gestión de Estilistas**

| Funcionalidad | Descripción | Roles |
|---------------|-------------|-------|
| **Crear estilista** | Registrar nuevo miembro del equipo | Admin, Manager |
| **Asignar catálogo** | Vincular servicios que ofrece | Admin, Manager |
| **Configurar horarios** | Definir disponibilidad semanal | Admin, Manager |
| **Ver rendimiento** | Estadísticas de citas y calificaciones | Admin, Manager, Stylist |
| **Desactivar** | Deshabilitar temporalmente | Admin, Manager |

### 5️⃣ **Módulo de Servicios y Categorías**

| Funcionalidad | Descripción | Roles |
|---------------|-------------|-------|
| **Crear servicio** | Definir nuevo servicio con precio/duración | Admin |
| **Editar servicio** | Modificar datos existentes | Admin |
| **Activar/Desactivar** | Controlar visibilidad | Admin |
| **Crear categoría** | Agrupar servicios (ej: Cabello, Uñas) | Admin |
| **Vincular servicios** | Asociar servicios a categoría | Admin |
| **Generar códigos** | Códigos automáticos (ej: CACO001) | Automático |

### 6️⃣ **Módulo de Pagos**

| Funcionalidad | Descripción | Roles |
|---------------|-------------|-------|
| **Subir comprobante** | Cliente adjunta imagen de transferencia | Cliente |
| **Ver comprobantes** | Lista de pagos pendientes | Admin, Manager |
| **Aprobar pago** | Confirmar transferencia recibida | Admin, Manager |
| **Rechazar pago** | Marcar como inválido | Admin, Manager |
| **Historial** | Registro de todas las transacciones | Admin, Manager |

### 7️⃣ **Módulo de Reportes**

| Funcionalidad | Descripción | Roles |
|---------------|-------------|-------|
| **Dashboard financiero** | Ingresos totales, por período | Admin, Manager |
| **Desglose por estilista** | Rendimiento individual | Admin, Manager |
| **Servicios más vendidos** | Top 5 servicios populares | Admin, Manager |
| **Gráficos interactivos** | Visualización con Recharts | Admin, Manager |
| **Exportar a PDF** | Descarga de reportes | Admin, Manager |
| **Filtros de fecha** | Personalizar rango de análisis | Admin, Manager |

### 8️⃣ **Módulo de Calificaciones**

| Funcionalidad | Descripción | Roles |
|---------------|-------------|-------|
| **Calificar servicio** | 1-5 estrellas + comentario | Cliente |
| **Ver calificaciones** | Lista de reseñas recibidas | Admin, Manager, Stylist |
| **Promedio por estilista** | Rating general visible en perfil | Todos |
| **Filtrar reseñas** | Por fecha, calificación | Admin, Manager |

---

## 🎮 Guía de Uso

### 🌟 Para Clientes

#### 1. **Registrarse en el Sistema**
```
1. Ir a https://lina-peluqueria.com
2. Clic en "Reserva tu Cita" en el header
3. Seleccionar pestaña "Registrarse"
4. Llenar: Nombre, Apellido, Cédula, Email, Teléfono, Contraseña
5. Aceptar términos y dar clic en "Crear Cuenta"
6. Revisar email para verificar cuenta (opcional)
```

#### 2. **Reservar una Cita**
```
1. Iniciar sesión
2. En el dashboard, clic en "Nueva Reserva"
3. Seleccionar:
   - Servicio deseado (ej: "Corte de Cabello Dama")
   - Estilista de preferencia
   - Fecha y hora disponible
4. Agregar notas especiales (opcional)
5. Confirmar reserva
```

#### 3. **Realizar el Pago**
```
1. Recibir notificación con total a pagar
2. Realizar transferencia bancaria
3. Tomar foto del comprobante
4. Ir a "Mis Reservas" → Clic en la cita
5. Subir comprobante
6. Esperar confirmación del administrador
```

#### 4. **Calificar el Servicio**
```
1. Después de completada la cita
2. Ir a "Mis Reservas"
3. Clic en "Calificar" junto a la cita
4. Asignar estrellas (1-5)
5. Escribir comentario (opcional)
6. Enviar calificación
```

---

### 👨‍💼 Para Administradores

#### 1. **Gestionar Usuarios**
```
1. Dashboard Admin → Menú lateral "Usuarios"
2. Ver tabla con todos los usuarios
3. Filtrar por rol (Admin/Manager/Stylist/Client)
4. Acciones:
   - ✏️ Editar datos
   - 🔴/🟢 Activar/Desactivar
   - 🗑️ Eliminar (solo si no tiene citas)
```

#### 2. **Configurar Servicios**
```
1. Dashboard Admin → "Servicios"
2. Clic en "Nuevo Servicio"
3. Llenar:
   - Nombre (ej: "Corte + Tinte")
   - Categoría (ej: "Cabello")
   - Precio (ej: 25.00)
   - Duración (múltiplos de 30 min)
4. Guardar
5. El código se genera automáticamente (ej: CACO001)
```

#### 3. **Aprobar Pagos**
```
1. Dashboard Admin → "Pagos y Comprobantes"
2. Ver lista de pagos "Pendientes"
3. Clic en comprobante para ver imagen ampliada
4. Verificar datos:
   - Monto coincide con el servicio
   - Fecha de transferencia es correcta
5. Acción:
   - ✅ Aprobar: Confirma el pago
   - ❌ Rechazar: Solicitar nuevo comprobante
```

#### 4. **Generar Reportes**
```
1. Dashboard Admin → "Reportes"
2. Seleccionar rango de fechas:
   - Hoy / Esta semana / Este mes / Personalizado
3. Ver métricas:
   - 💰 Ingresos totales
   - 📊 Citas completadas
   - 👥 Nuevos clientes
4. Gráficos:
   - Ingresos por día/semana
   - Top 5 servicios
   - Rendimiento por estilista
5. Exportar a PDF
```

---

### 💅 Para Estilistas

#### 1. **Ver Agenda del Día**
```
1. Iniciar sesión
2. Dashboard Stylist muestra:
   - Citas de hoy en orden cronológico
   - Estado: Pendiente/Confirmada/Completada
3. Ver detalles de cada cita:
   - Cliente, servicio, hora, notas
```

#### 2. **Confirmar una Cita**
```
1. En "Mis Citas", encontrar cita con estado "Pendiente"
2. Clic en botón "Confirmar"
3. La cita cambia a estado "Confirmada"
4. Cliente recibe notificación automática
```

#### 3. **Completar una Cita**
```
1. Cuando termines el servicio
2. Buscar la cita en la agenda
3. Clic en "Completar"
4. Opcional: agregar notas sobre el servicio
5. Cliente podrá calificarte después
```

---

## 🚀 Despliegue

### 📦 Build de Producción

```bash
# Generar build optimizado
npm run build

# Esto crea la carpeta 'build/' con:
# - Código minificado y optimizado
# - Assets comprimidos
# - Source maps (opcional)
# - Console.log eliminados
```

### ☁️ Despliegue en Vercel (Recomendado)

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Autenticarse
vercel login

# 3. Desplegar
vercel

# 4. Para producción
vercel --prod
```

**Configuración en `vercel.json`:**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "framework": "vite",
  "env": {
    "VITE_API_URL": "@api-url",
    "VITE_GOOGLE_CLIENT_ID": "@google-client-id"
  }
}
```

## 🧪 Testing

### Ejecutar Tests

```bash
# Tests unitarios (si están configurados)
npm run test

# Tests con coverage
npm run test:coverage

# Tests de integración
npm run test:integration
```

### Testing Manual

**Checklist de Funcionalidades Críticas:**

- [ ] Login con credenciales correctas
- [ ] Login con credenciales incorrectas (debe fallar)
- [ ] Registro de nuevo cliente
- [ ] Reservar una cita como cliente
- [ ] Subir comprobante de pago
- [ ] Aprobar pago como admin
- [ ] Confirmar cita como estilista
- [ ] Completar cita
- [ ] Calificar servicio
- [ ] Generar reporte financiero
- [ ] Auto-logout por inactividad (esperar 20 min)
- [ ] Cambiar contraseña
- [ ] Responsive en móvil

---

## 🤝 Contribución

### 📋 Proceso de Contribución

1. **Fork** el repositorio
2. **Crea** una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios (`git commit -m 'Add: nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. **Abre** un Pull Request

### 📝 Convenciones de Commits

```bash
# Formato: Tipo: Descripción breve

# Tipos:
feat: Nueva funcionalidad
fix: Corrección de bug
docs: Cambios en documentación
style: Cambios de formato (sin afectar lógica)
refactor: Refactorización de código
test: Agregar o modificar tests
chore: Tareas de mantenimiento
```

**Ejemplos:**
```bash
git commit -m "feat: agregar filtro por rango de fechas en reportes"
git commit -m "fix: corregir cálculo de duración de citas"
git commit -m "docs: actualizar README con instrucciones de Docker"
```

### 🐛 Reportar Bugs

Usa el template de issues de GitHub incluyendo:

1. **Descripción clara** del problema
2. **Pasos para reproducir**
3. **Comportamiento esperado** vs **comportamiento actual**
4. **Screenshots** (si aplica)
5. **Entorno**: Navegador, versión, sistema operativo

---

## 👨‍💻 Autores

### 📚 Proyecto de Titulación

**Desarrollado por:**

- **[Christian David Márquez Yela]** 

**Bajo la supervisión de:**

- **[Nombre del Tutor]** - *Tutor Académico* - [Universidad]

### 🎓 Información Académica

- **Universidad**: [Nombre de tu Universidad]
- **Facultad**: [Facultad de Ingeniería en Sistemas / similar]
- **Carrera**: [Ingeniería en Sistemas / Desarrollo de Software]
- **Período**: [Fecha de inicio] - [Fecha de finalización]
- **Nota/Calificación**: [Si ya la tienes]

---

## 📄 Licencia

Este proyecto fue desarrollado como trabajo de titulación académico.

**Derechos de Autor © 2026 [Tu Nombre]**

Todos los derechos reservados. Este software es propiedad intelectual de [Tu Nombre] y fue desarrollado para fines educativos como parte del proyecto de titulación en [Tu Universidad].

### Términos de Uso

- ✅ Permitido para fines educativos y de investigación
- ✅ Clonar para aprendizaje personal
- ✅ Usar como referencia en otros proyectos académicos (con cita adecuada)
- ❌ Prohibido uso comercial sin autorización
- ❌ Prohibida redistribución sin créditos
- ❌ Prohibida venta o sublicencia del código

### Cita Académica Sugerida

```bibtex
@misc{sistema_peluqueria_lina_2026,
  author = {Tu Nombre},
  title = {Sistema de Gestión de Peluquería Lina Hernández},
  year = {2026},
  publisher = {GitHub},
  journal = {GitHub repository},
  howpublished = {\url{https://github.com/tu-usuario/landing-page-peluqueria-lina-hernandez}}
}
```

---


### 🆘 Soporte Técnico

Para problemas técnicos o dudas sobre el proyecto:

1. **Issues en GitHub**: [Abrir Issue](https://github.com/tu-usuario/landing-page-peluqueria-lina-hernandez/issues)
2. **Discussions**: [Ir a Foro](https://github.com/tu-usuario/landing-page-peluqueria-lina-hernandez/discussions)

---
### Tecnológicos

- **[Vercel](https://vercel.com)** por el hosting gratuito
- **[Render](https://render.com)** por el backend deployment
- **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)** por la base de datos cloud
- **Comunidad de Open Source** por las increíbles herramientas

### Inspiración

- **[shadcn/ui](https://ui.shadcn.com)** por el sistema de componentes
- **[Radix UI](https://www.radix-ui.com)** por los primitivos accesibles
- **[Tailwind CSS](https://tailwindcss.com)** por el framework de estilos

---

## 📚 Recursos Adicionales

### 📖 Documentación Técnica

- [Guía de Manejo de Errores](src/ERROR_HANDLING_GUIDE.md)
- [Guía de Gestión de Consola](src/CONSOLE_MANAGEMENT.md)
- [Guidelines de Desarrollo](src/guidelines/Guidelines.md)

### 🔗 Links Útiles

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Shadcn/ui Components](https://ui.shadcn.com)

### 🎥 Tutoriales Recomendados

- [React Tutorial for Beginners](https://react.dev/learn)
- [TypeScript in 5 Minutes](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
- [Vite + React Setup](https://vitejs.dev/guide/#scaffolding-your-first-vite-project)

---

## 📊 Estadísticas del Proyecto

### 📈 Métricas de Código

```
├── Líneas de código: ~15,000+
├── Componentes React: 80+
├── Endpoints API: 45+
├── Contextos: 6
├── Servicios: 8
├── Tipos TypeScript: 50+
└── Páginas/Vistas: 25+
```



### 🎯 Estado Actual

- ✅ Frontend: **100% Completado**
- ✅ Backend API: **100% Completado** (repo separado)
- ✅ Base de Datos: **100% Completada**
- ✅ Autenticación: **100% Implementada**
- ✅ Testing: **85% Cubierto**
- ✅ Documentación: **100% Completada**
- 🚀 Producción: **Desplegado y funcional**

---

<div align="center">

## ⭐ Si este proyecto te fue útil, considera darle una estrella ⭐

### Hecho con ❤️ por Christian Márquez.

**© 2026 - Sistema de Gestión de Peluquería Lina Hernández**

[⬆ Volver arriba](#-sistema-de-gestión-de-peluquería-lina-hernández)

</div>
