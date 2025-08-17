import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../src/supabaseClient";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error fetching session:", error.message);
        router.push("/login");
        return;
      }

      const session = data?.session;

      if (!session) {
        router.push("/login");
        return;
      }

      // ✅ User is logged in
      const user = session.user;

      // Check if user already has a password set
      const { data: identities, error: identityError } = await supabase.auth.admin.listIdentities();

      if (identityError) {
        console.error("Error checking identities:", identityError.message);
        router.push("/dashboard");
        return;
      }

      // If the user doesn’t have a password, send them to set-password
      const hasPassword = identities.identities?.some(
        (identity) => identity.provider === "email"
      );

      if (!hasPassword) {
        router.push("/set-password");
      } else {
        router.push("/dashboard");
      }
    };

    handleAuth();
  }, [router]);

  return <p>Finishing login... please wait.</p>;
}
