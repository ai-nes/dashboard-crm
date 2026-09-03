"use client";

import { BarChart2, TrendUp2 } from "@tailgrids/icons";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { formatDate } from "@/utils/format-date";

import StudentChartInspectorSheet from "./student-chart-inspector-sheet";
import type { ChannelChartItem, TrendChartItem } from "./student-chart-types";
import StudentChartTooltip from "./student-chart-tooltip";
import type { Student360SectionProps } from "./types";

export default function StudentChartsSection({ data }: Student360SectionProps) {
  const chartId = data.student.code.toLowerCase().replace(/[^a-z0-9]/g, "-");

  // State cho Slide-over Inspector Drawer (Hướng 2)
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<ChannelChartItem | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<TrendChartItem | null>(null);

  // Đảm bảo lấy điểm xác suất và điểm đầu chuẩn xác từ dữ liệu hồ sơ
  const probability = data.insight?.probability ?? data.insight?.signalScore ?? 82;
  const baseline = data.insight?.baseline ?? Math.max(35, probability - 37);
  const probabilityChange = probability - baseline;

  // Dữ liệu tiến trình khả năng nhập học kèm các mốc sự kiện thực tế
  const trendData = useMemo<TrendChartItem[]>(() => {
    if (data.probabilityTrend && data.probabilityTrend.length > 0) {
      return data.probabilityTrend.map((item, index, arr) => ({
        ...item,
        date: formatDate(item.date),
        score: index === arr.length - 1 ? probability : (item.score ?? 0),
      }));
    }

    return [
      {
        date: "28/05",
        score: baseline,
        touches: 1,
        eventTitle: "Đăng ký tại Career Talk",
        eventDetail: `Để lại nguyện vọng ngành ${data.student.major || "Kỹ thuật phần mềm"} và thông tin liên hệ.`,
        channel: "Sự kiện",
      },
      {
        date: "31/05",
        score: Math.min(100, Math.round(baseline + probabilityChange * 0.3)),
        touches: 2,
        eventTitle: "Tra cứu học phí trên Website",
        eventDetail: "Xem bảng học phí và chính sách học bổng theo học kỳ 3 lần.",
        channel: "Website",
      },
      {
        date: "02/06",
        score: Math.min(100, Math.round(baseline + probabilityChange * 0.65)),
        touches: 1,
        eventTitle: "Check-in FPTU Open Day",
        eventDetail: "Tham gia phiên chuyên ngành AI và đặt câu hỏi về chuẩn đầu ra.",
        channel: "Sự kiện",
      },
      {
        date: "04/06",
        score: Math.min(100, Math.round(baseline + probabilityChange * 0.8)),
        touches: 1,
        eventTitle: "Trao đổi phụ huynh qua Zalo",
        eventDetail: "Phụ huynh hỏi về điều kiện học bổng và quy trình nộp hồ sơ.",
        channel: "Zalo",
      },
      {
        date: "06/06",
        score: probability,
        touches: 2,
        eventTitle: "Cuộc gọi tư vấn chuyên sâu",
        eventDetail: "Xác nhận nguyện vọng nhập học và thống nhất thời hạn hoàn tất hồ sơ.",
        channel: "Cuộc gọi",
      },
    ];
  }, [data.probabilityTrend, baseline, probability, probabilityChange, data.student.major]);

  // Dữ liệu các kênh tương tác kèm danh sách sự kiện và hoạt động chi tiết
  const channels = useMemo<ChannelChartItem[]>(() => {
    return [
      {
        channel: "Cuộc gọi",
        touches: 2,
        response: 100,
        fill: "var(--success-500)",
        activities: [
          {
            title: "Cuộc gọi tư vấn chuyên sâu lần 2",
            time: "06/06/2026 · 16:42",
            description: "Xác nhận ngành học, phụ huynh hỏi thêm về phương án học phí và điều kiện học bổng theo học kỳ.",
          },
          {
            title: "Cuộc gọi tư vấn ban đầu",
            time: "03/06/2026 · 10:12",
            description: "Trao đổi về chương trình học, dự án thực tế và cơ hội việc làm sau tốt nghiệp.",
          },
        ],
      },
      {
        channel: "Website",
        touches: 22,
        response: 82,
        fill: "var(--info-500)",
        activities: [
          {
            title: "Tra cứu biểu phí và học bổng",
            time: "31/05/2026",
            description: "Xem 3 lần trong cùng một phiên truy cập.",
          },
          {
            title: "Đọc đề án tuyển sinh ngành AI",
            time: "30/05/2026",
            description: "Thời gian đọc 4 phút 15 giây.",
          },
          {
            title: "Điền form tư vấn tuyển sinh trực tuyến",
            time: "28/05/2026",
            description: "Cung cấp nguyện vọng ưu tiên và đồng ý nhận tư vấn.",
          },
        ],
      },
      {
        channel: "Zalo",
        touches: 6,
        response: 84,
        fill: "var(--primary-500)",
        activities: [
          {
            title: "Trao đổi học phí với phụ huynh",
            time: "06/06/2026 · 16:42",
            description: "Gửi biểu phí, thông tin học bổng 30% và hẹn gọi trao đổi thêm.",
          },
          {
            title: "Giải đáp thắc mắc của học sinh",
            time: "04/06/2026 · 20:18",
            description: "Học sinh hỏi về các dự án thực tế và cơ hội thực tập doanh nghiệp.",
          },
        ],
      },
      {
        channel: "Sự kiện",
        touches: 2,
        response: 78,
        fill: "var(--warning-500)",
        activities: [
          {
            title: "Ngày hội tuyển sinh FPTU Open Day",
            time: "02/06/2026 · 09:30",
            description: "Check-in trực tiếp tại trường, tham gia phiên chuyên ngành AI và hỏi về đầu ra.",
          },
          {
            title: "Career Talk Định hướng nghề nghiệp",
            time: "28/05/2026 · 14:05",
            description: "Tham dự buổi định hướng và nộp phiếu đăng ký tư vấn trực tiếp.",
          },
        ],
      },
    ];
  }, []);

  const totalTouches = channels.reduce((sum, ch) => sum + (ch.touches ?? 0), 0);
  const avgResponse =
    channels.length > 0
      ? Math.round(
          channels.reduce((sum, ch) => sum + (ch.response ?? 0), 0) /
            channels.length,
        )
      : 0;

  const handleOpenChannelInspector = (channel: ChannelChartItem) => {
    setSelectedChannel(channel);
    setSelectedMilestone(null);
    setInspectorOpen(true);
  };

  const handleOpenMilestoneInspector = (milestone: TrendChartItem) => {
    setSelectedMilestone(milestone);
    setSelectedChannel(null);
    setInspectorOpen(true);
  };

  return (
    <section
      aria-label="Biểu đồ phân tích học sinh"
      className="grid min-w-0 items-stretch gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]"
    >
      {/* Chart 1: Khả năng nhập học */}
      <Card className="min-w-0 border-success-200/60 p-5">
        <CardHeader className="mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Khả năng nhập học</CardTitle>
            <Badge color="success">
              <TrendUp2 size={13} />
              {probabilityChange >= 0 ? `+${probabilityChange}` : probabilityChange} điểm
            </Badge>
          </div>
        </CardHeader>
        <div className="mb-3 grid grid-cols-3 divide-x divide-card-border rounded-xl bg-badge-success-background py-3 text-center">
          <ChartStat label="Điểm đầu" value={`${baseline}%`} />
          <ChartStat
            label="Hiện tại"
            value={`${probability}%`}
            tone="text-success-500"
          />
          <ChartStat label="Ngưỡng" value="70%" tone="text-warning-500" />
        </div>
        <div className="h-64 min-h-64 w-full cursor-pointer">
          <ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart
              data={trendData}
              margin={{ top: 10, right: 8, left: -18, bottom: 0 }}
              onClick={(state) => {
                const payload = (state as unknown as { activePayload?: Array<{ payload?: unknown }> })?.activePayload?.[0]?.payload as TrendChartItem | undefined;
                if (payload) {
                  handleOpenMilestoneInspector(payload);
                }
              }}
            >
              <defs>
                <linearGradient id={`student-probability-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--success-500)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--success-500)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tickMargin={10} />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <ReferenceLine
                y={70}
                stroke="var(--warning-500)"
                strokeDasharray="4 4"
                label={{
                  value: "Ngưỡng ưu tiên",
                  position: "insideTopRight",
                  fill: "var(--text-tertiary)",
                  fontSize: 11,
                }}
              />
              <Tooltip
                cursor={{ stroke: "var(--success-500)", strokeDasharray: "4 4" }}
                content={StudentChartTooltip}
              />
              <Area
                type="monotone"
                dataKey="score"
                name="Xác suất nhập học"
                stroke="var(--success-500)"
                strokeWidth={2.5}
                fill={`url(#student-probability-${chartId})`}
                dot={{
                  r: 4,
                  fill: "var(--success-500)",
                  strokeWidth: 0,
                  className: "cursor-pointer transition-transform hover:scale-125",
                }}
                activeDot={{
                  r: 6,
                  fill: "var(--success-500)",
                  stroke: "var(--card-background)",
                  strokeWidth: 2,
                  className: "cursor-pointer",
                }}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </Card>

      {/* Chart 2: Kênh tương tác */}
      <Card className="min-w-0 border-info-500/20 p-5">
        <CardHeader className="mb-4">
          <CardTitle>Kênh tương tác</CardTitle>
          <span
            className="flex size-9 items-center justify-center rounded-xl bg-badge-sky-background text-badge-sky-text"
            aria-hidden="true"
          >
            <BarChart2 size={17} />
          </span>
        </CardHeader>
        <div className="h-64 min-h-64 w-full cursor-pointer">
          <ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart
              data={channels}
              layout="vertical"
              margin={{ top: 4, right: 8, left: 4, bottom: 0 }}
              onClick={(state) => {
                const payload = (state as unknown as { activePayload?: Array<{ payload?: unknown }> })?.activePayload?.[0]?.payload as ChannelChartItem | undefined;
                if (payload) {
                  handleOpenChannelInspector(payload);
                }
              }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis type="number" hide domain={[0, 24]} />
              <YAxis
                type="category"
                dataKey="channel"
                width={68}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--text-tertiary)", fontSize: 11 }}
              />
              <Tooltip
                cursor={{ fill: "var(--background-soft-50)" }}
                content={StudentChartTooltip}
              />
              <Bar
                dataKey="touches"
                name="Điểm chạm"
                radius={[0, 5, 5, 0]}
                barSize={18}
                className="cursor-pointer"
              >
                {channels.map((entry) => (
                  <Cell
                    key={entry.channel}
                    fill={entry.fill || "var(--primary-500)"}
                    className="cursor-pointer transition-opacity hover:opacity-80"
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-badge-sky-background p-3 text-center">
          <div>
            <p className="text-xs text-text-tertiary">Tổng lượt tương tác</p>
            <p className="mt-1 text-lg font-semibold text-text-primary">{totalTouches}</p>
          </div>
          <div>
            <p className="text-xs text-text-tertiary">Phản hồi bình quân</p>
            <p className="mt-1 text-lg font-semibold text-info-500">{avgResponse}%</p>
          </div>
        </div>
      </Card>

      {/* Slide-over Sheet kiểm tra chi tiết theo Hướng 2 (Linear / Figma style) */}
      <StudentChartInspectorSheet
        isOpen={inspectorOpen}
        onOpenChange={setInspectorOpen}
        channel={selectedChannel}
        milestone={selectedMilestone}
        studentName={data.student.name}
        studentMajor={data.student.major}
      />
    </section>
  );
}

function ChartStat({
  label,
  value,
  tone = "text-text-primary",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="min-w-0 px-2">
      <p className="text-[11px] text-text-tertiary">{label}</p>
      <p className={`mt-1 text-base font-semibold ${tone}`}>{value}</p>
    </div>
  );
}
