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
import { createInsertSchema } from "drizzle-zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { ProductGalleryField } from "./ProductGalleryField";
import { ClientOnly } from "@/components/ui/ClientOnly";
import { SizeChartEditor } from "./SizeChartEditor";

type ProductsFormProps = {
  product?: SelectProducts;
};

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
        sizeChart: null,
        price: "0.00",
        stock: 8,
        totalComments: 0,
        featuredImageId: "",
    },
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
  } = form;

  const watchName = watch("name");

  useEffect(() => {
    if (product?.id) return;
    if (watchName) {
      const slug = watchName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setValue("slug", slug);
    }
  }, [watchName, product?.id, setValue]);

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
              <FormLabel className="text-sm">Product Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Classic Merino Crewneck"
                  {...register("name")}
                />
              </FormControl>
              <FormDescription>
                The name customers see on the website.
              </FormDescription>
              <FormMessage />
            </FormItem>

            <FormItem>
              <FormLabel className="text-sm">URL Slug</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. classic-merino-crewneck"
                  {...register("slug")}
                />
              </FormControl>
              <FormDescription>
                Auto-generated from the name. You can edit it if needed.
              </FormDescription>
              <FormMessage />
            </FormItem>

            <FormItem>
              <FormLabel className="text-sm">Description</FormLabel>
              <FormControl>
                <textarea
                  className="w-full min-h-[80px] px-3 py-2 text-sm border border-input rounded-md bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Describe the garment — fabric, fit, what makes it special..."
                  {...register("description")}
                />
              </FormControl>
              <FormDescription>
                Shown on the product page. Keep it short and clear.
              </FormDescription>
              <FormMessage />
            </FormItem>

            <BadgeSelectField name="badge" label="Badge (optional — shows a tag on the product card)" />

            <FormItem>
              <FormLabel className="text-sm">Price</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. 85.00"
                  {...register("price")}
                />
              </FormControl>
              <FormDescription>
                Price in INR (without currency symbol).
              </FormDescription>
              <FormMessage />
            </FormItem>

            <FormItem>
              <FormLabel className="text-sm">Stock</FormLabel>
              <div className="flex gap-x-2">
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    placeholder="e.g. 8"
                    {...register("stock", { valueAsNumber: true })}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant={Number(form.watch("stock")) === 0 ? "default" : "outline"}
                  onClick={() =>
                    form.setValue("stock", Number(form.watch("stock")) === 0 ? 8 : 0)
                  }
                >
                  {Number(form.watch("stock")) === 0 ? "In Stock" : "Out of Stock"}
                </Button>
              </div>
              <FormDescription>
                Set to 0 (or press Out of Stock) to hide add-to-cart and mark the product as sold out. 5 or below shows a &quot;hurry, only X left&quot; urgency badge.
              </FormDescription>
              <FormMessage />
            </FormItem>

            <FormItem>
              <FormLabel className="text-sm">Rating</FormLabel>
              <FormControl>
                <Input
                  placeholder="4"
                  {...register("rating")}
                />
              </FormControl>
              <FormDescription>
                Star rating shown on the product card (1–5).
              </FormDescription>
              <FormMessage />
            </FormItem>

            <FormItem>
              <FormLabel className="text-sm">Tags</FormLabel>
              <FormControl>
                <TagsField name={"tags"} defaultValue={product?.tags || []} />
              </FormControl>
              <FormDescription>
                Labels like &quot;new&quot;, &quot;bestseller&quot;, &quot;sale&quot;.
              </FormDescription>
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
                    className="px-3 py-1 text-xs border border-zinc-300 dark:border-zinc-600 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    + {size}
                  </button>
                ))}
              </div>
              <FormControl>
                <TagsField name={"sizes"} defaultValue={product?.sizes || []} />
              </FormControl>
              <FormDescription>
                Click a size above to add it, or type custom sizes below.
              </FormDescription>
              <FormMessage />
            </FormItem>

            <FormItem>
              <FormLabel className="text-sm">Size Chart (optional)</FormLabel>
              <FormControl>
                <SizeChartEditor
                  value={(form.watch("sizeChart") as string) || product?.sizeChart || null}
                  onChange={(json) => form.setValue("sizeChart", json as any)}
                />
              </FormControl>
              <FormDescription>
                Add a custom size chart for this product. If left empty, the default size guide is shown.
              </FormDescription>
              <FormMessage />
            </FormItem>

            <FormField
              control={control}
              name="featuredImageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Featured Image</FormLabel>
                  <Suspense>
                    <ImageDialog
                      defaultValue={product?.featuredImageId}
                      onChange={field.onChange}
                      value={field.value}
                    />
                  </Suspense>
                  <FormDescription>
                    The main image shown on the shop page and product cards.
                  </FormDescription>
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
              {product ? "Save Changes" : "Create Product"}
              {isPending && (
                <Spinner
                  className="ml-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
              )}
            </Button>
            <Link href="/admin/products" className={buttonVariants({ variant: "ghost" })}>
              Cancel
            </Link>
          </div>
        </form>
      </Form>
    </ClientOnly>
  );
}

export default ProductForm;
