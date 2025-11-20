// Importamos los feriados DESDE LA MISMA CARPETA
import feriadosData from './feriados.json'

// Creamos un Set para búsquedas rápidas.
// Esto solo se ejecuta una vez cuando se importa el archivo.
const feriadosSet = new Set(feriadosData.map((f) => f.date))

/**
 * Función auxiliar para sumar días corridos a una fecha
 * y ajustarla al siguiente día hábil si cae en fin de semana o feriado.
 *
 * @param {string} fechaStr - Fecha base en formato "YYYY-MM-DD"
 * @param {number} dias - Número de días corridos a sumar
 * @returns {string} - Nueva fecha en formato "YYYY-MM-DD"
 */
export const sumarDiasHabiles = (fechaStr, dias) => {
  const [año, mes, dia] = fechaStr.split('-').map(Number)
  // OJO: new Date(año, mes - 1, dia) -> El mes es 0-indexed (Enero=0)
  let fecha = new Date(año, mes - 1, dia)

  // Sumar días corridos inicialmente
  fecha.setDate(fecha.getDate() + dias)

  // CORRECCIÓN: Tu lógica original retrocedía (getDate() - 1).
  // La lógica correcta para fechas de pago/hitos es AVANZAR al siguiente día hábil.
  while (
    fecha.getDay() === 0 || // domingo
    fecha.getDay() === 6 || // sábado
    feriadosSet.has(fecha.toISOString().split('T')[0]) // feriado
  ) {
    fecha.setDate(fecha.getDate() + 1) // Avanzamos un día
  }

  // Devolvemos en formato "YYYY-MM-DD"
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(
    fecha.getDate(),
  ).padStart(2, '0')}`
}

/**
 * Obtiene la fecha de hoy en formato "YYYY-MM-DD"
 * @returns {string}
 */
export const obtenerFechaHoy = () => {
  const hoy = new Date()
  const dia = String(hoy.getDate()).padStart(2, '0')
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const anio = hoy.getFullYear()
  return `${anio}-${mes}-${dia}` // "YYYY-MM-DD"
}