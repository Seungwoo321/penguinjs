import * as React from "react";
import { type VariantProps } from "class-variance-authority";
declare const buttonVariants: any;
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}
declare const Button: any;
export { Button, buttonVariants };
//# sourceMappingURL=Button.d.ts.map