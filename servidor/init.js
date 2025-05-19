import dotenv from "dotenv";
dotenv.config(); // Primera línea de código
import express from "express";
import chalk from "chalk";
import pkg from "debug";
import { program } from "commander";
import { errorServidor } from "./errores.js";

const { default: createDebug, enable } = pkg;
if (process.env.DEBUG) {
  enable(process.env.DEBUG);
}
const debug = createDebug("servidor:root");

const app = express();

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

server.on("error", (error) => errorServidor(error, puerto));

export { app };
