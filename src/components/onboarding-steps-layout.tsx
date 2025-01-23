import { cn } from "#/lib/utils";

type Props = {
  children: React.ReactNode;

  /**
   * The total number of steps
   */
  numberOfSteps: number;

  /**
   * The current step starting from 0
   */
  currentStep: number;
};

export function OnboardingStepsLayout(props: Props) {
  const dots: React.ReactNode[] = [];

  for (let i = 0; i < props.numberOfSteps; i++) {
    dots.push(
      <div
        key={i}
        className={cn(
          "w-3 h-3 rounded-full bg-gray-300",
          i === props.currentStep && "bg-gray-400"
        )}
      ></div>
    );
  }

  return (
    <div className="fixed top-0 left-0 h-svh w-screen bg-white grid place-items-center p-8">
      <div className="grid grid-rows-[1fr_auto] h-full">
        <div className="h-full grid place-items-center">{props.children}</div>
        <div className="flex gap-2 justify-center items-center">{dots}</div>
      </div>
    </div>
  );
}
