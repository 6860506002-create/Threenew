import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple In-Memory Storage
let nodes: number[] = [];
let treeType: 'bst' | 'max-heap' | 'min-heap' = 'bst';

interface TreeNode {
  value: number;
  left?: TreeNode;
  right?: TreeNode;
}

// Tree Logic
const insertBST = (root: TreeNode | null, value: number): TreeNode => {
  if (!root) return { value };
  if (value < root.value) {
    root.left = insertBST(root.left || null, value);
  } else {
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
    const shouldSwap = type === 'max-heap' ? arr[idx] > arr[parentIdx] : arr[idx] < arr[parentIdx];
    if (shouldSwap) {
      [arr[idx], arr[parentIdx]] = [arr[parentIdx], arr[idx]];
      idx = parentIdx;
    } else {
      break;
    }
  }
};

const getTreeStats = (root: TreeNode | null) => {
  if (!root) return { height: 0, count: 0, traversals: { inOrder: [], preOrder: [] } };
  
  const values: number[] = [];
  const traverse = (node: TreeNode) => {
    values.push(node.value);
    if (node.left) traverse(node.left);
    if (node.right) traverse(node.right);
  };
  traverse(root);

  const getHeight = (node: TreeNode | null): number => {
    if (!node) return 0;
    return 1 + Math.max(getHeight(node.left || null), getHeight(node.right || null));
  };

  return {
    height: getHeight(root),
    count: values.length,
    traversals: {
      inOrder: [...values].sort((a, b) => a - b),
      preOrder: values
    }
  };
};

const getTreeState = () => {
  let tree: TreeNode | null = null;
  if (treeType === 'bst') {
    nodes.forEach(v => { tree = insertBST(tree, v); });
  } else {
    const heapArr: number[] = [];
    nodes.forEach(v => {
      heapArr.push(v);
      siftUp(heapArr, treeType as any);
    });
    tree = buildTreeFromArray(heapArr, 0) || null;
  }
  return { tree, type: treeType, stats: getTreeStats(tree) };
};

const app = express();
app.use(express.json());

app.get("/api/tree", (req, res) => {
  res.json(getTreeState());
});

app.post("/api/tree/insert-bulk", (req, res) => {
  const { values } = req.body;
  if (Array.isArray(values)) {
    const valid = values.map(v => parseInt(v)).filter(v => !isNaN(v));
    nodes.push(...valid);
  }
  res.json(getTreeState());
});

app.post("/api/tree/type", (req, res) => {
  treeType = req.body.type || 'bst';
  nodes = []; // Reset on type change for simplicity
  res.json(getTreeState());
});

app.delete("/api/tree", (req, res) => {
  nodes = [];
  res.json(getTreeState());
});

async function startServer() {
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

  if (process.env.VERCEL !== "1") {
    app.listen(3000, "0.0.0.0", () => {
      console.log("Server running on http://localhost:3000");
    });
  }
}

startServer();

export default app;
