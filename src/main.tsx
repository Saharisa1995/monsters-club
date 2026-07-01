import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import { AppProvider } from "@/context/AppContext"
import App from "./App"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AppProvider>
        <App />
        <Toaster position="bottom-center" richColors />
      </AppProvider>
    </ThemeProvider>
  </StrictMode>,
)
