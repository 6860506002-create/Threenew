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
// mysql2 prefers mysql:// prefix even for MariaDB
const dbUrl = rawDbUrl.replace("mariadb://", "mysql://");

let pool: mysql.Pool | null = null;
let useFallback = false;

// Fallback in-memory storage
let fallbackNodes: number[] = [];
let fallbackType: 'bst' | 'max-heap' | 'min-heap' = 'bst';

try {
  pool = mysql.createPool({
    uri: dbUrl,
    connectTimeout: 2000, // Reduce to 2 seconds for faster fallback
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
  });
  console.log("Database pool created with 2s timeout");
} catch (err) {
  console.error("Failed to create database pool, using fallback:", err);
  useFallback = true;
}

interface TreeNode {
  value: number;
  left?: TreeNode;
  right?: TreeNode;
}

// Initialize Database Tables
async function initDb() {
  if (useFallback || !pool) return;
  
  try {
    // Fast check if connection is actually possible
    const connection = await Promise.race([
      pool.getConnection(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000))
    ]) as mysql.PoolConnection;

    await connection.query(`
      CREATE TABLE IF NOT EXISTS tree_nodes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        value INT NOT NULL
      )
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tree_settings (
        setting_key VARCHAR(50) PRIMARY KEY,
        setting_value VARCHAR(50) NOT NULL
      )
    `);
    
    const [rows]: any = await connection.query("SELECT * FROM tree_settings WHERE setting_key = 'tree_type'");
    if (rows.length === 0) {
      await connection.query("INSERT INTO tree_settings (setting_key, setting_value) VALUES ('tree_type', 'bst')");
    }
    
    connection.release();
    console.log("Database initialized successfully");
  } catch (err) {
    console.error("Database connection failed or timed out. Switching to fallback mode.");
    useFallback = true;
  }
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
  let type: string = 'bst';
  let values: number[] = [];

  if (useFallback || !pool) {
    type = fallbackType;
    values = fallbackNodes;
  } else {
    try {
      const [nodes]: any = await pool.query("SELECT value FROM tree_nodes ORDER BY id ASC");
      const [settings]: any = await pool.query("SELECT setting_value FROM tree_settings WHERE setting_key = 'tree_type'");
      type = settings[0]?.setting_value || 'bst';
      values = nodes.map((n: any) => n.value);
    } catch (err) {
      console.error("DB Query failed, using fallback:", err);
      type = fallbackType;
      values = fallbackNodes;
    }
  }
  
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
  // Start DB initialization in background, don't await it
  initDb().catch(err => console.error("Background DB init failed:", err));
  
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
      const state = await getTreeState();
      res.json(state);
    } catch (err) {
      console.error("GET /api/tree error:", err);
      res.status(500).json({ error: "Failed to fetch tree" });
    }
  });

  app.post("/api/tree/type", async (req, res) => {
    const { type } = req.body;
    try {
      if (!useFallback && pool) {
        await pool.query("UPDATE tree_settings SET setting_value = ? WHERE setting_key = 'tree_type'", [type]);
        await pool.query("DELETE FROM tree_nodes");
      }
      fallbackType = type;
      fallbackNodes = [];
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update type" });
    }
  });

  app.post("/api/tree/insert", async (req, res) => {
    const { value } = req.body;
    const val = parseInt(value);
    if (isNaN(val)) return res.status(400).json({ error: "Invalid value" });

    try {
      if (!useFallback && pool) {
        await pool.query("INSERT INTO tree_nodes (value) VALUES (?)", [val]);
      }
      fallbackNodes.push(val);
      const state = await getTreeState();
      res.json(state);
    } catch (err) {
      res.status(500).json({ error: "Failed to insert value" });
    }
  });

  app.delete("/api/tree", async (req, res) => {
    try {
      if (!useFallback && pool) {
        await pool.query("DELETE FROM tree_nodes");
      }
      fallbackNodes = [];
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to reset tree" });
    }
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
  });
}

startServer();
