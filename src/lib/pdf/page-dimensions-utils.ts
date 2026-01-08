const STANDARD_SIZES = {
  A4: { width: 595.28, height: 841.89 },
  Letter: { width: 612, height: 792 },
  Legal: { width: 612, height: 1008 },
  Tabloid: { width: 792, height: 1224 },
  A3: { width: 841.89, height: 1190.55 },
  A5: { width: 419.53, height: 595.28 },
} as const;

export const getStandardPageName = (width: number, height: number): string => {
  const tolerance = 1;

  for (const [name, size] of Object.entries(STANDARD_SIZES)) {
    if (
      (Math.abs(width - size.width) < tolerance &&
        Math.abs(height - size.height) < tolerance) ||
      (Math.abs(width - size.height) < tolerance &&
        Math.abs(height - size.width) < tolerance)
    ) {
      return name;
    }
  }

  return "Custom";
};

export const convertPoints = (
  points: number,
  unit: "pt" | "in" | "mm" | "px",
): string => {
  let result = 0;

  switch (unit) {
    case "in":
      result = points / 72;
      break;
    case "mm":
      result = (points / 72) * 25.4;
      break;
    case "px":
      result = points * (96 / 72);
      break;
    default:
      result = points;
      break;
  }

  return result.toFixed(2);
};
