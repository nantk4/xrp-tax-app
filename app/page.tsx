"use client";

import { useState } from "react";

export default function Home() {
  const [income, setIncome] = useState("");
  const [xrpAmount, setXrpAmount] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  // 日本の所得税＋住民税を計算
  const calcTax = (totalIncome: number) => {
    if (totalIncome <= 0) return 0;

    const brackets = [
      { limit: 1950000, rate: 0.05, deduction: 0 },
      { limit: 3300000, rate: 0.1, deduction: 97500 },
      { limit: 6950000, rate: 0.2, deduction: 427500 },
      { limit: 9000000, rate: 0.23, deduction: 636000 },
      { limit: 18000000, rate: 0.33, deduction: 1536000 },
      { limit: 40000000, rate: 0.4, deduction: 2796000 },
      { limit: Infinity, rate: 0.45, deduction: 4796000 },
    ];

    const bracket = brackets.find((b) => totalIncome <= b.limit);
    if (!bracket) return 0;

    const incomeTax = totalIncome * bracket.rate - bracket.deduction;
    const residentTax = totalIncome * 0.1;

    return incomeTax + residentTax;
  };

  // 日付からXRP価格を取得（CoinGecko）
const fetchPrice = async () => {
  if (!date) {
    alert("日付を入力してください");
    return;
  }

  try {
    setLoading(true);
    const res = await fetch(`/api/xrp-price?date=${date}`);
    const data = await res.json();

    if (!data.price) {
      alert("価格が取得できませんでした");
      setLoading(false);
      return;
    }

    setSellPrice(String(data.price));
    setLoading(false);
  } catch {
    alert("価格取得エラー");
    setLoading(false);
  }
};

  const profit =
    Number(xrpAmount) * (Number(sellPrice) - Number(buyPrice)) || 0;

  const baseIncome = Number(income) || 0;
  const beforeTax = calcTax(baseIncome);
  const afterTax = calcTax(baseIncome + profit);

  const taxIncrease = afterTax - beforeTax;
  const netProfit = profit - taxIncrease;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
        <h1 className="text-xl font-bold mb-4 text-center">
          XRP 税引後 利確シミュレーター
        </h1>

        <div className="space-y-3">
          <input
            placeholder="年収（円）"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="w-full p-2 border rounded"
          />

          <input
            placeholder="XRP枚数"
            value={xrpAmount}
            onChange={(e) => setXrpAmount(e.target.value)}
            className="w-full p-2 border rounded"
          />

          <input
            placeholder="取得単価（円）"
            value={buyPrice}
            onChange={(e) => setBuyPrice(e.target.value)}
            className="w-full p-2 border rounded"
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border rounded"
          />

          <button
            onClick={fetchPrice}
            className="w-full bg-blue-500 text-white p-2 rounded"
          >
            {loading ? "価格取得中..." : "この日のXRP価格を取得"}
          </button>

          <input
            placeholder="売却価格（円）"
            value={sellPrice}
            onChange={(e) => setSellPrice(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mt-6 space-y-2 text-sm">
          <p>📈 利益: {Math.round(profit).toLocaleString()} 円</p>
          <p>💸 税金増加分: {Math.round(taxIncrease).toLocaleString()} 円</p>
          <p className="font-bold text-lg">
            🧾 税引後手取り: {Math.round(netProfit).toLocaleString()} 円
          </p>
        </div>
        <p className="mt-6 text-xs text-gray-500 text-center">
  ※ 本ツールは概算シミュレーションです。実際の税額は取引状況・控除・税制改正等により異なる場合があります。最終的な判断は税理士等の専門家にご確認ください。
</p>
      </div>
    </div>
  );
}
