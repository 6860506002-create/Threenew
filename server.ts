import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection pool
const rawDbUrl = process.env.DATABASE_URL || "mariadb://root:student@202.29.70.18:28000/6860506002";
const dbUrl = rawDbUrl.replace("mariadb://", "mysql://");

let pool: mysql.Pool | null = null;
let useFallback = true; // Default to fallback for immediate availability

// Fallback in-memory storage
let fallbackNodes: number[] = [];
let fallbackType: 'bst' | 'max-heap' | 'min-heap' = 'bst';

// Background Sync Helper with strict timeout
async function syncToDb(action: 'insert' | 'update_type' | 'delete', data?: any) {
  if (!pool) return;
  
  try {
    // Use a race to ensure background sync never hangs the event loop
    await Promise.race([
      (async () => {
        const connection = await pool!.getConnection();
        if (action === 'insert' && data !== undefined) {
          await connection.query("INSERT INTO tree_nodes (value) VALUES (?)", [data]);
        } else if (action === 'update_type' && data !== undefined) {
          await connection.query("UPDATE tree_settings SET setting_value = ? WHERE setting_key = 'tree_type'", [data]);
          await connection.query("DELETE FROM tree_nodes");
        } else if (action === 'delete') {
          await connection.query("DELETE FROM tree_nodes");
        }
        connection.release();
      })(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Sync Timeout")), 1500))
    ]);
    console.log(`Background sync success: ${action}`);
  } catch (err) {
    console.error(`Background sync suppressed: ${(err as Error).message}`);
  }
}

// Initialize Database Tables and Load Initial State with strict timeout
async function initDb() {
  try {
    console.log("Starting DB init process...");
    pool = mysql.createPool({
      uri: dbUrl,
      connectTimeout: 2000,
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0
    });

    // Try to get initial state with a strict timeout
    await Promise.race([
      (async () => {
        const connection = await pool!.getConnection();
        console.log("MariaDB connected! Syncing initial state...");

        await connection.query(`CREATE TABLE IF NOT EXISTS tree_nodes (id INT AUTO_INCREMENT PRIMARY KEY, value INT NOT NULL)`);
        await connection.query(`CREATE TABLE IF NOT EXISTS tree_settings (setting_key VARCHAR(50) PRIMARY KEY, setting_value VARCHAR(50) NOT NULL)`);
        
        const [nodeRows]: any = await connection.query("SELECT value FROM tree_nodes ORDER BY id ASC");
        const [typeRows]: any = await connection.query("SELECT setting_value FROM tree_settings WHERE setting_key = 'tree_type'");
        
        if (typeRows.length > 0) {
          fallbackType = typeRows[0].setting_value;
        } else {
          await connection.query("INSERT INTO tree_settings (setting_key, setting_value) VALUES ('tree_type', 'bst')");
        }
        
        // Populate memory from DB
        fallbackNodes = nodeRows.map((n: any) => n.value);
        
        connection.release();
        useFallback = false; 
        console.log(`Initial state loaded: ${fallbackNodes.length} nodes, type: ${fallbackType}`);
      })(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Init Timeout")), 2000))
    ]);
  } catch (err) {
    console.log("DB Init skipped or failed. Using memory mode. Data will persist in memory until server restarts.");
    useFallback = true;
  }
}

interface TreeNode {
  value: number;
  left?: TreeNode;
  right?: TreeNode;
}

// Tree Logic Helpers
const insertBST = (root: TreeNode | null, value: number): TreeNode => {
  if (!root) return { value };
  if (value < root.value) {
    root.left = insertBST(root.left || null, value);
  } else {
    root.right = insertBST(root.right || null, value);
  }
  return root;
};

const getTreeStats = (root: TreeNode | null): any => {
  if (!root) return { height: 0, count: 0, min: null, max: null, isBalanced: true };
  
  const nodes: number[] = [];
  const traverse = (node: TreeNode) => {
    nodes.push(node.value);
    if (node.left) traverse(node.left);
    if (node.right) traverse(node.right);
  };
  traverse(root);

  const getHeight = (node: TreeNode | null): number => {
    if (!node) return 0;
    return 1 + Math.max(getHeight(node.left || null), getHeight(node.right || null));
  };

  const checkBalanced = (node: TreeNode | null): boolean => {
    if (!node) return true;
    const lh = getHeight(node.left || null);
    const rh = getHeight(node.right || null);
    return Math.abs(lh - rh) <= 1 && checkBalanced(node.left || null) && checkBalanced(node.right || null);
  };

  return {
    height: getHeight(root),
    count: nodes.length,
    min: Math.min(...nodes),
    max: Math.max(...nodes),
    isBalanced: checkBalanced(root),
    traversals: {
      inOrder: [...nodes].sort((a, b) => a - b),
      preOrder: nodes, // Simple pre-order for now
    }
  };
};

const buildTreeFromArray = (arr: number[], index: number): TreeNode | undefined => {
  if (index >= arr.length) return undefined;
  const node: TreeNode = { value: arr[index] };
  node.left = buildTreeFromArray(arr, 2 * index + 1);
  node.right = buildTreeFromArray(arr, 2 * index + 2);
  return node;
};

const siftUp = (arr: number[], type: 'max-heap' | 'min-heap') => {
  let idx = arr.length - 1;
  while (idx > 0) {
    const parentIdx = Math.floor((idx - 1) / 2);
    const shouldSwap = type === 'max-heap' 
      ? arr[idx] > arr[parentIdx]
      : arr[idx] < arr[parentIdx];
    
    if (shouldSwap) {
      [arr[idx], arr[parentIdx]] = [arr[parentIdx], arr[idx]];
      idx = parentIdx;
    } else {
      break;
    }
  }
};

async function getTreeState() {
  const type = fallbackType;
  const values = fallbackNodes;
  
  let tree: TreeNode | null = null;
  if (type === 'bst') {
    values.forEach((v: number) => {
      tree = insertBST(tree, v);
    });
  } else {
    const heapArr: number[] = [];
    values.forEach((v: number) => {
      heapArr.push(v);
      siftUp(heapArr, type as 'max-heap' | 'min-heap');
    });
    tree = buildTreeFromArray(heapArr, 0) || null;
  }
  
  const stats = getTreeStats(tree);
  return { tree, type, stats };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Status API to check connection
  app.get("/api/status", (req, res) => {
    res.json({ 
      connected: !useFallback && pool !== null,
      mode: useFallback ? "Fallback (In-Memory)" : "Database (MariaDB)",
      dbUrl: rawDbUrl.replace(/:[^:@]+@/, ":****@") // Hide password
    });
  });

  app.get("/api/tree", async (req, res) => {
    try {
      // Always return from memory for instant speed
      const state = await getTreeState();
      res.json(state);
    } catch (err) {
      console.error("GET /api/tree error:", err);
      res.status(500).json({ error: "Failed to fetch tree" });
    }
  });

  app.post("/api/tree/type", async (req, res) => {
    const { type } = req.body;
    // Update memory immediately
    fallbackType = type;
    fallbackNodes = [];
    
    // Background sync
    syncToDb('update_type', type);
    
    res.json({ success: true });
  });

  app.post("/api/tree/insert", async (req, res) => {
    const { value } = req.body;
    const val = parseInt(value);
    if (isNaN(val)) return res.status(400).json({ error: "Invalid value" });

    // Update memory immediately
    fallbackNodes.push(val);
    
    // Background sync
    syncToDb('insert', val);
    
    const state = await getTreeState();
    res.json(state);
  });

  app.post("/api/tree/insert-bulk", async (req, res) => {
    const { values } = req.body;
    if (!Array.isArray(values)) return res.status(400).json({ error: "Invalid values" });

    const validValues = values.map(v => parseInt(v)).filter(v => !isNaN(v));
    if (validValues.length === 0) return res.status(400).json({ error: "No valid values" });

    // Update memory immediately
    fallbackNodes.push(...validValues);
    
    // Background sync
    for (const val of validValues) {
      syncToDb('insert', val);
    }
    
    const state = await getTreeState();
    res.json(state);
  });

  app.post("/api/tree/delete", async (req, res) => {
    // Update memory immediately
    fallbackNodes = [];
    
    // Background sync
    syncToDb('delete');
    
    res.json({ success: true });
  });

  app.delete("/api/tree", async (req, res) => {
    // Update memory immediately
    fallbackNodes = [];
    
    // Background sync
    syncToDb('delete');
    
    res.json({ success: true });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    // Start DB initialization in background AFTER server is listening
    initDb().catch(err => console.error("Background DB init failed:", err));
  });
}

startServer();
