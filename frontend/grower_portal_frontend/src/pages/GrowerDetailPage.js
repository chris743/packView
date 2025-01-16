import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TabView from '../components/TabView';
import ReusableTable from '../components/ReusableTable';
import ModalForm from '../components/ModalForm';
import { fetchData, createData } from '../api/api';
import { Button, Card, CardContent, Typography, Box } from '@mui/material';
import FileExplorer from '../components/FileExplorer';

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
        try {
            const growerData = await fetchData(`growers/${growerId}`);
            const ranchesData = await fetchData(`${ranch_endpoint}?grower=${growerId}`);
            const commoditiesData = await fetchData('commodities');
            const varietiesData = await fetchData('varieties');

            setGrower(growerData);
            setRanches(ranchesData);
            setCommodities(commoditiesData);
            setVarieties(varietiesData);

            // Reset selected ranch and blocks
            setSelectedRanch(null);
            setBlocks([]);
        } catch (error) {
            console.error("Error loading data:", error);
        }
    };

    useEffect(() => {
        loadData();
    }, [growerId]);

    const handleRanchClick = async (ranch) => {
        setSelectedRanch(ranch);
        try {
            const blocksData = await fetchData(`${block_endpoint}?ranch=${ranch.id}`);
            setBlocks(blocksData);
        } catch (error) {
            console.error("Error fetching blocks:", error);
        }
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
        try {
          const previouslySelectedRanchId = selectedRanch?.id;
      
          if (modalType === 'ranch') {
            // Add grower ID to the ranch creation request
            await createData(ranch_endpoint, { ...data, grower: growerId });
          } else if (modalType === 'block') {
            if (!selectedRanch?.id) {
              console.error("No ranch selected for block creation.");
              return;
            }
            // Add ranch ID to the block creation request
            await createData(block_endpoint, { ...data, ranch_id: selectedRanch.id });
          }
      
          // Reload data after saving
          await loadData();
      
          // If a ranch was previously selected, reload its blocks
          if (previouslySelectedRanchId) {
            const previouslySelectedRanch = ranches.find((r) => r.id === previouslySelectedRanchId);
            if (previouslySelectedRanch) {
              setSelectedRanch(previouslySelectedRanch);
              handleRanchClick(previouslySelectedRanch);
            }
          }
      
          handleCloseModal();
        } catch (error) {
          console.error("Error saving data:", error);
        }
      };

    const propertiesTab = (
        <Box display="flex" gap={3}>
            <Box flex={1}>
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

            <Box flex={1}>
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
                                { field: 'block_id', headerName: 'ID' },
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
    );

    const informationTab = (
        <Box>
            <Typography variant="h5">Grower Information</Typography>
            <Card>
                <CardContent>
                    <Typography variant="h5">Owner Contact</Typography>
                    <Typography variant="body1">Name: {grower?.grower_contact}</Typography>
                    <Typography variant="body1">Email: {grower?.grower_contact_email || "N/A"}</Typography>
                    <Typography variant="body1">Phone: {grower?.grower_contact_phone || "N/A"}</Typography>
                    <Typography variant="h5">Primary Contact</Typography>
                    <Typography variant="body1">Name: {grower?.property_manager_name || "N/A"}</Typography>
                    <Typography variant="body1">Email: {grower?.property_manager_email || "N/A"}</Typography>
                    <Typography variant="body1">Phone: {grower?.property_manager_phone || "N/A"}</Typography>
                </CardContent>
            </Card>
            <Box>
                <Typography variant="h5" sx={{ marginTop: 3 }}>
                    File Explorer
                </Typography>
                <FileExplorer growerId={growerId} />
            </Box>
        </Box>
    );

    return (
        <div>
            {grower && (
                <>
                    <Typography variant="h4" sx={{ marginBottom: 3 }}>
                        {grower.name} (ID: {grower.grower_id})
                    </Typography>
                    <TabView
                        tabs={[
                            { label: "Properties", content: propertiesTab },
                            { label: "Information", content: informationTab },
                        ]}
                    />
                </>
            )}

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
                              { name: 'name', label: 'Block Name', type: 'text' },
                              { name: 'block_id', label: 'Block ID', type: 'number' },
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
                                  options: varieties.map((v) => ({
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
