"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "../ui/input";
import { useRouter, useSearchParams } from "next/navigation";

const filterSelectionSchema = z.object({
  search: z.string(),
});

function SearchInput({ onSubmitextra }: { onSubmitextra?: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<z.infer<typeof filterSelectionSchema>>({
    resolver: zodResolver(filterSelectionSchema),
    defaultValues: { search: searchParams.get("search") || "" },
  });

  function onSubmit({ search }: z.infer<typeof filterSelectionSchema>) {
    onSubmitextra?.();
    !search || search.length === 0
      ? router.push(`/shop`)
      : router.push(`/shop/?search=${search}`);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="relative bg-transparent flex-1"
      >
        <FormField
          control={form.control}
          name="search"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Search"
                  className="!bg-transparent !rounded-md h-10 px-4 text-sm placeholder:text-zinc-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

export default SearchInput;
