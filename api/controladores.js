import dotenv from "dotenv";
dotenv.config(); // Primera línea de código
const getAuthUrl = (url) =>
  `${url}?app_id=${process.env.TMB_APP_ID}&app_key=${process.env.TMB_APP_KEY}`;
const getLineasMetro = async () => {
  const resp = await fetch(getAuthUrl(process.env.URL_TMB_METRO));
  const datos = await resp.json();
  return datos;
};
const getParadasLineaMetro = async (linea) => {
  const resp = await fetch(
    getAuthUrl(`${process.env.URL_TMB_METRO}${linea}/estacions`)
  );
  const datos = await resp.json();
  return datos;
};
export { getLineasMetro, getParadasLineaMetro };
