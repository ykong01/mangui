import React from "react"

export function Version () {
  const version = process.env.REACT_APP_VERSION || "local"

  return (<div>Version: {version}</div>)
}
