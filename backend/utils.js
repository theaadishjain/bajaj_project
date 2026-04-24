function validateAndSplit(data) {
  let validEdges = [];
  let invalid_entries = [];
  let duplicate_edges = [];
  let seenPairs = new Set();
  
  let isArr = Array.isArray(data);
  if (!isArr) return { validEdges, invalid_entries, duplicate_edges };

  for (let item of data) {
    if (typeof item !== 'string') {
      invalid_entries.push(String(item));
      continue;
    }
    
    let trimmed = item.trim();
    let regex = /^[A-Z]->[A-Z]$/;
    
    if (regex.test(trimmed)) {
      let parts = trimmed.split('->');
      if (parts[0] === parts[1]) {
        invalid_entries.push(trimmed);
      } else {
        if (seenPairs.has(trimmed)) {
          if (!duplicate_edges.includes(trimmed)) {
            duplicate_edges.push(trimmed);
          }
        } else {
          seenPairs.add(trimmed);
          validEdges.push(trimmed);
        }
      }
    } else {
      invalid_entries.push(trimmed);
    }
  }
  
  return { validEdges, invalid_entries, duplicate_edges };
}

function buildGraph(validEdges) {
  let childrenMap = {};
  let parentSet = new Set();
  let allNodes = new Set();
  const nodeHasParent = new Set();

  for (let edge of validEdges) {
    let [parent, child] = edge.split('->');
    allNodes.add(parent);
    allNodes.add(child);
    
    if (nodeHasParent.has(child)) {
      continue; // first parent wins
    }
    
    if (!childrenMap[parent]) {
      childrenMap[parent] = [];
    }
    childrenMap[parent].push(child);
    parentSet.add(child);
    nodeHasParent.add(child);
  }
  
  return { childrenMap, parentSet, allNodes };
}

function getGroups(allNodes, childrenMap) {
  let visited = new Set();
  let groups = [];
  
  // ugh need undirected graph just for this
  let adj = {};
  for (let node of allNodes) {
    adj[node] = [];
  }
  
  for (let parent in childrenMap) {
    for (let child of childrenMap[parent]) {
      adj[parent].push(child);
      adj[child].push(parent);
    }
  }

  for (let node of allNodes) {
    if (!visited.has(node)) {
      let group = new Set();
      let queue = [node];
      visited.add(node);
      
      while (queue.length > 0) {
        let curr = queue.shift();
        group.add(curr);
        
        for (let neighbor of adj[curr]) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
      groups.push(group);
    }
  }
  
  return groups;
}

function detectCycle(group, childrenMap) {
  let visited = new Set();
  let inStack = new Set();
  let cycleFound = false;

  function dfs(node) {
    if (!visited.has(node)) {
      visited.add(node);
      inStack.add(node);
      
      if (childrenMap[node]) {
        for (let child of childrenMap[node]) {
          if (!visited.has(child) && dfs(child)) {
            return true;
          } else if (inStack.has(child)) {
            return true;
          }
        }
      }
    }
    inStack.delete(node);
    return false;
  }
  
  for (let node of group) {
    if (!visited.has(node)) {
      if (dfs(node)) {
        cycleFound = true;
        break;
      }
    }
  }
  
  return cycleFound;
}

function buildTree(node, childrenMap) {
  let tree = {};
  if (childrenMap[node]) {
    for (let child of childrenMap[node]) {
      tree[child] = buildTree(child, childrenMap);
    }
  }
  return tree;
}

function getDepth(node, childrenMap) {
  if (!childrenMap[node] || childrenMap[node].length === 0) {
    return 1;
  }
  let maxD = 0;
  for (let child of childrenMap[node]) {
    let depth = getDepth(child, childrenMap);
    if (depth > maxD) {
      maxD = depth;
    }
  }
  return 1 + maxD;
}

function processHierarchies(groups, childrenMap, parentSet) {
  let hierarchies = [];
  
  for (let group of groups) {
    let root = null;
    
    let candidates = [];
    for (let node of group) {
      if (!parentSet.has(node)) {
        candidates.push(node);
      }
    }
    
    // took me a bit to figure this out
    if (candidates.length > 0) {
      candidates.sort();
      root = candidates[0];
    } else {
      let sortedGroup = Array.from(group).sort();
      root = sortedGroup[0];
    }
    
    let isCyclic = detectCycle(group, childrenMap);
    
    if (isCyclic) {
      hierarchies.push({
        root: root,
        tree: {},
        has_cycle: true
      });
    } else {
      let tree = {};
      tree[root] = buildTree(root, childrenMap);
      hierarchies.push({
        root: root,
        tree: tree,
        depth: getDepth(root, childrenMap)
      });
    }
  }
  
  return hierarchies;
}

function buildSummary(hierarchies) {
  let total_trees = 0;
  let total_cycles = 0;
  let largest_tree_root = null;
  let maxDepth = -1;
  
  for (let h of hierarchies) {
    if (h.has_cycle) {
      total_cycles++;
    } else {
      total_trees++;
      if (h.depth > maxDepth) {
        maxDepth = h.depth;
        largest_tree_root = h.root;
      } else if (h.depth === maxDepth) {
        if (!largest_tree_root || h.root < largest_tree_root) {
          largest_tree_root = h.root;
        }
      }
    }
  }
  
  return {
    total_trees,
    total_cycles,
    largest_tree_root
  };
}

module.exports = {
  validateAndSplit,
  buildGraph,
  getGroups,
  detectCycle,
  buildTree,
  getDepth,
  processHierarchies,
  buildSummary
};
