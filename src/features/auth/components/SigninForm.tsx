"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import { authSchema } from "../validations";
import { PasswordInput } from "./PasswordInput";

type FormData = z.infer<typeof authSchema>;
const emailSchema = z.object({ email: z.string().email() });
type EmailData = z.infer<typeof emailSchema>;

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supabase = createClient();
  const [isPending, startTransition] = React.useTransition();
  const [magicMode, setMagicMode] = React.useState(false);
  const [magicSent, setMagicSent] = React.useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "" },
  });

  const magicForm = useForm<EmailData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  React.useEffect(() => {
    const error = searchParams.get("error");
    if (error) toast({ title: "Error", description: error });
  }, [searchParams]);

  function onSubmit({ email, password }: FormData) {
    startTransition(async () => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "Error", description: error.message });
      } else {
        toast({ title: "Login Success" });
        router.push(searchParams?.get("from") || "/");
      }
    });
  }

  function onMagicLink({ email }: EmailData) {
    startTransition(async () => {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) {
        toast({ title: "Error", description: error.message });
      } else {
        setMagicSent(true);
      }
    });
  }

  if (magicMode) {
    if (magicSent) {
      return (
        <div className="text-center space-y-3 py-4">
          <p className="text-lg font-medium">Check your email ✉️</p>
          <p className="text-muted-foreground text-sm">
            We sent a sign-in link to{" "}
            <strong>{magicForm.getValues("email")}</strong>. Click the link to
            log in — no password needed.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setMagicSent(false); setMagicMode(false); }}
          >
            Back to sign in
          </Button>
        </div>
      );
    }

    return (
      <Form {...magicForm}>
        <form
          className="grid gap-4"
          onSubmit={(...args) => void magicForm.handleSubmit(onMagicLink)(...args)}
        >
          <FormField
            control={magicForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@domain.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={isPending}>
            {isPending && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
            Send magic link
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMagicMode(false)}
          >
            Sign in with password instead
          </Button>
        </form>
      </Form>
    );
  }

  return (
    <Form {...form}>
      <form
        className="grid gap-4"
        onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@domain.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="**********"
                  {...field}
                  className="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={isPending}>
          {isPending && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
          Sign in
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setMagicMode(true)}
        >
          Sign in with email link instead
        </Button>
      </form>
    </Form>
  );
}

export default SignInForm;
