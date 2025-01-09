import React, {useState, useEffect } from "react";
import { fetchData, editData, deleteData } from "../api/api";
import { Box } from "@mui/material";
import DailyHarvestTable from "../components/HarvestPlanWeeklyTable";

const harvestEndpoint = "planned-harvests";

const ReceivingPage = () => {
    const [ harvestData, setHarvestData ] = useState([]);
    const [ day, setDay ] = useState(null);

    const loadData = async () => {
        const response = await fetchData(harvestEndpoint);
        setHarvestData(response)
    }

    useEffect (() => {
        loadData();
    })

    const setSelectedDay = () =>{}

    const columns = [
        { field: "commodity", headerName: "commodity"},
        { field: "harvest_date", headerName: "Date"},
        { field: "growerBlockId", headerName: "Block ID" },
        { field: "growerBlockName", headerName: "Block Name" },
        { field: "planned_bins", headerName: "Est. Bins" },
        { field: "hauler", headerName: "Haul" },
        { field: "forklift_contractor", headerName: "Fork" },
        { field: "contractor", headerName: "Pick" },
        { field: "deliver_to", headerName: "Receiver" },
        { field: "packed_by", headerName: "Packer"},
        { field: "pool", headerName: "Pool"},
        { field: "grower_red", fieldName: "Rep"},
        { field: "bins_received", headerName: "Bins Received" },
      ];
    

    return (
        <Box>
            Receiving page
            
        </Box>
    )
}

export default ReceivingPage;