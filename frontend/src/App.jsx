import { useState } from 'react'

const API = import.meta.env.VITE_API_URL || "http://localhost:4000"

function TreeRenderer({ tree }) {
  let keys = Object.keys(tree);
  if (keys.length === 0) return null;
  
  return (
    <ul className="tree-list">
      {keys.map(node => (
        <li key={node}>
          {node}
          <TreeRenderer tree={tree[node]} />
        </li>
      ))}
    </ul>
  );
}

function App() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    // split by comma or newline, then trim
    let dataArr = input.split(/[\n,]+/).map(s => s.trim()).filter(s => s !== "");

    try {
      const res = await fetch(`${API}/bfhl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: dataArr })
      });

      if (!res.ok) {
        throw new Error("Server returned " + res.status);
      }

      let json = await res.json();
      setResult(json);
    } catch (err) {
      setError(err.message || "Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Graph Analyzer</h1>
      
      <div>
        <p>Enter edges (comma or newline separated, e.g. A-&gt;B):</p>
        <textarea 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          placeholder="A->B&#10;A->C&#10;B->D"
        />
        <br />
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Loading..." : "Submit"}
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {result && (
        <div className="result-section">
          <div className="summary-card">
            <h3>Summary</h3>
            <p><strong>Total Trees:</strong> {result.summary.total_trees}</p>
            <p><strong>Total Cycles:</strong> {result.summary.total_cycles}</p>
            <p><strong>Largest Tree Root:</strong> {result.summary.largest_tree_root || "None"}</p>
          </div>

          <h3>Hierarchies</h3>
          <div className="hierarchies-grid">
            {result.hierarchies && result.hierarchies.map((h, idx) => (
              <div key={idx} className={`hierarchy-card ${h.has_cycle ? 'cyclic' : ''}`}>
                <h4>Root: {h.root}</h4>
                {h.has_cycle ? (
                  <p><strong>Status:</strong> Cyclic</p>
                ) : (
                  <>
                    <p><strong>Depth:</strong> {h.depth}</p>
                    <TreeRenderer tree={h.tree} />
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="lists-section">
            {result.invalid_entries && result.invalid_entries.length > 0 && (
              <div>
                <h4>Invalid Entries</h4>
                <ul>
                  {result.invalid_entries.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            )}
            
            {result.duplicate_edges && result.duplicate_edges.length > 0 && (
              <div>
                <h4>Duplicate Edges</h4>
                <ul>
                  {result.duplicate_edges.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
