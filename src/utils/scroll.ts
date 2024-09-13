type horizontalScrollArea = "Left" | "Right";
export const calcHorizontalScrollArea = (scrollContainer: HTMLElement): horizontalScrollArea => {
  const center = scrollContainer.scrollWidth / 2;
  const containerClientWidth = scrollContainer.clientWidth;
  const scrollViewCenter = scrollContainer.scrollLeft + containerClientWidth / 2;

  // console.log(center, containerClientWidth, scrollViewCenter);

  return scrollViewCenter < center ? "Left" : "Right";
};
