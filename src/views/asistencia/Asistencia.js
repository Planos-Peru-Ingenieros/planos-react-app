import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CFormSelect,
  CFormInput,
  CButton,
  CRow,
  CCol,
} from '@coreui/react'
import axios from 'axios'

const Asistencia = () => {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [salary, setSalary] = useState('')
  const [loading, setLoading] = useState(true) // Estado de carga
  const [error, setError] = useState(null) // Estado de error

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await axios.get('http://127.0.0.1:5000/api/users')

        setUsers(response.data)
      } catch (err) {
        console.error('Error al cargar usuarios:', err)
        setError('No se pudieron cargar los usuarios. Revisa la consola.')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ]
  const monthOptions = [
    { label: 'Selecciona un mes', value: '' }, // Opción por defecto
    ...months.map((monthName, index) => ({
      label: monthName, // El texto que ve el usuario (ej. "Enero")
      value: index + 1, // El valor interno (índice 0 + 1 = 1)
    })),
  ]
  const currentYear = new Date().getFullYear()
  const years = [currentYear, currentYear - 1]

  const options = [
    { label: 'Selecciona un año', value: '' },
    ...years.map((year) => ({
      label: String(year),
      value: year,
    })),
  ]

  const handleSubmit = async (event) => {
    event.preventDefault()

    const formData = {
      userId: selectedUser,
      month: selectedMonth,
      year: selectedYear,
      salary: parseFloat(salary),
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/asistencia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Error al generar el archivo Excel')
      }

      // Recibir el archivo como blob
      const blob = await response.blob()

      // Crear una URL temporal
      const url = window.URL.createObjectURL(blob)

      // Crear un enlace temporal para forzar la descarga
      const a = document.createElement('a')
      a.href = url

      // Recuperar el nombre del archivo del encabezado Content-Disposition
      const disposition = response.headers.get('Content-Disposition')
      let filename = 'reporte.xlsm'
      if (disposition && disposition.includes('filename=')) {
        filename = disposition.split('filename=')[1].replace(/"/g, '')
      }

      a.download = filename
      document.body.appendChild(a)
      a.click()

      // Limpiar
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error:', error)
      alert('Hubo un problema al generar el archivo.')
    }
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>Asistencia</CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSubmit}>
            <CRow className="g-3">
              <CCol md={6}>
                <CFormSelect
                  id="user"
                  label="Usuarios"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  options={[{ label: 'Selecciona un usuario', value: '' }, ...users]}
                />
              </CCol>
              <CCol md={6}>
                <CFormSelect
                  id="month"
                  label="Mes"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  options={monthOptions}
                />
              </CCol>
              <CCol md={6}>
                <CFormSelect
                  id="year"
                  label="Año"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  options={options}
                />
              </CCol>
              <CCol md={6}>
                <CFormInput
                  type="number"
                  id="salario"
                  label="Salario"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="0.00"
                />
              </CCol>
              <CCol xs={12}>
                <CButton color="primary" type="submit">
                  Enviar
                </CButton>
              </CCol>
            </CRow>
          </CForm>
        </CCardBody>
      </CCard>
    </>
  )
}

export default Asistencia
