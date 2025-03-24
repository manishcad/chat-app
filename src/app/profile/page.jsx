"use client";
import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import "../styles/profile.css";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log(session,"this is session")
    if(!session){
      router.push("/auth/login");}
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
      setPreview(session.user.image || "/uploads/user.png" );
    }
  }, [session]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    if (image) formData.append("image", image);
  
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        body: formData,
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed.");
  
      alert("Profile updated successfully!");
  
      // 🔥 Fetch updated session data
      await update();
      router.refresh();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="profile-container">
      <h2>My Profile</h2>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleUpdate} encType="multipart/form-data">
        <div className="profile-avatar">
          <img src={preview} alt="Profile Picture" />
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        <label>Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Profile"}
        </button>
        <button type="button" onClick={()=>signOut({callbackUrl:"/auth/login"})} disabled={loading}>
          {loading ? "Logging Out..." : "Logout"}
        </button>
      </form>
    </div>
  );
}
