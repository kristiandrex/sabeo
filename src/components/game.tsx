"use client";

import {
  useEffect,
  useMemo,
  useOptimistic,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";

import {
  addAttempt,
  completeChallenge,
  registerChallengeOpen,
} from "#/app/actions/challenge";
import { NUMBER_OF_ROWS } from "#/constants";
import { Challenge } from "#/domain/challenge/types";
import { getColorsByAttempt } from "#/domain/challenge/colors";
import {
  readGuestAttempts,
  writeGuestAttempts,
} from "#/domain/challenge/guest";
import { useLocalStorage } from "#/hooks/useLocalStorage";

import { Attempts } from "./attempts";
import { DialogChallengeCompleted } from "./dialog-completed";
import { Keyboard } from "./keyboard";

function getAllAttemptsColors(attempts: string[], challenge: string) {
  return attempts.map((attempt) => getColorsByAttempt({ attempt, challenge }));
}

type Props = {
  dictionary: string[];
  challenge: Challenge;
  initialState: ChallengeInitialState;
  isGuest: boolean;
  shouldRegisterChallengeOpen: boolean;
};

type BonusSnapshot = {
  seasonPoints: number;
  currentStreak: number;
  fastBonusAwarded: boolean;
};

type ChallengeInitialState = {
  attempts: string[];
  isFinished: boolean;
  bonusSnapshot: BonusSnapshot | null;
};

export function Game({
  dictionary,
  challenge,
  initialState,
  isGuest,
  shouldRegisterChallengeOpen,
}: Props) {
  const [attempts, setAttempts] = useState(initialState.attempts);
  const [currentAttempt, setCurrentAttempt] = useState<string>("");
  const [bonusSnapshot, setBonusSnapshot] = useState<BonusSnapshot | null>(
    initialState.bonusSnapshot
  );
  const [isChallengeFinished, setIsChallengeFinished] = useState(
    initialState.isFinished
  );

  const [hasRegisteredChallengeOpen, setHasRegisteredChallengeOpen] = useState(
    !shouldRegisterChallengeOpen
  );

  const dictionarySet = useMemo(() => new Set(dictionary), [dictionary]);
  const [instructionsOpen] = useLocalStorage<boolean>("instructions-v2", true);
  const initialAttempts = initialState.attempts;

  const [optimisticAttempts, addOptimisticAttempt] = useOptimistic(
    attempts,
    (currentAttempts, newAttempt: string) => currentAttempts.concat(newAttempt)
  );

  const [optimisticCurrent, setOptimisticCurrent] = useOptimistic(
    currentAttempt,
    (currentAttempt, newAttempt: string) => newAttempt
  );

  const [isPending, startTransition] = useTransition();

  const colors = getAllAttemptsColors(optimisticAttempts, challenge.word);

  const storageKey = `guest-attempts-${challenge.id}`;

  const guestHasFinished =
    isGuest &&
    (attempts.includes(challenge.word) || attempts.length === NUMBER_OF_ROWS);

  const challengeLocked = isChallengeFinished || guestHasFinished;

  const shouldRegisterChallenge =
    shouldRegisterChallengeOpen &&
    !instructionsOpen &&
    !hasRegisteredChallengeOpen;

  useEffect(() => {
    if (!shouldRegisterChallenge) {
      return;
    }

    let cancelled = false;

    registerChallengeOpen(challenge.id)
      .then((result) => {
        if (cancelled || !result.success) {
          return;
        }

        setHasRegisteredChallengeOpen(true);
      })
      .catch((error) => {
        console.error("Failed to register challenge open", error);
      });

    return () => {
      cancelled = true;
    };
  }, [challenge.id, shouldRegisterChallenge]);

  async function addAttemptAction(attempt: string) {
    toast.dismiss();
    toast.info("Guardando intento...");

    const nextAttemptsCount = attempts.length + 1;
    const shouldFinishChallenge =
      attempt === challenge.word || nextAttemptsCount === NUMBER_OF_ROWS;

    startTransition(() => {
      addOptimisticAttempt(attempt);
      setOptimisticCurrent("");
    });

    if (isGuest) {
      const updatedAttempts = attempts.concat(attempt);

      if (!writeGuestAttempts(storageKey, updatedAttempts)) {
        toast.dismiss();
        toast.error("No se pudo guardar tu intento");
        return;
      }

      toast.dismiss();

      if (attempt !== challenge.word) {
        toast.success("Intento guardado");
      }

      startTransition(() => {
        setAttempts(updatedAttempts);
        setCurrentAttempt("");
      });

      if (shouldFinishChallenge) {
        setIsChallengeFinished(true);
      }

      return;
    }

    const { success } = await addAttempt(attempt, challenge.id);

    if (!success) {
      toast.dismiss();
      toast.error("No se pudo guardar tu intento");
      return;
    }

    toast.dismiss();

    if (attempt !== challenge.word) {
      toast.success("Intento guardado");
    } else {
      const response = await completeChallenge();

      if (!response.success) {
        toast.dismiss();
        toast.error(response.error);
        return;
      }

      setBonusSnapshot({
        seasonPoints: response.seasonPoints,
        currentStreak: response.currentStreak,
        fastBonusAwarded: response.fastBonusAwarded,
      });
    }

    startTransition(() => {
      setAttempts((value) => value.concat(attempt));
      setCurrentAttempt("");
    });

    if (shouldFinishChallenge) {
      setIsChallengeFinished(true);
    }
  }

  function onKeyDown(key: string) {
    if (challengeLocked || isPending) {
      return;
    }

    const isLetter = /^[A-ZÑ]$/.test(key);

    const wordIsCompleted = optimisticCurrent.length === challenge.word.length;

    if (isLetter && !wordIsCompleted) {
      setCurrentAttempt((value) => value.concat(key));
      return;
    }

    if (key === "BACKSPACE") {
      setCurrentAttempt((value) => value.slice(0, -1));
      return;
    }

    if (key !== "ENTER") {
      return;
    }

    if (!wordIsCompleted) {
      toast.dismiss();
      toast.error("El intento debe tener 5 o 6 letras");
      return;
    }

    if (!dictionarySet.has(optimisticCurrent.toLowerCase())) {
      toast.dismiss();
      toast.error("Esta palabra no está en mi diccionario");
      return;
    }

    addAttemptAction(optimisticCurrent);
  }

  useEffect(() => {
    if (!isGuest) {
      return;
    }

    startTransition(() => {
      setAttempts(readGuestAttempts(storageKey, initialAttempts));
    });
  }, [initialAttempts, isGuest, storageKey, startTransition]);

  return (
    <main className="flex h-full flex-col items-center justify-between gap-4">
      <DialogChallengeCompleted
        key={challengeLocked.toString()}
        challenge={challenge}
        colors={colors}
        defaultOpen={challengeLocked}
        seasonPoints={bonusSnapshot?.seasonPoints}
        currentStreak={bonusSnapshot?.currentStreak}
        fastBonusAwarded={bonusSnapshot?.fastBonusAwarded}
      />
      <Attempts
        attempts={optimisticAttempts}
        currentAttempt={optimisticCurrent}
        colors={colors}
        challenge={challenge.word}
      />

      <Keyboard
        challenge={challenge.word}
        attempts={optimisticAttempts}
        onKeyDown={onKeyDown}
      />
    </main>
  );
}
