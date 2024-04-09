import urlPrefix from "../urlPrefix"
import { EventEmitter } from "../eventEmitter"
import { toast } from "react-toastify"

export async function logout () {
  const res = await fetch(urlPrefix() + "auth/logout", {
    method: "get",
    credentials: "include"
  })
  switch (res.status) {
    case 200:
      sessionStorage.clear()
      EventEmitter.reset()
      break
    default:
  }
}

export async function login (username, password, uri) {
  const res = await fetch(urlPrefix() + "auth/login", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user: username,
      password,
      db: "admin",
      uri
    })
  })
  switch (res.status) {
    case 200:
      return true
    default:
      return false
  }
}

export async function loadHosts () {
  const res = await fetch(urlPrefix() + "auth/hosts", {
    method: "get"
  })
  switch (res.status) {
    case 200:
      return await res.json()
    default:
      toast.error("Backend error occured")
  }
}

export async function getCurrentUser () {
  const res = await fetch(
    urlPrefix() + "auth/user",
    {
      method: "get",
      credentials: "include"
    }
  )
  if (res.status === 200) {
    return await res.json()
  }
}
