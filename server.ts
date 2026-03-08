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
      connectTimeout: 1500, // Very short timeout
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
        }
        fallbackNodes = nodeRows.map((n: any) => n.value);
        
        connection.release();
        useFallback = false; 
        console.log("Initial state loaded");
      })(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Init Timeout")), 1500))
    ]);
  } catch (err) {
    console.log("DB Init skipped or failed (Normal for Vercel/Offline). Using memory mode.");
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
  } else if (value > root.value) {
    root.right = insertBST(root.right || null, value);
  }
  return root;
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
  // Always use memory for source of truth during session
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
  
  return { tree, type };
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
