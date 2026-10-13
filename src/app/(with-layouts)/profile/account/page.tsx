"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/tailgrids/core/avatar";
import { Card } from "@/components/tailgrids/core/card";
import { useAuth } from "@/components/common/auth/auth-provider";
import { Input } from "@/components/tailgrids/core/input";
import { Label } from "@/components/tailgrids/core/label";
import { TextField } from "@/components/tailgrids/core/text-field";

export default function AccountPage() {
  const { user } = useAuth();
  const displayName = user?.full_name || user?.email || "Người dùng";

  return (
    <div className="space-y-6">
      <Card className="bg-transparent p-5">
        <h2 className="mb-6 text-xl leading-7 font-semibold text-text-primary">
          Thông tin tài khoản
        </h2>
        <div className="space-y-6">
          <Avatar size="xxl">
            {user?.user_image ? (
              <AvatarImage src={user.user_image} alt={displayName} />
            ) : null}
            <AvatarFallback>
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <TextField className="w-full gap-2.5" readOnly>
              <Label>Họ và tên</Label>
              <Input
                name="fullName"
                value={user?.full_name ?? ""}
                className="w-full"
                readOnly
              />
            </TextField>
            <TextField className="w-full gap-2.5" readOnly>
              <Label>Địa chỉ email</Label>
              <Input
                name="email"
                type="email"
                value={user?.email ?? ""}
                className="w-full"
                readOnly
              />
            </TextField>
          </div>
        </div>
      </Card>
    </div>
  );
}
