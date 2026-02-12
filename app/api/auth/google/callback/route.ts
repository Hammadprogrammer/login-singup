// import { NextRequest, NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import prisma from "@/lib/prisma";

// export async function GET(req: NextRequest) {
//   const code = req.nextUrl.searchParams.get("code");

//   // 1️⃣ Google se access token lo
//   const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       client_id: process.env.GOOGLE_CLIENT_ID,
//       client_secret: process.env.GOOGLE_CLIENT_SECRET,
//       code,
//       redirect_uri: "http://localhost:3000/api/auth/google/callback",
//       grant_type: "authorization_code",
//     }),
//   });

//   const tokenData = await tokenRes.json();

//   // 2️⃣ Google user info lo
//   const userRes = await fetch(
//     "https://www.googleapis.com/oauth2/v2/userinfo",
//     {
//       headers: {
//         Authorization: `Bearer ${tokenData.access_token}`,
//       },
//     }
//   );

//   const googleUser = await userRes.json();

//   // 3️⃣ DB me user check
//   let user = await prisma.user.findUnique({
//     where: { email: googleUser.email },
//   });

//   // 4️⃣ User nahi hai → create
//   if (!user) {
//     user = await prisma.user.create({
//       data: {
//         email: googleUser.email,
//         name: googleUser.name,
//         provider: "google",
//       },
//     });
//   }

//   // 5️⃣ JWT token
//   const token = jwt.sign(
//     { id: user.id, email: user.email },
//     process.env.JWT_SECRET!,
//     { expiresIn: "7d" }
//   );

//   // 6️⃣ Cookie set
//   const response = NextResponse.redirect(new URL("/", req.url));
//   response.cookies.set("token", token, {
//     httpOnly: true,
//     secure: true,
//     path: "/",
//     maxAge: 60 * 60 * 24 * 7,
//   });

//   return response;
// }
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  // 1️⃣ Google se access token lo
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      redirect_uri: `${baseUrl}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenRes.json();

  // 2️⃣ Google user info lo
  const userRes = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    }
  );

  const googleUser = await userRes.json();

  // 3️⃣ DB me user check
  let user = await prisma.user.findUnique({
    where: { email: googleUser.email },
  });

  // 4️⃣ User nahi hai → create
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: googleUser.email,
        name: googleUser.name,
        provider: "google",
      },
    });
  }

  // 5️⃣ JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  // 6️⃣ Redirect + cookie
  const response = NextResponse.redirect(new URL("/", baseUrl));
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
