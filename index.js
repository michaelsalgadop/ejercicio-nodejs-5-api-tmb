import dotenv from "dotenv";
dotenv.config(); // Primera línea de código
import morgan from "morgan";
import express from "express";
import chalk from "chalk";
import pkg from "debug";
import { getLineasMetro, getParadasLineaMetro } from "./datos/datosAPI.js";
import { program } from "commander";

const { default: createDebug, enable } = pkg;
if (process.env.DEBUG) {
  enable(process.env.DEBUG);
}
const debug = createDebug("servidor:root");

const app = express();
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.json());

program.option("-p --puerto <puerto>", "Puerto Servidor");
program.parse();
const modificadoresCLI = program.opts();

const puerto = modificadoresCLI.puerto || process.env.PUERTO || 4000;

const server = app.listen(puerto, () => {
  debug(
    chalk.yellow(
      `Servidor escuchando en http://localhost:${chalk.green(puerto)}`
    )
  );
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    error.message = `El puerto ${puerto} está en uso!`;
  }
  debug(chalk.bold.redBright(error.message));
});

app.get("/metro/lineas", async (req, res, next) => {
  try {
    const datosLineas = await getLineasMetro();
    const lineasMetro = datosLineas.features.map(
      ({
        properties: {
          ID_LINIA: idLinea,
          NOM_LINIA: nombreLinea,
          DESC_LINIA: descripcionLinea,
        },
      }) => ({ id: idLinea, linea: nombreLinea, descripcion: descripcionLinea })
    );

    res.json({ lineasMetro: lineasMetro });
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      error.message = "No hemos podido obtener las líneas de metro.";
    }
    res.status(500).json({ error: true, mensaje: error.message });
  }
});

app.get("/metro/linea/:linea", async (req, res, next) => {
  try {
    const linea = req.params.linea;
    const { features } = await getLineasMetro();
    const lineaEncontrada = features.find(
      ({ properties: { NOM_LINIA: nombreLinea } }) =>
        nombreLinea.toUpperCase() === linea.toUpperCase()
    );
    if (!lineaEncontrada) {
      const nuevoError = new Error(
        "No se ha encontrado la línea especificada!"
      );
      nuevoError.codigo = 500;
      return next(nuevoError);
    }

    const {
      properties: {
        NOM_LINIA: nombreLinea,
        CODI_LINIA: codigoLinea,
        DESC_LINIA: descripcionLinea,
      },
    } = lineaEncontrada;

    const datosParadasLinea = await getParadasLineaMetro(codigoLinea);
    if (
      !datosParadasLinea ||
      !datosParadasLinea.features ||
      datosParadasLinea.features.length === 0
    ) {
      const nuevoError = new Error(
        "No se han encontrado paradas para la línea especificada!"
      );
      nuevoError.codigo = 500;
      return next(nuevoError);
    }

    const paradasLineaMetro = datosParadasLinea.features.map(
      ({
        properties: { NOM_ESTACIO: nombreEstacion, ID_ESTACIO: idEstacion },
      }) => ({ id: idEstacion, nombre: nombreEstacion })
    );

    res.json({
      linea: nombreLinea,
      descripcion: descripcionLinea,
      paradas: [...paradasLineaMetro],
    });
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      error.message = "No hemos podido obtener las paradas de metro.";
    }
    res.status(500).json({ error: true, mensaje: error.message });
  }
});

app.use((req, res, next) => {
  // Si incluye alguno de estos métodos la request
  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    const nuevoError = new Error("Te pensabas que podías jaquearme");
    nuevoError.codigo = 403;
    next(nuevoError);
  }
  next();
});

app.use((req, res, next) => {
  res.status(404).json({ error: true, mensaje: "Recurso no encontrado" });
});

app.use((error, req, res, next) => {
  const codigo = error.code || 500;
  const mensaje = error.message || "Error general";
  res.status(codigo).send(mensaje);
});
