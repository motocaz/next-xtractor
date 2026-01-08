"use client";

const labToRgb = (l: number, a: number, b: number): string => {
  const y = (l + 16) / 116;
  const x = a / 500 + y;
  const z = y - b / 200;

  const x3 = x * x * x;
  const y3 = y * y * y;
  const z3 = z * z * z;

  const xn = 0.95047;
  const yn = 1;
  const zn = 1.08883;

  const fx = x3 > 0.008856 ? x3 : (x - 16 / 116) / 7.787;
  const fy = y3 > 0.008856 ? y3 : (y - 16 / 116) / 7.787;
  const fz = z3 > 0.008856 ? z3 : (z - 16 / 116) / 7.787;

  const xr = fx * xn;
  const yr = fy * yn;
  const zr = fz * zn;

  let r = xr * 3.2406 + yr * -1.5372 + zr * -0.4986;
  let g = xr * -0.9689 + yr * 1.8758 + zr * 0.0415;
  let bl = xr * 0.0557 + yr * -0.204 + zr * 1.057;

  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
  bl = bl > 0.0031308 ? 1.055 * Math.pow(bl, 1 / 2.4) - 0.055 : 12.92 * bl;

  r = Math.max(0, Math.min(255, Math.round(r * 255)));
  g = Math.max(0, Math.min(255, Math.round(g * 255)));
  bl = Math.max(0, Math.min(255, Math.round(bl * 255)));

  return `rgb(${r}, ${g}, ${bl})`;
};

const lchToRgb = (l: number, c: number, h: number): string => {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);
  return labToRgb(l, a, b);
};

const oklabToRgb = (l: number, a: number, b: number): string => {
  const l1 = l + 0.3963377774 * a + 0.2158037573 * b;
  const m1 = l - 0.1055613458 * a - 0.0638541728 * b;
  const s1 = l - 0.0894841775 * a - 1.291485548 * b;

  const l2 = l1 * l1 * l1;
  const m2 = m1 * m1 * m1;
  const s2 = s1 * s1 * s1;

  const r = +4.0767416621 * l2 - 3.3077115913 * m2 + 0.2309699292 * s2;
  const g = -1.2684380046 * l2 + 2.6097574011 * m2 - 0.3413193965 * s2;
  const bl = -0.0041960863 * l2 - 0.7034186147 * m2 + 1.707614701 * s2;

  const r255 = Math.max(0, Math.min(255, Math.round(r * 255)));
  const g255 = Math.max(0, Math.min(255, Math.round(g * 255)));
  const b255 = Math.max(0, Math.min(255, Math.round(bl * 255)));

  return `rgb(${r255}, ${g255}, ${b255})`;
};

const oklchToRgb = (l: number, c: number, h: number): string => {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);
  return oklabToRgb(l, a, b);
};

const parseColorFunction = (
  str: string,
  functionName: string,
): number[] | null => {
  const regex = new RegExp(String.raw`${functionName}\(\s*([^)]+)\s*\)`, "i");
  const match = regex.exec(str);
  if (!match) return null;

  const content = match[1].trim();

  const withoutAlpha = content.split("/")[0].trim();
  const rawParts = withoutAlpha.split(/[,\s]+/);
  const parts = rawParts.filter((p) => p.trim().length > 0);
  const values = parts
    .map((v) => {
      const trimmed = v.trim();
      const parsed = Number.parseFloat(trimmed);
      return parsed;
    })
    .filter((v) => !Number.isNaN(v));

  return values.length > 0 ? values : null;
};

export const convertMultipleColorValues = (colorValue: string): string => {
  if (!colorValue || typeof colorValue !== "string") {
    return colorValue;
  }

  const unsupportedColorRegex = /(lab|oklab|lch|oklch)\([^)]+\)/gi;

  const result = colorValue.replace(unsupportedColorRegex, (match) => {
    const converted = convertUnsupportedColor(match);
    return converted;
  });

  return result;
};

export const convertUnsupportedColor = (colorValue: string): string => {
  if (!colorValue || typeof colorValue !== "string") {
    return colorValue;
  }

  const trimmed = colorValue.trim();

  if (trimmed.toLowerCase().startsWith("lab(")) {
    const values = parseColorFunction(trimmed, "lab");
    if (values && values.length >= 3) {
      try {
        const result = labToRgb(values[0], values[1], values[2]);
        return result;
      } catch (e) {
        console.warn("Failed to convert lab() color:", trimmed, e);
        return "rgb(0, 0, 0)";
      }
    } else {
      return "rgb(0, 0, 0)";
    }
  }

  if (trimmed.toLowerCase().startsWith("lch(")) {
    const values = parseColorFunction(trimmed, "lch");
    if (values && values.length >= 3) {
      try {
        return lchToRgb(values[0], values[1], values[2]);
      } catch (e) {
        console.warn("Failed to convert lch() color:", trimmed, e);
        return "rgb(0, 0, 0)";
      }
    }
  }

  if (trimmed.toLowerCase().startsWith("oklab(")) {
    const values = parseColorFunction(trimmed, "oklab");
    if (values && values.length >= 3) {
      try {
        return oklabToRgb(values[0], values[1], values[2]);
      } catch (e) {
        console.warn("Failed to convert oklab() color:", trimmed, e);
        return "rgb(0, 0, 0)";
      }
    }
  }

  if (trimmed.toLowerCase().startsWith("oklch(")) {
    const values = parseColorFunction(trimmed, "oklch");
    if (values && values.length >= 3) {
      try {
        return oklchToRgb(values[0], values[1], values[2]);
      } catch (e) {
        console.warn("Failed to convert oklch() color:", trimmed, e);
        return "rgb(0, 0, 0)";
      }
    }
  }

  return colorValue;
};

export const processCSS = (css: string): string => {
  if (!css || typeof css !== "string") {
    return css;
  }

  const colorPropertyRegex =
    /(color|background-color|border-color|outline-color|text-decoration-color|column-rule-color|caret-color|fill|stroke)\s*:\s*([^;]+)/gi;

  return css.replace(colorPropertyRegex, (match, property, value) => {
    const converted = convertUnsupportedColor(value.trim());
    return `${property}: ${converted}`;
  });
};

export const processInlineStyle = (styleValue: string): string => {
  if (!styleValue || typeof styleValue !== "string") {
    return styleValue;
  }

  const properties = styleValue.split(";").map((prop) => prop.trim());

  const processed = properties.map((prop) => {
    if (!prop) return "";
    const colonIndex = prop.indexOf(":");
    if (colonIndex === -1) return prop;

    const property = prop.substring(0, colonIndex).trim();
    const value = prop.substring(colonIndex + 1).trim();

    const colorProperties = [
      "color",
      "background-color",
      "border-color",
      "outline-color",
      "text-decoration-color",
      "column-rule-color",
      "caret-color",
      "fill",
      "stroke",
    ];

    if (colorProperties.includes(property.toLowerCase())) {
      const converted = convertUnsupportedColor(value);
      return `${property}: ${converted}`;
    }

    return prop;
  });

  return processed.filter(Boolean).join("; ");
};
