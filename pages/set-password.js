// pages/set-password.js
import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../src/supabaseClient";

export default function SetPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
      data: { passwordSet: true } // ✅ Mark metadata
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div>
      <h1>Set Your Password</h1>
      <form onSubmit={handleSetPassword}>
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Password"}
        </button>
      </form>
    </div>
  );
}
