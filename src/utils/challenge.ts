import { Color } from "#/types";

export function getColorsByAttempt({
  attempt,
  challenge,
}: {
  attempt: string;
  challenge: string;
}) {
  const colors: Color[] = [];

  for (let i = 0; i < attempt.length; i++) {
    const letter = attempt[i] ?? "";

    if (letter === challenge[i]) {
      colors.push("green");
    } else if (challenge.includes(letter)) {
      colors.push("yellow");
    } else {
      colors.push("gray");
    }
  }

  return colors;
}
