
import ExamplePage from ".";

export default function Home() {
  return (
    <div className="flex w-full min-h-screen items-center justify-center bg-zinc-50 font-sans">
      <main className="flex max-w-3xl w-full flex-col items-center justify-between py-32 px-16 bg-white sm:items-start text-black-500">
        <button>Home</button>
        <div className="w-full">
          <ExamplePage />
        </div>
      </main>
    </div>
  );
}
