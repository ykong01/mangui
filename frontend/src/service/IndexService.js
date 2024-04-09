import { toast } from "react-toastify"
import urlPrefix from "../urlPrefix"
import { isDatabaseError, isSessionExpired, retry } from "./QueryUtilities"

export async function dropIndex (dropIndexQuery, page) {
  const database = sessionStorage.getItem("database")
  const collection = sessionStorage.getItem("collection")
  if (database == null || collection == null) {
    toast.warn("Please select a collection first")
    return
  }
  if (!dropIndexQuery) {
    toast.warn("Provide an index name")
    return
  }
  const url =
        urlPrefix() +
        "dbs/" +
        database +
        "/collections/" +
        collection +
        "/indices/" +
        dropIndexQuery
  const res = await fetch(url, {
    method: "delete",
    credentials: "include"
  })
  switch (res.status) {
    case 204:
      toast.info(dropIndexQuery + " has been deleted.", {
        className: "text-break"
      })
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
      retry(dropIndex, dropIndexQuery, page)
      break
    case 422:
      toast.error("Request error")
      break
    default:
      throw new Error("Unauthorized")
  }
}

export async function createIndexFromModal (index, page) {
  const database = sessionStorage.getItem("database")
  const collection = sessionStorage.getItem("collection")
  const url =
        urlPrefix() +
        "dbs/" +
        database +
        "/collections/" +
        collection +
        "/indices"
  if (database == null || collection == null || index == null) {
    toast.warn("JSON is empty or no collection is selected")
    return
  }
  const res = await fetch(url, {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(index),
    credentials: "include"
  })
  switch (res.status) {
    case 201:
      toast.info("Index has been created")
      break
    case 400:
      toast.error("Request error")
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
      retry(createIndexFromModal, index, page)
      break
    default:
      throw new Error("Unauthorized")
  }
}
