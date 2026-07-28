import { useState } from "react";
import { Save } from "lucide-react";
import { useCanvas } from "../hooks/useCanvas";

const SaveDesign = () => {
  const { frontCanvas, backCanvas } = useCanvas();
  
  // Custom local toast state
  const [toast, setToast] = useState({ visible: false, title: "", description: "", type: "success" });

  const showToast = (title, description, type = "success") => {
    setToast({ visible: true, title, description, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const saveCanvasToFile = async (canvas, filename, includeShirt = false) => {
    try {
      if (includeShirt) {
        // Create a temporary canvas to combine t-shirt and design
        const tempCanvas = document.createElement("canvas");
        const ctx = tempCanvas.getContext("2d");

        // Set canvas size to match the t-shirt container size
        const container = canvas.wrapperEl.parentElement;
        tempCanvas.width = container.offsetWidth;
        tempCanvas.height = container.offsetHeight;

        // Draw the t-shirt background
        const tshirtImg = container.querySelector("img");
        if (tshirtImg) {
          ctx.drawImage(tshirtImg, 0, 0, tempCanvas.width, tempCanvas.height);
        }

        // Draw the design canvas at its correct position
        const rect = canvas.wrapperEl.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const x = rect.left - containerRect.left;
        const y = rect.top - containerRect.top;
        ctx.drawImage(canvas.lowerCanvasEl, x, y, canvas.width, canvas.height);

        // Get the data URL from the temporary canvas
        const dataUrl = tempCanvas.toDataURL({
          format: "png",
          quality: 1,
        });

        // Create download link
        const link = document.createElement("a");
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Original save functionality for design only
        const dataUrl = canvas.toDataURL({
          format: "png",
          quality: 1,
          multiplier: 2,
          width: canvas.width,
          height: canvas.height,
        });

        const link = document.createElement("a");
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      return true;
    } catch (error) {
      console.error(`Error saving ${filename}:`, error);
      return false;
    }
  };

  const handleSave = async (includeShirt = false) => {
    try {
      if (!frontCanvas && !backCanvas) {
        showToast(
          "No Design Found",
          "Please create a design before saving.",
          "destructive"
        );
        return;
      }

      let savedCount = 0;
      let failedCount = 0;

      if (frontCanvas) {
        const frontSaved = await saveCanvasToFile(
          frontCanvas,
          `tshirt-front-${includeShirt ? "with-shirt" : "design-only"}.png`,
          includeShirt
        );
        frontSaved ? savedCount++ : failedCount++;
      }

      if (backCanvas) {
        const backSaved = await saveCanvasToFile(
          backCanvas,
          `tshirt-back-${includeShirt ? "with-shirt" : "design-only"}.png`,
          includeShirt
        );
        backSaved ? savedCount++ : failedCount++;
      }

      if (failedCount > 0) {
        showToast(
          "Save Error",
          `Failed to save ${failedCount} design${failedCount > 1 ? "s" : ""}.`,
          "destructive"
        );
      } else {
        showToast(
          "Design Saved!",
          `Successfully saved ${savedCount} design file${savedCount > 1 ? "s" : ""}.`,
          "success"
        );
      }
    } catch (error) {
      console.error("Save error:", error);
      showToast(
        "Save Error",
        "An unexpected error occurred while saving.",
        "destructive"
      );
    }
  };

  return (
    <div className="flex gap-2 relative w-full">
      {/* Native Tailwind Button Element */}
      <button
        onClick={() => handleSave(true)}
        className="w-full flex items-center justify-center h-10 px-4 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 active:scale-[0.98] shadow transition-all duration-150 focus:outline-none"
      >
        <Save className="mr-2 h-4 w-4" />
        Save
      </button>

      {/* --- IN-COMPONENT TOAST POPUP --- */}
      {toast.visible && (
        <div
          className={`fixed bottom-16 right-4 z-50 max-w-sm w-full p-4 rounded-lg border shadow-lg transition-all transform animate-in fade-in slide-in-from-bottom-4 duration-300 ${
            toast.type === "destructive"
              ? "bg-red-50 border-red-200 text-red-900"
              : "bg-white border-gray-200 text-gray-900"
          }`}
        >
          <div className="font-semibold text-sm">{toast.title}</div>
          <div className={`text-xs mt-1 ${toast.type === "destructive" ? "text-red-700" : "text-gray-500"}`}>
            {toast.description}
          </div>
        </div>
      )}
    </div>
  );
};

export default SaveDesign;