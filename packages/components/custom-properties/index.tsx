import { Controller } from "react-hook-form";
import Input from "../input";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function CustomProperties({ control, errors }: any) {
  const [properties, setProperties] = useState<
    { label: string; values: string[] }[]
  >([]);
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");

  return (
    <div className="mt-4">
      <Controller
        control={control}
        name="custom_properties"
        render={({ field }) => {
          useEffect(() => {
            field.onChange(properties);
          }, [properties]);

          const addProperty = () => {
            if (!newLabel.trim()) return;
            setProperties([...properties, { label: newLabel, values: [] }]);
            setNewLabel("");
          };

          const addValue = (i: number) => {
            if (!newValue.trim()) return;
            const updatedProperties = [...properties];
            updatedProperties[i].values.push(newValue);
            setProperties(updatedProperties);
            setNewValue("");
          };

          const removeProperty = (i: number) => {
            setProperties(properties.filter((_, ii) => i !== ii));
          };

          const removeValue = (i: number, index: number) => {
            const updatedProperties = [...properties];
            updatedProperties[i].values.splice(index, 1);
            setProperties(updatedProperties);
          };

          return (
            <div className="mt-2">
              <label className="block font-semibold text-gray-300 mb-2 text-sm">
                Custom Properties
              </label>
              <div className="flex flex-col gap-4">
                {properties.map((property, i) => (
                  <div
                    key={i}
                    className="border border-gray-700 p-4 rounded-xl bg-gray-800/50
                               transition-all duration-300 ease-in-out transform hover:scale-[1.01] hover:shadow-lg"
                  >
                    {/* Property Header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium text-sm">
                        {property.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeProperty(i)}
                        className="p-1 rounded-full text-red-400 hover:text-red-600 hover:bg-red-500/10 transition"
                        aria-label="Remove property"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Add Value */}
                    <div className="flex items-center mt-2 gap-2">
                      <input
                        type="text"
                        className="flex-1 border border-gray-700 bg-gray-900/70 p-2 rounded-md text-white text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Enter value"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                      />
                      <button
                        type="button"
                        className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-500 transition-colors"
                        onClick={() => addValue(i)}
                      >
                        Add
                      </button>
                    </div>

                    {/* Values List */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {property.values.map((value, index) => (
                        <span
                          key={index}
                          className="flex items-center gap-1 px-2 py-1 bg-gray-700 text-white rounded-full text-xs
                                     transition-all hover:bg-gray-600"
                        >
                          {value}
                          <button
                            type="button"
                            onClick={() => removeValue(i, index)}
                            className="ml-1 text-gray-400 hover:text-red-400 transition-colors"
                            aria-label="Remove value"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Add New Property */}
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    placeholder="Enter property label (e.g., Material, Warranty)"
                    value={newLabel}
                    onChange={(e: any) => setNewLabel(e.target.value)}
                  />
                  <button
                    type="button"
                    className="px-3 py-2 bg-blue-600 text-white rounded-md flex items-center justify-center gap-1 text-sm hover:bg-blue-500 transition-colors"
                    onClick={addProperty}
                  >
                    <Plus size={16} />
                    Add
                  </button>
                </div>
              </div>

              {/* Validation Error */}
              {errors?.custom_properties && (
                <p className="text-red-500 text-xs mt-2">
                  {errors.custom_properties.message as string}
                </p>
              )}
            </div>
          );
        }}
      />
    </div>
  );
}
