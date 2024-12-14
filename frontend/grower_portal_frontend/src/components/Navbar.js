import React from 'react';
import { AppBar, Typography, Toolbar } from '@mui/material';

const Navbar = () => (
    <AppBar position='static'>
        <Toolbar>
            <Typography variant='h6'>Cobblestone Portal</Typography>
        </Toolbar>
    </AppBar>
);

export default Navbar;