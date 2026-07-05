type ScreenProps = {
  children: React.ReactNode;
};

export default function Screen({ children }: ScreenProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100">
      {children}
    </main>
  );
}
