//Importando los modulos necesarios
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const { Mutex } = require("async-mutex");
const mutex = new Mutex();
const mongoose = require("mongoose");
const { type } = require("os");

// Creacion del Servidor
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const puerto = 8081;

// Creando la conexion a la base de datos con MongoDB
(async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://leondev523:nYmvy5Jgxj2oGYTP@dbchat.ws0t7.mongodb.net/?retryWrites=true&w=majority&appName=DBCHAT",
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    console.log("Conectado a Base de datos Mongo");
  } catch (err) {
    console.error("Error al conectar a MongoDB:", err);
    process.exit(1);
  }
})();

//Definiendo el esquema y modelo para almacenar los mensajes.
const mensajeSchemme = new mongoose.Schema(
  {
    mensaje: { type: String, required: true },
    fecha: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Mensaje = mongoose.model("Mensaje", mensajeSchemme);

//Middleware y rutas
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  try {
    res.sendFile(__dirname + "/index.html");
  } 
  catch (err) {
    console.error("Error al enviar el archivo:", err);
    res.status(500).send("Error en el servidor");
  }
});

// Implementacion de un metodo recursivo para obtener todos los mensajes de la base de datos, 
// el mismo se mantendra ejecutandose hasta que ya no encuentre mas mensajes en la base de datos.
async function obtenerMensajesRecursivamente(fechaLimite, mensajes = [], batchSize = 5) {
  const nuevosMensajes = await Mensaje.find({ fecha: { $lt: fechaLimite } })
    .sort({ fecha: -1 })
    .limit(batchSize);

  if (nuevosMensajes.length === 0) return mensajes; // Si no hay más mensajes, detenemos la recursión

  return obtenerMensajesRecursivamente(nuevosMensajes[nuevosMensajes.length - 1].fecha, mensajes.concat(nuevosMensajes), batchSize);
}

 // Creacion de ruta para obtener los mensajes previamente almacenados en la base de datos usando el metodo recursivo.
 app.get("/mensajes", async (req, res) => {
  try {
    const mensajes = await obtenerMensajesRecursivamente(new Date());
    res.json(mensajes);
  } 
  catch (err) {
    console.error("Error al obtener los mensajes:", err);
    res.status(500).send("Error al obtener los mensajes");
  }
});

// Manejo de conexiones y recepcion de mensajes con Socket.io
io.on("connection", (socket) => {
  console.log("Un cliente se ha conectado");

  socket.on("mensaje", async (mensaje) => {
    const mensajeTexto =
      typeof mensaje === "string" ? mensaje : mensaje?.mensaje;

    if (!mensajeTexto) {
      console.error("⚠️ Error: El mensaje está vacío:", mensaje);
      socket.emit("error", "El mensaje está vacío");
      return;
    }

     // Implementacion de una funcion Recursivo para contar los caracteres de cada mensaje enviado.
     // En la cual Se usa index como posición actual en la cadena y contador para acumular la cantidad.
     function contarCaracteres(mensaje, index = 0, contador = 0) {
      if (index >= mensaje.length) return contador;
      return contarCaracteres(mensaje, index + 1, contador + 1);
    }

    const cantidadCaracteres = contarCaracteres(mensajeTexto);
    console.log(`El mensaje tiene ${cantidadCaracteres} caracteres.`);

    // Implementacion del Patron Semaforo para evitar concurrencia en la base de datos.
    const release = await mutex.acquire();

    try {
      const nuevoMensaje = new Mensaje({ mensaje: mensajeTexto });
      await nuevoMensaje.save();
      io.emit("mensaje", mensaje);
      
    } catch (err) {
      console.error("Error al guardar el mensaje:", err);
      socket.emit("error", "No se pudo guardar el mensaje");

    } finally {
      release(); // Liberando el semaforo

    }
  });

  socket.on("escribiendo", (usuario) => {
    try {
      socket.broadcast.emit("escribiendo", usuario);
    } 
    catch (err) {
      console.error("Error al emitir escribiendo:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Un cliente se ha desconectado.");
  });
});

// Inicio del servidor 
server.listen(puerto, () => {
  console.log(`Servidor escuchando en puerto ${puerto}`);
});
