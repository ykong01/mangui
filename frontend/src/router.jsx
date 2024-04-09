import React from "react"
import { Navigate, Route, createBrowserRouter, createRoutesFromElements } from "react-router-dom"
import AuthRoute from "./AuthRoute"
import Login from "./component/ui/Login"
import Main from "./component/ui/Main"
import { fetchDatabases } from "./service/DatabaseService"
import ErrorBoundary from "./ErrorBoundary"

const routes = createRoutesFromElements(
    <>
        <Route path="/" element={<Navigate replace to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/app" element={<AuthRoute redirectPath="/login" />}>
            <Route loader={fetchDatabases} errorElement={<ErrorBoundary />} index element={<Main />} />
        </Route>
    </>
)

export const router = createBrowserRouter(
  routes
)
