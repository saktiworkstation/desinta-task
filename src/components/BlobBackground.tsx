"use client";

export default function BlobBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      <div
        className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-[0.07] animate-float"
        style={{ background: "radial-gradient(circle, #ec4899, transparent)" }}
      />
      <div
        className="absolute top-1/3 -right-16 w-56 h-56 rounded-full opacity-[0.05] animate-float"
        style={{ background: "radial-gradient(circle, #c084fc, transparent)", animationDelay: "2s" }}
      />
      <div
        className="absolute bottom-32 left-1/4 w-40 h-40 rounded-full opacity-[0.06] animate-float"
        style={{ background: "radial-gradient(circle, #f43f5e, transparent)", animationDelay: "4s" }}
      />
    </div>
  );
}
