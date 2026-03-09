"use client";
import React from "react";
import { FaCheckCircle, FaStar, FaShippingFast, FaAd } from "react-icons/fa";

const plans = [
  {
    name: "Basic",
    price: "1,000",
    listings: "10 Listings",
    features: ["Email Support", "Standard Visibility", "Personal Dashboard", "7-Day Listing Duration"],
    popular: false,
  },
  {
    name: "Standard",
    price: "1,500",
    listings: "25 Listings",
    features: ["Priority Support", "Enhanced Visibility", "Sales Analytics", "Social Media Mention", "Logistics Assistance"],
    popular: true,
  },
  {
    name: "Premium",
    price: "2,500",
    listings: "50 Listings",
    features: ["24/7 Dedicated Support", "Maximum Visibility", "Featured Shop Status", "Advanced Reports", "Affiliate Deals Access"],
    popular: false,
  },
];

export default function PricingPlans() {
  return (
    <section className="py-20 bg-white px-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-light tracking-[0.3em] uppercase text-black mb-4">
          Seller Subscriptions
        </h2>
        <div className="h-[1px] w-20 bg-black mx-auto mb-6"></div>
        <p className="text-gray-500 text-sm tracking-widest uppercase">
          Zero Commission. Simple Monthly Plans.
        </p>
      </div>

      {/* Pricing Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col p-8 transition-all duration-300 border ${
              plan.popular 
                ? "border-black shadow-2xl scale-105 z-10 bg-white" 
                : "border-gray-100 bg-gray-50 hover:border-gray-300"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-1 text-[10px] tracking-[0.2em] uppercase font-bold">
                Most Popular
              </span>
            )}

            <div className="mb-8 text-center">
              <h3 className="text-lg font-medium tracking-[0.2em] uppercase mb-4 text-black">
                {plan.name}
              </h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-sm font-light text-gray-500 uppercase">PKR</span>
                <span className="text-5xl font-bold tracking-tighter text-black">{plan.price}</span>
                <span className="text-xs text-gray-400 uppercase tracking-widest">/mo</span>
              </div>
              <p className="mt-4 text-black font-semibold tracking-widest text-sm uppercase border-b border-gray-200 pb-4">
                {plan.listings}
              </p>
            </div>

            <ul className="space-y-4 mb-10 flex-grow">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center text-[11px] text-gray-600 uppercase tracking-wider">
                  <FaCheckCircle className="text-black mr-3 text-sm shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className={`w-full py-4 text-[10px] font-bold tracking-[0.3em] uppercase transition-all duration-300 ${
                plan.popular
                  ? "bg-black text-white hover:bg-gray-800"
                  : "bg-transparent border border-black text-black hover:bg-black hover:text-white"
              }`}
            >
              Select Plan
            </button>
          </div>
        ))}
      </div>

      {/* Additional Revenue Streams Section */}
      <div className="max-w-5xl mx-auto mt-20 pt-10 border-t border-gray-100">
        <h4 className="text-center text-[12px] tracking-[0.4em] uppercase text-gray-400 mb-10">
          Grow Your Presence (Phase 3)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col items-center text-center px-4">
            <FaStar className="text-black mb-4 text-xl" />
            <h5 className="text-[11px] font-bold tracking-[0.2em] uppercase mb-2">Featured Placements</h5>
            <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-wider">Boost your products to the top of search results.</p>
          </div>
          <div className="flex flex-col items-center text-center px-4">
            <FaAd className="text-black mb-4 text-xl" />
            <h5 className="text-[11px] font-bold tracking-[0.2em] uppercase mb-2">Ad Banners</h5>
            <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-wider">Custom store banners and sponsored collections.</p>
          </div>
          <div className="flex flex-col items-center text-center px-4">
            <FaShippingFast className="text-black mb-4 text-xl" />
            <h5 className="text-[11px] font-bold tracking-[0.2em] uppercase mb-2">Logistics Support</h5>
            <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-wider">Partner with our courier network for discounted rates.</p>
          </div>
        </div>
      </div>
    </section>
  );
}