import { useState } from "react";
import CreatePoll from "../components/CreatePoll";

export default function CreatePollPage() {
  const [polls, setPolls] = useState([]);

  const handlePollCreate = (poll) => {
    setPolls([...polls, poll]);
    alert("Poll created successfully!");
  };

  return (
    <div style={{padding: 24}}>
      <CreatePoll onCreate={handlePollCreate} />
      <hr />
      <h3>Created Polls</h3>
      <ul>
        {polls.map((poll, idx) => (
          <li key={idx}>
            <b>{poll.question}</b> ({poll.level}{poll.area ? `: ${poll.area}` : ""})<br/>
            Options: {poll.options.join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}
