import React from 'react'
import {
  CAvatar,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cibCcMastercard,
  cibCcVisa,
  cifUs,
  cifBr,
  cilCloudDownload,
  cilPeople,
} from '@coreui/icons'

import MainChart from './MainChart'

const Dashboard = () => {
  const tableExample = [
    { 
      avatar: { initials: 'AA', color: 'primary' }, 
      user: { name: 'Anthoni Alfaro', registered: 'Jan 1, 2025' }, 
      country: { flag: cifUs }, 
      usage: { value: 50, color: 'success' }, 
      payment: { icon: cibCcMastercard }, 
      activity: '10 sec ago' 
    },
    { 
      avatar: { initials: 'JP', color: 'info' }, 
      user: { name: 'Juan Perez', registered: 'Jan 1, 2025' }, 
      country: { flag: cifBr }, 
      usage: { value: 22, color: 'info' }, 
      payment: { icon: cibCcVisa }, 
      activity: '5 minutes ago' 
    },
  ]

  return (
    <>
      <CCard className="mb-4">
        <CCardBody>
          <CRow>
            <CCol sm={5}>
              <h4 className="card-title mb-0">Tráfico de Red</h4>
            </CCol>
            <CCol sm={7} className="d-none d-md-block">
              <CButton color="primary" className="float-end">
                <CIcon icon={cilCloudDownload} />
              </CButton>
            </CCol>
          </CRow>
          <MainChart />
        </CCardBody>
      </CCard>

      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Usuarios de Planos Perú</CCardHeader>
            <CCardBody>
              <CTable align="middle" className="mb-0 border" hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell className="text-center">
                      <CIcon icon={cilPeople} />
                    </CTableHeaderCell>
                    <CTableHeaderCell>Usuario</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">País</CTableHeaderCell>
                    <CTableHeaderCell>Uso de Sistema</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Pago</CTableHeaderCell>
                    <CTableHeaderCell>Actividad</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {tableExample.map((item, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell className="text-center">
                        <CAvatar size="md" color={item.avatar.color}>
                          {item.avatar.initials}
                        </CAvatar>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div>{item.user.name}</div>
                        <div className="small text-muted">Registrado: {item.user.registered}</div>
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <CIcon size="xl" icon={item.country.flag} />
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="fw-semibold">{item.usage.value}%</div>
                        <CProgress thin color={item.usage.color} value={item.usage.value} />
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <CIcon size="xl" icon={item.payment.icon} />
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="fw-semibold">{item.activity}</div>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Dashboard