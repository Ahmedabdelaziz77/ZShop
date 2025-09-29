import { forwardRef } from "react";

interface BaseProps {
  label?: string;
  type?: "text" | "number" | "password" | "email" | "textarea";
  className?: string;
}

type InputProps = BaseProps & React.InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = BaseProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

type Props = InputProps | TextareaProps;

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(
  ({ label, type = "text", className, ...props }, ref) => {
    const baseClasses =
      "w-full border border-gray-600 bg-[#1a1a1a] text-white px-3 py-2 rounded-md placeholder-gray-400 " +
      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 " +
      "transition-all duration-300 ease-in-out hover:border-gray-500";

    return (
      <div className="w-full">
        {label && (
          <label className="block font-medium text-gray-200 mb-1 text-sm">
            {label}
          </label>
        )}

        {type === "textarea" ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            className={`${baseClasses} min-h-[100px] resize-y ${className}`}
            {...(props as TextareaProps)}
          />
        ) : (
          <input
            type={type}
            ref={ref as React.Ref<HTMLInputElement>}
            className={`${baseClasses} ${className}`}
            {...(props as InputProps)}
          />
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
