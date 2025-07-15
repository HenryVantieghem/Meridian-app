import React from "react";

export default {
  title: "Design System/Typography",
};

export const CartierTypography = () => (
  <div style={{ padding: 32 }}>
    <div className="h1-serif" style={{ marginBottom: 16 }}>
      H1 Serif – Playfair Display
    </div>
    <div className="body-sans" style={{ marginBottom: 16 }}>
      Body Sans – Inter, system-ui
    </div>
    <div className="caption-sans">
      Caption Sans – Inter, system-ui, uppercase
    </div>
  </div>
);
