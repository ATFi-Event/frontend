type PositionState = {
  x: number;
  y: number;
};

type SetPosition = React.Dispatch<React.SetStateAction<PositionState>>;

export const handleMouseMove = (event: MouseEvent, setPosition: SetPosition, MAX_SHIFT: number) => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const normalizedX = event.clientX / width;
  const normalizedY = event.clientY / height;
  const centeredX = normalizedX - 0.5;
  const centeredY = normalizedY - 0.5;
  setPosition({
    x: centeredX * MAX_SHIFT * 5, // Range: -MAX_SHIFT hingga MAX_SHIFT
    y: -centeredY * MAX_SHIFT * 5, // Pergerakan terbalik untuk efek paralaks
  });
};
