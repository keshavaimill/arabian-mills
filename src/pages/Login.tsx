import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { login } from "@/lib/auth";
import logo from "@/assets/arabian-mills-logo.svg";

const LoginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Email or username is required")
    .refine(
      (value) => {
        // Allow usernames OR basic email format.
        const v = value.trim();
        const looksLikeEmail = v.includes("@");
        if (!looksLikeEmail) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      { message: "Enter a valid email address" },
    ),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof LoginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authError, setAuthError] = useState<string | null>(null);

  const fromPath = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from && typeof state.from === "string" ? state.from : "/";
  }, [location.state]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { identifier: "", password: "" },
    mode: "onSubmit",
  });

  const onSubmit = (values: LoginFormValues) => {
    setAuthError(null);
    const result = login(values.identifier, values.password);
    if (!result.ok) {
      setAuthError("Invalid credentials. Please check your username/email and password.");
      return;
    }

    navigate(fromPath, { replace: true });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-gray-50 px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-4 sm:mb-6 flex justify-center">
          <img
            src={logo}
            alt="Arabian Mills Logo"
            className="h-14 sm:h-16 w-auto"
            decoding="async"
          />
        </div>
        <div className="mb-6 sm:mb-8 text-center space-y-2">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-muted-foreground">Arabian Mills</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">Operations Command Center</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to continue</p>
        </div>

        <Card className="section-shell border-border/70 bg-white/80">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl">Login</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {authError && (
              <div
                role="alert"
                aria-live="polite"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {authError}
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <FormField
                  control={form.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email / Username</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          autoComplete="username"
                          inputMode="email"
                          placeholder="admin or admin@company.com"
                        />
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
                        <Input {...field} type="password" autoComplete="current-password" placeholder="••••••••" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full rounded-xl bg-foreground text-white" disabled={form.formState.isSubmitting}>
                  Login
                </Button>

                <p className="text-xs text-muted-foreground leading-relaxed">                </p>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;

