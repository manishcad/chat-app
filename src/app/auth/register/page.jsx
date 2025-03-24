"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "../../styles/auth.css"; // Import styles
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState(""); 
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFileChange = (e) => {
    setImage(e.target.files[0]); // Store the selected file
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("image", image);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: formData, // Send FormData instead of JSON
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed.");

      alert("Registration successful! Redirecting to login...");
      router.push("/auth/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleRegister} encType="multipart/form-data">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input type="text" id="name" placeholder="Enter your name" onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input type="email" id="email" placeholder="Enter your email" onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" placeholder="Enter your password" onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <div className="form-group">
          <label htmlFor="image">Profile Picture</label>
          <input type="file" id="image" accept="image/*" onChange={handleFileChange} required />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>

      <p>Already have an account? <Link href="/auth/login">Login</Link></p>
    </div>
  );
}
