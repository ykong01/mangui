import { ArrowPathIcon, TableCellsIcon, TrashIcon } from "@heroicons/react/16/solid"
import React, { useEffect, useRef, useState } from "react"
import { EventEmitter, Events } from "../../eventEmitter"
import { deleteCollection, getCollectionCount, fetchCollections, showCollectionContent } from "../../service/CollectionService"

export default function Collections ({ db }) {
  const [collections, setCollections] = useState([])
  const [showConfirm, setShowConfirm] = useState(null)
  const confirmButtonRef = useRef(null)

  useEffect(() => {
    refreshCollections()
  }, [db])

  useEffect(() => {
    // If showConfirm is not null, it means the confirm button should be visible
    if (showConfirm !== null && confirmButtonRef.current) {
      confirmButtonRef.current.focus()
    }
  }, [showConfirm])

  async function refreshCollections () {
    const collections = await fetchCollections(db)
    setCollections(collections)
  }

  function highlightSelectedCollection (e) {
    document.querySelectorAll(".collection").forEach((elem) => {
      elem.classList.remove("btn-toggle-nav-active")
    })
    e.target.classList.add("btn-toggle-nav-active")
  }

  async function showCollectionData (e, name) {
    highlightSelectedCollection(e)
    sessionStorage.setItem("database", db)
    sessionStorage.setItem("collection", name)
    sessionStorage.setItem("query", "")
    sessionStorage.setItem("orderBy", "_id")
    sessionStorage.setItem("sortOrder", "ASC")
    await triggerQuery(0)
  }

  async function triggerQuery (page) {
    const resultData = await showCollectionContent("find", "", page)
    EventEmitter.dispatch(Events.RENDER_RESULT, resultData)
  }

  async function handleCollectionCountUpdate (e, i, name) {
    const count = await getCollectionCount(db, name)
    const updatedCollections = collections.map((collection, index) =>
      index === i ? { ...collection, itemCount: count } : collection
    )
    setCollections(updatedCollections)
  }

  async function handleCollectionDelete (name) {
    await deleteCollection(db, name)
    confirmButtonRef.current.blur()
    refreshCollections()
  }

  function prepareCollectionDelete (i) {
    setShowConfirm(i)
  }

  function handleCancel () {
    setShowConfirm(null)
  }

  return (
        <ul className="btn-toggle-nav pb-1">
            {collections.map((item, i) => (
                <li key={i} className="mb-1">
                    <button
                        onClick={(e) => showCollectionData(e, item.name)}
                        className="font-thin collection"
                    >
                        <TableCellsIcon className="w-4 h-4 me-1 inline" />{item.name}
                    </button>
                    <span className="font-thin">
                        {" "}({item.itemCount}{" "}
                        <ArrowPathIcon
                            className="w-3.5 h-3.5 mb-1 update-collection-count inline"
                            role={"button"}
                            onClick={(e) => handleCollectionCountUpdate(e, i, item.name)}
                        />)
                    </span>
                    <div className="float-end">
                        {showConfirm !== i
                          ? (
                            <TrashIcon className="w-4 h-4 hover:text-[#f63414]" role="button" title={`${item.name}`} onClick={() => prepareCollectionDelete(i)} />
                            )
                          : (
                            <button
                                className="border text-xs text-[#f63414] hover:!text-white hover:bg-[#f63414] border-[#f63414] rounded-md px-1 py-1"
                                name="dropCollectionConfirm"
                                onBlur={handleCancel}
                                onClick={() => handleCollectionDelete(item.name)}
                                ref={confirmButtonRef}
                            >
                                Confirm
                            </button>
                            )}
                    </div>
                </li>
            ))}
        </ul>
  )
}
