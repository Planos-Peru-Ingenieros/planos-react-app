import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Select from 'react-select'

export default function CrearCotizacion() {
  const [cotizacion, setCotizaciones] = useState([])
  const [cotizacionSeleccionado, setCotizacionSeleccionado] = useState('')
  const [detalles, setDetalles] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [montoCuotas, setMontoCuotas] = useState([])
  const [montoCancelacion, setMontoCancelacion] = useState('') // Inicializa con una cadena vacía
  const [montoTotal, setMontoTotal] = useState('') // Para almacenar el monto total ingresado
  const [fechasCuotas, setFechasCuotas] = useState([])
  const [showModal, setShowModal] = useState(false) // Estado para mostrar el modal
  const [excelBlob, setExcelBlob] = useState(null) // Estado para almacenar el blob de Excel
  // 🔥 Añadir estados para usuarios
  const [usuarios, setUsuarios] = useState([])
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('')
  const [showModalJPG, setShowModalJPG] = useState(false)
  // 🔄 Cargar cotizaciones
  useEffect(() => {
    axios
      .get('https://planosperu.com.pe/intranet/api/tipot/')
      .then((response) => setCotizaciones(response.data.results))
      .catch((error) => console.error('Error al obtener las cotizaciones:', error))
  }, [])

  useEffect(() => {
    if (cotizacionSeleccionado) {
      const cotizacionSeleccionada = cotizacion.find((c) => c.id === cotizacionSeleccionado)

      // 📝 Actualiza observaciones
      setObservaciones(cotizacionSeleccionada ? cotizacionSeleccionada.observaciones : '')

      // 📝 Actualiza detalles según el tipo
      if (cotizacionSeleccionada) {
        switch (cotizacionSeleccionada.tipo) {
          case 'Planos y Documentos':
            switch (cotizacionSeleccionada.codigo) {
              case 'DEC-SUB':
                setDetalles(
                  'Se elaborará planos y documentos para saneamiento legal de un inmueble () sin cargas tecnicas, segun normativas vigentes de los Registros Públicos.',
                )
                break
              case 'IND':
                setDetalles(
                  'Se elaborará planos y documentos para saneamiento legal de un inmueble () sin cargas tecnicas, segun normativas vigentes de los Registros Públicos.',
                )
                break
              case 'BUS-CAT':
                setDetalles(
                  'Se elaborará planos y documentos de un inmueble georeferenciados con coordenadas UTM, segun normativas vigentes de los Registros Públicos.',
                )
                break
              default:
                setDetalles('Se elaborará planos y documentos para , según normativa vigente.')
                break
            }
            break
          case 'Documentos':
            setDetalles('Se elaborará documentos para , según normativa vigente.')
            break
          case 'Planos':
            setDetalles('Se elaborará planos para')
            break
          default:
            setDetalles('')
        }
      } else {
        setDetalles('')
      }
    } else {
      setObservaciones('')
      setDetalles('')
    }
  }, [cotizacionSeleccionado, cotizacion])

  // 🔄 Cargar usuarios desde tu API
  useEffect(() => {
    axios
      .get('https://planosperu.com.pe/intranet/api/users/')
      .then((res) => {
        // Actualiza el estado con los resultados
        setUsuarios(res.data.results) // Los usuarios están dentro de la propiedad 'results'
      })
      .catch((err) => {
        console.error('❌ Error al obtener usuarios:', err.message)
        console.log('Código de error:', err.code)
        console.log('Detalles:', err.response?.data || err.request || 'Sin respuesta del servidor')
      })
  }, [])

  const handleUsuarioChange = (selectedOption) => {
    const username = selectedOption ? selectedOption.value : ''
    setUsuarioSeleccionado(username)
  }
  const feriados = [
    { date: '2025-01-01', name: 'Año Nuevo' },
    { date: '2025-01-02', name: 'Día no laborable para el sector público' },
    { date: '2025-04-17', name: 'Jueves Santo' },
    { date: '2025-04-18', name: 'Viernes Santo' },
    { date: '2025-05-01', name: 'Día del Trabajo' },
    { date: '2025-06-07', name: 'Batalla de Arica y Día de la Bandera' },
    { date: '2025-06-29', name: 'Día de San Pedro y San Pablo' },
    { date: '2025-07-23', name: 'Día de la Fuerza Aérea del Perú' },
    { date: '2025-07-28', name: 'Fiestas Patrias' },
    { date: '2025-07-29', name: 'Fiestas Patrias' },
    { date: '2025-08-06', name: 'Batalla de Junín' },
    { date: '2025-08-30', name: 'Santa Rosa de Lima' },
    { date: '2025-10-08', name: 'Combate de Angamos' },
    { date: '2025-11-01', name: 'Día de Todos los Santos' },
    { date: '2025-12-08', name: 'Inmaculada Concepción' },
    { date: '2025-12-09', name: 'Batalla de Ayacucho' },
    { date: '2025-12-25', name: 'Navidad' },
  ]
  // Función auxiliar para sumar días hábiles (excluye sábados y domingos)
  const sumarDiasHabiles = (fechaStr, dias) => {
    const [año, mes, dia] = fechaStr.split('-').map(Number)
    let fecha = new Date(año, mes - 1, dia)

    // Sumar días corridos inicialmente
    fecha.setDate(fecha.getDate() + dias)

    const feriadosSet = new Set(feriados.map((f) => f.date))

    // Mientras caiga en sábado, domingo o feriado, avanzar 1 día
    while (
      fecha.getDay() === 0 || // domingo
      fecha.getDay() === 6 || // sábado
      feriadosSet.has(fecha.toISOString().split('T')[0]) // feriado
    ) {
      fecha.setDate(fecha.getDate() - 1)
    }

    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
  }

  const handleCotizacionChange = async (selectedOption) => {
    const cotizacionId = selectedOption ? selectedOption.value : ''
    setCotizacionSeleccionado(cotizacionId)

    if (cotizacionId && montoTotal > 0) {
      const selectedCotizacion = cotizacion.find((c) => c.id === cotizacionId)

      if (selectedCotizacion) {
        const cuotas = selectedCotizacion.cuotas
        const fechaHoy = obtenerFechaHoy() // yyyy-mm-dd
        let montos = []
        let fechas = []

        if (cuotas === 1) {
          montos = [montoTotal]
          fechas = [fechaHoy]
        } else {
          let porcentajes = []

          if (cuotas === 2) {
            porcentajes = [0.55, 0.45]
          } else if (cuotas === 3) {
            porcentajes = [0.35, 0.35, 0.3]
          } else if (cuotas === 4) {
            porcentajes = [0.3, 0.25, 0.25, 0.2]
          }

          const redondearDecena = (monto) => Math.round(monto / 10) * 10
          let sumaRedondeada = 0

          for (let i = 0; i < porcentajes.length; i++) {
            if (i === porcentajes.length - 1) {
              montos.push(parseFloat((montoTotal - sumaRedondeada).toFixed(2)))
            } else {
              const monto = redondearDecena(montoTotal * porcentajes[i])
              montos.push(monto)
              sumaRedondeada += monto
            }

            // Calcular fecha exacta según días personalizados
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
        setMontoCancelacion(montos[0])
        setFechasCuotas(fechas)
      }
    }
  }

  // Función que maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Obtener los datos de la cotización seleccionada
    const selectedCotizacion = cotizacion.find((c) => c.id === cotizacionSeleccionado)
    const codigoCotizacion = selectedCotizacion ? selectedCotizacion.codigo : ''

    const datos = {
      usuario: usuarioSeleccionado,
      codigo: codigoCotizacion,
      detalles: detalles,
      piso: e.target.pisos.value,
      area: e.target.area.value,
      cliente: e.target.cliente.value,
      ubicacion: e.target.ubicacion.value,
      telefono: e.target.telefono.value,
      dni: e.target.dni.value,
      observaciones: observaciones,
      cuotas: montoCuotas,
      fechas: fechasCuotas,
    }

    // Realizar la solicitud POST al backend para generar el archivo Excel
    const response = await fetch('http://127.0.0.1:5000/crear-cotizacion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    })

    if (!response.ok) {
      const errorText = await response.text()
      alert(`Error al generar la cotización: ${errorText}`)
      return
    }

    // Obtener el blob del archivo Excel
    const blob = await response.blob()
    setExcelBlob(blob) // Guarda el blob de Excel

    // Crear URL para el archivo Blob
    const url = window.URL.createObjectURL(blob)

    // Generar nombre del archivo basado en la fecha y datos de la cotización
    const hoy = new Date()
    const anio = hoy.getFullYear()
    const mes = String(hoy.getMonth() + 1).padStart(2, '0')
    const dia = String(hoy.getDate()).padStart(2, '0')
    const mes_dia = `${mes}${dia}`

    // Abreviar el nombre de usuario
    const abreviado_usuario = (usuarioSeleccionado.slice(0, 3) || 'USR').toUpperCase()

    // Limpiar caracteres no alfanuméricos en cliente y ubicación
    const limpiar = (texto) => texto.replace(/[^a-zA-Z0-9_-]/g, '').replace(/\s+/g, '_')
    const cliente_limpio = limpiar(e.target.cliente.value || 'Cliente')
    const ubicacion_limpia = limpiar(e.target.ubicacion.value || 'Ubicacion')

    // Crear el enlace para descargar el archivo Excel
    const a = document.createElement('a')
    a.href = url
    a.download = `CZ-${anio}-${mes_dia}-${abreviado_usuario}-${codigoCotizacion}-${cliente_limpio}-${ubicacion_limpia}.xlsx`
    a.click()

    // Muestra el modal de confirmación para la generación del PDF
    setShowModal(true)
  }

  // Función que se llama cuando el usuario confirma la creación del PDF
  const handleGeneratePDF = async () => {
    const clienteInput = document.querySelector('[name="cliente"]')
    const ubicacionInput = document.querySelector('[name="ubicacion"]')
    const pisoInput = document.querySelector('[name="pisos"]')
    const telefonoInput = document.querySelector('[name="telefono"]')
    const dniInput = document.querySelector('[name="dni"]')
    const areaInput = document.querySelector('[name="area"]')
    if (!clienteInput || !ubicacionInput) {
      alert('No se encontraron los campos requeridos.')
      return
    }

    // Recuperar el código de cotización en este momento
    const selectedCotizacion = cotizacion.find(
      (c) => c.id.toString() === cotizacionSeleccionado.toString(),
    )
    const codigoCotizacion = selectedCotizacion?.codigo || 'SIN-CODIGO'

    const hoy = new Date()
    const anio = hoy.getFullYear()
    const mes = String(hoy.getMonth() + 1).padStart(2, '0')
    const dia = String(hoy.getDate()).padStart(2, '0')
    const mes_dia = `${mes}${dia}`

    const abreviado_usuario = (usuarioSeleccionado.slice(0, 3) || 'USR').toUpperCase()

    const limpiar = (texto) => texto.replace(/[^a-zA-Z0-9_-]/g, '').replace(/\s+/g, '_')

    const cliente_limpio = limpiar(clienteInput.value || 'Cliente')
    const ubicacion_limpia = limpiar(ubicacionInput.value || 'Ubicacion')

    // Llamar a la función para generar el PDF

    const datos = {
      usuario: usuarioSeleccionado,
      codigo: codigoCotizacion,
      detalles: detalles,
      piso: pisoInput.value,
      area: areaInput.value,
      cliente: clienteInput.value,
      ubicacion: ubicacionInput.value,
      telefono: telefonoInput.value,
      dni: dniInput.value,
      observaciones: observaciones,
      cuotas: montoCuotas,
      fechas: fechasCuotas,
    }

    const response = await fetch('http://127.0.0.1:5000/crear-cotizacion-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    })

    if (!response.ok) {
      const errorText = await response.text()
      alert(`Error al generar el PDF: ${errorText}`)
      return
    }

    // Obtener el blob del archivo PDF
    const pdfBlob = await response.blob()
    const url = window.URL.createObjectURL(pdfBlob)

    // Generar el nombre del archivo PDF
    const nombreArchivoPDF = `CZ-${anio}-${mes_dia}-${abreviado_usuario}-${codigoCotizacion}-${cliente_limpio}-${ubicacion_limpia}.pdf`

    // Crear el enlace para descargar el archivo PDF
    const a = document.createElement('a')
    a.href = url
    a.download = nombreArchivoPDF
    a.click()

    setShowModal(false) // Cerrar el modal
    setShowModalJPG(true)
  }

  // Función que se llama cuando el usuario confirma la creación del JPG
  const handleGenerateJPG = async () => {
    const clienteInput = document.querySelector('[name="cliente"]')
    const ubicacionInput = document.querySelector('[name="ubicacion"]')
    const pisoInput = document.querySelector('[name="pisos"]')
    const telefonoInput = document.querySelector('[name="telefono"]')
    const dniInput = document.querySelector('[name="dni"]')
    const areaInput = document.querySelector('[name="area"]')
    if (!clienteInput || !ubicacionInput) {
      alert('No se encontraron los campos requeridos.')
      return
    }

    const selectedCotizacion = cotizacion.find(
      (c) => c.id.toString() === cotizacionSeleccionado.toString(),
    )
    const codigoCotizacion = selectedCotizacion?.codigo || 'SIN-CODIGO'

    const hoy = new Date()
    const anio = hoy.getFullYear()
    const mes = String(hoy.getMonth() + 1).padStart(2, '0')
    const dia = String(hoy.getDate()).padStart(2, '0')
    const mes_dia = `${mes}${dia}`

    const abreviado_usuario = (usuarioSeleccionado.slice(0, 3) || 'USR').toUpperCase()

    const limpiar = (texto) => texto.replace(/[^a-zA-Z0-9_-]/g, '').replace(/\s+/g, '_')

    const cliente_limpio = limpiar(clienteInput.value || 'Cliente')
    const ubicacion_limpia = limpiar(ubicacionInput.value || 'Ubicacion')

    const datos = {
      usuario: usuarioSeleccionado,
      codigo: codigoCotizacion,
      detalles: detalles,
      piso: pisoInput.value,
      area: areaInput.value,
      cliente: clienteInput.value,
      ubicacion: ubicacionInput.value,
      telefono: telefonoInput.value,
      dni: dniInput.value,
      observaciones: observaciones,
      cuotas: montoCuotas,
      fechas: fechasCuotas,
    }

    const response = await fetch('http://127.0.0.1:5000/crear-cotizacion-jpg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    })

    if (!response.ok) {
      const errorText = await response.text()
      alert(`Error al generar el JPG: ${errorText}`)
      return
    }

    // Obtener el blob del archivo JPG
    const jpgBlob = await response.blob()
    const url = window.URL.createObjectURL(jpgBlob)

    // Generar el nombre del archivo JPG
    const nombreArchivoJPG = `CZ-${anio}-${mes_dia}-${abreviado_usuario}-${codigoCotizacion}-${cliente_limpio}-${ubicacion_limpia}.jpg`

    // Crear el enlace para descargar el archivo JPG
    const a = document.createElement('a')
    a.href = url
    a.download = nombreArchivoJPG
    a.click()

    setShowModalJPG(false)
  }

  // Función para cancelar la generación del PDF
  const handleCancel = () => {
    setShowModal(false) // Cerrar el modal sin generar el PDF
    setShowModalJPG(true)
  }
  const handleCancel1 = () => {
    setShowModalJPG(false)
  }

  const handleMontoTotalChange = (e) => {
    const value = parseFloat(e.target.value) || ''
    setMontoTotal(value)

    if (cotizacionSeleccionado && value > 0) {
      const selectedCotizacion = cotizacion.find((c) => c.id === cotizacionSeleccionado)

      if (selectedCotizacion) {
        const cuotas = selectedCotizacion.cuotas
        let montos = []
        let fechas = []
        const fechaHoy = obtenerFechaHoy()

        if (cuotas === 1) {
          montos = [value]
          fechas = [fechaHoy]
        } else {
          let porcentajes = []

          if (cuotas === 2) {
            porcentajes = [0.55, 0.45]
          } else if (cuotas === 3) {
            porcentajes = [0.35, 0.35, 0.3]
          } else if (cuotas === 4) {
            porcentajes = [0.3, 0.25, 0.25, 0.2]
          }

          const redondearDecena = (monto) => Math.round(monto / 10) * 10
          let sumaRedondeada = 0

          for (let i = 0; i < porcentajes.length; i++) {
            if (i === porcentajes.length - 1) {
              montos.push(parseFloat((value - sumaRedondeada).toFixed(2)))
            } else {
              const monto = redondearDecena(value * porcentajes[i])
              montos.push(monto)
              sumaRedondeada += monto
            }
            // Calcular fecha exacta según días personalizados
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
        setMontoCancelacion(montos[0])
        setFechasCuotas(fechas)
      }
    }
  }

  const obtenerFechaHoy = () => {
    const hoy = new Date()
    const dia = String(hoy.getDate()).padStart(2, '0')
    const mes = String(hoy.getMonth() + 1).padStart(2, '0')
    const anio = hoy.getFullYear()
    return `${anio}-${mes}-${dia}` // "YYYY-MM-DD"
  }

  return (
    <div className="container">
      <div className="card mt-3">
        <div className="card-header">
          <h4 className="card-title">Crear Cotización</h4>
          <p className="card-title-desc">Llena el formulario para crear una nueva cotización.</p>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Usuario <span style={{ color: 'red' }}>*</span>
                </label>
                <Select
                  options={usuarios.map((usuario) => ({
                    value: usuario.username, // Asegúrate de que 'username' es único
                    label: usuario.username, // El valor que se muestra
                  }))}
                  value={
                    usuarioSeleccionado
                      ? { value: usuarioSeleccionado, label: usuarioSeleccionado }
                      : null
                  }
                  onChange={handleUsuarioChange}
                  placeholder="Seleccione un usuario"
                />
              </div>

              {/* Select de Cotizaciones */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Cotización <span style={{ color: 'red' }}>*</span>
                </label>
                <Select
                  options={[
                    {
                      label: 'Mas solicitado',
                      options: cotizacion
                        .filter((c) => c.entidad?.toLowerCase().trim() === 'mas solicitado')
                        .map((c) => ({
                          value: c.id,
                          label: c.nom_tipo,
                        }))
                        .sort((a, b) => a.label.localeCompare(b.label)), // Ordenar alfabéticamente
                    },
                    {
                      label: 'SUNARP',
                      options: cotizacion
                        .filter((c) => c.entidad?.toLowerCase().trim() === 'sunarp')
                        .map((c) => ({
                          value: c.id,
                          label: c.nom_tipo,
                        }))
                        .sort((a, b) => a.label.localeCompare(b.label)), // Ordenar alfabéticamente
                    },
                    {
                      label: 'OTROS',
                      options: cotizacion
                        .filter((c) => c.entidad?.toLowerCase().trim() !== 'sunarp')
                        .map((c) => ({
                          value: c.id,
                          label: c.nom_tipo,
                        }))
                        .sort((a, b) => a.label.localeCompare(b.label)), // Ordenar alfabéticamente
                    },
                  ]}
                  value={
                    cotizacionSeleccionado
                      ? {
                          value: cotizacionSeleccionado,
                          label:
                            cotizacion.find((c) => c.id === cotizacionSeleccionado)?.nom_tipo || '',
                        }
                      : null
                  }
                  onChange={handleCotizacionChange}
                  placeholder="Seleccione una cotización"
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">DNI / RUC</label>
                <input type="text" className="form-control" name="dni" />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Cliente / Empresa <span style={{ color: 'red' }}>*</span>
                </label>
                <input type="text" className="form-control" name="cliente" required />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Teléfono</label>
                <input type="text" className="form-control" name="telefono" />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Ubicación <span style={{ color: 'red' }}>*</span>
                </label>
                <input type="text" className="form-control" name="ubicacion" required />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">
                Detalles <span style={{ color: 'red' }}>*</span>
              </label>
              <textarea
                className="form-control"
                name="detalles"
                rows="3"
                value={detalles}
                onChange={(e) => setDetalles(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Número de Pisos <span className="text-danger">*</span>
                </label>
                <input type="text" className="form-control" name="pisos" required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Área (m²) aprox.<span style={{ color: 'red' }}>*</span>
                </label>
                <input type="number" step="0.01" className="form-control" name="area" required />
              </div>
            </div>
            {/* Campo para ingresar el monto total */}
            <div className="mb-3">
              <label className="form-label">
                Costo de Cancelación <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={montoTotal}
                onChange={handleMontoTotalChange}
                placeholder="Ingrese el monto total"
              />
            </div>

            {/* Mostrar las cuotas con su fecha al costado */}
            <div className="mb-3">
              <label className="form-label">Cuotas</label>
              {montoCuotas.length > 0 && fechasCuotas.length > 0 && (
                <ul>
                  {montoCuotas.map((monto, index) => (
                    <li key={index}>
                      Cuota {index + 1}: S/. {monto} – Fecha: {fechasCuotas[index]}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Campo Observaciones */}
            <div className="mb-3">
              <label className="form-label">Observaciones</label>
              <textarea
                className="form-control"
                name="observaciones"
                rows="3"
                value={observaciones || ''}
                onChange={(e) => setObservaciones(e.target.value)}
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary">
              Crear Cotización
            </button>
          </form>

          {showModal && (
            <div className="modal" style={{ display: 'block' }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">¿Deseas generar el PDF?</h5>
                    <button type="button" className="btn-close" onClick={handleCancel}></button>
                  </div>
                  <div className="modal-body">
                    <p> ¿Quieres crear el PDF ahora?</p>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                      No
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={(e) => {
                        e.preventDefault()

                        const clienteInput = document.querySelector('[name="cliente"]')
                        const ubicacionInput = document.querySelector('[name="ubicacion"]')

                        if (!clienteInput || !ubicacionInput) {
                          alert('No se encontraron los campos requeridos.')
                          return
                        }

                        // Recuperar el código de cotización en este momento
                        const selectedCotizacion = cotizacion.find(
                          (c) => c.id.toString() === cotizacionSeleccionado.toString(),
                        )
                        const codigoCotizacion = selectedCotizacion?.codigo || 'SIN-CODIGO'

                        const hoy = new Date()
                        const anio = hoy.getFullYear()
                        const mes = String(hoy.getMonth() + 1).padStart(2, '0')
                        const dia = String(hoy.getDate()).padStart(2, '0')
                        const mes_dia = `${mes}${dia}`

                        const abreviado_usuario = (
                          usuarioSeleccionado.slice(0, 3) || 'USR'
                        ).toUpperCase()

                        const limpiar = (texto) =>
                          texto.replace(/[^a-zA-Z0-9_-]/g, '').replace(/\s+/g, '_')

                        const cliente_limpio = limpiar(clienteInput.value || 'Cliente')
                        const ubicacion_limpia = limpiar(ubicacionInput.value || 'Ubicacion')

                        handleGeneratePDF(
                          anio,
                          mes_dia,
                          abreviado_usuario,
                          codigoCotizacion,
                          cliente_limpio,
                          ubicacion_limpia,
                        )
                      }}
                    >
                      Sí
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showModalJPG && (
            <div className="modal" style={{ display: 'block' }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">¿Deseas generar el JPG?</h5>
                    <button type="button" className="btn-close" onClick={handleCancel1}></button>
                  </div>
                  <div className="modal-body">
                    <p> ¿Quieres crear el JPG ahora?</p>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleCancel1}>
                      No
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={(e) => {
                        e.preventDefault()

                        const clienteInput = document.querySelector('[name="cliente"]')
                        const ubicacionInput = document.querySelector('[name="ubicacion"]')

                        if (!clienteInput || !ubicacionInput) {
                          alert('No se encontraron los campos requeridos.')
                          return
                        }

                        // Recuperar el código de cotización en este momento
                        const selectedCotizacion = cotizacion.find(
                          (c) => c.id.toString() === cotizacionSeleccionado.toString(),
                        )
                        const codigoCotizacion = selectedCotizacion?.codigo || 'SIN-CODIGO'

                        const hoy = new Date()
                        const anio = hoy.getFullYear()
                        const mes = String(hoy.getMonth() + 1).padStart(2, '0')
                        const dia = String(hoy.getDate()).padStart(2, '0')
                        const mes_dia = `${mes}${dia}`

                        const abreviado_usuario = (
                          usuarioSeleccionado.slice(0, 3) || 'USR'
                        ).toUpperCase()

                        const limpiar = (texto) =>
                          texto.replace(/[^a-zA-Z0-9_-]/g, '').replace(/\s+/g, '_')

                        const cliente_limpio = limpiar(clienteInput.value || 'Cliente')
                        const ubicacion_limpia = limpiar(ubicacionInput.value || 'Ubicacion')

                        handleGenerateJPG(
                          anio,
                          mes_dia,
                          abreviado_usuario,
                          codigoCotizacion,
                          cliente_limpio,
                          ubicacion_limpia,
                        )
                      }}
                    >
                      Sí
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
