import { createFileRoute } from "@tanstack/react-router";
import { Text } from "@repo/ui/components/ui/text";
import { SignInForm } from "../../components/auth/sign-in-form";

export const Route = createFileRoute("/sign-in/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <section className="flex h-screen flex-col overflow-x-hidden bg-white sm:flex-row">
      <section className="group relative hidden h-full w-full sm:flex sm:flex-1">
        <img
          src="/images/sign-in-banner.jpg"
          alt="Whiteboard doodle showcase banner"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="-left-full absolute bottom-4 z-40 flex flex-col rounded-md px-4 py-2 opacity-0 transition-all duration-300 ease-out group-hover:left-4 group-hover:opacity-100">
          <Text variant="sm-regular" className="text-white">
            Want your image here?
          </Text>
          <Text variant="xs-regular" className="text-white">
            Share your doodle at{" "}
            <a href="mailto:doodle@white-board.io" className="underline">
              doodle@white-board.io
            </a>
          </Text>
        </div>
      </section>
      <section className="mx-auto flex h-full w-full max-w-sm translate-y-0 transform flex-col items-center justify-center overflow-x-hidden bg-white px-4 opacity-100 transition-all duration-500 ease-in-out md:px-6 lg:max-w-md lg:px-12">
        <SignInForm />
      </section>
    </section>
  );
}
