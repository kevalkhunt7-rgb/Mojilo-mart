// src/components/Cart/CartItemRow.jsx

import React from "react";
import { CartItem3DViewer } from "../3d/CartItem3DViewer";

export function CartItemRow({ item, onRemove }) {
  return (
    <div className="cart-item-row" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      
      {/* 🟢 Interactive 3D Model Viewer for ANY apparel */}
      <div className="cart-item-preview">
        <CartItem3DViewer item={item} />
      </div>

      {/* Cart Item Info */}
      <div className="cart-item-info">
        <h3>{item.name}</h3>
        <p>SIZE: {item.size} | COLOR: {item.color}</p>
        <button onClick={() => onRemove(item.id)}>Remove</button>
      </div>

      <div className="cart-item-price">
        ₹{item.price}
      </div>
    </div>
  );
}