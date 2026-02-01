"use client";

import Logo from "@docs/components/logo";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@docs/utils/utils";
import { GithubStars } from "./github-stars";
import { siteConfig } from "@/fumadocs.config";
import { NAV_ICON_MAP } from "./config";

interface MobileNavbarProps {
  className?: string;
}

export function MobileNavbar({ className }: MobileNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navItems = siteConfig.navItems ?? [];
  type NavIconName = keyof typeof NAV_ICON_MAP;
  type NavItem =
    | {
      type: "link";
      label: string;
      href: string;
      icon?: NavIconName;
    }
    | {
      type: "menu";
      label: string;
      icon?: NavIconName;
      items: Array<{
        label: string;
        href: string;
        icon?: NavIconName;
      }>;
    };
  const resolvedNavItems = navItems as NavItem[];

  return (
    <div className={cn("mobile-navbar", className)}>
      <div className="mobile-navbar-header">
        <a className="flex gap-2" href="/">
          <Logo />
        </a>
        <Button
          aria-label="Toggle menu"
          className="mobile-menu-button"
          onClick={() => setIsOpen(!isOpen)}
          size="icon"
          variant="ghost"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="mobile-navbar-menu"
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{
              duration: 0.2,
              ease: [0.22, 1, 0.36, 1], // ease-out-quart
            }}
          >
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mobile-navbar-links"
              initial={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.15, duration: 0.2 }}
            >
              {resolvedNavItems.map((item) => {
                if (item.type === "menu") {
                  return (
                    <div key={item.label}>
                      <div className="mobile-navbar-link">
                        {item.icon ? (
                          (() => {
                            const Icon = NAV_ICON_MAP[item.icon];
                            return Icon ? <Icon size={16} /> : null;
                          })()
                        ) : null}
                        {item.label}
                      </div>
                      <div className="flex flex-col gap-1">
                        {item.items.map((child) => {
                          const Icon = child.icon
                            ? NAV_ICON_MAP[child.icon]
                            : null;
                          return (
                            <Link
                              className="mobile-navbar-link pl-6"
                              href={child.href}
                              key={child.href}
                            >
                              {Icon ? <Icon size={16} /> : null}
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                const Icon = item.icon ? NAV_ICON_MAP[item.icon] : null;
                return (
                  <Link
                    className="mobile-navbar-link"
                    href={item.href}
                    key={item.href}
                  >
                    {Icon ? <Icon size={16} /> : null}
                    {item.label}
                  </Link>
                );
              })}
            </motion.div>

            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mobile-navbar-footer"
              initial={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.2, duration: 0.2 }}
            >
              <GithubStars />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
