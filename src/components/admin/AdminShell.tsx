import React, { ReactNode } from "react";
import { Icons } from "../layouts/icons";
import Link from "next/link";
import { Button } from "../ui/button";
import BackButton from "../layouts/BackButton";

type AdminShellProps = {
  heading: string;
  description: string;
  showBackButton?: boolean;
  children: ReactNode;
};

function AdminShell({
  heading,
  description,
  showBackButton,
  children,
}: AdminShellProps) {
  return (
    <section>
      <div className="flex gap-x-3 mb-5 pb-3 border-b">
        {showBackButton && <BackButton />}
        <div>
          <h1 className="text-2xl font-semibold mb-1 leading-tight">
            {heading}
          </h1>
          {description && (
            <p className="max-w-2xl text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}

export default AdminShell;
