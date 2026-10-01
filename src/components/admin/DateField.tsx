import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/** ISO (yyyy-MM-dd) date field with a styled calendar picker. */
export function DateField({
  value,
  onChange,
  placeholder = "Pick a date",
}: {
  value: string | null | undefined;
  onChange: (iso: string | null) => void;
  placeholder?: string;
}) {
  let selected: Date | undefined;
  if (value) {
    const d = parseISO(value);
    if (!isNaN(d.getTime())) selected = d;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "mt-1.5 flex w-full items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-left text-sm hover:border-foreground/50 transition",
            !selected && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 opacity-60" />
          <span className="truncate">
            {selected ? format(selected, "EEE, dd MMM yyyy") : placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={(d) => onChange(d ? format(d, "yyyy-MM-dd") : null)}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}
