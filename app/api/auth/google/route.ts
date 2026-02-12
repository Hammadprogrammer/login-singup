// import { NextResponse } from "next/server";

// export async function GET() {
//   const params = new URLSearchParams({
//     client_id: process.env.GOOGLE_CLIENT_ID!,
//     redirect_uri: "http://localhost:3000/api/auth/google/callback",
//     response_type: "code",
//     scope: "email profile",
//   });

//   return NextResponse.redirect(
//     "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString()
//   );
// }
import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${baseUrl}/api/auth/google/callback`,
    response_type: "code",
    scope: "email profile",
  });

  return NextResponse.redirect(
    "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString()
  );
}
