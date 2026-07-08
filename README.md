# TPE#4 - Desarrollo Web

Trabajo Práctico Especial N.º 4 de la materia **Desarrollo Web**: una aplicación full-stack de autenticación y gestión de usuarios, con login tradicional (JWT) y login social (Google OAuth 2.0).

> Repositorio de la cátedra: <https://github.com/marco-unemi/TPE-4_DW.git>

## Tabla de contenidos

1. [Descripción del proyecto y arquitectura](#1-descripción-del-proyecto-y-arquitectura)
2. [Estructura del repositorio](#2-estructura-del-repositorio)
3. [Requisitos previos](#3-requisitos-previos)
4. [Cómo obtener el connection string de MongoDB Atlas](#4-cómo-obtener-el-connection-string-de-mongodb-atlas)
5. [Cómo crear credenciales OAuth de Google](#5-cómo-crear-credenciales-oauth-de-google)
6. [Instalación y ejecución local](#6-instalación-y-ejecución-local)
7. [Variables de entorno](#7-variables-de-entorno)
8. [Documentación de la API](#8-documentación-de-la-api)
9. [Cómo probar con Postman](#9-cómo-probar-con-postman)
10. [Despliegue manual](#10-despliegue-manual)
11. [Limitaciones conocidas / próximos pasos manuales](#11-limitaciones-conocidas--próximos-pasos-manuales)
12. [Pie de página](#12-pie-de-página)

---

## 1. Descripción del proyecto y arquitectura

Este repositorio implementa una aplicación **full-stack** organizada como **monorepo**, con el frontend y el backend en carpetas independientes (`/frontend` y `/backend`) que se desarrollan, versionan y **despliegan por separado**:

- **Frontend**: React + Vite (SPA), consume la API mediante `axios` y maneja el ruteo con `react-router-dom`.
- **Backend**: Node.js + Express, con **Mongoose** como ODM sobre **MongoDB** (Atlas en producción).
- **Autenticación**: doble esquema soportado por el mismo backend:
  - **JWT** (JSON Web Token) para registro/login tradicional con email y contraseña (contraseñas hasheadas con `bcryptjs`).
  - **Google OAuth 2.0** mediante `passport` y `passport-google-oauth20`, que genera el mismo tipo de JWT al finalizar el login social, para que el frontend maneje una única forma de sesión.
- **Persistencia**: MongoDB Atlas (cluster gratuito M0) a través de Mongoose.

Flujo general: el frontend llama a la API REST del backend (`/api/...`), recibe un JWT (por login tradicional o por el callback de Google) y lo adjunta en el header `Authorization: Bearer <token>` en cada request a rutas protegidas.

---

## 2. Estructura del repositorio

Estructura real del repositorio:

```
TPE#4_DW/
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   └── src/
│       ├── app.js
│       ├── config/
│       │   ├── db.js              # conexión a MongoDB (Mongoose)
│       │   └── passport.js        # estrategia de Google OAuth
│       ├── controllers/
│       │   ├── authController.js  # register, login, googleCallback, me
│       │   └── usuarioController.js
│       ├── middleware/
│       │   ├── errorHandler.js
│       │   └── verifyToken.js     # valida el JWT (header Authorization)
│       ├── models/
│       │   └── Usuario.js         # schema con hash de password vía bcrypt
│       ├── routes/
│       │   ├── authRoutes.js
│       │   └── usuarioRoutes.js
│       └── utils/
│           └── generateToken.js
├── frontend/                      # React + Vite
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── api/
│       │   └── axios.js           # instancia axios + interceptores (JWT, 401)
│       ├── context/
│       │   └── AuthContext.jsx    # sesión (token/usuario) en localStorage
│       ├── routes/
│       │   └── ProtectedRoute.jsx
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── UsuariosDashboard.jsx
│       │   ├── OAuthCallbackPage.jsx
│       │   └── NotFoundPage.jsx
│       └── components/
│           ├── Navbar.jsx
│           ├── UsuarioTable.jsx
│           └── UsuarioForm.jsx
├── postman/
│   └── TPE4-DW.postman_collection.json
├── .gitignore
└── README.md
```

---

## 3. Requisitos previos

- **Node.js 18+** y **npm** (verificar con `node -v` y `npm -v`).
- Una cuenta de **MongoDB Atlas** (gratuita) o una instancia local de MongoDB.
- Una cuenta de **Google Cloud** (para las credenciales de OAuth).
- **Postman** (opcional, para probar la API sin frontend).
- **Git** para clonar el repositorio.

---

## 4. Cómo obtener el connection string de MongoDB Atlas

1. Creá una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) (o iniciá sesión si ya tenés una).
2. Creá un **cluster gratuito M0** (`Build a Database` → tier `M0 Free`).
3. En el menú lateral, andá a **Database Access** y creá un **usuario de base de datos** (usuario + contraseña) con permisos de lectura/escritura.
4. En el menú lateral, andá a **Network Access** y agregá una entrada `0.0.0.0/0` (`Allow access from anywhere`) para poder conectarte desde tu entorno de desarrollo. En un entorno productivo real conviene restringir esto, pero para el TPE alcanza con permitir todas las IPs.
5. Volvé a **Database** (tu cluster) y hacé clic en **Connect** → **Drivers**.
6. Copiá el **connection string (URI)** que te muestra, con el formato:
   ```
   mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```
7. Reemplazá `<password>` por la contraseña real del usuario de base de datos creado en el paso 3, y agregá el nombre de la base (por ejemplo `/tpe4_dw`) antes de los parámetros `?retryWrites=...`. Pegá ese valor completo en `MONGO_URI` dentro de tu `.env` del backend.

---

## 5. Cómo crear credenciales OAuth de Google

1. Entrá a [Google Cloud Console](https://console.cloud.google.com/) y creá un **proyecto** nuevo (o seleccioná uno existente).
2. En el menú, andá a **APIs & Services** → **OAuth consent screen**.
   - Elegí tipo de usuario **External**.
   - Completá los datos mínimos requeridos (nombre de la app, email de soporte, etc.).
   - En la sección de **Test users**, agregá tu propia cuenta de **Gmail** como usuario de prueba (necesario mientras la app no esté verificada/publicada).
3. Andá a **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**.
   - Tipo de aplicación: **Web application**.
   - En **Authorized redirect URIs**, agregá **exactamente** el valor configurado en `GOOGLE_CALLBACK_URL`. Para desarrollo local:
     ```
     http://localhost:5000/api/auth/google/callback
     ```
4. Guardá y copiá el **Client ID** y el **Client Secret** generados: van en `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` del `.env` del backend.

> El valor de **Authorized redirect URIs** en Google Cloud debe coincidir carácter por carácter con `GOOGLE_CALLBACK_URL`. Si no coinciden, el login con Google falla con el error `redirect_uri_mismatch` (ver sección 10 para el caso de producción).

---

## 6. Instalación y ejecución local

Cloná el repositorio y abrí dos terminales (una para el backend y otra para el frontend).

### Backend (puerto 5000 por defecto)

```bash
cd backend
npm install
copy .env.example .env    # en PowerShell/CMD; en bash/macOS/Linux: cp .env.example .env
# completar los valores reales en backend/.env (ver sección 7)
npm run dev
```

`npm run dev` levanta el servidor con `nodemon` en el puerto definido por `PORT` (por defecto **5000**). También existe `npm start` para levantarlo con `node` sin recarga automática (pensado para producción).

### Frontend (puerto 5173 por defecto de Vite)

```bash
cd frontend
npm install
copy .env.example .env    # en PowerShell/CMD; en bash/macOS/Linux: cp .env.example .env
# completar los valores reales en frontend/.env (ver sección 7)
npm run dev
```

Vite expone la app en `http://localhost:5173` por defecto. Con ambos servidores corriendo, el frontend (5173) consume la API del backend (5000) usando `VITE_API_URL`.

---

## 7. Variables de entorno

### `backend/.env` (basado en `backend/.env.example`)

| Variable | Descripción | Ejemplo / valor de desarrollo |
|---|---|---|
| `PORT` | Puerto en el que escucha el servidor Express | `5000` |
| `MONGO_URI` | Connection string de MongoDB (Atlas o local) | `mongodb://localhost:27017/tpe4_dw` |
| `JWT_SECRET` | Secreto usado para firmar/verificar los JWT | cadena larga y aleatoria |
| `JWT_EXPIRES_IN` | Tiempo de expiración del JWT | `1d` |
| `GOOGLE_CLIENT_ID` | Client ID de la credencial OAuth de Google | provisto por Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Client Secret de la credencial OAuth de Google | provisto por Google Cloud Console |
| `GOOGLE_CALLBACK_URL` | URL de callback registrada en Google Cloud | `http://localhost:5000/api/auth/google/callback` |
| `FRONTEND_URL` | URL del frontend, usada para CORS y para el redirect post-login de Google | `http://localhost:5173` |

### `frontend/.env` (basado en `frontend/.env.example`)

| Variable | Descripción | Ejemplo / valor de desarrollo |
|---|---|---|
| `VITE_API_URL` | URL base de la API del backend, usada por `axios` | `http://localhost:5000/api` |

---

## 8. Documentación de la API

URL base local: `http://localhost:5000/api`

### Autenticación — `/api/auth`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/register` | Pública | Registra un usuario nuevo (`nombre`, `email`, `password`). Devuelve `{ token, usuario }`. |
| `POST` | `/api/auth/login` | Pública | Login con `email` y `password`. Devuelve `{ token, usuario }`. Si la cuenta fue creada con Google (sin password), responde 400 indicando que debe iniciar sesión con Google. |
| `GET` | `/api/auth/google` | Pública | Inicia el flujo de OAuth: redirige a la pantalla de consentimiento de Google. |
| `GET` | `/api/auth/google/callback` | Pública (callback de Google) | Callback que Google invoca tras el login. Genera un JWT y redirige al frontend a `FRONTEND_URL/oauth-callback?token=<jwt>`. |
| `GET` | `/api/auth/me` | Protegida (JWT) | Devuelve los datos del usuario autenticado a partir del token. |

### Usuarios — `/api/usuarios`

Todas las rutas de este recurso requieren JWT (aplicado a nivel de router).

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/usuarios` | Protegida (JWT) | Lista todos los usuarios. |
| `GET` | `/api/usuarios/:id` | Protegida (JWT) | Obtiene un usuario por su `id`. |
| `PUT` | `/api/usuarios/:id` | Protegida (JWT) | Actualiza `nombre`, `email` y/o `password` de un usuario. |
| `DELETE` | `/api/usuarios/:id` | Protegida (JWT) | Elimina un usuario por su `id`. |

Para las rutas protegidas, el token debe enviarse en el header:

```
Authorization: Bearer <token>
```

---

## 9. Cómo probar con Postman

1. Abrí Postman e importá la colección incluida en el repositorio: **`postman/TPE4-DW.postman_collection.json`** (`File` → `Import`).
2. Si la colección usa una variable `baseUrl`, configurala apuntando a tu backend local, por ejemplo `http://localhost:5000/api` (podés hacerlo desde la pestaña **Variables** de la colección).
3. Corré primero el request **Register** (o **Login**, si el usuario ya existe). La colección incluye un test script que guarda automáticamente el `token` de la respuesta en una variable de la colección/entorno.
4. Con el token ya guardado, corré los requests protegidos (`GET /api/auth/me`, `GET /api/usuarios`, etc.) — el header `Authorization` se completa solo usando esa variable.
5. **El login con Google no se puede probar desde Postman.** Ese flujo depende de la pantalla de consentimiento de Google y de un redirect en el navegador (`GET /api/auth/google`), así que solo puede probarse abriendo esa URL en un navegador con el backend y el frontend corriendo.

---

## 10. Despliegue manual

Esta sección queda documentada como guía paso a paso; **no se ejecutó ningún despliegue real** al preparar este repositorio. El usuario debe realizarlo con sus propias credenciales de Render/Vercel/Google/Atlas.

### Backend en Render

1. Entrá a [Render](https://render.com/) → **New** → **Web Service**.
2. Conectá el repositorio de GitHub del proyecto.
3. Configurá:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Cargá todas las variables de entorno del backend (ver tabla de la sección 7) en el dashboard de Render (**Environment**).
5. Tené en cuenta que el **free tier de Render** tiene *cold starts*: si el servicio estuvo inactivo, la primera request tras un período de inactividad puede tardar bastante más (hasta decenas de segundos) en responder mientras la instancia se "despierta".

### Frontend en Vercel

1. Entrá a [Vercel](https://vercel.com/) → **Add New** → **Project** (Import Project) y seleccioná el repositorio de GitHub.
2. Configurá:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Cargá la variable de entorno `VITE_API_URL` apuntando a la URL pública del backend en Render, seguida de `/api` (por ejemplo `https://tpe4-dw-backend.onrender.com/api`).

### Sincronización post-deploy (paso final, obligatorio)

Una vez que **ambos** servicios estén desplegados y tengas sus URLs definitivas:

1. En el dashboard de Render, actualizá las variables de entorno del backend:
   - `FRONTEND_URL` → URL real de producción del frontend en Vercel.
   - `GOOGLE_CALLBACK_URL` → `https://<tu-backend-en-render>/api/auth/google/callback`.
2. En Google Cloud Console (Credentials → tu OAuth Client ID), agregá esa misma URL de callback de producción como **Authorized redirect URI** (sumándola a la de desarrollo, no reemplazándola, si querés seguir probando localmente).

> Si se omite este paso, el login con Google **falla en producción** con el error `redirect_uri_mismatch`, porque la URL a la que Google redirige después del login no coincide con ninguna de las URIs autorizadas en el cliente OAuth.

---

## 11. Limitaciones conocidas / próximos pasos manuales

El código de este repositorio fue verificado con `npm install`/build y un intento de conexión a Mongo, pero **no fue probado end-to-end** contra:

- un cluster real de **MongoDB Atlas**,
- un login real con **Google OAuth**,
- los despliegues reales en **Render** y **Vercel**.

Estos pasos quedan pendientes para cuando el usuario complete sus propias credenciales (Atlas, Google Cloud, Render, Vercel) y siga las secciones 4, 5, 6 y 10 de este README.

---

## 12. Pie de página

Trabajo práctico realizado para la materia **Desarrollo Web**. Consigna y repositorio de la cátedra: <https://github.com/marco-unemi/TPE-4_DW.git>
