# Cartia — cartas digitales por QR (multi-restaurante)

Incluye: carta pública con pedidos desde la mesa, comandero para camareros (los
pedidos pasan por el camarero antes de ir a cocina) y lista de turno/cola de
espera — todo en tiempo real sobre Firestore.

## 1. Crear el proyecto en Firebase
1. Ve a https://console.firebase.google.com → **Crear proyecto**.
2. Dentro del proyecto, activa:
   - **Authentication** → método **Email/contraseña** (Sign-in method → Email/Password → Habilitar).
   - **Firestore Database** → crear base de datos (modo producción).
3. En **Configuración del proyecto → Tus apps**, añade una app web y copia el objeto `firebaseConfig`.

## 2. Configurar el proyecto local
```bash
npm install
cp .env.example .env
```
Rellena `.env` con los datos de `firebaseConfig` del paso anterior, y pon en `VITE_PUBLIC_URL`
el dominio donde vas a publicar (por ejemplo `https://carta.tuapp.es`).

## 3. Subir las reglas de seguridad
Instala Firebase CLI si no la tienes (`npm i -g firebase-tools`), luego:
```bash
firebase login
firebase init firestore   # selecciona tu proyecto, acepta el archivo firestore.rules existente
firebase deploy --only firestore:rules
```
Esto asegura que **cada restaurante solo lo puede editar su dueño**, y que la carta pública
se puede leer sin necesidad de iniciar sesión (para que funcione el QR).

## 4. Probar en local
```bash
npm run dev
```
- `/planes` — página de precios para enseñar a un bar
- `/login` — crear cuenta o entrar
- `/panel` — lista de tus restaurantes
- `/panel/{slug}` — editar un restaurante (incluye pestañas **Pedidos** y **Lista de turno**)
- `/{slug}` — lo que ve el cliente al escanear el QR (con "Mi Mesa" y "Lista de turno")

## 5. Desplegar en Netlify
1. Sube este proyecto a un repositorio de GitHub.
2. En Netlify: **Add new site → Import from Git**, selecciona el repo.
3. En **Site settings → Environment variables**, añade las mismas variables del `.env`.
4. Netlify detecta `netlify.toml` automáticamente (build `npm run build`, carpeta `dist`).

## Cómo vender esto a un bar
1. Crea su restaurante desde `/panel` (o hazlo con su email si quieres que administre él mismo).
2. Ve a la pestaña **Código QR** dentro de su panel, descarga el QR y llévaselo impreso.
3. Cóbrale según el plan elegido en `/planes` (el límite de categorías/idiomas se aplica
   automáticamente según el campo `plan` del restaurante, editable en **Datos del local**).

## Nota sobre el cobro real
Esta versión controla los límites de cada plan (categorías, idiomas) pero no cobra
automáticamente — el cobro mensual lo gestionas tú (Bizum, transferencia, o más adelante
Stripe) y simplemente cambias el campo "Plan contratado" del restaurante cuando corresponda.
