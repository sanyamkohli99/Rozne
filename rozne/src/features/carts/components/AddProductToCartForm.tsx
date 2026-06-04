"use client";
import { QuantityInput } from "@/components/layouts/QuantityInput";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import useCartActions from "../hooks/useCartActions";
import { AddProductCartData, AddProductToCartSchema } from "../validations";

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

interface AddProductToCartFormProps {
  productId: string;
  availableSizes?: string[];
}

function AddProductToCartForm({
  productId,
  availableSizes = [],
}: AddProductToCartFormProps) {
  const { user } = useAuth();
  const { addProductToCart } = useCartActions(user, productId);
  const maxQuantity = 8;

  const hasSizes = availableSizes.length > 0;
  const orderedSizes = [...availableSizes].sort(
    (a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b),
  );

  const form = useForm<AddProductCartData>({
    resolver: zodResolver(AddProductToCartSchema),
    defaultValues: {
      quantity: 1,
      size: undefined,
    },
  });

  const selectedSize = form.watch("size");

  async function onSubmit(values: AddProductCartData) {
    addProductToCart(values.quantity);
  }

  const addOne = () => {
    const currQuantity = form.getValues("quantity");
    if (currQuantity < maxQuantity) form.setValue("quantity", currQuantity + 1);
  };
  const minusOne = () => {
    const currQuantity = form.getValues("quantity");
    if (currQuantity > 1) form.setValue("quantity", currQuantity - 1);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {hasSizes && (
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Size
                  {field.value && (
                    <span className="ml-2 text-muted-foreground font-normal">
                      — {field.value}
                    </span>
                  )}
                </FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {orderedSizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() =>
                          field.onChange(
                            field.value === size ? undefined : size,
                          )
                        }
                        className={cn(
                          "min-w-[3rem] h-10 px-3 border text-sm font-medium transition-all duration-150",
                          "hover:border-zinc-900 hover:bg-zinc-50",
                          field.value === size
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-300 bg-white text-zinc-800",
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <QuantityInput
                  {...field}
                  addOneHandler={addOne}
                  minusOneHandler={minusOne}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={hasSizes && !selectedSize}
        >
          {hasSizes && !selectedSize ? "Select a Size" : "Add to Cart"}
        </Button>
      </form>
    </Form>
  );
}

export default AddProductToCartForm;
