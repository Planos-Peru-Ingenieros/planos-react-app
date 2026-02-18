import React, { useEffect, useState } from 'react'
import { CCardHeader, CForm } from '@coreui/react'

// 1. IMPORTAMOS NUESTROS NUEVOS COMPONENTES Y UTILIDADES
import { sumarDiasHabiles, obtenerFechaHoy } from './calculosFechas'
import useCotizacionData from './useCotizacionData'
import FormularioEncabezado from './FormularioEncabezado'
import FormularioDatosCliente from './FormularioDatosCliente'
import FormularioDatosProyecto from './FormularioDatosProyecto'
import FormularioCalculoCuotas from './FormularioCalculoCuotas'
import ConfirmacionModals from './ConfirmacionModals'

export default function CrearCotizacion() {
  // --- ESTADO PRINCIPAL ---

  // 2. Usamos el Hook para cargar datos.
  const { cotizaciones, usuarios, loading } = useCotizacionData() // OK: Plural

  // 3. Estado de los 'Select'
  const [cotizacionSeleccionado, setCotizacionSeleccionado] = useState(null) // ID
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('') // username

  // 4. Estado de los campos del formulario
  const [detalles, setDetalles] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [montoTotal, setMontoTotal] = useState('')
  const [dni, setDni] = useState('')
  const [cliente, setCliente] = useState('')
  const [telefono, setTelefono] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [pisos, setPisos] = useState('')
  const [area, setArea] = useState('')

  // 5. Estado de las cuotas (calculadas)
  const [montoCuotas, setMontoCuotas] = useState([])
  const [fechasCuotas, setFechasCuotas] = useState([])

  // 6. Estado de los Modales
  const [showModal, setShowModal] = useState(false)
  const [showModalJPG, setShowModalJPG] = useState(false)

  // --- LÓGICA Y EFECTOS ---

  // 7. Efecto que actualiza los 'detalles'
  useEffect(() => {
    if (!cotizacionSeleccionado) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDetalles('')
      setObservaciones('')
      return
    }

    const cot = cotizaciones.find((c) => c.id === cotizacionSeleccionado)
    if (!cot) return

    let observacionesValue = cot?.observaciones || ''
    let detallesValue = ''
    switch (cot.tipo) {
      case 'Planos y Documentos':
        switch (cot.codigo) {
          case 'DEC-FAB':
            detallesValue =
              'Se elaborarán planos y documentos para el saneamiento del inmueble, sin cargas técnicas bajo la normativa vigente de Registros Públicos.'
            break
          case 'DEC-IND':
            detallesValue =
              'Se elaborarán planos y documentos para el saneamiento del inmueble e independencia, sin cargas técnicas bajo la normativa vigente de Registros Públicos.'
            break
          case 'DEC-SUB':
            detallesValue =
              'Se elaborarán planos y documentos para el saneamiento del inmueble y subdivisión, sin cargas técnicas bajo la normativa vigente de Registros Públicos.'
            break
          case 'IND':
            detallesValue =
              'Se elaborarán planos y documentos para la independización del inmueble, bajo la normativa vigente de Registros Públicos.'
            break
          case 'BUS-CAT':
            detallesValue =
              'Se elaborará planos y documentos de un inmueble georeferenciados con coordenadas UTM, segun normativas vigentes de los Registros Públicos.'
            break
          default:
            detallesValue = 'Se elaborará planos y documentos para , según normativa vigente.'
            break
        }
        break
      case 'Documentos':
        switch (cot.codigo) {
          case 'LEV-CAR':
            detallesValue =
              'Se elaborarán formularios y documentos para el sustento legal del levantamiento de cargas del inmueble, bajo la normativa vigente de Registros Públicos.'
            break
        }
        break
      case 'Planos':
        detallesValue = 'Se elaborará planos para.'
        break
      default:
        detallesValue = ''
        break
    }
    setDetalles(detallesValue)
    setObservaciones(observacionesValue)
  }, [cotizacionSeleccionado, cotizaciones])

  // 8. Efecto que RE-CALCULA LAS CUOTAS
  useEffect(() => {
    if (cotizacionSeleccionado && montoTotal > 0) {
      // ***** INICIO CORRECCIÓN 3 *****
      const selectedCotizacion = cotizaciones.find(
        // USAR PLURAL
        (c) => c.id === cotizacionSeleccionado,
      )
      // ***** FIN CORRECCIÓN 3 *****

      if (selectedCotizacion) {
        const cuotas = selectedCotizacion.cuotas
        const fechaHoy = obtenerFechaHoy()
        let montos = []
        let fechas = []

        if (cuotas === 1) {
          montos = [parseFloat(montoTotal)]
          fechas = [fechaHoy]
        } else {
          // ... (el resto de esta lógica estaba bien) ...
          let porcentajes = []
          if (cuotas === 2) porcentajes = [0.55, 0.45]
          else if (cuotas === 3) porcentajes = [0.35, 0.35, 0.3]
          else if (cuotas === 4) porcentajes = [0.3, 0.25, 0.25, 0.2]

          const redondearDecena = (monto) => Math.round(monto / 10) * 10
          let sumaRedondeada = 0
          const total = parseFloat(montoTotal)

          for (let i = 0; i < porcentajes.length; i++) {
            if (i === porcentajes.length - 1) {
              montos.push(parseFloat((total - sumaRedondeada).toFixed(2)))
            } else {
              const monto = redondearDecena(total * porcentajes[i])
              montos.push(monto)
              sumaRedondeada += monto
            }

            let diasExtra = 0
            if (i === 1) diasExtra = selectedCotizacion.dias1 || 0
            else if (i === 2) diasExtra = selectedCotizacion.dias2 || 0
            else if (i === 3) diasExtra = selectedCotizacion.dias3 || 0

            const fechaBase = i === 0 ? fechaHoy : fechas[fechas.length - 1]
            const nuevaFecha = i === 0 ? fechaHoy : sumarDiasHabiles(fechaBase, diasExtra)
            fechas.push(nuevaFecha)
          }
        }
        setMontoCuotas(montos)
        setFechasCuotas(fechas)
      }
    } else {
      setMontoCuotas([])
      setFechasCuotas([])
    }
    // ***** INICIO CORRECCIÓN 4 *****
  }, [cotizacionSeleccionado, montoTotal, cotizaciones]) // USAR PLURAL
  // ***** FIN CORRECCIÓN 4 *****

  // --- HANDLERS (Manejadores de eventos) ---

  const handleUsuarioChange = (selectedOption) => {
    setUsuarioSeleccionado(selectedOption ? selectedOption.value : '')
  }

  const handleCotizacionChange = (selectedOption) => {
    setCotizacionSeleccionado(selectedOption ? selectedOption.value : null)
  }

  const handleMontoTotalChange = (e) => {
    if (/^\d*$/.test(e.target.value)) {
      setMontoTotal(e.target.value)
    }
  }

  // 10. Función ÚNICA para construir el JSON
  const construirDatosParaBackend = () => {
    // ***** INICIO CORRECCIÓN 5 *****
    const selectedCotizacion = cotizaciones.find(
      // USAR PLURAL
      (c) => c.id === cotizacionSeleccionado,
    )
    // ***** FIN CORRECCIÓN 5 *****
    const codigoCotizacion = selectedCotizacion ? selectedCotizacion.codigo : ''

    const cuotasCombinadas = montoCuotas.map((monto, index) => {
      let descripcionCuota = `Cuota ${index + 1}`
      if (index === 0) descripcionCuota = 'Adelanto'
      else if (index === montoCuotas.length - 1) descripcionCuota = 'Cancelación / Entrega final'

      return {
        monto: monto.toFixed(2),
        descripcion: descripcionCuota,
        fecha: fechasCuotas[index],
      }
    })

    // Construimos el objeto final con la estructura que pediste
    return {
      nombre: selectedCotizacion ? selectedCotizacion.nom_tipo : 'Proyecto',
      tipo: cotizacionSeleccionado,
      elaboracion: selectedCotizacion ? selectedCotizacion.dias1 || 0 : 5,
      estado: 'pendiente',
      area: `${area} m2`,
      titulo: detalles,
      cliente: cliente,
      pisos: pisos,
      ubicacion: ubicacion,
      telefono: telefono,
      dni: dni,
      observaciones: observaciones,
      cuotas: cuotasCombinadas,
      usuario: usuarioSeleccionado,
      codigo: codigoCotizacion,
    }
  }

  // 11. Handlers para generar los archivos
  const handleSubmit = async (e) => {
    e.preventDefault()
    const datos = construirDatosParaBackend()
    try {
      // Ajusta la IP si no es localhost (Aqui cabiar la url para la intranet)
      const responseBD = await fetch(
        'https://intranet.planosperu.com.pe/api/cotizaciones/guardar/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datos),
        },
      )

      if (responseBD.ok) {
        console.log('✅ Cotización guardada en BD correctamente')
      } else {
        const errorText = await responseBD.text()
        console.error('⚠️ Error al guardar en BD:', errorText)
      }
    } catch (error) {
      console.error('❌ Error de conexión con Django (BD):', error)
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/crear-cotizacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      })

      if (!response.ok) {
        const errorText = await response.text()
        alert(`Error al generar el archivo Excel: ${errorText}`)
        return
      }

      // Descargar el archivo
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      const hoy = new Date()
      const anio = hoy.getFullYear()
      const mes = String(hoy.getMonth() + 1).padStart(2, '0')
      const dia = String(hoy.getDate()).padStart(2, '0')
      const mes_dia = `${mes}${dia}`

      const abreviado_usuario =
        datos.usuario && datos.usuario.length > 0 ? datos.usuario.slice(0, 3).toUpperCase() : 'USR'

      const limpiar = (texto) => texto.replace(/[^a-zA-Z0-9_-]/g, '').replace(/\s+/g, '_')

      const cliente_limpio = limpiar(datos.cliente || 'Cliente')
      const ubicacion_limpia = limpiar(datos.ubicacion || 'Ubicacion')

      const a = document.createElement('a')
      a.href = url
      a.download = `CZ-${anio}-${mes_dia}-${abreviado_usuario}-${datos.codigo}-${cliente_limpio}-${ubicacion_limpia}.xlsx`
      document.body.appendChild(a) // Necesario en algunos navegadores
      a.click()
      document.body.removeChild(a) // Limpieza

      // Mostrar modal de éxito
      setShowModal(true)
    } catch (error) {
      console.error('Error en servicio de Excel:', error)
      alert('Error al conectar con el generador de Excel (Puerto 5000).')
    }
  }
  const handleGeneratePDF = async () => {
    const datos = construirDatosParaBackend()

    const response = await fetch('http://127.0.0.1:5000/crear-cotizacion-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    })

    if (!response.ok) {
      alert(`Error al generar el PDF: ${await response.text()}`)
      return
    }

    const pdfBlob = await response.blob()
    const url = window.URL.createObjectURL(pdfBlob)
    const hoy = new Date()
    const anio = hoy.getFullYear()
    const mes = String(hoy.getMonth() + 1).padStart(2, '0')
    const dia = String(hoy.getDate()).padStart(2, '0')
    const mes_dia = `${mes}${dia}`
    const abreviado_usuario = (datos.usuario.slice(0, 3) || 'USR').toUpperCase()
    const limpiar = (texto) => texto.replace(/[^a-zA-Z0-9_-]/g, '').replace(/\s+/g, '_')
    const cliente_limpio = limpiar(datos.cliente || 'Cliente')
    const ubicacion_limpia = limpiar(datos.ubicacion || 'Ubicacion')
    const nombreArchivoPDF = `CZ-${anio}-${mes_dia}-${abreviado_usuario}-${datos.codigo}-${cliente_limpio}-${ubicacion_limpia}.pdf`

    const a = document.createElement('a')
    a.href = url
    a.download = nombreArchivoPDF
    a.click()

    setShowModal(false)
    setShowModalJPG(true)
  }

  const handleGenerateJPG = async () => {
    const datos = construirDatosParaBackend()

    const response = await fetch('http://127.0.0.1:5000/crear-cotizacion-jpg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    })

    if (!response.ok) {
      alert(`Error al generar el JPG: ${await response.text()}`)
      return
    }

    const jpgBlob = await response.blob()
    const url = window.URL.createObjectURL(jpgBlob)
    const hoy = new Date()
    const anio = hoy.getFullYear()
    const mes = String(hoy.getMonth() + 1).padStart(2, '0')
    const dia = String(hoy.getDate()).padStart(2, '0')
    const mes_dia = `${mes}${dia}`
    const abreviado_usuario = (datos.usuario.slice(0, 3) || 'USR').toUpperCase()
    const limpiar = (texto) => texto.replace(/[^a-zA-Z0-9_-]/g, '').replace(/\s+/g, '_')
    const cliente_limpio = limpiar(datos.cliente || 'Cliente')
    const ubicacion_limpia = limpiar(datos.ubicacion || 'Ubicacion')
    const nombreArchivoJPG = `CZ-${anio}-${mes_dia}-${abreviado_usuario}-${datos.codigo}-${cliente_limpio}-${ubicacion_limpia}.jpg`

    const a = document.createElement('a')
    a.href = url
    a.download = nombreArchivoJPG
    a.click()

    setShowModalJPG(false)
  }

  // 12. Handlers de los modales (SIN CAMBIOS)
  const handleCancel = () => {
    setShowModal(false)
    setShowModalJPG(true)
  }
  const handleCancel1 = () => {
    setShowModalJPG(false)
  }

  // --- RENDERIZADO ---

  // 13. El JSX (SIN CAMBIOS, PERO YA CORREGIDO DE ANTES)
  return (
    <div className="container">
      <div className="card mt-3">
        <CCardHeader>Llena el formulario para crear una nueva cotización.</CCardHeader>
        <div className="card-body">
          <CForm onSubmit={handleSubmit}>
            <FormularioEncabezado
              usuarios={usuarios}
              cotizacion={cotizaciones} // OK: Plural
              usuarioSeleccionado={usuarioSeleccionado}
              handleUsuarioChange={handleUsuarioChange}
              cotizacionSeleccionado={cotizacionSeleccionado}
              handleCotizacionChange={handleCotizacionChange}
              loading={loading}
            />

            <FormularioDatosCliente
              dni={dni}
              setDni={setDni}
              cliente={cliente}
              setCliente={setCliente}
              telefono={telefono}
              setTelefono={setTelefono}
              ubicacion={ubicacion}
              setUbicacion={setUbicacion}
            />

            <FormularioDatosProyecto
              detalles={detalles}
              setDetalles={setDetalles}
              pisos={pisos}
              setPisos={setPisos}
              area={area}
              setArea={setArea}
            />

            <FormularioCalculoCuotas
              montoTotal={montoTotal}
              handleMontoTotalChange={handleMontoTotalChange}
              montoCuotas={montoCuotas}
              fechasCuotas={fechasCuotas}
            />

            <div className="mb-3">
              <label className="form-label" htmlFor="observaciones">
                Observaciones
              </label>
              <textarea
                className="form-control"
                id="observaciones"
                name="observaciones"
                rows="3"
                value={observaciones || ''}
                onChange={(e) => setObservaciones(e.target.value)}
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              Crear Cotización
            </button>
          </CForm>

          <ConfirmacionModals
            showModal={showModal}
            handleCancel={handleCancel}
            handleGeneratePDF={handleGeneratePDF}
            showModalJPG={showModalJPG}
            handleCancel1={handleCancel1}
            handleGenerateJPG={handleGenerateJPG}
          />
        </div>
      </div>
    </div>
  )
}
