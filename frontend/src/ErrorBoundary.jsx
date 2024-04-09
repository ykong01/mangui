import React, { useEffect } from "react"
import { useNavigate, useRouteError } from "react-router-dom"

export default function ErrorBoundary () {
  const navigate = useNavigate()
  const error = useRouteError()

  useEffect(() => {
    switch (error.message) {
      case "Unauthorized":
        navigate("/")
        break
    }
  }, [error])

  return (<></>)
}
