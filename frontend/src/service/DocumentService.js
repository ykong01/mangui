import { toast } from "react-toastify"
import urlPrefix from "../urlPrefix"
import { isDatabaseError, isSessionExpired, retry } from "./QueryUtilities"

export async function insertDocument (documentContent, page) {
  const database = sessionStorage.getItem("database")
  const collection = sessionStorage.getItem("collection")
  const url =
        urlPrefix() +
        "dbs/" +
        database +
        "/collections/" +
        collection +
        "/documents"
  if (database == null || collection == null) {
    toast.warn("Please select a collection first")
    return
  }
  if (!documentContent) {
    toast.warn("JSON is empty")
    return
  }
  const res = await fetch(url, {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ document: documentContent }),
    credentials: "include"
  })
  switch (res.status) {
    case 201:
      toast.info("Item has been inserted")
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
      retry(insertDocument, page)
      break
    case 422:
      toast.error("Request error")
      break
    default:
      throw new Error("Unauthorized")
  }
}

export async function updateDocument (
  updateDocumentQuery,
  updateDocumentText,
  page
) {
  if (typeof updateDocumentQuery !== "string") {
    toast.error("Update failed")
    toast.error("Document id is not of type string")
    return
  }
  const database = sessionStorage.getItem("database")
  const collection = sessionStorage.getItem("collection")
  const url =
        urlPrefix() +
        "dbs/" +
        database +
        "/collections/" +
        collection +
        "/documents"
  const queryText =
        "_id:" +
        (updateDocumentQuery.indexOf("ObjectId") >= 0
          ? updateDocumentQuery
          : "\"" + updateDocumentQuery + "\"")
  const updateItem = JSON.parse(updateDocumentText)
  delete updateItem._id // ids cannot be updated for now
  const updateText = JSON.stringify(updateItem)
  if (database == null || collection == null) {
    toast.warn("Please select a collection first")
    return
  }
  const res = await fetch(url, {
    method: "put",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      idQuery: queryText,
      updateDocument: updateText
    }),
    credentials: "include"
  })
  switch (res.status) {
    case 200:
      toast.info(updateDocumentQuery + " has been edited.", {
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
      retry(updateDocument, updateDocumentQuery, updateDocumentText, page)
      break
    case 422:
      toast.error("Request error")
      break
    default:
      throw new Error("Unauthorized")
  }
}

export async function deleteDocument (deleteDocumentQuery, page) {
  const database = sessionStorage.getItem("database")
  const collection = sessionStorage.getItem("collection")
  const queryText = deleteDocumentQuery
  if (database == null || collection == null) {
    toast.warn("Please select a collection first")
    return
  }
  if (!deleteDocumentQuery) {
    toast.warn("Provide an item id via query")
    return
  }
  const url =
        urlPrefix() +
        "dbs/" +
        database +
        "/collections/" +
        collection +
        "/documents?id=" +
        encodeURIComponent(queryText)
  const res = await fetch(url, {
    method: "delete",
    credentials: "include"
  })
  switch (res.status) {
    case 204:
      toast.info(deleteDocumentQuery + " has been deleted.", {
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
      retry(deleteDocument, deleteDocumentQuery, page)
      break
    case 422:
      toast.error("Request error")
      break
    default:
      throw new Error("Unauthorized")
  }
}
