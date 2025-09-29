import { Controller } from "react-hook-form";

const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

export default function SizeSelector({ control, errors }: any) {
  return (
    <div className="mt-2">
      <label className="block font-semibold text-gray-300 mb-2">Sizes</label>
      <Controller
        name="sizes"
        control={control}
        render={({ field }) => (
          <div className="flex gap-3 flex-wrap">
            {sizes.map((size) => {
              const isSelected = (field.value || []).includes(size);
              return (
                <button
                  type="button"
                  key={size}
                  onClick={() =>
                    field.onChange(
                      isSelected
                        ? field.value.filter((s: string) => s !== size)
                        : [...(field.value || []), size]
                    )
                  }
                  className={`px-4 py-2 rounded-md font-medium text-sm shadow-sm transition-all duration-200
                    ${
                      isSelected
                        ? "bg-blue-600 text-white border border-blue-400 scale-105"
                        : "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 hover:text-white"
                    }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        )}
      />
      {errors.sizes && (
        <p className="text-red-500 text-xs mt-1">
          {errors.sizes.message as string}
        </p>
      )}
    </div>
  );
}
