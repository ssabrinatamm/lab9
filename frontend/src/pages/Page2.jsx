import React, { useState, useEffect, useCallback } from "react";
import "./Page2.css";
import { useAsgardeo } from "@asgardeo/react";

const API_URL = "http://localhost:5001/api"; 

const Page2 = () => {
  const auth = useAsgardeo();
  const [accessToken, setAccessToken] = useState(null);
  const [puppies, setPuppies] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 1. Update Form State to match Backend Model
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    age: "",
  });
  const [editingId, setEditingId] = useState(null);

  // Auth Logic 
  useEffect(() => {
    if (!auth?.isSignedIn) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await auth.getAccessToken?.();
        if (!cancelled && token) setAccessToken(token);
      } catch (e) {
        if (!cancelled) setError("Could not load access token");
      }
    })();
    return () => { cancelled = true; };
  }, [auth]);

  const getAuthHeaders = useCallback(() => {
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  }, [accessToken]);

  // 2. Fetch Puppies
  const fetchPuppies = useCallback(async () => {
    const headers = getAuthHeaders();
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/puppies`, { headers });
      if (!response.ok) throw new Error("Failed to fetch puppies");
      const data = await response.json();
      setPuppies(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchPuppies();
  }, [fetchPuppies]);

  // Handle Input Changes (Name, Breed, Age)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Create or Update Puppy
  const handleAddPuppy = async () => {
    // Basic validation
    if (!formData.name.trim() || !formData.breed.trim() || !formData.age) {
      setError("Please fill in all fields (Name, Breed, Age)");
      return;
    }

    try {
      setError(null);
      const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };
      const url = editingId ? `${API_URL}/puppies/${editingId}` : `${API_URL}/puppies`;
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({ ...formData, age: Number(formData.age) }),
      });

      if (!response.ok) throw new Error("Failed to save puppy");

      await fetchPuppies();
      setFormData({ name: "", breed: "", age: "" }); // Reset form
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeletePuppy = async (id) => {
    if (!window.confirm("Delete this puppy?")) return;
    try {
      const response = await fetch(`${API_URL}/puppies/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Delete failed");
      await fetchPuppies();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditPuppy = (puppy) => {
    setFormData({ name: puppy.name, breed: puppy.breed, age: puppy.age });
    setEditingId(puppy.id); // Backend model uses 'id'
  };

  const handleCancel = () => {
    setFormData({ name: "", breed: "", age: "" });
    setEditingId(null);
  };

  return (
    <div className="page2-container">
      <h2>Puppy List Manager</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="form-section">
        <h3>{editingId ? "Edit Puppy" : "Add New Puppy"}</h3>
        <div className="form-group">
          <input name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} className="input-field" />
          <input name="breed" placeholder="Breed" value={formData.breed} onChange={handleInputChange} className="input-field" />
          <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleInputChange} className="input-field" />
          
          <div className="button-group">
            <button onClick={handleAddPuppy} className="btn btn-primary">{editingId ? "Update" : "Add"}</button>
            {editingId && <button onClick={handleCancel} className="btn btn-secondary">Cancel</button>}
          </div>
        </div>
      </div>

      <div className="table-section">
        <h3>Puppies ({puppies.length})</h3>
        {loading ? <div className="loading">Loading...</div> : (
          <table className="puppies-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Breed</th>
                <th>Age</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {puppies.map((puppy) => (
                <tr key={puppy.id}>
                  <td>{puppy.name}</td>
                  <td>{puppy.breed}</td>
                  <td>{puppy.age}</td>
                  <td>
                    <button onClick={() => handleEditPuppy(puppy)} className="btn-icon">✏️</button>
                    <button onClick={() => handleDeletePuppy(puppy.id)} className="btn-icon">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Page2;