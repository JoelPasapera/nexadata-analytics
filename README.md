# NexaData Analytics

Plataforma web de análisis exploratorio de datos desarrollada con **TypeScript, Node.js y Fastify**. El proyecto permite cargar datasets en formato CSV y obtener automáticamente estadísticas descriptivas, detección de valores faltantes, identificación de valores atípicos y análisis de correlaciones entre variables numéricas.

## 🚀 Características principales

### 📂 Importación de datos
- Carga de archivos CSV.
- Detección automática de columnas.
- Conversión automática de valores numéricos.
- Identificación de valores nulos y faltantes.

### 📊 Análisis estadístico
Para las variables numéricas se calculan:

- Media.
- Mediana.
- Mínimo.
- Máximo.
- Varianza.
- Desviación estándar.
- Primer cuartil (Q1).
- Tercer cuartil (Q3).
- Rango intercuartílico (IQR).

### 🚨 Detección de valores atípicos

El sistema utiliza el método **IQR (Interquartile Range)** para identificar posibles outliers:

```text
Límite inferior = Q1 - 1.5 × IQR
Límite superior = Q3 + 1.5 × IQR
```

Esto permite encontrar observaciones que se alejan significativamente del comportamiento habitual de una variable.

### 🔗 Análisis de correlaciones

El sistema calcula automáticamente la correlación de Pearson entre las variables numéricas y clasifica la fuerza de la relación:

| Correlación | Interpretación |
|---:|---|
| 0.00 – 0.19 | Muy débil |
| 0.20 – 0.39 | Débil |
| 0.40 – 0.59 | Moderada |
| 0.60 – 0.79 | Fuerte |
| 0.80 – 1.00 | Muy fuerte |

La misma clasificación se aplica para correlaciones negativas utilizando su valor absoluto.

## 🏗️ Arquitectura

```text
NexaData Analytics
│
├── data/
│   └── ventas.csv
│
├── public/
│   └── index.html
│
├── src/
│   │
│   ├── routes/
│   │   └── analysis.routes.ts
│   │
│   ├── services/
│   │   ├── analysis.service.ts
│   │   ├── correlation.service.ts
│   │   ├── csv.service.ts
│   │   └── statistics.service.ts
│   │
│   ├── types/
│   │   └── dataset.ts
│   │
│   ├── utils/
│   │   └── math.ts
│   │
│   └── server.ts
│
├── package.json
└── tsconfig.json
```

## 🧩 Tecnologías

### Backend

- **Node.js**
- **TypeScript**
- **Fastify**
- **@fastify/cors**
- **@fastify/multipart**

### Procesamiento de datos

- **csv-parse**
- Funciones estadísticas implementadas en TypeScript.

### Frontend

- HTML5
- CSS3
- JavaScript

## ⚙️ Requisitos

Necesitas tener instalado:

```text
Node.js
npm
```

Se recomienda utilizar una versión moderna de Node.js compatible con ES2022.

## 📥 Instalación

Clona el repositorio:

```bash
git clone https://github.com/TU-USUARIO/nexadata-analytics.git
```

Entra al proyecto:

```bash
cd nexadata-analytics
```

Instala las dependencias:

```bash
npm install
```

## ▶️ Ejecución

Para iniciar el proyecto en modo desarrollo:

```bash
npm run dev
```

También puedes utilizar:

```bash
npm start
```

El servidor estará disponible en:

```text
http://localhost:3000
```

## 📡 API

El proyecto dispone de un endpoint para analizar datasets:

```http
POST /api/analyze
```

El archivo CSV debe enviarse mediante `multipart/form-data` utilizando el campo:

```text
file
```

### Ejemplo con cURL

```bash
curl -X POST \
  -F "file=@data/ventas.csv" \
  http://localhost:3000/api/analyze
```

### Respuesta aproximada

```json
{
  "success": true,
  "file": "ventas.csv",
  "analysis": {
    "rows": 12,
    "columns": 5,
    "numericColumns": [
      "ventas",
      "precio",
      "clientes",
      "satisfaccion"
    ],
    "categoricalColumns": [
      "producto"
    ],
    "statistics": [],
    "correlations": [],
    "missingValues": {}
  }
}
```

## 📈 Ejemplo de dataset

El proyecto incluye un dataset de prueba:

```csv
producto,ventas,precio,clientes,satisfaccion
Laptop,120,3500,90,4.7
Laptop,135,3500,100,4.8
Laptop,150,3600,115,4.9
Celular,250,1200,230,4.3
Celular,280,1250,260,4.5
Celular,310,1300,290,4.6
Tablet,180,1800,160,4.4
Tablet,190,1850,170,4.5
Tablet,205,1900,185,4.6
Monitor,80,900,70,4.1
Monitor,95,950,85,4.2
Monitor,110,1000,100,4.4
```

## 🔬 Flujo de procesamiento

```text
CSV
 │
 ▼
Carga del archivo
 │
 ▼
Parser CSV
 │
 ▼
Detección de tipos
 │
 ▼
Limpieza y normalización
 │
 ├───────────────┐
 ▼               ▼
Numéricas      Categóricas
 │
 ▼
Estadística descriptiva
 │
 ├───────────────┐
 ▼               ▼
Outliers      Correlaciones
 │               │
 └───────┬───────┘
         ▼
     Dashboard
```

## 🧠 Objetivo del proyecto

NexaData Analytics busca construir una base sólida para una plataforma de análisis de datos capaz de transformar datasets sin procesar en información útil para la toma de decisiones.

El proyecto está diseñado con una arquitectura modular para que nuevos módulos puedan incorporarse sin modificar completamente el sistema existente.

## 🔮 Próximas funcionalidades

La plataforma puede evolucionar hacia un sistema mucho más completo incorporando:

- Soporte para archivos Excel.
- Gráficos interactivos.
- Histogramas.
- Boxplots.
- Scatter plots.
- Heatmaps de correlación.
- Filtros dinámicos.
- Limpieza automática de datos.
- Detección avanzada de anomalías.
- Regresión lineal.
- Regresión logística.
- Clustering K-Means.
- Series temporales.
- Modelos predictivos.
- Exportación de reportes PDF.
- Exportación de resultados a Excel.
- Base de datos PostgreSQL.
- Autenticación de usuarios.
- Historial de análisis.
- Dashboard configurable.
- Generación automática de insights mediante inteligencia artificial.

## 📌 Roadmap

### Versión 1.0
- [x] Carga CSV.
- [x] Detección de columnas.
- [x] Estadística descriptiva.
- [x] Valores faltantes.
- [x] Detección de outliers.
- [x] Correlaciones.
- [x] API REST.
- [x] Dashboard básico.

### Versión 2.0
- [ ] Gráficos interactivos.
- [ ] Soporte Excel.
- [ ] Filtros.
- [ ] Heatmap de correlaciones.
- [ ] Exportación de reportes.

### Versión 3.0
- [ ] Machine Learning.
- [ ] Predicciones.
- [ ] Clustering.
- [ ] Detección avanzada de anomalías.
- [ ] Series temporales.

### Versión 4.0
- [ ] Sistema de usuarios.
- [ ] PostgreSQL.
- [ ] Historial de proyectos.
- [ ] Dashboard avanzado.
- [ ] Generación automática de insights con IA.

## 👨‍💻 Autor

**Joel Pasapera**

Proyecto desarrollado como plataforma experimental para análisis de datos, estadística y futuras aplicaciones de Machine Learning.

## 📄 Licencia

Este proyecto puede distribuirse y modificarse según la licencia que se establezca para el repositorio.
