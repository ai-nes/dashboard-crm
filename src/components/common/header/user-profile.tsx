"use client";

import { useAuth } from "@/components/common/auth/auth-provider";
import {
  BillingIcon,
  GearIcon,
  LogoutIcon,
  UserCircleIcon,
} from "@/components/common/header/icons";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/tailgrids/core/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHeader,
  DropdownMenuItem,
  DropdownMenuSection,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/tailgrids/core/dropdown";
import { frappeAsset, logout } from "@/services/api/auth";
import { AltArrowDownIcon } from "@/utils/icon";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface UserProfileMenuItem {
  href: string;
  icon: React.ReactNode;
  label: string;
}

const menuItems: UserProfileMenuItem[] = [
  { href: "/profile", icon: <UserCircleIcon />, label: "Xem tài khoản" },
  { href: "#", icon: <GearIcon />, label: "Cài đặt tài khoản" },
  { href: "#", icon: <BillingIcon />, label: "Gói dịch vụ" },
];

export function UserProfileButton() {
  const { user, refetch } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const displayName = user?.full_name || user?.email || "Người dùng";
  const email = user?.email ?? "";
  const avatarUrl = frappeAsset(user?.user_image);
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    refetch();
    router.replace("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex items-center gap-2 rounded-lg border-0 p-0 transition-all outline-none focus-visible:ring-4 focus-visible:ring-input-primary-focus-border/20 focus-visible:ring-offset-1">
        <Avatar>
          {avatarUrl ? (
            <AvatarImage
              src={avatarUrl}
              alt={displayName}
              className="size-8.5 rounded-lg"
            />
          ) : null}
          <AvatarFallback className="rounded-lg border border-border-secondary-alt bg-background-gray-secondary_alt text-xs">
            {initial}
          </AvatarFallback>
        </Avatar>

        <span className="text-xs leading-5 font-medium text-text-primary">
          {displayName}
        </span>

        <AltArrowDownIcon className="size-3 text-icon-tertiary transition-transform duration-200 group-aria-expanded:-rotate-180" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        placement="bottom end"
        className="w-70 overflow-hidden p-0 shadow-3xl"
      >
        <DropdownMenuHeader className="flex w-full items-center justify-start gap-2 border-b border-border-secondary-alt px-4 py-3">
          <Avatar size="md">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={displayName} />
            ) : null}
            <AvatarFallback className="border border-border-secondary-alt bg-background-gray-secondary_alt">
              {initial}
            </AvatarFallback>
          </Avatar>
          <span className="flex flex-col">
            <span className="text-sm font-medium text-text-primary">
              {displayName}
            </span>
            {email ? (
              <span className="truncate text-xs text-gray-500">{email}</span>
            ) : null}
          </span>
        </DropdownMenuHeader>

        <DropdownMenuSection className="p-1.5">
          {menuItems.map((item) => (
            <DropdownMenuItem
              key={item.label}
              href={item.href}
              className="cursor-pointer px-3 py-2.5"
              render={(domProps) =>
                "href" in domProps ? (
                  <Link {...domProps} />
                ) : (
                  <div {...domProps} />
                )
              }
            >
              <span className="shrink-0 text-icon-secondary group-hover:text-text-primary">
                {item.icon}
              </span>
              <span className="leading-5 font-medium">{item.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuSection>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onAction={handleLogout}
          className="m-1.5 w-auto cursor-pointer px-3 py-2.5"
        >
          <span className="text-icon-secondary group-hover:text-text-primary">
            <LogoutIcon />
          </span>
          <span className="leading-5">Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
