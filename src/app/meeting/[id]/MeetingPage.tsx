"use client";

import AudioVolumeIndicator from "@/components/AudioVolumeIndicator";
import Button, { buttonClassName } from "@/components/Button";
import FlexibleCallLayout from "@/components/FlexibleCalllayout";
import PermissionPrompt from "@/components/PermissionPromp";
import RecordingsList from "@/components/RecordingList";
import useLoadCall from "@/hooks/useLoadCall";
import useStreamCall from "@/hooks/useStreamCall";
import { useUser } from "@clerk/nextjs";
import {
  Call,
  CallControls,
  CallingState,
  DeviceSettings,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  useCallStateHooks,
  useStreamVideoClient,
  VideoPreview,
} from "@stream-io/video-react-sdk";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";

interface MeetingPageProps {
  id: string;
}
export default function MeetingPage({ id }: MeetingPageProps) {
  const { user, isLoaded: userLoader } = useUser();
  const { call, callLoading } = useLoadCall(id);
  const [setupComplete, setSetupComplete] = useState(false);

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
  const call = useStreamCall();
  const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();
  const [setupComplete, setSetupComplete] = useState(false);
  const callEndAt = useCallEndedAt();
  const callStartsAt = useCallStartsAt();
  const callIsInFuture = callStartsAt && new Date(callStartsAt) > new Date();
  const callHasEnded = !!callEndAt;
  if (callHasEnded) {
    return <MeetingEndedScreen />;
  }
  async function handleSetupComplete() {
    call.join();
    setSetupComplete(true);
  }
  if (callIsInFuture) {
    return <UpcomingMeetingScreen />;
  }
  const description = call.state.custom.description;
  return (
    <div className="space-y-6">
      {description && (
        <p className="text-center">
          Meeting description: <span className="font-bold">{description}</span>
        </p>
      )}
      {setupComplete ? (
        <CallUI />
      ) : (
        <SetupUI onSetupComplete={handleSetupComplete} />
      )}
    </div>
  );
}

interface SetupUIProps {
  onSetupComplete: () => void;
}
function SetupUI({ onSetupComplete }: SetupUIProps) {
  const call = useStreamCall();

  const { useMicrophoneState, useCameraState } = useCallStateHooks();

  const micState = useMicrophoneState();
  const camState = useCameraState();

  const [micCamDisabled, setMicCamDisabled] = useState(false);

  useEffect(() => {
    if (micCamDisabled) {
      call.camera.disable();
      call.microphone.disable();
    } else {
      call.camera.enable();
      call.microphone.enable();
    }
  }, [micCamDisabled, call]);

  if (!micState.hasBrowserPermission || !camState.hasBrowserPermission) {
    return <PermissionPrompt />;
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <h1 className="text-center text-2xl font-bold">Setup</h1>
      <VideoPreview />
      <div className="flex h-16 items-center gap-3">
        <AudioVolumeIndicator />
        <DeviceSettings />
      </div>
      <label className="flex items-center gap-2 font-medium">
        <input
          type="checkbox"
          checked={micCamDisabled}
          onChange={(e) => setMicCamDisabled(e.target.checked)}
        />
        Join with mic and camera off
      </label>
      <Button onClick={onSetupComplete}>Join meeting</Button>
    </div>
  );
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
        <RecordingsList />
      </div>
    </div>
  );
}
function CallUI() {
  const { useCallCallingState } = useCallStateHooks();

  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) {
    return <Loader2 className="mx-auto animate-spin" />;
  }

  return <FlexibleCallLayout />;
}
