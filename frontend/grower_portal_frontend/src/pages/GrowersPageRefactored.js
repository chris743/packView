import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import PageLayout from '../components/PageLayout';
import DataTable from '../components/DataTable';
import ModalDialog from '../components/ModalDialog';
import FormBuilder from '../components/FormBuilder';
import useDataFetching from '../hooks/useDataFetching';

const GrowersPage = () => {
  const [currentGrower, setCurrentGrower] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  // Use our custom hook for data fetching
  const { 
    data: growers, 
    loading, 
    error, 
    createItem, 
    updateItem 
  } = useDataFetching({
    endpoint: 'growers',
    loadOnMount: true
  });

  // Define columns for DataTable
  const columns = [
    { field: 'id', headerName: 'ID', width: 100, sortable: true },
    { field: 'name', headerName: 'Grower Name', sortable: true },
    { 
      field: 'grower_contact', 
      headerName: 'Contact Person',
      sortable: true,
      renderCell: (row) => row.grower_contact || 'N/A'
    },
    { 
      field: 'grower_contact_email', 
      headerName: 'Email', 
      sortable: true,
      renderCell: (row) => row.grower_contact_email || 'N/A'
    },
  ];

  // Define actions for DataTable
  const actions = [
    {
      label: 'View',
      color: 'primary',
      onClick: (row) => navigate(`/growers/${row.id}`),
    },
    {
      label: 'Edit',
      color: 'secondary',
      onClick: (row) => handleOpenModal(row),
    },
  ];

  // Define form fields for FormBuilder
  const formFields = [
    { name: 'name', label: 'Description', required: true },
    { name: 'grower_id', label: 'Grower ID', type: 'number', width: 6 },
    { name: 'grower_contact', label: 'Grower/Owner Name', type: 'text', width: 6 },
    { name: 'grower_contact_email', label: 'Grower Email', type: 'email', width: 6 },
    { name: 'grower_contact_phone', label: 'Grower Phone', type: 'text', width: 6 },
    { name: 'property_manager_name', label: 'Manager Name', type: 'text', width: 6 },
    { name: 'property_manager_email', label: 'Manager Email', type: 'email', width: 6 },
    { name: 'property_manager_phone', label: 'Manager Phone', type: 'text', width: 6 },
  ];

  // Handle modal open/close
  const handleOpenModal = (grower = null) => {
    setCurrentGrower(grower);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setCurrentGrower(null);
    setModalOpen(false);
  };

  // Form submission handler
  const handleSave = async (formData) => {
    try {
      if (currentGrower) {
        await updateItem(currentGrower.id, formData);
      } else {
        await createItem(formData);
      }
      handleCloseModal();
    } catch (err) {
      console.error('Error saving grower:', err);
      // Could show error notification here
    }
  };

  // Buttons for the modal
  const modalActions = (
    <>
      <Button variant="outlined" onClick={handleCloseModal}>
        Cancel
      </Button>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => {
          // Get form data from FormBuilder and save
          // This would typically be handled by a form submission
          const formData = document.getElementById('grower-form')
            ? new FormData(document.getElementById('grower-form'))
            : {};
          handleSave(formData);
        }}
      >
        Save
      </Button>
    </>
  );

  // Header actions for the page
  const headerActions = (
    <Button
      variant="contained"
      color="primary"
      onClick={() => handleOpenModal()}
    >
      Add Grower
    </Button>
  );

  return (
    <PageLayout
      title="Growers"
      headerActions={headerActions}
      loading={loading}
      error={error}
    >
      <DataTable
        columns={columns}
        data={growers}
        actions={actions}
        enableSearch={true}
        enablePagination={true}
      />

      <ModalDialog
        open={modalOpen}
        onClose={handleCloseModal}
        title={currentGrower ? 'Edit Grower' : 'Add Grower'}
        actions={modalActions}
      >
        <FormBuilder
          fields={formFields}
          initialValues={currentGrower || {}}
          onChange={(values) => console.log('Form values:', values)}
        />
      </ModalDialog>
    </PageLayout>
  );
};

export default GrowersPage;