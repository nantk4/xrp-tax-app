import { NextResponse } from "next/server";

function toUtcStartEnd(dateStr: string) {
  // dateStr: yyyy-mm-dd
  // UTCのその日の00:00:00〜23:59:59を作る
  const [y, m, d] = dateStr.split("-").map(Number);
  const start = Date.UTC(y, m - 1, d, 0, 0, 0) / 1000; // seconds
  const end = Date.UTC(y, m - 1, d, 23, 59, 59) / 1000;
  return { start, end };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }

  try {
    const { start, end } = toUtcStartEnd(date);

    // XRP/JPYの時系列（価格）をレンジで取得
    // id=ripple, vs_currency=jpy
    const url = `https://api.coingecko.com/api/v3/coins/ripple/market_chart/range?vs_currency=jpy&from=${start}&to=${end}`;

    const res = await fetch(url, {
      // 同じ日付はキャッシュ（1日）
      next: { revalidate: 86400 },
      headers: {
        "accept": "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "failed to fetch", status: res.status },
        { status: 500 }
      );
    }

    const data = await res.json();

    // data.prices = [[timestamp(ms), price], ...]
    const prices: [number, number][] = data?.prices;
    if (!prices || prices.length === 0) {
      return NextResponse.json({ error: "price not found" }, { status: 404 });
    }

    // その日のデータの中央値（ザックリ代表値）を返す
    const mid = prices[Math.floor(prices.length / 2)][1];

    return NextResponse.json({ price: mid });
  } catch (e) {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
