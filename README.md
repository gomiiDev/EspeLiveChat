# ESPEChat

ESPEChat es una aplicacion web de chat en tiempo real construida con Express y Socket.IO. Su objetivo principal es mostrar como una app web puede mantener comunicacion bidireccional entre cliente y servidor para reflejar mensajes, usuarios conectados y estados de escritura sin recargar la pagina.

## Caracteristicas principales

- Chat en tiempo real entre multiples usuarios.
- Indicador de escritura usando eventos en vivo.
- Conteo de usuarios conectados.
- Registro simple mediante nombre de usuario almacenado en cookie.
- Interfaz web ligera con HTML, CSS y JavaScript del lado del cliente.

## Tecnologias usadas

- Node.js
- Express
- HTTP nativo de Node.js
- Socket.IO
- cookie-parser
- HTML, CSS y JavaScript

## Por que WebSocket en esta app

El chat necesita comunicacion en tiempo real. Con un modelo tradicional basado en peticiones HTTP, el cliente tendria que consultar constantemente al servidor para saber si hay mensajes nuevos o si otro usuario esta escribiendo. Eso genera mas trafico, mas latencia y una experiencia menos fluida.

Los WebSocket resuelven ese problema porque abren un canal persistente y bidireccional entre navegador y servidor. Una vez establecida la conexion, cualquiera de los dos extremos puede enviar datos en cualquier momento. En ESPEChat esto permite:

- enviar mensajes en el instante en que un usuario los publica,
- notificar a los demas cuando alguien esta escribiendo,
- actualizar el numero de usuarios conectados sin recargar la pagina.

## Por que se usa Socket.IO y no WebSocket puro

La app no implementa el protocolo WebSocket manualmente. En su lugar usa Socket.IO, una libreria que simplifica la comunicacion en tiempo real sobre la conexion entre cliente y servidor.

Socket.IO aporta varias ventajas practicas en este proyecto:

- Maneja la conexion y reconexion automaticamente.
- Ofrece una API basada en eventos, mas simple que trabajar con frames o sockets crudos.
- Facilita emitir eventos a todos los clientes o excluir al emisor.
- Integra de forma natural el servidor Node.js con el cliente del navegador.
- Reduce la complejidad del codigo para un caso de uso academico como este chat.

En esta app, la libreria se usa con el patron evento-payload. El cliente emite eventos como `message`, `typing` y `stopTyping`; el servidor los procesa y vuelve a emitir la informacion necesaria a los clientes conectados.

## Flujo de tiempo real con Socket.IO

### 1. Creacion del servidor HTTP y enlace con Socket.IO

La aplicacion crea primero un servidor HTTP con Express y luego lo entrega a Socket.IO para que ambos compartan el mismo puerto.

```js
const app = express();
const httpServer = createServer(app);
realTimeServer(httpServer);
```

Ese paso es importante porque Socket.IO necesita engancharse al servidor HTTP para administrar las conexiones persistentes del chat.

### 2. Conexion de cada cliente

Cuando un navegador abre el chat, el cliente ejecuta:

```js
const socket = io();
```

Eso inicia la conexion con el servidor Socket.IO. Del lado del servidor, cada conexion se atiende dentro de:

```js
io.on("connection", (socket) => {
  // eventos por cliente
});
```

Cada usuario conectado obtiene su propio objeto `socket`, que representa su canal activo con el servidor.

### 3. Envio y difusion de mensajes

Cuando el usuario envia un mensaje, el cliente ejecuta:

```js
socket.emit("message", cleanMessage);
```

El servidor escucha ese evento, valida el contenido y lo distribuye a todos los clientes conectados:

```js
socket.on("message", (message) => {
  io.emit("message", {
    user,
    message: cleanMessage,
    date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  });
});
```

Aqui se ve uno de los usos mas importantes de Socket.IO en la app:

- `socket.emit(...)` para enviar datos desde un cliente al servidor.
- `io.emit(...)` para reenviar el evento a todos los clientes conectados.

### 4. Indicador de escritura

Mientras el usuario escribe, el cliente emite:

```js
socket.emit("typing");
```

Cuando deja de escribir, emite:

```js
socket.emit("stopTyping");
```

El servidor escucha ambos eventos y notifica a todos menos al emisor:

```js
socket.broadcast.emit("typing", { user });
socket.broadcast.emit("stopTyping", { user });
```

Este es otro uso clave de Socket.IO en ESPEChat: `socket.broadcast.emit(...)` permite compartir un evento con todos los demas clientes sin reenviarlo al mismo usuario que lo genero.

### 5. Conteo de usuarios conectados

Cada vez que un cliente se conecta o se desconecta, el servidor ejecuta:

```js
io.emit("userCount", { total: io.engine.clientsCount });
```

Con esto, el frontend puede actualizar en tiempo real cuantas personas estan dentro del chat.

## Eventos Socket.IO usados en la app

| Evento | Emisor inicial | Uso |
| --- | --- | --- |
| `message` | Cliente | Enviar un mensaje al servidor y redistribuirlo a todos |
| `typing` | Cliente | Avisar que el usuario empezo a escribir |
| `stopTyping` | Cliente | Avisar que el usuario dejo de escribir |
| `userCount` | Servidor | Informar el numero total de conexiones activas |

## Estructura general del proyecto

```text
src/
  index.js            # Configura Express, HTTP y Socket.IO
  realTimeServer.js   # Logica de eventos en tiempo real
  middleware/
    isLoggedIn.js     # Protege la ruta principal del chat
  public/
    css/              # Estilos de la app
    js/
      script.js       # Cliente Socket.IO y eventos del chat
      register.js     # Registro del usuario
      ui.js           # Render de mensajes y utilidades de interfaz
  routes/
    index.js          # Rutas principales
  views/
    index.html        # Pantalla del chat
    register.html     # Pantalla de registro
```

## Instalacion

1. Instala las dependencias:

```bash
npm install
```

2. Inicia la aplicacion:

```bash
npm start
```

3. Abre el navegador en:

```text
http://localhost:3000
```

## Uso de la aplicacion

1. Ingresa a la pagina de registro.
2. Escribe un nombre de usuario.
3. Entra al chat.
4. Envia mensajes y observa la sincronizacion en tiempo real entre clientes.

Para comprobar el comportamiento de Socket.IO, abre la app en dos o mas pestañas o navegadores diferentes. Asi podras ver en vivo:

- la llegada inmediata de mensajes,
- el indicador de escritura,
- la actualizacion del conteo de usuarios conectados.

## Resumen tecnico

El valor principal de esta app esta en su arquitectura de comunicacion en tiempo real. Express se encarga de servir las vistas y los archivos estaticos, mientras que Socket.IO administra las conexiones persistentes y los eventos entre clientes y servidor. Gracias a eso, ESPEChat implementa un chat funcional con una base pequena de codigo y con un modelo claro para estudiar eventos bidireccionales sobre WebSocket.