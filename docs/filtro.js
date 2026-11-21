// Revisión de fotos en el celular del invitado (no sale nada a internet):
// 1) que haya al menos una cara visible (lentes y sombreros sí pasan),
// 2) que no sea contenido para adultos.
// Motor: face-api (TinyFaceDetector) + modelo MobileNetV2 de NSFWJS, sobre el mismo TensorFlow.js.
import * as faceapi from "./vendor/face-api.esm.js";
const tf = faceapi.tf;
const BASE = new URL(".", import.meta.url).href;
let carga = null;

export function precargar() {
  if (!carga) carga = (async () => {
    try { await tf.setBackend("webgl"); } catch { await tf.setBackend("cpu"); }
    await tf.ready();
    await faceapi.nets.tinyFaceDetector.loadFromUri(BASE + "modelos/caras");
    const nsfw = await tf.loadLayersModel(BASE + "modelos/nsfw/model.json");
    tf.tidy(() => nsfw.predict(tf.zeros([1, 224, 224, 3])));
    return nsfw;
  })().catch((e) => { carga = null; throw e; });
  return carga;
}

const UMBRAL = 0.4; // medido: caras reales (incluso con lentes oscuros o gorra) > 0.44; objetos < 0.3
const opciones = (s) => new faceapi.TinyFaceDetectorOptions({ inputSize: s, scoreThreshold: UMBRAL });

async function hayCara(canvas) {
  // Lee la foto en varios tamaños: cada uno detecta mejor caras de distinto tamaño.
  for (const s of [416, 320, 512, 608]) if ((await faceapi.detectAllFaces(canvas, opciones(s))).length) return true;
  // Fotos de grupo o caras pequeñas: revisa por zonas, ampliadas.
  const w = canvas.width, h = canvas.height, tw = w * 0.6, th = h * 0.6, z = document.createElement("canvas");
  z.width = 640; z.height = Math.round(640 * th / tw);
  for (const [fx, fy] of [[0, 0], [0.4, 0], [0, 0.4], [0.4, 0.4], [0.2, 0.2]]) {
    z.getContext("2d").drawImage(canvas, fx * w, fy * h, tw, th, 0, 0, z.width, z.height);
    if ((await faceapi.detectAllFaces(z, opciones(416))).length) return true;
  }
  return false;
}

export async function revisar(canvas) {
  const nsfw = await precargar();
  const salida = tf.tidy(() => {
    const img = tf.browser.fromPixels(canvas).toFloat().div(255);
    return nsfw.predict(tf.image.resizeBilinear(img, [224, 224], true).reshape([1, 224, 224, 3]));
  });
  const [dibujo, hentai, neutral, porno, sexy] = await salida.data(); salida.dispose();
  // Límites altos a propósito: el modelo marca entre 0.5 y 0.7 algunas fotos normales con mucha piel
  // (escotes, toallas, caras muy de cerca); el contenido explícito real suele pasar de 0.9.
  const adulto = porno >= 0.85 || hentai >= 0.85 || porno + hentai >= 0.92;
  const cara = adulto ? false : await hayCara(canvas);
  return { cara, adulto, puntajes: { dibujo, hentai, neutral, porno, sexy } };
}
