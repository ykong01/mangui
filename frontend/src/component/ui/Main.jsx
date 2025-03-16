import React, { useEffect } from "react"
import { ToastContainer } from "react-toastify"
import CollectionFragment from "./CollectionFragment"
import { Navigation } from "./Navigation"
import "./NavigationAndLayout.css"

export default function Main () {
  useEffect(() => {
    const limit = sessionStorage.getItem("queryLimit")
    if (limit === null || limit === undefined) {
      sessionStorage.setItem("queryLimit", "5")
    }
    handleNavResize()
    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousedown", handleMouseDown)
    }
  }, [])

  function handleNavResize () {
    window.addEventListener("resize", handleResize)
    window.addEventListener("mousedown", handleMouseDown)
  };

  function handleResize () {
    const navComponent = document.querySelector("#left")
    if (window.innerWidth < 930) {
      navComponent.style.removeProperty("width")
    }
  }

  function stopResize () {
    window.removeEventListener("mousemove", resizeNav)
    window.removeEventListener("mouseup", stopResize)
  }

  function resizeNav (event) {
    const navComponent = document.querySelector("#left")
    const newWidth = event.pageX - navComponent.getBoundingClientRect().left + "px"
    navComponent.style.width = newWidth
  }

  function handleMouseDown (event) {
    const navAnchor = document.querySelector("#nav_anchor")
    if (event.target === navAnchor) {
      window.addEventListener("mousemove", resizeNav)
      window.addEventListener("mouseup", stopResize)
    }
  }

  return (
        <>
            <main className="h-screen p-8 grid mt-[-80px] min-w-[560px] dark:bg-dark-bg">
                <Navigation />
                <div id="nav_anchor" className="bg-transparent w-[4px] cursor-col-resize"></div>
                <CollectionFragment />
            </main>
            <ToastContainer
                autoClose={2500}
                hideProgressBar
                draggable={false}
                pauseOnHover
                className="mr-[20px]"
                theme="colored"
            />
        </>
  )
}
