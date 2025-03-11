import { toast } from "react-toastify"
import urlPrefix from "../urlPrefix"
import { isDatabaseError, isSessionExpired, retry } from "./QueryUtilities"

export async function showCollectionContent (action, query, page) {
  const explain = action === "explain" ? "&explain=true" : ""
  const database = sessionStorage.getItem("database")
  const collection = sessionStorage.getItem("collection")
  const limitText = "&limit=" + sessionStorage.getItem("queryLimit")
  const pageText = "&page=" + page
  if (database == null && collection == null) {
    toast.warn("Please select a collection first")
    return
  }
  const queryText =
        query == null || query.length === 0 ? "" : encodeURIComponent(query)
  const orderBy = sessionStorage.getItem("orderBy")
    ? sessionStorage.getItem("orderBy")
    : "_id"
  const sortOrder = sessionStorage.getItem("sortOrder")
    ? sessionStorage.getItem("sortOrder")
    : "ASC"
  const orderByUri = "&orderBy=" + orderBy
  const sortOrderUri = "&order=" + sortOrder
  const url =
        action === "indices"
          ? urlPrefix() +
              "dbs/" +
              database +
              "/collections/" +
              collection +
              "/indices"
          : urlPrefix() +
              "dbs/" +
              database +
              "/collections/" +
              collection +
              "/find?query=" +
              queryText +
              explain +
              limitText +
              pageText +
              orderByUri +
              sortOrderUri
  const res = await fetch(url, {
    method: "get",
    credentials: "include"
  })
  let resultData = null
  let documentList = null
  let totalDocumentCount = 0
  let result = null
  switch (res.status) {
    case 200:
      sessionStorage.setItem("query", query)
      result = await res.text()
      resultData = JSON.parse(result)
      documentList = resultData.documentList
      totalDocumentCount = action === "explain" ? 1 : resultData.totalDocumentCount
      return {
        action, page, documentList, totalDocumentCount
      }
    case 422:
      toast.error("Request error")
      return {
        action, page, documentList, totalDocumentCount
      }
    case 401:
      result = await res.text()
      if (isDatabaseError(result)) {
        toast.error("Database error")
        return
      }
      if (isSessionExpired(result)) {
        throw new Error("Unauthorized")
      }
      return retry(showCollectionContent, action, query, page)
    default:
      throw new Error("Unauthorized")
  }
}

export async function getCollectionCount (db, coll) {
  const res = await fetch(urlPrefix() + "dbs/" + db + "/collections/" + coll + "/count", {
    method: "get",
    credentials: "include"
  })
  switch (res.status) {
    case 200:
      return await res.text()
    case 401:
      const result = await res.text()
      if (isDatabaseError(result)) {
        toast.error("Database error")
        return
      }
      if (isSessionExpired(result)) {
        throw new Error("Unauthorized")
      }
      return retry(getCollectionCount, db, coll)
    case 422:
    case 500:
      toast.error("Request or input error")
      break
    default:
      throw new Error("Unauthorized")
  }
}

export async function deleteCollection (db, coll) {
  const res = await fetch(urlPrefix() + "dbs/" + db + "/collections/" + coll, {
    method: "delete",
    credentials: "include"
  })
  switch (res.status) {
    case 204:
      toast.info(`Collection "${coll}" has been deleted.`)
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
      retry(deleteCollection, db, coll)
      break
    case 422:
    case 500:
      toast.error("Request or input error")
      break
    default:
      throw new Error("Unauthorized")
  }
}

export async function getCollectionFields () {
  const db = sessionStorage.getItem("database")
  const coll = sessionStorage.getItem("collection")
  if (db == null || coll == null) {
    return
  }
  const res = await fetch(
    urlPrefix() + "dbs/" + db + "/collections/" + coll + "/fields",
    {
      method: "get",
      credentials: "include"
    }
  )
  switch (res.status) {
    case 200:
      return res.text()
    case 401:
      const result = await res.text()
      if (isDatabaseError(result)) {
        toast.error("Database error")
        return
      }
      if (isSessionExpired(result)) {
        throw new Error("Unauthorized")
      }
      return retry(getCollectionFields)
    case 422:
    case 500:
      toast.error("Request or input error")
      break
    default:
      throw new Error("Unauthorized")
  }
}

export async function fetchCollections (db) {
  const res = await fetch(urlPrefix() + "dbs/" + db + "/collections", {
    method: "get",
    credentials: "include"
  })
  switch (res.status) {
    case 200:
      const collections = []
      const items = await res.json()
      for (let i = 0; i < items.length; i++) {
        collections.push({
          name: items[i].name,
          itemCount: items[i].count
        })
      }
      return collections
    case 401:
      return []
    case 422:
      toast.error("Request error")
      break
    default:
      throw new Error("Unauthorized")
  }
}

export async function importCollection (file) {
  const db = sessionStorage.getItem("database")
  const coll = sessionStorage.getItem("collection")
  if (db == null && coll == null) {
    toast.warn("Please select a collection first")
    return
  }

  const formData = new FormData()
  formData.append("file", file)

  const res = await fetch(urlPrefix() + "dbs/" + db + "/collections/" + coll + "/import?type=json", {
    method: "put",
    body: formData,
    credentials: "include"
  })

  let errorText = null
  switch (res.status) {
    case 200:
      toast.info("Collection import successful")
      return true
    case 401:
      const result = await res.text()
      if (isDatabaseError(result)) {
        toast.error("Database error")
        return false
      }
      if (isSessionExpired(result)) {
        throw new Error("Unauthorized")
      }
      return retry(importCollection, file)
    case 400:
    case 422:
      errorText = await res.text()
      toast.error("Request error: " + errorText)
      return false
    case 500:
      errorText = await res.json()
      if (errorText.message.includes("Maximum upload size exceeded")) {
        toast.error("Request error: maximum file size exceeded")
      }
      return false
    default:
      throw new Error("Unauthorized")
  }
}

export async function exportCollection () {
  const db = sessionStorage.getItem("database")
  const coll = sessionStorage.getItem("collection")
  if (db == null && coll == null) {
    toast.warn("Please select a collection first")
    return
  }
  const res = await fetch(urlPrefix() + "dbs/" + db + "/collections/" + coll + "/export?type=csv", {
    method: "get",
    credentials: "include"
  })

  switch (res.status) {
    case 200:
      toast.info("Collection export is ready")
      const data = new Blob(["\ufeff", await res.text()], { type: "text/csv" }) // https://stackoverflow.com/a/54302120
      const url = window.URL.createObjectURL(data)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = coll + "-export-" + new Date().toLocaleDateString() + ".csv"
      document.body.appendChild(a)
      a.click()
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
      return retry(exportCollection)
    case 422:
      toast.error("Request error")
      break
    default:
      throw new Error("Unauthorized")
  }
}
