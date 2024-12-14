import React, { useEffect, useState } from 'react';
import { Modal, TextField, Box, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const ModalForm = ({ open, onClose, onSave, initialData, fields }) => {
    const [formData, setFormData] = useState({});

    // Initialize form data when initialData changes
    useEffect(() => {
        setFormData(initialData || {});
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = () => {
        onSave(formData);
        onClose();
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    p: 4,
                    boxShadow: 24,
                    borderRadius: 2,
                }}
            >
                <h2>{initialData ? 'Edit Block' : 'Add Block'}</h2>
                {fields.map((field) => {
                    if (field.type === 'select') {
                        return (
                            <FormControl fullWidth key={field.name} margin="normal">
                                <InputLabel>{field.label}</InputLabel>
                                <Select
                                    name={field.name}
                                    value={formData[field.name] || ''}
                                    onChange={handleChange}
                                >
                                    {field.options.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        );
                    }
                    return (
                        <TextField
                            key={field.name}
                            fullWidth
                            margin="normal"
                            label={field.label}
                            name={field.name}
                            type={field.type || 'text'}
                            value={formData[field.name] || ''}
                            onChange={handleChange}
                        />
                    );
                })}
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Button variant="contained" color="primary" onClick={handleSubmit}>
                        Save
                    </Button>
                    <Button variant="outlined" onClick={onClose}>
                        Cancel
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default ModalForm;
