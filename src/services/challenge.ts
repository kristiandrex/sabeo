export function getColorByAttempts({
  attempt,
  challenge,
}: {
  attempt: string;
  challenge: string;
}) {
  const colors: string[] = [];

  for (let i = 0; i < attempt.length; i++) {
    const letter = attempt[i] ?? "";

    if (letter === challenge[i]) {
      colors.push("bg-green-500");
    } else if (challenge.includes(letter)) {
      colors.push("bg-yellow-500");
    } else {
      colors.push("bg-gray-500");
    }
  }

  return colors;
}
