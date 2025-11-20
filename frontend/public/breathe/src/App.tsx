import { useEffect } from "react";
import { TimerPage } from "./pages/TimerPage";

function App() {
  useEffect(() => {
    document.body.classList.add("bg-neutral-100");
    return () => {
      document.body.classList.remove("bg-neutral-100");
    };
  }, []);

  return (
    <div className="w-full h-dvh bg-gradient-to-br from-[#e8f4f2] via-[#f2f7f6] to-[#edf5f3]">
      <main className="w-full h-full relative">
        <div
          className="w-full h-full flex flex-col"
          style={{
            paddingTop: "env(safe-area-inset-top)",
            paddingBottom: "env(safe-area-inset-bottom)",
            paddingLeft: "env(safe-area-inset-left)",
            paddingRight: "env(safe-area-inset-right)",
          }}
        >
          <TimerPage />
        </div>
      </main>
    </div>
  );
}

export default App;
