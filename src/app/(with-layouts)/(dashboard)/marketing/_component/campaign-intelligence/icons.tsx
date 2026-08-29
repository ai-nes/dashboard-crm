import { Calendar } from "@tailgrids/icons";
import Image from "next/image";
import type { ComponentProps } from "react";

interface PlatformIconProps extends ComponentProps<"div"> {
  channel: string;
  size?: "sm" | "md" | "lg";
}

const sizeConfig = {
  sm: {
    container: "size-6",
    innerIcon: 13,
    calendar: 13,
  },
  md: {
    container: "size-8",
    innerIcon: 17,
    calendar: 16,
  },
  lg: {
    container: "size-10",
    innerIcon: 22,
    calendar: 20,
  },
};

export function PlatformIcon({ channel, size = "md", className = "", ...props }: PlatformIconProps) {
  const currentSize = sizeConfig[size] ?? sizeConfig.md;
  const baseClasses = `relative flex shrink-0 items-center justify-center overflow-hidden rounded-full ${currentSize.container} ${className}`;

  if (channel === "Facebook") {
    return (
      <div {...props} className={baseClasses}>
        <Image
          src="/images/social-icons/facebook.svg"
          alt="Facebook"
          width={48}
          height={48}
          className="size-full object-cover"
        />
      </div>
    );
  }

  if (channel === "Google") {
    return (
      <div {...props} className={baseClasses}>
        <Image
          src="/images/social-icons/google.svg"
          alt="Google"
          width={48}
          height={48}
          className="size-full object-cover"
        />
      </div>
    );
  }

  if (channel === "TikTok") {
    return (
      <div {...props} className={`${baseClasses} bg-black dark:bg-[#202020]`}>
        <Image
          src="/images/social-icons/tiktok.svg"
          alt="TikTok"
          width={currentSize.innerIcon}
          height={currentSize.innerIcon}
          className="invert"
        />
      </div>
    );
  }

  if (channel === "Zalo") {
    return (
      <div {...props} className={`${baseClasses} bg-[#0068FF]`}>
        <Image
          src="/images/social-icons/zalo.svg"
          alt="Zalo"
          width={currentSize.innerIcon + 1}
          height={currentSize.innerIcon + 1}
          className="invert"
        />
      </div>
    );
  }

  // Default / School Event
  return (
    <div
      {...props}
      className={`${baseClasses} bg-primary-100 text-primary-600 dark:bg-primary-950 dark:text-primary-400`}
    >
      <Calendar size={currentSize.calendar} aria-hidden="true" />
    </div>
  );
}

