import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReusableTable from '../components/ReusableTable';
import ModalForm from '../components/ModalForm';
import { fetchData, createData } from '../api/api';
import { Button, Card, CardContent, Typography, Box } from '@mui/material';

const ranch_endpoint = "ranches";
const block_endpoint = "blocks";

const GrowerDetailPage = () => {
    const { growerId } = useParams();
    const [grower, setGrower] = useState(null);
    const [ranches, setRanches] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [commodities, setCommodities] = useState([]);
    const [varieties, setVarieties] = useState([]);
    const [selectedRanch, setSelectedRanch] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null); // "ranch" or "block"
    const [currentEntity, setCurrentEntity] = useState(null);

    const loadData = async () => {
        const growerData = await fetchData(`growers/${growerId}`);
        const ranchesData = await fetchData(`${ranch_endpoint}?grower=${growerId}`);
        const commoditiesData = await fetchData('commodities');
        const varietiesData = await fetchData('varieties');


        setGrower(growerData);
        setRanches(ranchesData);
        setCommodities(commoditiesData);
        setVarieties(varietiesData);

        // Automatically select the first ranch
        if (ranchesData.length > 0) {
            setSelectedRanch(ranchesData[0]);
            const blocksData = await fetchData(`${block_endpoint}?ranch=${ranchesData[0].id}`);
            setBlocks(blocksData);
        }
    };

    useEffect(() => {
        loadData();
    }, [growerId]);

    const handleRanchClick = async (ranch) => {
        setSelectedRanch(ranch);
        const blocksData = await fetchData(`${block_endpoint}?ranch=${ranch.id}`);
        setBlocks(blocksData);
    };

    const handleOpenModal = (type, entity = null) => {
        setModalType(type);
        setCurrentEntity(entity);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalType(null);
        setCurrentEntity(null);
        setModalOpen(false);
    };

    const handleSave = async (data) => {
        if (modalType === 'ranch') {
            await createData(ranch_endpoint, { ...data, grower_id: grower.id });
        } else if (modalType === 'block') {
            await createData(block_endpoint, { ...data, ranch_id: selectedRanch.id });
            console.log(data);
        }
        loadData();
        handleCloseModal();
    };

    return (
        <div>
            {grower && (
                <>
                    {/* Header Section */}
                    <Card sx={{ marginBottom: 3 }}>
                        <CardContent>
                            <Typography variant="h4">Grower: {grower.name}</Typography>
                            <Typography variant="body1">Email: {grower.email || "N/A"}</Typography>
                            <Typography variant="body1">Phone: {grower.phone || "N/A"}</Typography>
                        </CardContent>
                    </Card>

                    {/* Two Columns Section */}
                    <Box
                        display="grid"
                        gridTemplateColumns="repeat(2, 1fr)"
                        gap={2}
                    >
                        {/* Left Column: Ranches */}
                        <Box>
                            <Typography variant="h5" sx={{ marginBottom: 2 }}>
                                Ranches
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleOpenModal('ranch')}
                                sx={{ marginBottom: 2 }}
                            >
                                Add Ranch
                            </Button>
                            <ReusableTable
                                columns={[
                                    { field: 'id', headerName: 'ID' },
                                    { field: 'name', headerName: 'Ranch Name' },
                                ]}
                                data={ranches}
                                actions={[
                                    {
                                        label: 'View Blocks',
                                        color: 'secondary',
                                        onClick: (row) => handleRanchClick(row),
                                    },
                                ]}
                            />
                        </Box>

                        {/* Right Column: Blocks of Selected Ranch */}
                        <Box>
                            <Typography variant="h5" sx={{ marginBottom: 2 }}>
                                Blocks for Ranch: {selectedRanch?.name || "Select a Ranch"}
                            </Typography>
                            {selectedRanch && (
                                <>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleOpenModal('block')}
                                        sx={{ marginBottom: 2 }}
                                    >
                                        Add Block
                                    </Button>
                                    <ReusableTable
                                        columns={[
                                            { field: 'id', headerName: 'ID' },
                                            { field: 'name', headerName: 'Block Name' },
                                            { field: 'size', headerName: 'Size (acres)' },
                                            { field: 'gib_applied', headerName: 'Gib Applied' },
                                            {
                                                field: 'planted_commodity',
                                                headerName: 'Planted Commodity',
                                                render: (row) => row.planted_commodity?.name || "N/A",
                                            },
                                        ]}
                                        data={blocks}
                                    />
                                </>
                            )}
                        </Box>
                    </Box>
                </>
            )}

            {/* Modal for Adding Ranches or Blocks */}
            <ModalForm
                open={modalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                initialData={currentEntity}
                modalType={modalType === 'ranch' ? 'Add/Edit Ranch' : 'Add/Edit Block'}
                fields={
                    modalType === 'ranch'
                        ? [{ name: 'name', label: 'Ranch Name' }]
                        : modalType === 'block'
                        ? [
                              { name: 'name', label: 'Block Name' },
                              { name: 'size', label: 'Size (acres)', type: 'number' },
                              {
                                  name: 'planted_commodity',
                                  label: 'Planted Commodity',
                                  type: 'select',
                                  options: commodities.map((c) => ({
                                      value: c.id,
                                      label: c.name,
                                  })),
                              },
                              {
                                name: 'planted_variety',
                                label: 'Planted Variety',
                                type: 'select',
                                options: varieties.map((v=v) => ({
                                    value: v.id,
                                    label: v.name,
                                })),
                            },
                              { name: 'gib_applied', label: 'Gib Applied', type: 'checkbox' },
                          ]
                        : []
                }
            />
        </div>
    );
};

export default GrowerDetailPage;
