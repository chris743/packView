import axios from "axios";
import { data } from "react-router-dom";

// Set up base URL if needed, e.g. for your backend server
export const API_URL = "http://192.168.126.112:8000/api"; // Replace with your API URL
export const CHART_URL = "http://192.168.126.112:8000/data";

// Fetch all commodities
export const fetchData = async (endpoint) => {
  try {
    const response = await axios.get(`${API_URL}/${endpoint}/`);
    return response.data;
  } catch (error) {
    throw new Error("Error fetching commodities");
  }
};

export const fetchChartData = async (endpoint) => {
  try {
    const response = await axios.get(`${CHART_URL}/${endpoint}/`);
    return response.data;
  } catch (error) {
    throw new Error("Error fetching commodities");
  }
};

// Create a new commodity
export const createData = async (endpoint, data) => {
  try {
    const response = await axios.post(`${API_URL}/${endpoint}/`, data);
    return response.data; // Return the created commodity
  } catch (error) {
    console.log(data);
    console.log(`${API_URL}/${endpoint}/`);
    throw new Error("Error creating oject");
  }
};

// Update an existing commodity
export const editData = async (endpoint, id, data) => {
  try {
    console.log(`Making API request to: ${API_URL}/${endpoint}/${id}/`);
    console.log("Request payload:", data);
    
    const response = await axios.put(`${API_URL}/${endpoint}/${id}/`, data);
    
    console.log("API response:", response.data);
    return response.data; // Return the updated commodity
  } catch (error) {
    console.error("API error details:", error.response?.data || error.message);
    console.error("Status code:", error.response?.status);
    console.error("Headers:", error.response?.headers);
    
    // Rethrow with more details
    if (error.response) {
      throw error; // Keep the original axios error with response data
    } else {
      throw new Error(`Error updating ${endpoint}: ${error.message}`);
    }
  }
};

// Delete a commodity by ID
export const deleteData = async (endpoint, id) => {
  const response = await fetch(`${API_URL}/${endpoint}/${id}/`, {
    method: 'DELETE',
  });

  // Check if the deletion was successful (status 204)
  if (response.status === 204) {
    return { success: true }; // Indicate successful deletion
  } else if (response.ok) {
    return await response.json(); // Handle other successful responses (if any)
  } else {
    throw new Error('Failed to delete commodity');
  }
};

export const saveRowOrder = async (endpoint, orderedRows) => {
  try {
    // Validate input data
    if (!Array.isArray(orderedRows) || orderedRows.length === 0) {
      console.error("Invalid input for saveRowOrder:", orderedRows);
      throw new Error("Invalid rows data for reordering");
    }
    
    // Ensure each row has id and row_order
    const validRows = orderedRows.filter(row => 
      row && row.id && row.row_order !== undefined && row.row_order !== null
    );
    
    if (validRows.length === 0) {
      console.error("No valid rows to save order:", orderedRows);
      throw new Error("No valid rows to save order");
    }
    
    // Extract only the needed fields to reduce payload size
    const payload = {
      rows: validRows.map(row => ({
        id: row.id,
        row_order: row.row_order,
      }))
    };
    
    console.log(`Saving row order to ${API_URL}/${endpoint}/reorder/ with payload:`, payload);
    
    const response = await axios.post(`${API_URL}/${endpoint}/reorder/`, payload);
    
    console.log('Row order save response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error saving row order:", error);
    console.error("Error details:", error.response?.data);
    console.error("Status code:", error.response?.status);
    console.error("Request payload:", orderedRows);
    throw error; // Preserve the original error for better debugging
  }
};

export const printerScannerData = async () => {
  try {
    const response = await fetch('http://192.168.128.29:5001/status');
    const data = await response.json();
    return {
      scanners: data?.scanners || {},
      printers: data?.printers || {}
    };
  } catch (error) {
    console.error("Diagnostics fetch error:", error);
    return { scanners: {}, printers: {} };
  }
};