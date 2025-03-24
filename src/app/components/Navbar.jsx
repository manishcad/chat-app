"use client";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import "../styles/navbar.css";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="logo">
        <Link href="/">
          <Image src="https://png.pngtree.com/element_our/png/20181229/vector-chat-icon-png_302635.jpg" alt="Logo" width={50} height={50} />
        </Link>
      </div>

      <div className={`nav-links ${isOpen ? "open" : ""}`}>
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
      </div>

      <div className="profile-container1">
        {session ? (
          <Image
            src={session.user.image || "/uploads/user.png"}
            alt="Profile"
            width={40}
            height={40}
            className="profile-avatar1"
            onClick={() => router.push("/profile")}
            style={{ cursor: "pointer", borderRadius: "50%" }}
          />
        ) : (
          <button className="login-btn" onClick={() => signIn()}>Login</button>
        )}
      </div>

      <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </div>
    </nav>
  );
}
