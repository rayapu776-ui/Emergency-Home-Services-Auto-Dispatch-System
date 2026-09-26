import React from "react";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  CreditCard,
  ArrowDownToLine,
  History,
  Building2,
} from "lucide-react";
import { useTechnician } from "../context/TechnicianContext";

export default function TechnicianEarningsPage() {
  const {
    metrics,
    bankAccount,
    payoutHistory,
    handleOpenBankModal,
    setShowPayoutModal,
  } = useTechnician();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title & Payout Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Earnings & Payouts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent revenue tracking, completed settlements, and direct bank payouts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenBankModal}
            className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
            <span>{bankAccount?.isConnected ? "Manage Bank" : "Connect Bank"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPayoutModal(true)}
            disabled={!metrics?.availableBalance || metrics.availableBalance <= 0}
            className="py-2.5 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            <span>Withdraw Balance</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Today's Earnings */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Today's Earnings
            </span>
            <DollarSign className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl font-black text-emerald-950 mt-1">
            {metrics?.todayEarningsFormatted || "₹" + (metrics?.todayEarnings || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400">Daily dispatches revenue</p>
        </div>

        {/* 2. This Week's Earnings */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              This Week
            </span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {metrics?.weekEarningsFormatted || "₹" + (metrics?.weekEarnings || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400">Last 7 calendar days</p>
        </div>

        {/* 3. Available Balance */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Available Balance
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            {metrics?.availableBalanceFormatted || "₹" + (metrics?.availableBalance || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400">Ready for instant payout</p>
        </div>

        {/* 4. Total Lifetime Earnings */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Lifetime Earnings
            </span>
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {metrics?.earningsFormatted || "₹" + (metrics?.totalEarnings || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400">Verified platform payouts</p>
        </div>
      </div>

      {/* Bank Account Connection Status Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Direct Bank Transfer (IMPS)
              </h3>
              <p className="text-xs text-slate-500">
                {bankAccount?.isConnected
                  ? `Connected to ${bankAccount.bankName}`
                  : "Connect your bank account to receive daily direct deposits"}
              </p>
            </div>
          </div>

          <span
            className={`self-start sm:self-center px-3 py-1 rounded-full text-xs font-bold ${
              bankAccount?.isConnected
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : "bg-amber-100 text-amber-900 border border-amber-300"
            }`}
          >
            {bankAccount?.isConnected ? "Active Bank Transfer" : "Action Needed"}
          </span>
        </div>

        {bankAccount?.isConnected ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <p className="text-slate-400 font-bold uppercase text-[10px]">Bank Name</p>
              <p className="font-bold text-slate-800 mt-0.5">{bankAccount.bankName || "—"}</p>
            </div>
            <div>
              <p className="text-slate-400 font-bold uppercase text-[10px]">Account Number</p>
              <p className="font-bold text-slate-800 font-mono mt-0.5">{bankAccount.accountNumberMasked || "—"}</p>
            </div>
            <div>
              <p className="text-slate-400 font-bold uppercase text-[10px]">IFSC Code</p>
              <p className="font-bold text-slate-800 font-mono mt-0.5">{bankAccount.ifsc || "—"}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs">
            <p className="text-amber-900 font-medium">
              You haven't setup your bank details yet. Payments for completed jobs will accumulate in your available balance.
            </p>
            <button
              type="button"
              onClick={handleOpenBankModal}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 cursor-pointer"
            >
              Add Bank Account
            </button>
          </div>
        )}
      </div>

      {/* Payout History Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-700" />
            <h3 className="text-base font-black text-slate-900">
              Payout History & Settlements
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-bold">
            {payoutHistory.length} Transactions
          </span>
        </div>

        {payoutHistory.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <DollarSign className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No earnings yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Completed jobs will automatically generate verified payout records and bank settlement logs here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {payoutHistory.map((payout, idx) => (
              <div
                key={payout.id || idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
              >
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">
                    {payout.title || `Payout #${payout.id ? String(payout.id).slice(0, 8) : idx + 101}`}
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    {payout.date || payout.created_at || "Recent transfer"} • Direct IMPS Deposit
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-emerald-800 text-sm">
                    +₹{(Number(payout.amount) || 0).toLocaleString("en-IN")}
                  </p>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {payout.status || "Settled"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
