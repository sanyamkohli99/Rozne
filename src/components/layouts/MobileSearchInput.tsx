"use client";
import React, { useState } from "react";
import { Icons } from "./icons";
import { Button } from "../ui/button";
import SearchInput from "./SearchInput";

type Props = {
  onToggle: (open: boolean) => void;
};

function MobileSearchInput({ onToggle }: Props) {
  const [openSearchBar, setOpenSearchBar] = useState(false);

  const toggle = (val: boolean) => {
    setOpenSearchBar(val);
    onToggle(val);
  };

  if (openSearchBar) {
    return (
      <div className="fixed inset-x-0 top-0 z-50 bg-background px-4 py-3 flex items-center gap-3">
        <button onClick={() => toggle(false)} className="shrink-0 p-1">
          <Icons.chevronLeft size={20} />
        </button>
        <div className="flex-1">
          <SearchInput onSubmitextra={() => toggle(false)} />
        </div>
      </div>
    );
  }

  return (
    <Button onClick={() => toggle(true)} variant="ghost" size="icon">
      <Icons.search size={18} />
    </Button>
  );
}

export default MobileSearchInput;
