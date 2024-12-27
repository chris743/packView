import axios from "axios";
import { data } from "react-router-dom";

// Set up base URL if needed, e.g. for your backend server
const API_URL = "http://192.168.128.210:8000/api"; // Replace with your API URL
const CHART_URL = "http://192.168.128.210:8000/data";

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
    const response = await axios.put(`${API_URL}/${endpoint}/${id}/`, data);
    return response.data; // Return the updated commodity
  } catch (error) {
    throw new Error("Error updating commodity");
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