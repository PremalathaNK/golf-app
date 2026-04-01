import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function Dashboard() {
  const [name, setName] = useState("");
  const [charities, setCharities] = useState([]);

  // ✅ Fetch data
  const fetchCharities = async () => {
    const { data, error } = await supabase
      .from("charities")
      .select("*");

    if (error) {
      console.log("Fetch error:", error.message);
    } else {
      setCharities(data);
    }
  };

  useEffect(() => {
    fetchCharities();
  }, []);

  // ✅ Add data
  const addCharity = async () => {
    if (!name) return alert("Enter charity name");

    const { error } = await supabase
      .from("charities")
      .insert([{ name }]);

    if (error) {
      console.log("Insert error:", error.message);
    } else {
      setName("");
      fetchCharities();
    }
  };

  // ✅ Delete data
  const deleteCharity = async (id) => {
    const { error } = await supabase
      .from("charities")
      .delete()
      .eq("id", id);

    if (error) {
      console.log("Delete error:", error.message);
    } else {
      fetchCharities();
    }
  };

  // ✅ Logout (SAFE version — no redirect crash)
  const logout = async () => {
    await supabase.auth.signOut();
    alert("Logged out");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h2 style={{ textAlign: "center" }}>Charity Dashboard</h2>

      <button
        onClick={logout}
        style={{
          marginBottom: "20px",
          padding: "6px",
          width: "100%",
          backgroundColor: "#333",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Logout
      </button>

      <h3>Add Charity</h3>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter charity name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: "8px",
            width: "65%",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={addCharity}
          style={{
            marginLeft: "10px",
            padding: "8px",
            backgroundColor: "green",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Add
        </button>
      </div>

      <h3>Charities List</h3>

      {charities.length === 0 ? (
        <p>No data found</p>
      ) : (
        charities.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px",
              margin: "8px 0",
              border: "1px solid #ccc",
              borderRadius: "6px",
            }}
          >
            <span>{item.name}</span>

            <button
              onClick={() => deleteCharity(item.id)}
              style={{
                backgroundColor: "red",
                color: "white",
                border: "none",
                padding: "5px 10px",
                borderRadius: "4px",
              }}
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}