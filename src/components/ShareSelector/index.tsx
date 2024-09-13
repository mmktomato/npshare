import { clsx } from "clsx";

import { TitleType } from "../../types";

interface TitleOption {
  title: TitleType;
  selected: boolean;
}

interface ShareSelectorProps {
  options: TitleOption[];
  onSelect: (title: TitleType) => void;
}

export const ShareSelector: React.FC<ShareSelectorProps> = ({ options, onSelect }) => {
  return (
    <div className="flex w-56 justify-around">
      {options.map(({ title, selected }) => (
        <div
          key={title}
          onClick={() => onSelect(title)}
          className={clsx("p-2", "cursor-pointer", {
            "border-b-2 border-b-blue-500": selected,
          })}
        >
          {title}
        </div>
      ))}
    </div>
  );
};
