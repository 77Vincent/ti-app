"use client";

import Mousetrap from "mousetrap";
import { useEffect } from "react";

export function useEnterToNext(onEnter: () => void) {
  useEffect(() => {
    Mousetrap.bind("enter", (event) => {
      event.preventDefault();
      onEnter();
      return false;
    });

    return () => {
      Mousetrap.unbind("enter");
    };
  }, [onEnter]);
}
