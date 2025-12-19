"use client"

import { usePathname } from "next/navigation"
import { Navigation } from "./navigation"
import { useAuth } from "@/hooks/use-auth"

export function ConditionalNavigation() {
  const pathname = usePathname()
  // Paths where the navigation should be hidden
  const hiddenPaths = ["/try", "/auth"];

  // Check if the current path starts with any of the hidden paths
  const shouldHideNav = hiddenPaths.some(path => pathname.startsWith(path));

  if (shouldHideNav) {
    return null;
  }

  return <Navigation />;
}
