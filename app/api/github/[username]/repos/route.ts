import { NextResponse } from "next/server";
import { getGithubRepositories } from "@/lib/github";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const result = await getGithubRepositories(username);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status }
    );
  }

  return NextResponse.json(result.data);
}
