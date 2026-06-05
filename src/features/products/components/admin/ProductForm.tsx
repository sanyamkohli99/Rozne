"use client";

import {
  createProductAction,
  getProductGalleryMediaIds,
  updateProductAction,
  upsertProductMediasAction,
} from "@/_actions/products";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import TagsField from "@/components/ui/tagsField";
import { useToast } from "@/components/ui/use-toast";
import { BadgeSelectField } from "@/features/cms";
import { ImageDialog } from "@/features/medias";
import {
  InsertProducts,
  SelectProducts,
  products,
} from "@/lib/supabase/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@urql/next";
import { createInsertSchema } from "drizzle-zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { gql } from "urql";
import { ProductGalleryField } from "./ProductGalleryField";
import { ClientOnly } from "@/components/ui/ClientOnly";

type ProductsFormProps = {
  product?: SelectProducts;
};

export const ProductFormQuery = gql(/* GraphQL */ `
  query ProductFormQuery {
    collectionsCollection(orderBy: [{ label: AscNullsLast }]) {
      __typename
      edges {
        node {
          id
          label
        }
      }
    }
  }
`);

const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

function ProductForm({ product }: ProductsFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const [galleryImageIds, setGalleryImageIds] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
  ]);

  useEffect(() => {
    if (!product?.id) return;
    getProductGalleryMediaIds(product.id)
      .then((ids) => {
        if (ids.length > 0) {
          const padded: (string | null)[] = [null, null, null, null];
          ids.slice(0, 4).forEach((id, i) => {
            padded[i] = id;
          });
          setGalleryImageIds(padded);
        }
      })
      .catch(() => {});
  }, [product?.id]);

  const [{ data }] = useQuery({
    query: ProductFormQuery,
  });

  const form = useForm<InsertProducts>({
    resolver: zodResolver(createInsertSchema(products).omit({ createdAt: true })),
    defaultValues: product ? { ...product } : {
        name: "",
        slug: "",
        description: "",
        featured: false,
        rating: "4",
        tags: [],
        images: [],
        sizes: [],
        price: "0.00",
        totalComments: 0,
        featuredImageId: "",
    },
  });

  const {
    register,
    control,
    handleSubmit,
  } = form;

  const addPresetSize = (size: string) => {
    const current = (form.getValues("sizes") as string[]) || [];
    if (Array.isArray(current) && !current.includes(size)) {
      form.setValue("sizes", [...current, size]);
    }
  };

  const onSubmit = handleSubmit(
    async (data: InsertProducts) => {
      startTransition(async () => {
        try {
          let savedProduct;
          if (product) {
            const result = await updateProductAction(product.id, data);
            if (result.error) throw new Error(result.error);
            savedProduct = result.data[0];
          } else {
            const result = await createProductAction(data);
            if (result.error) throw new Error(result.error);
            savedProduct = result.data[0];
          }
  // ...

          if (savedProduct) {
            const validMediaIds = galleryImageIds.filter(
              (id): id is string => !!id,
            );
            await upsertProductMediasAction(savedProduct.id, validMediaIds);
          }

          router.push("/admin/products");
          router.refresh();

          toast({
            title: `Product is ${product ? "updated" : "created"}.`,
            description: `${data.name}`,
          });
        } catch (err) {
          console.error("Product submission error:", err);
          toast({
            title: "Error saving product.",
            description: err instanceof Error ? err.message : "An unknown error occurred.",
            variant: "destructive",
          });
        }
      });
    },
    (errors) => {
      console.error("Form validation errors:", errors);
      toast({
        title: "Validation Error",
        description: "Please check the form fields for errors.",
        variant: "destructive",
      });
    }
  );

  return (
    <ClientOnly>
      <Form {...form}>
        <form
          className="gap-x-5 flex gap-y-5 flex-col px-3"
          onSubmit={onSubmit}
        >
          <div className="flex flex-col gap-y-5 max-w-[560px]">
            <FormItem>
              <FormLabel className="text-sm">Name*</FormLabel>
              <FormControl>
                <Input
                  placeholder="Type Product Name."
                  {...register("name")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem>
              <FormLabel className="text-sm">Slug*</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. ribbed-merino-cardigan"
                  {...register("slug")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem>
              <FormLabel className="text-sm">Description</FormLabel>
              <FormControl>
                <textarea
                  className="w-full min-h-[80px] px-3 py-2 text-sm border border-input rounded-md bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Describe the garment..."
                  {...register("description")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <Suspense>
              {data && data.collectionsCollection && (
                <FormField
                  control={control}
                  name={"collectionId"}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collection</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a collection" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {data.collectionsCollection!.edges.map(
                            ({ node: collection }) => (
                              <SelectItem
                                value={collection.id}
                                key={collection.id}
                              >
                                {collection.label}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Assign this product to a collection.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </Suspense>

            <BadgeSelectField name="badge" label={""} />

            <FormItem>
              <FormLabel className="text-sm">Price*</FormLabel>
              <FormControl>
                <Input
                  placeholder="0.00"
                  {...register("price")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem>
              <FormLabel className="text-sm">Rating</FormLabel>
              <FormControl>
                <Input
                  placeholder="4.0"
                  {...register("rating")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem>
              <FormLabel className="text-sm">Tags</FormLabel>
              <FormControl>
                <TagsField name={"tags"} defaultValue={product?.tags || []} />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem>
              <FormLabel className="text-sm">Available Sizes</FormLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {PRESET_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => addPresetSize(size)}
                    className="px-3 py-1 text-xs border border-zinc-300 rounded hover:bg-zinc-100 transition-colors"
                  >
                    + {size}
                  </button>
                ))}
              </div>
              <FormControl>
                <TagsField name={"sizes"} defaultValue={product?.sizes || []} />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormField
              control={control}
              name="featuredImageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Featured Image*</FormLabel>
                  <Suspense>
                    <ImageDialog
                      defaultValue={product?.featuredImageId}
                      onChange={field.onChange}
                      value={field.value}
                    />
                  </Suspense>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="max-w-[560px]">
            <ProductGalleryField
              value={galleryImageIds}
              onChange={setGalleryImageIds}
              maxImages={4}
            />
          </div>

          <div className="py-8 flex gap-x-5 items-center">
            <Button disabled={isPending} variant={"outline"} type="submit">
              {product ? "Update Product" : "Create Product"}
              {isPending && (
                <Spinner
                  className="ml-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
              )}
            </Button>
            <Link href="/admin/products" className={buttonVariants()}>
              Cancel
            </Link>
          </div>
        </form>
      </Form>
    </ClientOnly>
  );
}

export default ProductForm;
