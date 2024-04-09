import { toast } from "react-toastify"
import urlPrefix from "../urlPrefix"
import { isDatabaseError, isSessionExpired, retry } from "./QueryUtilities"

export async function updateUser (userName, password) {
  const database = sessionStorage.getItem("database")
  const requestData = {
    user: userName,
    password
  }
  const res = await fetch(urlPrefix() + "dbs/" + database + "/user/update", {
    method: "put",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestData)
  })
  switch (res.status) {
    case 200:
      // do nothing
      break
    case 401:
      const result = await res.text()
      if (isDatabaseError(result)) {
        toast.error("Database error")
        return
      }
      if (isSessionExpired(result)) {
        throw new Error("Unauthorized")
      }
      retry(updateUser)
      break
    case 422:
    case 500:
      toast.error("Request or input error")
      break
    default:
      throw new Error("Unauthorized")
  }
}

export async function createUser (user) {
  const database = sessionStorage.getItem("database")
  const requestData = {
    user: user.user,
    password: user.password,
    roles: user.roles
  }
  const res = await fetch(urlPrefix() + "dbs/" + database + "/user", {
    method: "put",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestData)
  })
  switch (res.status) {
    case 200:
      toast.info("User '" + user.user + "' has been created.")
      break
    case 401:
      const result = await res.text()
      if (isDatabaseError(result)) {
        toast.error("Database error")
        return
      }
      if (isSessionExpired(result)) {
        throw new Error("Unauthorized")
      }
      retry(createUser)
      break
    case 422:
    case 500:
      toast.error("Request or input error")
      break
    default:
      throw new Error("Unauthorized")
  }
}
