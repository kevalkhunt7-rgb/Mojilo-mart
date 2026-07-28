import * as fabric from "fabric";

export const applyUpwardCurve = (radius, totalTextWidth, textStr) => {
  const totalAngle = totalTextWidth / radius;
  const startAngle = -totalAngle / 2;

  const pathStrings = [];
  for (let i = 0; i < textStr.length; i++) {
    const charAngle = startAngle + (i / (textStr.length - 1 || 1)) * totalAngle;
    const x = radius * Math.sin(charAngle);
    const y = radius * (1 - Math.cos(charAngle));

    if (i === 0) {
      pathStrings.push(`M ${x.toFixed(2)} ${y.toFixed(2)}`);
    } else {
      pathStrings.push(`A ${radius} ${radius} 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)}`);
    }
  }
  return pathStrings.join(" ");
};

export const applyDownwardCurve = (radius, totalTextWidth, textStr) => {
  const totalAngle = totalTextWidth / radius;
  const startAngle = -totalAngle / 2;

  const pathStrings = [];
  for (let i = 0; i < textStr.length; i++) {
    const charAngle = startAngle + (i / (textStr.length - 1 || 1)) * totalAngle;
    const x = radius * Math.sin(charAngle);
    const y = -radius * (1 - Math.cos(charAngle));

    if (i === 0) {
      pathStrings.push(`M ${x.toFixed(2)} ${y.toFixed(2)}`);
    } else {
      pathStrings.push(`A ${radius} ${radius} 0 0 0 ${x.toFixed(2)} ${y.toFixed(2)}`);
    }
  }
  return pathStrings.join(" ");
};

export const recalculateTextCurve = (textObj) => {
  if (!textObj) return;

  const radiusValue = textObj.get?.("curveRadius") ?? textObj.curveRadius ?? 0;
  const direction = textObj.get?.("curveDirection") ?? textObj.curveDirection ?? "up";

  if (!radiusValue || radiusValue === 0) {
    textObj.set({ path: null });
    return;
  }

  const textStr = textObj.text || "";
  if (!textStr) {
    textObj.set({ path: null });
    return;
  }

  const currentFontSize = textObj.fontSize || 24;
  const estimatedCharWidth = currentFontSize * 0.55;
  const totalTextWidth = textStr.length * estimatedCharWidth;

  let integratedPathData = "";
  if (direction === "up") {
    integratedPathData = applyUpwardCurve(radiusValue, totalTextWidth, textStr);
  } else {
    integratedPathData = applyDownwardCurve(radiusValue, totalTextWidth, textStr);
  }

  textObj.set({
    path: new fabric.Path(integratedPathData, { visible: false, strokeWidth: 0 }),
    textAlign: "center",
  });
};
