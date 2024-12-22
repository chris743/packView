import React, { useState, useEffect } from 'react';
import ReusableTable from '../components/ReusableTable';
import { fetchData, createData, editData, deleteData } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import ModalForm from '../components/ModalForm';

const endpoint = "growers";

const GrowersPage = () => {
    const [growers, setGrowers] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentGrower, setCurrentGrower] = useState(null);

    const navigate = useNavigate();

    const loadGrowers = async () => {
        const data = await fetchData(endpoint);
        setGrowers(data);
    };

    useEffect(() => {
        loadGrowers();
    }, []);

    const handleOpenModal = (grower = null) => {
        setCurrentGrower(grower);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setCurrentGrower(null);
        setModalOpen(false);
    };

    const columns = [
        { field: 'id', headerName: 'ID' },
        { field: 'name', headerName: 'Grower Name' },
    ];

    const actions = [
        {
            label: 'View',
            color: 'primary',
            onClick: (row) => navigate(`/growers/${row.id}`),
        },
    ];

    const handleSave = async (data) => {
        if (currentGrower) {
            // Edit existing commodity
            await editData(endpoint, currentGrower.id, data);
        } else {
            // Create new commodity
            await createData(endpoint, data);
        }
        loadGrowers();
    };

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
                modalType = 'Add/Edit Commodity'
                fields={[
                    { name: 'name', label: 'Description' },
                    { name: 'grower_id', label: 'Grower ID', type: 'number' },
                    { name: 'grower_contact', label: 'Grower/Owner Name', type: 'text' },
                    { name: 'grower_contact_email', label: 'Grower Email', type: 'text' },
                    { name: 'grower_contact_phone', label: 'Grower Phone', type: 'number' },
                    { name: 'property_manager_name', label: 'Manager Name', type: 'text' },
                    { name: 'property_manager_phone', label: 'Manager Email', type: 'text' },
                    { name: 'property_manager_email', label: 'Manager Phone', type: 'number' },
                ]}
            />
        </div>
    );
};

export default GrowersPage;
