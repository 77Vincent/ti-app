"use client";

import { Button } from "@heroui/react";
import { signOut } from "next-auth/react";
import { PAGE_PATHS } from "@/lib/config/paths";

export default function LogoutButton() {
  function handleLogout() {
    void signOut({
      callbackUrl: PAGE_PATHS.SIGN_IN,
    });
  }

  return (
    <Button
      onPress={handleLogout}
      variant="bordered"
    >
      Logout
    </Button>
  );
}
