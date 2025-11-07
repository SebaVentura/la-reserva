Proyecto La Reserva
Aplicación web comunitaria desarrollada en React + Vite para fomentar la separación de residuos en origen, el registro de aportes vecinales y la generación de reportes ambientales. Incluye un módulo de procesamiento de imágenes con inteligencia artificial (IA) entrenado con Teachable Machine (TensorFlow.js) para identificar materiales reciclables como aluminio, cartón y vidrio.
🚀 Tecnologías utilizadas
Área	Tecnología
Frontend	React (Vite) + TailwindCSS
Animaciones	Framer Motion
Iconografía	Lucide React
Gráficos	Recharts
Backend	Firebase (Firestore + Storage)
IA / ML	TensorFlow.js + Teachable Machine
Estado local	useState / useEffect / localStorage
🧠 Funcionalidades principales
•	🏠 Módulo principal: navegación simple entre secciones (Inicio, Guía, Aportes, Recordatorios, Comunidad, Reportes, Admin).
•	♻️ Aportes vecinales: formulario con alias, cantidad, limpieza, notas y sugerencias educativas automáticas.
•	🧩 Comunidad: gráficos de barras y series temporales sobre aportes.
•	🧠 Procesamiento de imágenes con IA: detección de materiales (Aluminio, Cartón, Vidrio, Otros) mediante TensorFlow.js.
•	☁️ Integración con Firebase: base de datos Firestore, almacenamiento de aportes y conexión futura con Storage.
📂 


Estructura de carpetas

la-reserva/
├── public/
│   ├── modelo-materiales/
│   │   ├── model.json
│   │   ├── metadata.json
│   │   └── weights.bin
│   └── favicon.ico
├── src/
│   ├── components/
│   ├── services/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
└── README.md

⚙️ Instalación y ejecución local
1. Clonar el repositorio:
   git clone https://github.com/tuusuario/la-reserva.git
   cd la-reserva
2. Instalar dependencias:
   npm install
3. Ejecutar el entorno local:
   npm run dev
   Acceder en http://localhost:5174/la-reserva/
🔧 Configuración de Firebase
1. Crear un proyecto en Firebase Console.
2. Agregar una app web y copiar las credenciales.
3. Crear el archivo src/services/firebaseConfig.js con el contenido del objeto firebaseConfig.
🧠 Entrenamiento del modelo IA
Entrenar el modelo en Teachable Machine con al menos 20 imágenes por clase: Aluminio, Carton, Vidrio, Otros. Exportar como TensorFlow.js y colocar los archivos en /public/modelo-materiales/.
🧾 Créditos y autoría
Proyecto académico desarrollado por Sebastián Ventura  y Wilson Briceño 
Tecnicatura en Ciencia de Datos e Inteligencia Artificial — ISFT N°190
Bahía Blanca, Argentina.
Contacto: sventura76.sv@gmail.com   -  
📄 Licencia
Este proyecto se distribuye bajo licencia MIT. Puede usarse, modificarse y redistribuirse libremente conservando los créditos del autor original.

La Reserva Project
A community web application developed in React + Vite to promote waste separation at the source, register neighborhood contributions, and generate environmental reports. It includes an image processing module with artificial intelligence (AI) trained with Teachable Machine (TensorFlow.js) to identify recyclable materials such as aluminum, cardboard, and glass.

🚀 Technologies Used
Technology Area
Frontend: React (Vite) + Tailwind CSS
Animations: Framer Motion
Iconography: Lucide React
Graphics: Recharts
Backend: Firebase (Firestore + Storage)
AI/ML: TensorFlow.js + Teachable Machine
Local State: useState / useEffect / localStorage

🧠 Main Features

• 🏠 Main Module: Simple navigation between sections (Home, Guide, Contributions, Reminders, Community, Reports, Admin).

• ♻️ Neighborhood contributions: Form with aliases, quantity, cleanliness, notes, and automatic educational suggestions.

🧩 Community: Bar charts and time series on contributions.

🧠 AI image processing: Material detection (Aluminum, Cardboard, Glass, Others) using TensorFlow.js.

☁️ Firebase integration: Firestore database, contribution storage, and future connection to Firebase Storage.
Folder Structure

la-reserva/
├── public/
│ ├── modelo-materiales/
│ │ ├── model.json
│ │ ├── metadata.json
│ │ └── weights.bin
│ └── favicon.ico
├── src/
│ ├── components/
│ ├── services/
│ ├── App.jsx
│ ├── main.jsx
│ └── index.css
├── package.json
├── git.config.js
└── README.md

⚙️ Local Installation and Execution
1. Clone the repository:

git clone https://github.com/yourusername/la-reserva.git

cd la-reserva
2. Install dependencies:

npm install
3. Run the local environment:

npm run dev

Access at http://localhost:5174/la-reserva/
🔧 Firebase Configuration
1. Create a project in the Firebase Console.

2. Add a web app and copy the credentials.

3. Create the file src/services/firebaseConfig.js with the contents of the firebaseConfig object.

🧠 AI Model Training
Train the model on a Teachable Machine with at least 20 images per class: Aluminum, Cardboard, Glass, Other. Export as TensorFlow.js and place the files in /public/modelo-materiales/.

🧾 Credits and Authorship
Academic project developed by Sebastián Ventura and Wilson Briceño
Technical Degree in Data Science and Artificial Intelligence — ISFT N°190
Bahía Blanca, Argentina.

Contact: sventura76.sv@gmail.com - orionwilsongeo@gmail.com

📄 License
This project is distributed under the MIT License. It may be used, modified, and redistributed freely, provided that the original author is credited.



# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
