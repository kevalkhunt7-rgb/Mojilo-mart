/**
 * Helper to safely load an image from a URL or Data URL without tainting the HTML Canvas.
 * Converts external/proxied image URLs into base64 Data URLs so fabric.toDataURL()
 * never throws a SecurityError when generating 3D model textures.
 */
export const loadCorsSafeImage = async (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== "string") {
    throw new Error("Invalid image URL");
  }

  // 1. Data URLs are already self-contained and clean
  if (rawUrl.startsWith("data:")) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(new Error("Failed to load Data URL image"));
      img.src = rawUrl;
    });         
  }

  // Determine proxy URL and API endpoints
  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const apiBase = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "") + "/api";

  let proxyUrl = rawUrl;
  if (!rawUrl.includes("/uploads/proxy") && (rawUrl.startsWith("http://") || rawUrl.startsWith("https://"))) {
    proxyUrl = `${apiBase}/uploads/proxy?url=${encodeURIComponent(rawUrl)}`;
  } else if (rawUrl.startsWith("/")) {
    proxyUrl = `${backendUrl}${rawUrl}`;
  }

  const blobToDataUrl = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const createImgFromDataUrl = (dataUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(new Error("Failed to load converted Data URL image"));
      img.src = dataUrl;
    });
  };

  // Attempt 1: Fetch via Backend Proxy & convert to Data URL
  try {
    const res = await fetch(proxyUrl);
    if (res.ok) {
      const blob = await res.blob();
      const dataUrl = await blobToDataUrl(blob);
      return await createImgFromDataUrl(dataUrl);
    }
  } catch (err) {
    console.warn("Proxy fetch failed, attempting direct fetch...", err);
  }

  // Attempt 2: Direct fetch & convert to Data URL
  try {
    const res = await fetch(rawUrl, { mode: "cors" });
    if (res.ok) {
      const blob = await res.blob();
      const dataUrl = await blobToDataUrl(blob);
      return await createImgFromDataUrl(dataUrl);
    }
  } catch (err) {
    console.warn("Direct fetch failed, attempting Image element fallback...", err);
  }

  // Attempt 3: Direct HTMLImageElement load with crossOrigin = "anonymous"
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load image from URL: ${rawUrl}`));
    img.src = proxyUrl || rawUrl;
  });
};
