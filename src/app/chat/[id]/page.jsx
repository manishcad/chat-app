"use client"
import { useSession } from "next-auth/react"; // Import useSession
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
export default function Chat() {
  const { id: receiverId } = useParams();
  const { data: session } = useSession(); // Get session data
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [fetchingMessages, setFetchingMessages] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!session) return; // Ensure session exists before making requests
      try {
        setError("");
        const res = await fetch(`/api/users/${receiverId}`, {
          headers: {
            "Authorization": `Bearer ${session.user.accessToken}`, // Pass token
            "Content-Type": "application/json"
          }
        });

        if (!res.ok) throw new Error("User not found or unavailable.");

        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError(err.message || "Error fetching user.");
      } finally {
        setLoading(false);
      }
    };

    if (receiverId) fetchUser();
  }, [receiverId, session]); // Re-run when session is updated




  const fetchMessages = async () => {
    if (!session) return; // Ensure session exists
    try {
      setFetchingMessages(true);
      setError("");
  
      const res = await fetch(`/api/messages/${receiverId}`, {
        headers: {
          "Authorization": `Bearer ${session.user.accessToken}`,
          "Content-Type": "application/json"
        }
      });
  
      if (!res.ok) throw new Error("Could not fetch messages.");
  
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError(err.message || "Failed to load messages.");
    } finally {
      setFetchingMessages(false);
    }
  };
  
  useEffect(() => {
    if (session && receiverId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000); // Poll every 5s
      return () => clearInterval(interval);
    }
  }, [receiverId, session]);
  
       
  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !session) return;
    setSending(true);
    setError("");
  
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.user.accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ receiverId, content: newMessage }),
      });
  
      if (!res.ok) throw new Error("Message not sent. Try again.");
  
      const data = await res.json();
      setMessages((prevMessages) => [...prevMessages, data]); // Append new message
      setNewMessage(""); // Clear input
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };
  

  return (
    <div className="chat-container">
      {loading ? <p>Loading chat...</p> : <h1>Chat with {user?.name || "Unknown User"}</h1>}
      
      {error && (
        <div className="error-box">
          <p className="error">{error}</p>
          <button onClick={fetchMessages} disabled={fetchingMessages}>
            {fetchingMessages ? "Retrying..." : "Retry"}
          </button>
        </div>
      )}

      <div className="messages">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.senderId === receiverId ? "received" : "sent"}`}>
              {msg.content}
            </div>
          ))
        ) : (
          <p>No messages yet.</p>
        )}
      </div>

      <div className="input-container">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={sending}
        />
        <button onClick={sendMessage} disabled={sending}>
          {sending ? "Sending..." : "Send"}
        </button>
      </div>

      <style jsx>{`
        .chat-container {
          max-width: 600px;
          margin: auto;
          padding: 20px;
          text-align: center;
        }
        .messages {
          border: 1px solid #ddd;
          padding: 10px;
          min-height: 200px;
          overflow-y: auto;
          margin-bottom: 10px;
          color: black;
        }
        .message {
          padding: 8px;
          border-radius: 5px;
          margin: 5px 0;
          max-width: 70%;
        }
        .sent {
          background: #007bff;
          color: white;
          align-self: flex-end;
        }
        .received {
          background: #f1f1f1;
          align-self: flex-start;
        }
        .input-container {
          display: flex;
          gap: 10px;
        }
        input {
          flex: 1;
          padding: 8px;
        }
        button {
          padding: 8px;
          cursor: pointer;
        }
        .error-box {
          background: #ffe0e0;
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 10px;
        }
        .error {
          color: red;
        }
      `}</style>
    </div>
  );
}
