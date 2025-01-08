import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import ReusableTable from '../components/ReusableTable';
import ModalForm from '../components/ModalForm';
import {
    fetchData,
    editData,
    createData,
    deleteData
} from '../api/api';

const endpoint = "growers"

const GrowersPage = () => {
    const [data, setData] = useState([]);

    const loadData = async () => {
        const data = await fetchData(endpoint);
        setData(data);
    };

    useEffect(() => {
        loadGrowers();
    }, []);

    const handleOpenModal = (Grower = null) => {
        setCurrentGrower(Grower);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setCurrentGrower(null);
        setModalOpen(false);
    };

    const handleSave = async (data) => {
        if (currentGrower) {
            // Edit existing Grower
            await editData(endpoint, currentGrower.id, data);
        } else {
            // Create new Grower
            await createData(endpoint, data);
        }
        loadGrowers();
    };

    const handleDelete = async (row) => {
        await deleteData(endpoint, row.id);
        loadGrowers();
    };

    const columns = [
        { field: 'name', headerName: 'Grower Name' },
        { field: 'contact_email', headerName: 'Email' },
        { field: 'contact_phone', headerName: 'Phone' },
    ];

    const actions = [
        {
            label: 'Edit',
            color: 'secondary',
            onClick: (row) => handleOpenModal(row),
        },
        {
            label: 'Delete',
            color: 'error',
            onClick: handleDelete,
        },
    ];

    return (
        <div>
            <h2>Growers</h2>
            <Button
                variant="contained"
                color="primary"
                onClick={() => handleOpenModal()}
                sx={{ marginBottom: 2 }}
            >
                Add Grower
            </Button>
            <ReusableTable columns={columns} data={growers} actions={actions} />
            <ModalForm
                open={modalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                initialData={currentGrower}
                fields={[
                    { name: 'name', label: 'Grower Name' },
                    { name: 'contact_email', label: 'Contact Email', type: 'text' },
                    { name: 'contact_phone', label: 'Contact Phone', type: 'phone' },
                   
                ]}
            />
        </div>
    );
};

export default GrowersPage;
