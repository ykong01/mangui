import { toast } from "react-toastify"
import urlPrefix from "../urlPrefix"

export function isDatabaseError (res) {
  return res === "DATABASE_ERROR"
}

export function isSessionExpired (res) {
  return res === "SESSION_EXPIRED"
}

export function isRefreshTokenError (res) {
  return res === "REFRESH_TOKEN_MISSING"
}

export function isUnauthorized (res) {
  return res === "UNAUTHORIZED"
}

export async function obtainNewJwtTokenPair () {
  const url = urlPrefix() + "auth/token/obtain"
  const res = await fetch(url, {
    method: "get",
    credentials: "include"
  })
  switch (res.status) {
    case 200:
      return true
    default:
      toast.error("Cannot obtain new token")
      return false
  }
}

export async function retry (callback, ...params) {
  const tokenObtained = await obtainNewJwtTokenPair()
  if (tokenObtained) {
    return await callback(...params)
  } else {
    throw Error("Unauthorized")
  }
}
