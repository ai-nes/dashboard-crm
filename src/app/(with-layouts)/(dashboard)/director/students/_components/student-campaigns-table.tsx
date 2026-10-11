import { Badge } from "@/components/tailgrids/core/badge";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import type { StudentCampaignParticipation } from "@/services/api/student-campaigns";
import {
  campaignStatusColor,
  campaignStatusLabel,
} from "../../campaigns/_components/mappings";

const registrationDate = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Ho_Chi_Minh",
});

export default function StudentCampaignsTable({
  items,
}: {
  items: StudentCampaignParticipation[];
}) {
  return (
    <TableRoot aria-label="Các chiến dịch học sinh đã tham gia">
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Chiến dịch</TableHead>
          <TableHead scope="col">Trạng thái</TableHead>
          <TableHead scope="col">Thời gian đăng ký</TableHead>
          <TableHead scope="col">Tham gia</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="min-w-52 align-top">
              <p className="font-medium text-text-primary">{item.title}</p>
              <p className="mt-1 text-xs text-text-secondary">
                {item.code || "—"}
              </p>
              {item.channel && (
                <p className="mt-1 text-xs text-text-secondary">
                  {item.channel}
                </p>
              )}
            </TableCell>
            <TableCell className="whitespace-nowrap align-top">
              <Badge
                size="sm"
                color={campaignStatusColor[item.status] ?? "gray"}
              >
                {campaignStatusLabel[item.status] ?? item.status}
              </Badge>
            </TableCell>
            <TableCell className="whitespace-nowrap align-top">
              <time dateTime={item.registeredAt}>
                {registrationDate.format(new Date(item.registeredAt))}
              </time>
              {item.timestampEstimated && (
                <p className="mt-1 text-xs text-text-secondary">
                  Thời gian ước tính
                </p>
              )}
            </TableCell>
            <TableCell className="align-top">
              {item.isOriginalCampaign ? (
                <Badge size="sm" color="primary">
                  Chiến dịch đầu tiên
                </Badge>
              ) : (
                <Badge size="sm" color="sky">
                  Tham gia tiếp
                </Badge>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </TableRoot>
  );
}
