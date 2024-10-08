"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface CustomDatePickerProps {
    date: string | undefined;
    setDate: (date: string | undefined) => void;
    className?: string;
}

export function CustomDatePicker({
    date,
    setDate,
    className,
}: CustomDatePickerProps) {
    const [calendarDate, setCalendarDate] = React.useState<Date>(
        date ? parseISO(date) : new Date()
    );

    const years = React.useMemo(() => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 10 }, (_, i) => currentYear + i);
    }, []);

    const months = React.useMemo(
        () => [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ],
        []
    );

    const handleYearChange = React.useCallback((year: string) => {
        setCalendarDate((prevDate) => {
            const newDate = new Date(prevDate);
            newDate.setFullYear(parseInt(year));
            return newDate;
        });
    }, []);

    const handleMonthChange = React.useCallback(
        (month: string) => {
            setCalendarDate((prevDate) => {
                const newDate = new Date(prevDate);
                newDate.setMonth(months.indexOf(month));
                return newDate;
            });
        },
        [months]
    );

    const handleDateSelect = (newDate: Date | undefined) => {
        setDate(newDate ? newDate.toISOString() : undefined);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? (
                        format(parseISO(date), "PPP")
                    ) : (
                        <span>Pick an expiration date</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <div className="flex items-center justify-between p-2 space-x-2">
                    <Select
                        value={months[calendarDate.getMonth()]}
                        onValueChange={handleMonthChange}
                    >
                        <SelectTrigger className="h-8 w-[130px]">
                            <SelectValue>
                                {months[calendarDate.getMonth()]}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((month) => (
                                <SelectItem key={month} value={month}>
                                    {month}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={calendarDate.getFullYear().toString()}
                        onValueChange={handleYearChange}
                    >
                        <SelectTrigger className="h-8 w-[130px]">
                            <SelectValue>
                                {calendarDate.getFullYear()}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Calendar
                    mode="single"
                    selected={date ? parseISO(date) : undefined}
                    onSelect={handleDateSelect}
                    month={calendarDate}
                    onMonthChange={setCalendarDate}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}
