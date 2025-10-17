type Props = {
  type: string;
  content: string;
};

export default function ButtonCustom({ type, content }: Props) {
  return (
    <div className="px-[10px] py-[7px] rounded-lg bg-[#2a2b2c] text-[#a4abb1] hover:bg-[#a4abb1] hover:text-[#2a2b2c] flex items-center gap-1 text-[12px] transition duration-100 ease-in">
      {type == "plus" && <span className="material-symbols-outlined">add</span>}
      <h1 className="font-semibold me-2">{content}</h1>
      {type == "arrow" && (
        <span className="material-symbols-outlined">arrow_forward</span>
      )}
    </div>
  );
}
