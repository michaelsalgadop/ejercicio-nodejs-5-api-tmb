import morgan from "morgan";
import express from "express";
import { app } from "./init.js";
import rutasMetro from "./rutas/metro.js"; // Al ser una exportación default, se pone sin {}
import { error404, errorGeneral } from "./errores.js";
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.json());

app.use((req, res, next) => {
  // Si incluye alguno de estos métodos la request
  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    const nuevoError = new Error("Te pensabas que podías jaquearme");
    nuevoError.status = 403;
    /**
     * Ponemos return porque en algunos casos puede ser que del next de error, se vaya al next
     * siguiente de debajo, esto llamaría dos veces a next, dando a posibles errores de express.
     * De esta forma, nos aseguramos que eso no pase.
     */
    return next(nuevoError);
  }
  next();
});
app.use("/metro", rutasMetro);

app.use(error404);

app.use(errorGeneral);
