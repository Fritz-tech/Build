import { NextRequest, NextResponse } from "next/server";
import { getOrCreateAppUser, verifyCloudHikeToken } from "@/lib/cloudhike-auth";

export async function GET(req: NextRequest) {
  try {
    const authorization = req.headers.get("authorization") || "";
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice(7).trim()
      : "";

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const authUser = await verifyCloudHikeToken(token);
    if (!authUser) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const appUser = await getOrCreateAppUser(authUser);

    return NextResponse.json({
      user: {
        id: appUser.id,
        name: appUser.name,
        email: appUser.email,
        image: appUser.image,
        credits: appUser.credits,
      },
    });
  } catch (error) {
    console.error("Current user lookup failed:", error);
    return NextResponse.json(
      { error: "Unable to load your account right now." },
      { status: 500 }
    );
  }
}
