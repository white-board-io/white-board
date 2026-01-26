import { Button } from "@repo/ui/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Text } from "@repo/ui/components/ui/text";
import { Input } from "@repo/ui/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function SignInForm() {
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full">
      <div className="mb-10 text-center">
        <img src="/images/whiteboard-logo.svg" alt="logo" className="mx-auto size-10" />
        <Text variant="xl-semibold" className="mt-2">
          Welcome back
        </Text>
        <Text variant="sm-regular" className="text-gray-800">
          Sign in to continue
        </Text>
      </div>

      <form className="space-y-3">
        <div>
          <label htmlFor="email" className="text-gray-800 text-sm">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="password" className="text-gray-800 text-sm">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => {
                setShowPassword(!showPassword);
              }}
              className="-top-2 absolute inset-y-0 right-0 flex items-center pr-3"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-5 w-5 text-gray-700" /> : <Eye className="h-5 w-5 text-gray-700" />}
            </button>
          </div>
        </div>

        <section>
          <Button type="submit" className="mt-4 h-10 w-full">
            Sign in
          </Button>
        </section>
      </form>

      <div className="mt-6 text-center">
        <Text variant="sm-regular" className="text-gray-800">
          Don't have an account?
        </Text>
        <Button
          variant="link"
          onClick={() => navigate({ to: "/sign-in" })}
          className="h-auto py-0 text-primary-800 hover:text-primary-900"
        >
          Sign up
        </Button>
      </div>
    </div>
  );
}