import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        credits: session.user.credits,
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
