# Planning Poker

## Description

Este proyecto es una aplicación web que permite a los equipos de desarrollo estimar el esfuerzo de las tareas de un proyecto. La aplicación se basa en la técnica de estimación de esfuerzo conocida como Planning Poker.

## Instalación

Para instalar la aplicación, se debe clonar el repositorio y ejecutar el siguiente comando en la raíz del proyecto:

```bash
npm install
```

## Configuración

Para configurar la aplicación, se debe crear un archivo `.env` en la raíz del proyecto en base al `.env.example`, especificamente con las siguiente variable de entorno:

```env
REACT_APP_API_URL=http://localhost:3001
```

## Uso

Para ejecutar la aplicación, se debe ejecutar el siguiente comando en la raíz del proyecto:

```bash
npm start
```

## Cómo se usa?

1. Crear una sala de estimación: Lo primero es crear la sala, para eso desde el home se le da un nombre el cual se convierte en el _slug_ de la instancia de votación y la identifica.
2. Admin de la sala: El primer usuario que accede a la sala queda como su _owner_. Solo el puede dar inicio al cronometro, resetear los votos y cerrar la sala.
3. Unirse a la sala: Los usuarios se unen a la sala con el _slug_ de la sala y su nombre.
4. Votar: Una vez que todos los usuarios votaron, el _owner_ puede dar inicio al cronometro para que que comience el proceso de cierre de votación. Al finalizar el tiempo, se muestran los votos de todos los usuarios, los valores que quedaron fuera de calculo y el _peso_ asignado a la tarea.

Otras opciones:

- Resetear votos: Solo el _owner_ puede resetear los votos de la sala y todos los votos de esa instancia son eliminados.
- Cerrar sala: Solo el _owner_ puede cerrar la sala. Ya no se podran realizar votaciones en esa instancia.

## WIP:

- Diseño
