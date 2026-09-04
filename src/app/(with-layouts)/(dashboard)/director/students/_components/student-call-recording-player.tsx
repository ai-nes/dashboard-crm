"use client";

import { Play, Volume1 } from "@tailgrids/icons";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import type { StudentCallRecord } from "@/services/api/students/types";

interface StudentCallRecordingPlayerProps {
  call: StudentCallRecord;
}

export default function StudentCallRecordingPlayer({ call }: StudentCallRecordingPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(call.durationSeconds ?? 0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => setDuration(audio.duration || call.durationSeconds || 0);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [call.durationSeconds, call.recordingUrl]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio || !call.recordingUrl) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    void audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  };

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-card-border bg-background-gray-secondary/40 px-3 py-2.5">
      {call.recordingUrl ? (
        <audio ref={audioRef} src={call.recordingUrl} preload="metadata" className="sr-only" />
      ) : null}
      <Button
        type="button"
        variant="primary"
        appearance={call.recordingUrl ? "fill" : "outline"}
        iconOnly
        size="sm"
        onPress={togglePlayback}
        isDisabled={!call.recordingUrl}
        aria-label={
          call.recordingUrl
            ? isPlaying
              ? "Tạm dừng bản ghi âm"
              : "Phát bản ghi âm"
            : "Chưa có bản ghi âm"
        }
        className="size-9 shrink-0 rounded-full"
      >
        {isPlaying ? <span className="text-xs font-bold">Ⅱ</span> : <Play size={16} />}
      </Button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-text-primary">
            <Volume1 size={15} className="text-primary-500" aria-hidden="true" />
            Bản ghi âm
          </span>
          <span className="shrink-0 text-xs tabular-nums text-text-tertiary">
            {formatDuration(currentTime)} / {formatDuration(duration)}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-card-border" aria-hidden="true">
          <div
            className="h-full rounded-full bg-primary-500 transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
        {!call.recordingUrl ? (
          <p className="mt-1 text-xs text-text-tertiary">Bản ghi sẽ khả dụng khi API trả về đường dẫn âm thanh.</p>
        ) : null}
      </div>
    </div>
  );
}

function formatDuration(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "00:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
