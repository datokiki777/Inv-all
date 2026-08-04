import { AppProviders } from "@/app/providers";
import { AppRouter } from "@/app/router";

// Root composition only. All real logic lives in providers/ and router/ —
// this file should stay tiny for the lifetime of the project.
export default function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
