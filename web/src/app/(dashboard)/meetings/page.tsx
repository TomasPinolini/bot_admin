import { Header } from "@/components/header";
import { Mic } from "lucide-react";
import { getMeetings } from "@/lib/queries";
import { MeetingTable } from "@/components/meetings/meeting-table";

export const dynamic = "force-dynamic";

export default async function MeetingsPage() {
  const meetings = await getMeetings();

  return (
    <div className="flex flex-col gap-6 p-8 px-10 h-full">
      <Header
        title="Meetings"
        subtitle="Fireflies meeting recordings and extracted data"
      />

      {meetings.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-text-muted">
          <Mic size={40} className="opacity-30" />
          <p className="text-sm">No meetings synced yet</p>
          <p className="text-xs">
            Meetings will appear here once the Fireflies sync task runs
          </p>
        </div>
      ) : (
        <MeetingTable meetings={meetings} />
      )}
    </div>
  );
}
