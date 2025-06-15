import React from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import "react-toastify/dist/ReactToastify.css"
import { router } from "./router"
import "./index.css"
import { ThemeProvider } from "./ThemeContext"

const root = createRoot(document.getElementById("root"))
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
)
