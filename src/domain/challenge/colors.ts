import { Color } from "#/domain/challenge/types";

export function getColorsByAttempt({ attempt, challenge }: { attempt: string; challenge: string }) {
  const colors: Color[] = Array.from<Color>({ length: attempt.length }).fill("gray");
  const availableLetters = new Map<string, number>();

  for (const letter of challenge) {
    const count = availableLetters.get(letter) ?? 0;
    availableLetters.set(letter, count + 1);
  }

  for (let i = 0; i < attempt.length; i++) {
    const letter = attempt[i] ?? "";

    if (letter === challenge[i]) {
      colors[i] = "green";
      const count = availableLetters.get(letter) ?? 0;
      availableLetters.set(letter, count - 1);
    }
  }

  for (let i = 0; i < attempt.length; i++) {
    if (colors[i] === "green") continue;

    const letter = attempt[i] ?? "";
    const count = availableLetters.get(letter) ?? 0;

    if (count > 0) {
      colors[i] = "yellow";
      availableLetters.set(letter, count - 1);
    }
  }

  return colors;
}
