const express = require('express');
const cors = require('cors');
const {
  validateAndSplit,
  buildGraph,
  getGroups,
  detectCycle,
  buildTree,
  getDepth,
  processHierarchies,
  buildSummary
} = require('./utils');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.post('/bfhl', (req, res) => {
  console.log('Received POST /bfhl with body:', req.body);
  const data = req.body.data || [];
  
  const { validEdges, invalid_entries, duplicate_edges } = validateAndSplit(data);
  const { childrenMap, parentSet, allNodes } = buildGraph(validEdges);
  const groups = getGroups(allNodes, childrenMap);
  const hierarchies = processHierarchies(groups, childrenMap, parentSet);
  const summary = buildSummary(hierarchies);
  
  const response = {
    user_id: "fullname_ddmmyyyy",
    email_id: "myemail@college.edu",
    college_roll_number: "MYROLL",
    hierarchies: hierarchies,
    invalid_entries: invalid_entries,
    duplicate_edges: duplicate_edges,
    summary: summary
  };
  
  res.json(response);
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
