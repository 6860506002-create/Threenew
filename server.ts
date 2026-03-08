import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TreeNode {
  value: number;
  left?: TreeNode;
  right?: TreeNode;
}

// In-memory "Database" for the tree
let serverTree: TreeNode | null = null;
let serverTreeType: 'bst' | 'max-heap' | 'min-heap' = 'bst';

// Helper functions for BST
const insertBST = (root: TreeNode | null, value: number): TreeNode => {
  if (!root) return { value };
  if (value < root.value) {
    root.left = insertBST(root.left || null, value);
  } else if (value > root.value) {
    root.right = insertBST(root.right || null, value);
  }
  return root;
};

// Helper functions for Heap
const getHeapArray = (root: TreeNode | null): number[] => {
  if (!root) return [];
  const result: number[] = [];
  const queue: (TreeNode | undefined)[] = [root];
  while (queue.length > 0) {
    const node = queue.shift();
    if (node) {
      result.push(node.value);
      queue.push(node.left);
      queue.push(node.right);
    }
  }
  return result;
};

const buildTreeFromArray = (arr: number[], index: number): TreeNode | undefined => {
  if (index >= arr.length) return undefined;
  const node: TreeNode = { value: arr[index] };
  node.left = buildTreeFromArray(arr, 2 * index + 1);
  node.right = buildTreeFromArray(arr, 2 * index + 2);
  return node;
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/tree", (req, res) => {
    res.json({ tree: serverTree, type: serverTreeType });
  });

  app.post("/api/tree/type", (req, res) => {
    const { type } = req.body;
    serverTreeType = type;
    serverTree = null; // Reset on type change
    res.json({ success: true });
  });

  app.post("/api/tree/insert", (req, res) => {
    const { value } = req.body;
    const val = parseInt(value);
    if (isNaN(val)) return res.status(400).json({ error: "Invalid value" });

    if (serverTreeType === 'bst') {
      serverTree = insertBST(serverTree, val);
    } else {
      const currentArr = getHeapArray(serverTree);
      currentArr.push(val);
      
      // Sift up
      let idx = currentArr.length - 1;
      while (idx > 0) {
        const parentIdx = Math.floor((idx - 1) / 2);
        const shouldSwap = serverTreeType === 'max-heap' 
          ? currentArr[idx] > currentArr[parentIdx]
          : currentArr[idx] < currentArr[parentIdx];
        
        if (shouldSwap) {
          [currentArr[idx], currentArr[parentIdx]] = [currentArr[parentIdx], currentArr[idx]];
          idx = parentIdx;
        } else {
          break;
        }
      }
      serverTree = buildTreeFromArray(currentArr, 0) || null;
    }
    res.json({ tree: serverTree });
  });

  app.delete("/api/tree", (req, res) => {
    serverTree = null;
    res.json({ success: true });
  });

  // Vite middleware for development
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
