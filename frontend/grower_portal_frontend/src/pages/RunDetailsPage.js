import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import axios from "axios";


const endpoint = "http://localhost:8000/api/production-runs";

const RunDetailsPage = () => {
  const { runId } = useParams();
  const [run, setRun] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRunDetails = async () => {
      try {
        const response = await axios.get(`${endpoint}/${runId}/details`);
        setRun(response.data);
      } catch (error) {
        console.error("Error fetching run details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRunDetails();
  }, [runId]);

  if (loading) return <Typography>Loading...</Typography>;
  if (!run) return <Typography>No data found for this run.</Typography>;

  const sizerData = run.sizer_data?.raw_JSON || [];

  const { pool_id, block_id, packout_date, product_id } = sizerData[0] || {};
  const commodityCode = product_id?.substring(0, 2) || "";
  const commodityLabel =
    {
      CA: "Cara Cara",
      NA: "Navel",
      VA: "Valencia",
      BL: "Blood",
      GR: "Grapefruit",
      MA: "Mandarin",
      MI: "Minneola",
      // Add more mappings as needed
    }[commodityCode] || commodityCode;

    const gradeTotals = sizerData.reduce((acc, item) => {
        const grade = item.product_id?.substring(7) || "";
        const gradeLabel = {
          FA: "Fancy",
          CH: "Choice",
          EX: "Export",
        }[grade] || grade;
      
        acc[gradeLabel] = (acc[gradeLabel] || 0) + item.quantity;
        return acc;
      }, {});

  const sortedSizerData = [...sizerData]
    .map((item) => {
      const product = item.product_id || "";
      const gradeCode = product.substring(7);
      const size = product.substring(4, 7);
      const gradeLabel =
        {
          FA: "Fancy",
          CH: "Choice",
          EX: "Export",
          EF: "Export Fancy",
          EC: "Export Choice",
          JU: "Juice",
          RO: "Rot"
        }[gradeCode] || gradeCode;
    const gradeTotal = gradeTotals[gradeLabel] || 1;
    const percent = (item.quantity / gradeTotal) * 100;

      return {
        gradeLabel,
        size: parseInt(size), // ensure numeric sorting
        quantity: item.quantity,
        percent: Number(((item.quantity / gradeTotal) * 100).toFixed(1)),
      };
    })
    .filter((item) => item.quantity > 0) // filter out zero quantities
    .sort((a, b) => {
      const gradeOrder = { Fancy: 1, Choice: 2, Export: 3 };
      const gradeCompare =
        (gradeOrder[a.gradeLabel] || 99) - (gradeOrder[b.gradeLabel] || 99);
      if (gradeCompare !== 0) return gradeCompare;
      return a.size - b.size;
    });

    const totalCtns = sizerData.reduce((sum, item) => sum + item.quantity, 0);
    const bins = run?.bins || 0;

    const fancy = sizerData
    .filter(item => item.product_id?.endsWith("FA"))
    .reduce((sum, item) => sum + item.quantity, 0);

    const choice = sizerData
    .filter(item => item.product_id?.endsWith("CH"))
    .reduce((sum, item) => sum + item.quantity, 0);

    const other = totalCtns - fancy - choice;

    const fancyPct = (((fancy + other) / totalCtns) * 100).toFixed(1);
    const choicePct = ((choice / totalCtns) * 100).toFixed(1);

    console.log("Run Details:", run);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Run Details
      </Typography>

      <Paper elevation={3} sx={{ p: 2, mb: 4, width: "75%" }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 2, width: "75%" }}>
        <Box sx={{ textAlign: 'left', alignItems: 'left', paddingRight: 0, marginRight: 1 }}>
            <Typography variant="h6">Commodity: {commodityLabel}</Typography>
            <Typography variant="h6">Block: {block_id}</Typography>
            <Typography variant="h6">Pool: {pool_id}</Typography>
            <Typography variant="h6">Date: {packout_date}</Typography>
        </Box>

        <Box sx={{ textAlign: 'left', alignItems: 'left', marginLeft: 1 }}>
            <Typography variant="h6">Total Cartons: {totalCtns}</Typography>
            <Typography variant="h6">Bins: {run?.bins || 0}</Typography>
            <Typography variant="h6">
            Ctns per Bin: {bins > 0 ? (totalCtns / bins).toFixed(2) : "—"}
            </Typography>
            <Typography variant="h6">Fancy: {fancyPct}%</Typography>
            <Typography variant="h6">Choice: {choicePct}%</Typography>
        </Box>
        </Box>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Packout Breakdown
      </Typography>
      <Paper sx={{width: "75%"}}>
      <Table size="small" >
        <TableHead>
            <TableRow>
            <TableCell><strong>Grade</strong></TableCell>
            <TableCell><strong>Size</strong></TableCell>
            <TableCell><strong>Quantity</strong></TableCell>
            <TableCell><strong>% of Grade</strong></TableCell>
            <TableCell><strong>Visual</strong></TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {sortedSizerData.map((row, index, arr) => {
                const isFirstOfGrade =
                index === 0 || row.gradeLabel !== arr[index - 1].gradeLabel;

                return (
                <React.Fragment key={index}>
                    {isFirstOfGrade && index !== 0 && (
                    <TableRow>
                        <TableCell colSpan={5}>
                        <Box
                            sx={{
                            height: 1,
                            backgroundColor: "#ddd",
                            my: 1,
                            }}
                        />
                        </TableCell>
                    </TableRow>
                    )}
                    <TableRow>
                    <TableCell sx={{ width: 75 }}>{row.gradeLabel}</TableCell>
                    <TableCell sx={{ width: 75 }}>{row.size}</TableCell>
                    <TableCell sx={{ width: 75 }}>{row.quantity}</TableCell>
                    <TableCell sx={{ width: 150 }}>{row.percent}%</TableCell>
                    <TableCell>
                        <Box
                        sx={{
                            width: `${row.percent}%`,
                            height: 12,
                            backgroundColor: "#4caf50",
                            borderRadius: 1,
                        }}
                        />
                    </TableCell>
                    </TableRow>
                </React.Fragment>
                );
            })}
            </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default RunDetailsPage;
