"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // Redirect only when status is determined
  useEffect(() => {
    
    if (status === "loading") return; // 🔥 Don't push to login if session is still loading
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]); // ✅ Runs only when status changes

  // Fetch users after session is confirmed
  useEffect(() => {
    if (status !== "authenticated") return; // ✅ Fetch only if user is logged in

    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load users");

        setUsers(data);
       
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [status]); // ✅ Only fetch when session is authenticated

  const startChat = (userId) => {
    router.push(`/chat/${userId}`);
  };
  

  return (
    <div className="container">
      <h1>All Users</h1>
      {status === "authenticated" && (
        <>
          <p>{session?.user?.name}</p>
          <button onClick={() => signOut({ callbackUrl: "/auth/login" })}>Sign Out</button>
        </>
      )}
      {loading && <p>Loading users...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {users.map((user) => (
          <li key={user.id} className="user-item" onClick={() => startChat(user.id)}>
            {user.name}
          </li>
        ))}
      </ul>
      <style jsx>{`
  .container {
    max-width: 600px;
    margin: auto;
    padding: 20px;
    text-align: center;
    font-family: Arial, sans-serif;
    background-color: #1e1e1e;
    color: white;
    border-radius: 10px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  }

  h1 {
    font-size: 24px;
    margin-bottom: 15px;
    color: #ffcc00;
  }

  p {
    font-size: 16px;
    margin-bottom: 10px;
  }

  button {
    padding: 10px 15px;
    border: none;
    background-color: #ff4d4d;
    color: white;
    font-size: 16px;
    cursor: pointer;
    border-radius: 5px;
    margin-bottom: 15px;
    transition: background-color 0.3s ease;
  }

  button:hover {
    background-color: #e60000;
  }

  .user-item {
    cursor: pointer;
    padding: 12px;
    border: 1px solid #444;
    margin: 5px 0;
    border-radius: 8px;
    background-color: #333;
    transition: all 0.3s ease;
    font-size: 18px;
  }

  .user-item:hover {
    background-color: #555;
    transform: scale(1.05);
  }
`}</style>

    </div>
    
  );
}
