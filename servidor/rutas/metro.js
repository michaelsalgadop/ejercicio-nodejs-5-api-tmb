import express from "express";
import {
  getLineasMetro,
  getParadasLineaMetro,
} from "../../api/controladores.js";
import { errorDatos } from "../errores.js";

const router = express.Router();

router.get("/lineas", async (req, res, next) => {
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
    errorDatos(error, next, "No hemos podido obtener las líneas de metro.");
  }
});

router.get("/linea/:linea", async (req, res, next) => {
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
      nuevoError.status = 500;
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
      nuevoError.status = 500;
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
    errorDatos(error, next, "No hemos podido obtener las paradas de metro.");
  }
});

export default router;
// Exportamos con el default, para después importarlo en otro sitio y podamos importarlo con el nombre que queramos, sin utilizar un alias.
