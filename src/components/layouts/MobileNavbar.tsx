"use client";
import { Suspense, useState } from "react";
import CartNav from "../../features/carts/components/CartNav";
import Branding from "./Branding";
import MobileSearchInput from "./MobileSearchInput";
import { SideMenu } from "./SideMenu";
import CartLink from "../../features/carts/components/CartLink";
import { ThemeToggle } from "./ThemeToggle";

type Props = { adminLayout: boolean };

function MobileNavbar({ adminLayout }: Props) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="md:hidden relative flex gap-x-4 justify-between items-center h-[64px]">
      {!searchOpen && (
        <>
          <div className="flex gap-x-2 items-center">
            <SideMenu />
            <MobileSearchInput onToggle={setSearchOpen} />
          </div>

          <Branding />
          <div className="flex gap-x-1 items-center">
            <ThemeToggle />
            {!adminLayout && (
              <Suspense fallback={<CartLink productCount={0} />}>
                <CartNav />
              </Suspense>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default MobileNavbar;
