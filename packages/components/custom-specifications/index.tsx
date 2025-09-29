import { Controller, useFieldArray } from "react-hook-form";
import Input from "../input";
import { PlusCircle, Trash2 } from "lucide-react";

export default function CustomSpecifications({ control, errors }: any) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "custom_specifications",
  });

  return (
    <div className="mt-4">
      <label className="block font-semibold text-gray-300 mb-2 text-sm">
        Custom Specifications
      </label>

      <div className="flex flex-col gap-4">
        {fields?.map((item, i) => (
          <div
            key={item.id}
            className="flex gap-4 items-start bg-gray-800/50 p-4 rounded-lg border border-gray-700
                       transition-all duration-300 ease-in-out transform hover:scale-[1.01] hover:shadow-lg"
          >
            {/* Specification Name */}
            <div className="flex-1">
              <Controller
                control={control}
                name={`custom_specifications.${i}.name`}
                rules={{ required: "Specification name is required!" }}
                render={({ field }) => (
                  <Input
                    label="Name"
                    placeholder="e.g., Battery Life, Weight"
                    {...field}
                  />
                )}
              />
            </div>

            {/* Specification Value */}
            <div className="flex-1">
              <Controller
                control={control}
                name={`custom_specifications.${i}.value`}
                rules={{ required: "Value is required!" }}
                render={({ field }) => (
                  <Input
                    label="Value"
                    placeholder="e.g., 4000mAh, 1.8kg"
                    {...field}
                  />
                )}
              />
            </div>

            {/* Delete Button */}
            <button
              onClick={() => remove(i)}
              type="button"
              className="mt-7 flex-shrink-0 p-2 rounded-full text-red-400
                         hover:text-red-600 hover:bg-red-500/10
                         transition-all duration-200"
              aria-label="Remove specification"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        {/* Add New Specification */}
        <button
          className="flex items-center gap-2 text-blue-500 hover:text-blue-400
                     text-sm font-medium self-start transition-colors duration-200"
          type="button"
          onClick={() => append({ name: "", value: "" })}
        >
          <PlusCircle size={18} />
          Add Specification
        </button>
      </div>

      {/* Validation Error */}
      {errors?.custom_specifications && (
        <p className="text-red-500 text-xs mt-2">
          {errors.custom_specifications.message as string}
        </p>
      )}
    </div>
  );
}
