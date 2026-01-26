import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ReactNode } from "react";

const textStyles = cva([], {
  variants: {
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
      "4xl": "text-4xl",
      "5xl": "text-5xl",
    },
    weight: {
      bold: "font-bold",
      medium: "font-medium",
      regular: "font-normal",
      semibold: "font-semibold",
      italic: "font-normal italic",
    },
  },
  defaultVariants: {
    size: "base",
    weight: "regular",
  },
});

type Size = NonNullable<VariantProps<typeof textStyles>["size"]>;
type Weight = NonNullable<VariantProps<typeof textStyles>["weight"]>;
export type TextVariant = `${Size}-${Weight}`;

type TextStyleProps = {
  title?: string;
  as?: "span" | "p";
  subdued?: boolean;
  className?: string;
  children: ReactNode;
  variant?: TextVariant;
};

export const Text = (props: TextStyleProps) => {
  const { title, children, className, as: Tag = "p", variant = "base-regular" } = props;

  const [size, weight] = variant.split("-") as [Size, Weight];

  return (
    <Tag title={title} className={textStyles({ size, weight, className })}>
      {children}
    </Tag>
  );
};