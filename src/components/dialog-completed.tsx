import { Button, Dialog, Flex, Text } from "@radix-ui/themes";
import { toast } from "sonner";

import { Challenge, Color } from "#/types";

type Props = {
  challenge: Challenge;
  colors: Color[][];
  defaultOpen: boolean;
};

export function DialogChallengeCompleted({
  challenge,
  colors,
  defaultOpen,
}: Props) {
  async function copyToClipboard() {
    try {
      const text = getTextToShare();
      await navigator.clipboard.writeText(text);

      toast.dismiss();
      toast.success("Se copió tu resultado");
    } catch (error) {
      console.error(error);

      toast.dismiss();
      toast.error("No se pudo compartir el reto");
    }
  }

  async function share() {
    try {
      if (typeof navigator.share !== "function") {
        copyToClipboard();
        return;
      }

      await navigator.share({
        title: "Sabeo",
        text: getTextToShare(),
      });
    } catch (error) {
      console.error(error);
      copyToClipboard();
    }
  }

  function getTextToShare() {
    let text = "Reto del día en Sabeo\n";

    colors.forEach((row) => {
      row.forEach((color) => {
        text += color === "green" ? "🟩" : color === "yellow" ? "🟨" : "⬜";
      });

      text += "\n";
    });

    text += "Inténtalo en https://sabeo.vercel.app/";

    return text;
  }

  return (
    <Dialog.Root defaultOpen={defaultOpen}>
      <Dialog.Content maxWidth="450px" aria-describedby={undefined}>
        <Dialog.Title align={"center"} className="text-2xl mb-2">
          La palabra es: {challenge.word}
        </Dialog.Title>

        {challenge.description && (
          <Text as="p" className="text-center text-balance">
            {challenge.description}
          </Text>
        )}

        <Flex direction="column" className="my-4">
          {colors.map((row, index) => (
            <ColorSquaresRow key={index} colors={row} />
          ))}
        </Flex>

        <Flex justify={"center"}>
          <Button className="bg-green-500 hover:bg-green-600" onClick={share}>
            Compartir
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

function ColorSquaresRow({ colors }: { colors: Color[] }) {
  return (
    <Flex justify={"center"}>
      {colors.map((color) => {
        if (color === "green") {
          return "🟩";
        }

        if (color === "yellow") {
          return "🟨";
        }

        return "⬜";
      })}
    </Flex>
  );
}
