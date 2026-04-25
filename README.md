# Partido Científico - Laboratorio de Simulación Económica

**Política basada en evidencia científica. Transparencia total. Democracia directa.**

## 🎯 Visión

El Partido Científico propone un nuevo modelo de política donde cada decisión se evalúa científicamente antes de ejecutarse. Utilizamos datos oficiales y herramientas de simulación para predecir las consecuencias reales de las medidas políticas.

## 🚀 Características Principales

### Laboratorio de Simulación Económica
- **14 variables económicas** ajustables con propagación en cascada
- **Cálculo automático** basado en correlaciones históricas reales
- **Validación de coherencia** automática de resultados
- **Generación de informes** escritos automáticos
- **Visualizaciones** históricas y proyecciones

### Concepto del Partido Científico

- **📊 Decisión Basada en Datos**: Cada propuesta se evalúa mediante simulaciones antes de implementarse
- **🔬 Metodología Científica**: Utilizamos datos oficiales del INDEC, BCRA y otras fuentes gubernamentales
- **🌐 Acceso Libre**: Todas nuestras herramientas son de acceso público y código abierto
- **🗳️ Democracia Directa**: Sistema de participación ciudadana aprovechando la alta conectividad
- **🏗️ Obras Públicas en Vivo**: Transmisión en tiempo real de todas las obras públicas
- **⚖️ Modernización de la Justicia**: Sistemas digitales transparentes que eliminan discrecionalidad
- **📈 Estado Online**: Acceso en tiempo real a todos los indicadores e información administrativa

## 🛠️ Tecnologías

- **React 18** con TypeScript
- **Vite** para desarrollo y build
- **Tailwind CSS** para estilos
- **Recharts** para gráficos
- **jsPDF** para exportación de informes

## 📦 Instalación

```bash
npm install
```

## 🏃 Desarrollo

```bash
npm run dev
```

La aplicación se abrirá automáticamente en [http://localhost:3000](http://localhost:3000)

## 🏗️ Build para Producción

```bash
npm run build
```

Los archivos se generarán en la carpeta `dist/` listos para desplegar.

## 📊 Variables Económicas del Laboratorio

El laboratorio completo incluye las siguientes variables:

- Inflación (IPC %)
- Tasa de Desempleo (%)
- Inversión Bruta (% PIB)
- Consumo Energético (kWh per cápita)
- Índice MERVAL
- Exportaciones (% PIB)
- Riesgo País (puntos básicos)
- Consumo de Carne (kg/año per cápita)
- Automóviles Vendidos (miles)
- Deuda Pública (% del PIB)
- Pobreza (%) - calculada automáticamente
- PIB (millones USD)
- Salarios Reales (índice base 100)
- Inflación Futura (%)

## 🧮 Cómo Funciona el Laboratorio

1. **Modifica variables**: Usa los sliders para ajustar cualquier variable económica
2. **Aplica propagación**: Haz clic en "Aplicar propagación" para ver cómo se propagan los efectos
3. **Observa resultados**: El sistema calcula automáticamente cómo cambian otras variables basándose en correlaciones históricas
4. **Revisa validación**: El sistema valida automáticamente la coherencia de los resultados
5. **Lee el informe**: Se genera automáticamente un informe escrito detallado de los cambios

## 📈 Datos Históricos

Los datos históricos están basados en información real de:
- INDEC (Instituto Nacional de Estadística y Censos)
- BCRA (Banco Central de la República Argentina)
- Otras fuentes oficiales

Cubre el período 1994-2025 con datos semestrales.

## 🔄 Carga Automática de Riesgo País

El sistema incluye carga automática de datos de riesgo país desde fuentes oficiales:

- **FRED API**: Federal Reserve Economic Data (API gratuita)
- **BCRA**: Banco Central (implementación en progreso)
- **Datos locales**: Fallback con datos históricos hardcodeados

### Configuración Rápida

1. Obtén tu API key gratuita de FRED: https://fred.stlouisfed.org/docs/api/api_key.html
2. Crea un archivo `.env` en la raíz del proyecto:
   ```env
   VITE_FRED_API_KEY=tu_api_key_aqui
   ```
3. El sistema cargará automáticamente los datos más recientes

## 📁 Estructura del Proyecto

```
src/
├── pages/
│   └── LandingPage.tsx          # Página principal pública
├── components/
│   ├── LaboratorioSimple.tsx     # Versión simple
│   ├── LaboratorioIntermedio.tsx # Versión intermedia
│   └── LaboratorioCompleto.tsx  # Versión completa
├── data/
│   └── historicalData.ts        # Datos históricos (1994-2025)
├── utils/
│   ├── correlationCalculator.ts  # Cálculo de correlaciones
│   ├── reportGenerator.ts        # Generación de informes
│   └── coherenceValidator.ts     # Validación de coherencia
├── App.tsx                       # Componente raíz
└── main.tsx                      # Punto de entrada
```

## 🌐 Despliegue

El proyecto está listo para desplegarse en cualquier plataforma de hosting estático:

- **Vercel**: `vercel --prod`
- **Netlify**: Conecta tu repositorio Git
- **GitHub Pages**: Usa `npm run build` y despliega la carpeta `dist/`

## 📝 Licencia

MIT - Código abierto para transparencia total

## 🤝 Contribuciones

Este es un proyecto abierto. Todas las contribuciones son bienvenidas. El objetivo es crear herramientas de acceso libre para que cualquier ciudadano pueda evaluar propuestas políticas basadas en evidencia científica.

## 📧 Contacto

Para más información sobre el Partido Científico:
- Email: contacto@partidocientifico.ar
- Todas las herramientas son de código abierto y acceso libre

---

**"La política basada en evidencia científica es el futuro. Sé parte del cambio."**
