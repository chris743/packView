import { useState, useEffect, useCallback } from 'react';
import { fetchData, fetchChartData, createData, editData, deleteData } from '../api/api';

/**
 * Custom hook for handling common data fetching operations
 * 
 * @param {Object} options
 * @param {string} options.endpoint - API endpoint to fetch from
 * @param {boolean} options.isChartData - Whether to use fetchChartData instead of fetchData
 * @param {boolean} options.loadOnMount - Whether to load data when component mounts
 * @param {number} options.refreshInterval - Auto-refresh interval in milliseconds
 * @param {function} options.dataTransformer - Function to transform the data after fetching
 */
const useDataFetching = ({
  endpoint,
  isChartData = false,
  loadOnMount = true,
  refreshInterval = null,
  dataTransformer = null,
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load data function
  const loadData = useCallback(async () => {
    if (!endpoint) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const fetchFunction = isChartData ? fetchChartData : fetchData;
      const responseData = await fetchFunction(endpoint);
      
      // Apply data transformer if provided
      const transformedData = dataTransformer 
        ? dataTransformer(responseData) 
        : responseData;
      
      setData(transformedData);
    } catch (err) {
      console.error(`Error fetching data from ${endpoint}:`, err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [endpoint, isChartData, dataTransformer]);

  // Create item
  const createItem = useCallback(async (itemData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await createData(endpoint, itemData);
      await loadData(); // Reload data after creation
      return result;
    } catch (err) {
      console.error(`Error creating item in ${endpoint}:`, err);
      setError(err.message || 'Failed to create item');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, loadData]);

  // Update item
  const updateItem = useCallback(async (id, itemData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await editData(endpoint, id, itemData);
      await loadData(); // Reload data after update
      return result;
    } catch (err) {
      console.error(`Error updating item in ${endpoint}:`, err);
      setError(err.message || 'Failed to update item');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, loadData]);

  // Delete item
  const deleteItem = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await deleteData(endpoint, id);
      await loadData(); // Reload data after deletion
      return result;
    } catch (err) {
      console.error(`Error deleting item from ${endpoint}:`, err);
      setError(err.message || 'Failed to delete item');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, loadData]);

  // Load data on mount if required
  useEffect(() => {
    if (loadOnMount) {
      loadData();
    }
  }, [loadOnMount, loadData]);

  // Set up refresh interval if provided
  useEffect(() => {
    if (!refreshInterval) return;
    
    const intervalId = setInterval(() => {
      loadData();
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval, loadData]);

  return {
    data,
    loading,
    error,
    loadData,
    createItem,
    updateItem,
    deleteItem,
    setData,
  };
};

export default useDataFetching;