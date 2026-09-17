import React from "react";
import {
  ArrowRight,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";

export default function CartDrawer({
  isOpen,
  onClose,
  items = [],
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) {
  if (!isOpen) return null;

  const subtotal = items.reduce(
    (sum, item) =>
      sum +
      (parseFloat(item.price.replace(/[^0-9.]/g, "")) || 29) *
        (item.quantity || 1),
    0,
  );
  const fee = items.length > 0 ? 3.5 : 0;
  const total = subtotal + fee;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-slide-in">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Your Cart</h2>
                <p className="text-xs text-slate-500 font-medium">
                  {items.length} {items.length === 1 ? "service" : "services"}{" "}
                  selected
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="h-16 w-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-4 text-slate-300">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Your cart is empty
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                  Browse our top-rated home cleaning, salon, spa, appliance
                  repair, and maintenance services.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors"
                >
                  Explore services
                </button>
              </div>
            ) : (
              items.map((item) => {
                const numericPrice =
                  parseFloat(item.price.replace(/[^0-9.]/g, "")) || 29;
                return (
                  <div
                    key={item.slug || item.name}
                    className="flex gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 rounded-xl object-cover shrink-0 border border-slate-200/60"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.slug || item.name)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs font-semibold text-emerald-800 mt-0.5">
                        ${numericPrice.toFixed(2)}
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 border border-slate-200 bg-white rounded-lg px-2 py-1">
                          <button
                            onClick={() =>
                              onUpdateQuantity(
                                item.slug || item.name,
                                (item.quantity || 1) - 1,
                              )
                            }
                            disabled={(item.quantity || 1) <= 1}
                            className="text-slate-400 hover:text-slate-800 disabled:opacity-30"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-bold text-slate-800 min-w-4 text-center">
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() =>
                              onUpdateQuantity(
                                item.slug || item.name,
                                (item.quantity || 1) + 1,
                              )
                            }
                            className="text-slate-400 hover:text-slate-800"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-xs font-extrabold text-slate-900">
                          ${(numericPrice * (item.quantity || 1)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer / Summary */}
          {items.length > 0 && (
            <div className="border-t border-slate-100 p-6 bg-white space-y-4">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Safety & Service Fee</span>
                  <span className="font-bold text-slate-900">
                    ${fee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 text-sm font-black text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-emerald-800">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Argent Verified Guarantee & Free rescheduling</span>
              </div>

              <button
                onClick={onCheckout}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-950 py-3.5 text-sm font-bold text-white transition-all hover:bg-emerald-800 shadow-md hover:shadow-lg"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
