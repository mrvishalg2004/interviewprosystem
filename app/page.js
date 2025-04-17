// import { Button } from "@/components/ui/button";
// import Image from "next/image";

// export default function Home() {
//   return (
//   <div>
//     <h1>Thank You for visit</h1>
//     <Button>Go to main menu</Button>

//   </div>
//   );
// }

"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function Home() {
  const router = useRouter();

  const navigateToSignIn = () => {
    router.push("/dashboard"); // Navigate to the desired route
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundImage: "url('https://images.unsplash.com/photo-1472289065668-ce650ac443d2?q=80&w=2938&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h1 style={{ color: "white", textShadow: "0px 0px 10px rgba(0, 0, 0, 0.7)" }}>
        Thank You for visiting
      </h1> 
      <Button
        onClick={navigateToSignIn}
        style={{
          marginTop: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          color: "black",
          borderRadius: "8px",
        }}
      >
        Go to Main Page
      </Button>
    </div>
  );
}
