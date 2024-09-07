import { useState } from "react";
import { clsx } from "clsx";

interface RefTitlePair {
  ref: React.RefObject<HTMLElement>;
  title: string;
}

interface ShareSelectorProps {
  refTitles: RefTitlePair[];
}

export const ShareSelector: React.FC<ShareSelectorProps> = ({ refTitles }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const onClick = (index: number) => {
    refTitles[index].ref.current?.scrollIntoView({ inline: "start" });
    setSelectedIndex(index);
  };

  return (
    <div className="flex w-56 justify-around">
      {refTitles.map(({ title }, i) => (
        <div
          key={i}
          onClick={() => onClick(i)}
          className={clsx("p-2", "cursor-pointer", {
            "border-b-2 border-b-blue-500": selectedIndex === i,
          })}
        >
          {title}
        </div>
      ))}
    </div>
  );
};
