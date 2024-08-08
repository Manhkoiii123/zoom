"use client";

import { buttonClassName } from "@/components/Button";
import useLoadCall from "@/hooks/useLoadCall";
import useStreamCall from "@/hooks/useStreamCall";
import { useUser } from "@clerk/nextjs";
import {
  Call,
  CallControls,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  useCallStateHooks,
  useStreamVideoClient,
} from "@stream-io/video-react-sdk";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";

interface MeetingPageProps {
  id: string;
}
export default function MeetingPage({ id }: MeetingPageProps) {
  const { user, isLoaded: userLoader } = useUser();
  const { call, callLoading } = useLoadCall(id);
  // const client = useStreamVideoClient();
  if (!userLoader || callLoading) {
    return <Loader2 className="mx-auto animate-spin" />;
  }
  if (!call) {
    return <p className="text-center font-bold">Call not found</p>;
  }
  const notAllowToJoin =
    call.type === "private-meeting" &&
    (!user || !call.state.members.find((m) => m.user.id === user.id));

  if (notAllowToJoin) {
    return (
      <p className="text-center font-bold">
        You are not allowed to view this meeting
      </p>
    );
  }
  return (
    <StreamCall call={call}>
      <StreamTheme className="space-y-3">
        <MeetingScreen />
      </StreamTheme>
    </StreamCall>
  );
}
function MeetingScreen() {
  const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();
  const callEndAt = useCallEndedAt();
  const callStartsAt = useCallStartsAt();
  const callIsInFuture = callStartsAt && new Date(callStartsAt) > new Date();
  const callHasEnded = !!callEndAt;
  if (callHasEnded) {
    return <MeetingEndedScreen />;
  }
  if (callIsInFuture) {
    return <UpcomingMeetingScreen />;
  }

  return <div> Call ui</div>;
}
function UpcomingMeetingScreen() {
  const call = useStreamCall();

  return (
    <div className="flex flex-col items-center gap-6">
      <p>
        This meeting has not started yet. It will start at{" "}
        <span className="font-bold">
          {call.state.startsAt?.toLocaleString()}
        </span>
      </p>
      {call.state.custom.description && (
        <p>
          Description:{" "}
          <span className="font-bold">{call.state.custom.description}</span>
        </p>
      )}
      <Link href="/" className={buttonClassName}>
        Go home
      </Link>
    </div>
  );
}
function MeetingEndedScreen() {
  return (
    <div className="flex flex-col items-center gap-6">
      <p className="font-bold">This meeting has ended</p>
      <Link href="/" className={buttonClassName}>
        Go home
      </Link>
      <div className="space-y-3">
        <h2 className="text-center text-xl font-bold">Recordings</h2>
        {/* <RecordingsList /> */}
      </div>
    </div>
  );
}
