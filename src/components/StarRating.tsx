import React from "react";

type Props = {
  value: number;                 // 1..5
  onChange?: (v: number) => void; // si existe → es clickeable
  readOnly?: boolean;
  size?: number;
};

export default function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 22,
}: Props) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {stars.map((n) => {
        const filled = n <= value;

        return (
          <button
            key={n}
            type="button"
            disabled={readOnly}
            onClick={() => {
              if (!readOnly && onChange) onChange(n);
            }}
            aria-label={`${n} estrellas`}
            title={`${n} estrellas`}
            style={{
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: readOnly ? "default" : "pointer",
              fontSize: size,
              lineHeight: 1,
              opacity: readOnly ? 0.85 : 1,
            }}
          >
            {filled ? "⭐" : "☆"}
          </button>
        );
      })}
    </div>
  );
}
