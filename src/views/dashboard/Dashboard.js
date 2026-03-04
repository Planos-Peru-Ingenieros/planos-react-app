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

import MainCotizaciones from './MainCotizaciones'

const Dashboard = () => {
  const tableExample = [
    {
      avatar: { initials: 'AA', color: 'primary' },
      user: { name: 'Anthoni Alfaro', registered: 'Jan 1, 2025' },
      country: { flag: cifUs },
      usage: { value: 50, color: 'success' },
      payment: { icon: cibCcMastercard },
      activity: '10 sec ago',
    },
    {
      avatar: { initials: 'JP', color: 'info' },
      user: { name: 'Juan Perez', registered: 'Jan 1, 2025' },
      country: { flag: cifBr },
      usage: { value: 22, color: 'info' },
      payment: { icon: cibCcVisa },
      activity: '5 minutes ago',
    },
  ]

  return (
    <>
      <CCard className="mb-4">
        <CCardBody>
          <CRow>
            <CCol sm={5}>
              <h4 className="card-title mb-0">Cotizaciones</h4>
            </CCol>
          </CRow>
          <MainCotizaciones />
        </CCardBody>
      </CCard>
    </>
  )
}

export default Dashboard
