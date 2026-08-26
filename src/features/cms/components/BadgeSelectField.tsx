"use client";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useFormContext } from "react-hook-form";

type BadgeSelectFieldProps = {
  name: string;
  label: string;
};

function BadgeSelectField({ name, label }: BadgeSelectFieldProps) {
  const { setValue, control } = useFormContext();

  return (
    <FormField
      control={control}
      name="badge"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Badge</FormLabel>
          <Select
            onValueChange={(value) =>
              setValue("badge", value === "none" ? null : (value as any), {
                shouldDirty: true,
              })
            }
            value={field.value || "none"}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Add a badge for the Product" />
              </SelectTrigger>
            </FormControl>

            <SelectContent>
              <SelectGroup>
                <SelectLabel>Badge</SelectLabel>
                <SelectItem value="none">No Badge</SelectItem>
                <SelectItem value="new_product">New Product</SelectItem>
                <SelectItem value="best_sale">Best Sale</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <FormDescription>
            Choose &quot;No Badge&quot; if you don&apos;t want a tag on the product card.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default BadgeSelectField;
