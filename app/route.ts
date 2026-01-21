import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "date required" }, { status: 400 });
  }

  const d = new Date(date);
  const formatted = `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;

  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/ripple/history?date=${formatted}&localization=false`,
    { next: { revalidate: 86400 } }
  );

  const data = await res.json();
  const price = data?.market_data?.current_price?.jpy;

  if (!price) {
    return NextResponse.json({ error: "price not found" }, { status: 404 });
  }

  return NextResponse.json({ price });
}
