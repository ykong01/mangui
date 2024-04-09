import { toast } from "react-toastify"
import urlPrefix from "../urlPrefix"
import { isDatabaseError, isSessionExpired, retry } from "./QueryUtilities"

export async function fetchDatabases () {
  const res = await fetch(urlPrefix() + "dbs", {
    method: "get",
    credentials: "include"
  })
  switch (res.status) {
    case 200:
      return await res.json()
    case 401:
      const result = await res.text()
      if (isDatabaseError(result)) {
        toast.error("Database error")
        return
      }
      if (isSessionExpired(result)) {
        throw new Error("Unauthorized")
      }
      return retry(fetchDatabases)
    default:
      throw new Error("Unauthorized")
  }
}

export async function createDatabase (name) {
  const res = await fetch(urlPrefix() + "dbs/create", {
    method: "post",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ databaseName: name })
  })
  switch (res.status) {
    case 201:
      toast.info("Database created")
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
      retry(createDatabase, name)
      break
    default:
      throw new Error("Unauthorized")
  }
}

export async function createCollection (db, name) {
  const res = await fetch(urlPrefix() + "dbs/" + db + "/collections/create", {
    method: "post",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ collectionName: name })
  })
  switch (res.status) {
    case 201:
      toast.info(`Collection "${name}" created`)
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
      retry(createCollection, db, name)
      break
    default:
      throw new Error("Unauthorized")
  }
}

export async function deleteDatabase (db) {
  const res = await fetch(urlPrefix() + "dbs/" + db, {
    method: "delete",
    credentials: "include"
  })
  switch (res.status) {
    case 204:
      toast.info(`Database "${db}" has been deleted.`)
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
      retry(deleteDatabase, db)
      break
    case 422:
    case 500:
      toast.error("Request or input error")
      break
    default:
      throw new Error("Unauthorized")
  }
}
