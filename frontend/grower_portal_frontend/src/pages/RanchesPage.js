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

const endpoint = "ranches"

const RanchesPage = () => {
    const [ranches, setRanches] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentRanch, setCurrentRanch] = useState(null);

    const loadRanches = async () => {
        const data = await fetchData(endpoint);
        setRanches(data);
    };

    useEffect(() => {
        loadRanches();
    }, []);

    const handleOpenModal = (Ranch = null) => {
        setCurrentRanch(Ranch);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setCurrentRanch(null);
        setModalOpen(false);
    };

    const handleSave = async (data) => {
        if (currentRanch) {
            // Edit existing ranch
            await editData(endpoint, currentRanch.id, data);
        } else {
            // Create new ranch
            await createData(endpoint, data);
        }
        loadRanches();
    };

    const handleDelete = async (row) => {
        await deleteData(endpoint, row.id);
        loadRanches();
    };

    const columns = [
        { field: 'name', headerName: 'Name' },
        { field: 'grower', headerName: 'Grower/Owner' },
        { field: 'location', headerName: 'Location' },
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
            <h2>Ranches</h2>
            <Button
                variant="contained"
                color="primary"
                onClick={() => handleOpenModal()}
                sx={{ marginBottom: 2 }}
            >
                Add Ranch
            </Button>
            <ReusableTable columns={columns} data={ranches} actions={actions} />
            <ModalForm
                open={modalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                initialData={currentRanch}
                fields={[
                    { name: 'name', label: 'Ranch Name' },
                    { name: 'grower', label: 'Grower/Owner', type: 'text' },
                    { name: 'location', label: 'Address', type: 'text' },
                   
                ]}
            />
        </div>
    );
};

export default RanchesPage;
