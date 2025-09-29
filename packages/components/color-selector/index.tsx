import { Plus, X } from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";

const defaultColors = [
  "#000000",
  "#ffffff",
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#ffff00",
  "#ff00ff",
  "#00ffff",
];

const ColorSelector = ({ control }: any) => {
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newColor, setNewColor] = useState("#ffffff");

  return (
    <div className="mt-4">
      <label className="block font-medium text-gray-200 mb-2 text-sm">
        Colors
      </label>
      <Controller
        name="colors"
        control={control}
        render={({ field }) => (
          <div className="flex gap-3 flex-wrap">
            {[...defaultColors, ...customColors].map((color) => {
              const isSelected = (field.value || []).includes(color);
              const isLightColor = ["#ffffff", "#ffff00"].includes(color);

              return (
                <button
                  type="button"
                  key={color}
                  onClick={() =>
                    field.onChange(
                      isSelected
                        ? field.value.filter((c: string) => c !== color)
                        : [...(field.value || []), color]
                    )
                  }
                  className={`w-9 h-9 rounded-md flex items-center justify-center transition-all duration-200 shadow-md hover:scale-110 focus:outline-none ${
                    isSelected
                      ? "ring-2 ring-offset-2 ring-blue-500"
                      : "ring-1 ring-transparent"
                  } ${isLightColor ? "border border-gray-300" : ""}`}
                  style={{ backgroundColor: color }}
                />
              );
            })}

            {/* Add Custom Color Button */}
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-9 h-9 flex items-center justify-center rounded-md border border-gray-500 bg-gray-800 hover:bg-gray-700 transition-all duration-200 shadow-md"
            >
              {showColorPicker ? (
                <X size={16} color="white" />
              ) : (
                <Plus size={16} color="white" />
              )}
            </button>

            {/* Color Picker */}
            {showColorPicker && (
              <div className="relative flex items-center gap-2 mt-2 animate-fadeIn">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-10 h-10 p-0 border border-gray-300 rounded cursor-pointer"
                />
                <button
                  type="button"
                  className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    setCustomColors([...customColors, newColor]);
                    setShowColorPicker(false);
                  }}
                >
                  Add
                </button>
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default ColorSelector;
