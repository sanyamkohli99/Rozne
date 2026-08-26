"use client";
import { Suspense, useState } from "react";
import CartNav from "../../features/carts/components/CartNav";
import Branding from "./Branding";
import MobileSearchInput from "./MobileSearchInput";
import { SideMenu } from "./SideMenu";
import CartLink from "../../features/carts/components/CartLink";

type Props = { adminLayout: boolean };

function MobileNavbar({ adminLayout }: Props) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="md:hidden relative flex gap-x-8 justify-between items-center h-[64px]">
      {!searchOpen && (
        <>
          <div className="flex gap-x-3 items-center">
            <SideMenu />
            <MobileSearchInput onToggle={setSearchOpen} />
          </div>

          <Branding />
          <Suspense fallback={<CartLink productCount={0} />}>
            {!adminLayout && <CartNav />}
          </Suspense>
        </>
      )}
    </div>
  );
}

export default MobileNavbar;
