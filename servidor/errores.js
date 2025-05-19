import pkg from "debug";
import chalk from "chalk";

const { default: createDebug, enable } = pkg;
if (process.env.DEBUG) {
  enable(process.env.DEBUG);
}
const debug = createDebug("servidor:errores");

const errorDatos = (error, next, mensajeRefused) => {
  error.message =
    error.code === "ECONNREFUSED" ? mensajeRefused : error.message;
  const nuevoError = new Error(error.message);
  nuevoError.status = 500;
  next(nuevoError);
};

const errorServidor = (error, puerto) => {
  if (error.code === "EADDRINUSE") {
    error.message = `El puerto ${puerto} está en uso!`;
  }
  debug(chalk.bold.redBright(error.message));
};
/**
 * Express le pasará automáticamente los parámetros cuando los use como middlewares de error.
 * Express las usará automáticamente en su sistema de middleware. Internamente,
 * Express les pasa los parámetros necesarios cuando hay una petición 404 o un error general.
 * Simplemente defines la función con los parámetros que esperas recibir (Express los proporciona).
 */
const error404 = (req, res, next) => {
  res.status(404).json({ error: true, mensaje: "Recurso no encontrado" });
};

const errorGeneral = (error, req, res, next) => {
  const codigo = error.status || 500;
  const mensaje = error.message || "Error general";
  res.status(codigo).send(mensaje);
};

export { errorDatos, errorServidor, error404, errorGeneral };
