import * as React from "react";
import { cn } from "@/lib/utils";
import { Input, InputProps } from "@/components/ui/input";

export interface DatalistProps extends Omit<InputProps, "list"> {
    label?: string;
    options: string[];
    listId: string;
    changeHandler: any;
    inputValue?: string;
}

const Datalist = React.forwardRef<HTMLInputElement, DatalistProps>(
    (
        {
            className,
            label,
            options,
            listId,
            id,
            inputValue,
            changeHandler,
            ...props
        },
        ref
    ) => {
        // const [inputValue, setInputValue] = React.useState<string>("");

        // const filteredOptions = options.filter((option: string) =>
        //     option.toLowerCase().includes(inputValue.toLowerCase())
        // );

        return (
            <>
                <Input
                    list={listId}
                    id={id}
                    className={className}
                    type="text"
                    ref={ref}
                    {...props}
                    // ={inputValue}
                    value={inputValue}
                    onChange={(e) => {
                        // setInputValue(e.target.value);
                        changeHandler(e);
                    }}
                />

                <datalist
                    id={listId}
                    className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-red-900 p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                >
                    {options.map((option, index) => (
                        <option
                            key={index}
                            value={option}
                            className=" bg-red-900 relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        />
                    ))}
                </datalist>
            </>
        );
    }
);

Datalist.displayName = "Datalist";

export { Datalist };
