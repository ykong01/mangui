import React from "react"
import { Navigate, Outlet } from "react-router-dom"

export default function AuthRoute ({ redirectPath }) {
  const isAuthenticated = sessionStorage.getItem("isAuthenticated")
  if (isAuthenticated === "true") {
    return <Outlet />
  } else {
    return <Navigate replace to={redirectPath} />
  }
};
