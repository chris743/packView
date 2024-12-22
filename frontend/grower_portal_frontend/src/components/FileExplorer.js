import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    List, ListItem, ListItemIcon, ListItemText, Button, Typography, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Breadcrumbs, Link 
} from '@mui/material';
import { 
    Folder as FolderIcon, 
    InsertDriveFile as FileIcon, 
    ArrowBack as BackIcon, 
    Upload as UploadIcon, 
    CreateNewFolder as NewFolderIcon 
} from '@mui/icons-material';

const FileExplorer = ({ growerId }) => {
    const [currentFolder, setCurrentFolder] = useState(null); // Current folder object
    const [folders, setFolders] = useState([]);
    const [files, setFiles] = useState([]);
    const [path, setPath] = useState([]); // Array of folder objects for breadcrumbs
    const [newFolderName, setNewFolderName] = useState('');
    const [openFolderDialog, setOpenFolderDialog] = useState(false);

    const API_URL = "http://127.0.0.1:8000/api";

    useEffect(() => {
        fetchFoldersAndFiles();
    }, [currentFolder]);

    const fetchFoldersAndFiles = async () => {
        const folderId = currentFolder?.id || null;
    
        try {
            // Fetch folders and files for the current grower and folder
            const folderResponse = await axios.get(`/api/folders/?grower=${growerId}&parent=${folderId}`);
            const fileResponse = await axios.get(`/api/files/?folder=${folderId}`);
            
            setFolders(folderResponse.data); // Set folders for the grower
            setFiles(fileResponse.data); // Set files for the grower
        } catch (error) {
            console.error("Error fetching folders or files:", error.response || error.message || error);
        }
    };
    

    const handleNavigate = (folder) => {
        console.log("Navigating to folder:", folder); // Debugging
        setPath((prevPath) => [...prevPath, folder]); // Add folder to path
        setCurrentFolder(folder); // Update current folder
    };

    const handleBreadcrumbClick = (folder, index) => {
        // Update both the path and the current folder
        setPath(path.slice(0, index + 1));
        setCurrentFolder(folder);
    };

    const handleRootNavigation = () => {
        setPath([]);
        setCurrentFolder(null);
    };

    const handleGoBack = () => {
        const newPath = [...path];
        newPath.pop(); // Remove the last folder in the path
        setPath(newPath);
        setCurrentFolder(newPath.length > 0 ? newPath[newPath.length - 1] : null); // Set to null for root
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name);
        formData.append('folder', currentFolder?.id || '');

        try {
            await axios.post('/api/files/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            fetchFoldersAndFiles(); // Refresh after upload
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    const handleOpenFolderDialog = () => setOpenFolderDialog(true);
    const handleCloseFolderDialog = () => {
        setNewFolderName('');
        setOpenFolderDialog(false);
    };

    const handleCreateFolder = async () => {
        if (!newFolderName) return;

        try {
            await axios.post('/api/folders/', {
                name: newFolderName,
                parent: currentFolder?.id || null,
                grower: growerId,
            });
            setNewFolderName('');
            fetchFoldersAndFiles();
        } catch (error) {
            console.error("Error creating folder:", error);
        }

        handleCloseFolderDialog();
    };

    return (
        <div>
            <Typography variant="h4">File Explorer</Typography>

            {/* Breadcrumb Navigation */}
            <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: 2 }}>
                <Link onClick={handleRootNavigation} style={{ cursor: 'pointer' }}>
                    Root
                </Link>
                {path.map((folder, index) => (
                    <Link
                        key={folder.id}
                        onClick={() => handleBreadcrumbClick(folder, index)}
                        style={{ cursor: 'pointer' }}
                    >
                        {folder.name}
                    </Link>
                ))}
            </Breadcrumbs>

            <div style={{ marginBottom: 10 }}>
                <Button variant="contained" color="secondary" onClick={handleGoBack} disabled={path.length === 0}>
                    <BackIcon /> Go Back
                </Button>

                <Button
                    variant="contained"
                    color="primary"
                    style={{ marginLeft: 10 }}
                    startIcon={<NewFolderIcon />}
                    onClick={handleOpenFolderDialog}
                >
                    New Folder
                </Button>

                <Button
                    variant="contained"
                    color="primary"
                    component="label"
                    style={{ marginLeft: 10 }}
                    startIcon={<UploadIcon />}
                >
                    Upload File
                    <input type="file" hidden onChange={handleFileUpload} />
                </Button>
            </div>

            {/* List Folders and Files */}
            <List>
                {folders.map((folder) => (
                    <ListItem key={folder.id} button onClick={() => handleNavigate(folder)}>
                        <ListItemIcon>
                            <FolderIcon />
                        </ListItemIcon>
                        <ListItemText primary={folder.name} />
                    </ListItem>
                ))}
                {files.map((file) => (
                    <ListItem key={file.id}>
                        <ListItemIcon>
                            <FileIcon />
                        </ListItemIcon>
                        <ListItemText
                            primary={file.name}
                            secondary={
                                <a href={file.file} target="_blank" rel="noopener noreferrer">
                                    View File
                                </a>
                            }
                        />
                    </ListItem>
                ))}
            </List>

            {/* Create Folder Dialog */}
            <Dialog open={openFolderDialog} onClose={handleCloseFolderDialog}>
                <DialogTitle>Create New Folder</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Folder Name"
                        fullWidth
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseFolderDialog} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleCreateFolder} color="primary">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default FileExplorer;
