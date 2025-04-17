import axios from 'axios';
import { API_URL, CHART_URL } from '../api/api';

/**
 * Service to automatically sync batch IDs from packs_completed to production runs
 */
class BatchSyncService {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.intervalMs = 60000; // 60 seconds
  }

  /**
   * Start the batch sync service
   * @param {Function} onError - Optional callback for error handling
   */
  start(onError) {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log("BatchSync service started");
    
    // Run immediately on start
    this.syncBatches().catch(err => {
      console.error("Initial batch sync failed:", err);
      if (onError) onError(err);
    });
    
    // Set interval for future syncs
    this.intervalId = setInterval(() => {
      this.syncBatches().catch(err => {
        console.error("Batch sync failed:", err);
        if (onError) onError(err);
      });
    }, this.intervalMs);
  }
  
  /**
   * Stop the batch sync service
   */
  stop() {
    if (!this.isRunning) return;
    
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.isRunning = false;
    console.log("BatchSync service stopped");
  }
  
  /**
   * Main sync function that matches batch IDs to production runs
   */
  async syncBatches() {
    try {
      // 1. Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().slice(0, 10);
      
      // 2. Fetch all production runs for today
      const runsResponse = await axios.get(`${API_URL}/production-runs/`);
      const todaysRuns = runsResponse.data.filter(run => run.run_date === today);
      
      if (todaysRuns.length === 0) {
        console.log("No production runs for today, skipping batch sync");
        return;
      }
      
      // 3. Fetch recent packs_completed records
      // Note: Using CHART_URL since this is from the shed_analysis app
      const packsResponse = await axios.get(`${CHART_URL}/packs-completed/`);
      const recentPacks = packsResponse.data;
      
      if (recentPacks.length === 0) {
        console.log("No packs completed data available, skipping batch sync");
        return;
      }
      
      // 4. Process each pack to extract batch ID and grower block ID
      const updates = [];
      
      for (const pack of recentPacks) {
        try {
          // Parse the payload JSON - in the shed_analysis model, payload is a text field
          let payload;
          try {
            payload = typeof pack.payload === 'string' 
              ? JSON.parse(pack.payload) 
              : pack.payload;
          } catch (parseError) {
            console.error(`Error parsing payload for pack ${pack.batch || pack.timestamp}:`, parseError);
            continue;
          }
          
          // Extract the batch ID - can be in different properties based on API response
          const batchId = pack.batch || payload.BatchId;
          
          if (!batchId) {
            console.log("Skipping pack record with no BatchId");
            continue;
          }
          
          // Extract the grower block ID 
          const growerBlockId = payload.UserData?.Famous?.GrowerBlockId;
          
          if (!growerBlockId) {
            console.log(`Skipping batch ${batchId} with no GrowerBlockId`);
            continue;
          }
          
          // 5. Look for matching runs
          const matchingRuns = todaysRuns.filter(run => {
            // Check both direct grower_block_id and flattened path
            const blockId = String(run.grower_block?.block_id || run["grower_block.block_id"] || "");
            return blockId === String(growerBlockId);
          });
          
          // 6. Update matching runs that don't already have a batch ID
          for (const run of matchingRuns) {
            if (!run.batch_id && run.run_status === "In process") {
              console.log(`Matching batch ${batchId} to run ${run.id} (block ${growerBlockId})`);
              
              updates.push({
                runId: run.id,
                batchId: batchId
              });
            }
          }
        } catch (err) {
          console.error("Error processing pack record:", err);
          // Continue with next record
        }
      }
      
      // 7. Perform batch updates
      for (const update of updates) {
        await axios.patch(`${API_URL}/production-runs/${update.runId}/`, {
          batch_id: update.batchId
        });
        console.log(`Updated run ${update.runId} with batch ${update.batchId}`);
      }
      
      return updates.length; // Return number of updates made
    } catch (error) {
      console.error("Error in syncBatches:", error);
      throw error;
    }
  }
}

// Create singleton instance
const batchSyncService = new BatchSyncService();

export default batchSyncService;