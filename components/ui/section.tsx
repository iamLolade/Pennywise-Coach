import * as React from "react";

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export const Container = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cx("mx-auto w-full max-w-6xl px-4", className)} {...props} />
  );
};

export const Section = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) => {
  return (
    <section
      className={cx("py-14 sm:py-20", className)}
      {...props}
    />
  );
};
