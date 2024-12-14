import React, { useState, useEffect } from 'react';
import ReusableTable from '../components/ReusableTable';
import { fetchData } from '../api/api';
import { useNavigate } from 'react-router-dom';

const grower_endpoint = "growers";

const GrowersPage = () => {
    const [growers, setGrowers] = useState([]);
    const navigate = useNavigate();

    const loadGrowers = async () => {
        const data = await fetchData(grower_endpoint);
        setGrowers(data);
    };

    useEffect(() => {
        loadGrowers();
    }, []);

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

    return (
        <div>
            <h2>Growers</h2>
            <ReusableTable columns={columns} data={growers} actions={actions} />
        </div>
    );
};

export default GrowersPage;
