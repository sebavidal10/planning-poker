# PokerPlanning - Frontend 🃏

Aplicación web moderna y minimalista para Planning Poker, construida con **React**, **Tailwind CSS** y **Framer Motion**. Diseñada para ofrecer una experiencia de usuario premium, rápida y personalizable.

## 🛠 Tecnologías

- **React**: Biblioteca principal de UI.
- **Tailwind CSS**: Estilizado con sistema de diseño personalizado y soporte para **Dark Mode**.
- **Framer Motion**: Animaciones fluidas (volteo de cartas 3D, transiciones de modales).
- **Lucide React**: Sistema de iconos vectoriales para avatares y UI.
- **Context API**: Gestión de estado global para **Temas** e **Idiomas (i18n)**.
- **Socket.IO Client**: Comunicación bidireccional en tiempo real.

## 🚀 Características Premium

- **Minimalismo Premium**: Diseño basado en Zinc (900/950) con acentos en Índigo.
- **Soporte Multironda**: Gestiona múltiples tareas en una sola sesión sin reiniciar la sala.
- **Internacionalización (i18n)**: Soporte completo para **Inglés** y **Español**.
- **Modo Oscuro/Claro**: Selector de tema persistente.
- **Avatares Minimalistas**: Iconos de animales automáticos que reemplazan a los antiguos emojis.
- **Cartas Especiales**: Soporte para votos de "Café" (☕️) y "Incertidumbre" (?).
- **Gestión de Sala (Owner)**:
  - Expulsar participantes.
  - Bloquear/Reiniciar rondas.
  - Revelar votos con cálculos automáticos.
  - Cerrar sala globalmente.
- **Modales Personalizados**: Reemplazo total de alertas nativas por diálogos animados.

## 📦 Instalación y Ejecución

1.  **Instalar dependencias**:

    ```bash
    npm install
    ```

2.  **Configurar entorno**:
    Crea un archivo `.env` basado en `.env.example`:

    ```env
    REACT_APP_API_URL=http://localhost:3001
    REACT_APP_SOCKET_URL=http://localhost:3001
    ```

3.  **Iniciar**:
    ```bash
    npm start
    ```

## 🏗 Arquitectura

- **`usePlanningPoker`**: Custom hook que centraliza toda la interacción con Sockets y API, facilitando el mantenimiento y testeo de la lógica de negocio.
- **Componentes Atómicos**: Reutilización de componentes como `Card`, `Modal` e `IconComponent`.
- **Contextos**: `ThemeContext` y `LanguageContext` para persistencia de preferencias de usuario.

## 🧪 Testing

```bash
npm test
```

- Cobertura de lógica de votos, conexión a sala y renderizado de componentes críticos.
