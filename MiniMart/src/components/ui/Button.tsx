type Props = {
  children: React.ReactNode;
  onClick?: () => void;
};

export default function Button({ children, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="bg-black text-white px-5 py-2 rounded-xl hover:bg-gray-800 transition"
    >
      {children}
    </button>
  );
}