import { CircleStackIcon, TrashIcon } from "@heroicons/react/16/solid"
import React, { useEffect, useRef, useState } from "react"
import { useLoaderData } from "react-router-dom"
import { EventEmitter, Events } from "../../eventEmitter"
import { deleteDatabase, fetchDatabases } from "../../service/DatabaseService"
import Collections from "./Collections"

export default function Databases () {
  const fetchedDatabases = useLoaderData()
  const [databases, setDatabases] = useState(fetchedDatabases ?? [])
  const [showConfirm, setShowConfirm] = useState(null)
  const confirmButtonRef = useRef(null)

  EventEmitter.subscribe(Events.DATABASE_REFRESH, refreshDatabases)

  useEffect(() => {
    // If showConfirm is not null, it means the confirm button should be visible
    if (showConfirm !== null && confirmButtonRef.current) {
      confirmButtonRef.current.focus()
    }
  }, [showConfirm])

  async function refreshDatabases () {
    const dbs = await fetchDatabases()
    setDatabases(dbs)
  }

  function prepareDatabaseDelete (i) {
    setShowConfirm(i)
  }

  async function handleDatabaseDelete (name) {
    await deleteDatabase(name)
    confirmButtonRef.current.blur()
    refreshDatabases()
  }

  function toggleCollapse (event) {
    const toggleElement = document.getElementById(event.target.dataset.collapseToggle)
    toggleElement.classList.toggle("hidden")
  }

  function handleCancel () {
    setShowConfirm(null)
  }

  return (
        <ul className="ps-2">
            {databases != null && databases.map((item, i) => (
                <li className="mb-1" key={i}>
                    <button
                        className="btn-toggle w-fit items-center text-decoration-none mb-1"
                        aria-expanded="false"
                        data-collapse-toggle={`db-${item.name}`}
                        onClick={toggleCollapse}
                        id={`db-${i}`}
                    >
                        <CircleStackIcon className="w-4 h-4 me-1" />{item.name}
                    </button>
                    <div className="float-end">
                        {showConfirm !== i
                          ? (
                            <TrashIcon className="w-4 h-4 hover:text-[#f63414]" role="button" title={`${item.name}`} onClick={() => prepareDatabaseDelete(i)} />
                            )
                          : (
                            <button
                                className="border text-xs text-[#f63414] hover:text-white hover:bg-[#f63414] border-[#f63414] rounded-md px-1 py-1"
                                name="dropDatabaseConfirm"
                                onBlur={handleCancel}
                                onClick={() => handleDatabaseDelete(item.name)}
                                ref={confirmButtonRef}
                            >
                                Confirm
                            </button>
                            )}
                    </div>
                    <div className="hidden" id={`db-${item.name}`}>
                        <Collections db={item.name} />
                    </div>
                </li>
            ))}
        </ul>
  )
};
