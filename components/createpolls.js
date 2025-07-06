import { useState } from "react";

// Dummy user role (replace with real authentication/authorization)
const user = {
  username: "adminUser",
  role: "admin", // Change to 'user' to test access restriction
};

const POLLING_LEVELS = [
  "Ward",
  "Subcounty",
  "County",
  "National"
];

export default function CreatePoll({ onCreate }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [level, setLevel] = useState(POLLING_LEVELS[0]);
  const [area, setArea] = useState(""); // For specifying ward/subcounty/county (expand as needed)
  const [error, setError] = useState("");

  if (user.role !== "admin") {
    return <div>Access denied. Only administrators can create polls.</div>;
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => setOptions([...options, ""]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim() || options.some(opt => !opt.trim())) {
      setError("Please provide a question and at least two options.");
      return;
    }
    setError("");
    // Simulate poll creation
    onCreate?.({
      question,
      options: options.filter(Boolean),
      level,
      area: level === "National" ? null : area
    });
    setQuestion("");
    setOptions(["", ""]);
    setLevel(POLLING_LEVELS[0]);
    setArea("");
  };

  return (
    <form onSubmit={handleSubmit} style={{border: "1px solid #ccc", padding: 24, maxWidth: 500}}>
      <h2>Create a New Poll</h2>
      {error && <div style={{color: "red"}}>{error}</div>}
      <div>
        <label>Question:<br/>
          <input value={question} onChange={e => setQuestion(e.target.value)} required style={{width: "100%"}} />
        </label>
      </div>
      <div>
        Options:
        {options.map((opt, idx) => (
          <div key={idx}>
            <input
              value={opt}
              onChange={e => handleOptionChange(idx, e.target.value)}
              required
              placeholder={`Option ${idx + 1}`}
              style={{width: "80%"}}
            />
          </div>
        ))}
        <button type="button" onClick={addOption}>Add Option</button>
      </div>
      <div>
        <label>Polling Level:<br/>
          <select value={level} onChange={e => setLevel(e.target.value)}>
            {POLLING_LEVELS.map(lvl => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
        </label>
      </div>
      {level !== "National" && (
        <div>
          <label>
            {level} Name:<br/>
            <input
              value={area}
              onChange={e => setArea(e.target.value)}
              required
              placeholder={`Enter ${level} name`}
              style={{width: "100%"}}
            />
          </label>
        </div>
      )}
      <button type="submit">Create Poll</button>
    </form>
  );
}
