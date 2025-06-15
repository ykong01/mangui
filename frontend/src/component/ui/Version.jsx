import React from "react"

export function Version() {
    const version = import.meta.env.VITE_VERSION || "local"

    return (<div>Version: {version}</div>)
}
