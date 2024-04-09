import { ChevronRightIcon, CircleStackIcon, TableCellsIcon } from "@heroicons/react/16/solid"
import { ArrowRightEndOnRectangleIcon, UserCircleIcon } from "@heroicons/react/24/outline"
import React, { useEffect, useState } from "react"
import { EventEmitter, Events } from "../../eventEmitter"
import { getCurrentUser, logout } from "../../service/AuthService"
import Result from "./Result"
import { useNavigate } from "react-router-dom"

export default function CollectionFragment () {
  const [database, setDatabase] = useState("")
  const [collection, setCollection] = useState("")
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  function refreshBreadcrumb (data) {
    setDatabase(data.database)
    setCollection(data.collection)
  }

  useEffect(() => {
    EventEmitter.subscribe(Events.BREADCRUMB_REFRESH, refreshBreadcrumb)
    getUser()
  }, [])

  async function logoutUser () {
    await logout()
    navigate("/")
  }

  async function getUser () {
    const res = await getCurrentUser()
    if (res !== undefined) {
      setUser(res.user)
    } else {
      setUser("unknown user")
    }
  }

  return (
        <div id="right" className="p-4 overflow-auto border rounded-e-md bg-white min-w-[490px]">
            <div className="flex gap-4">
                <div className="grow text-decoration-none">
                    <div>
                        <span className="text-2xl font-light">Query collection</span>
                        {collection !== null && collection.length > 0
                          ? (
                                <div className="inline-block mb-3 ms-2 text-md bg-white font-thin py-0.5 px-1 border rounded-md">
                                    <CircleStackIcon className="w-4 h-4 me-1 inline" />{database}
                                    <ChevronRightIcon className="w-4 h-4 inline" />
                                    <TableCellsIcon className="w-4 h-4 me-1 inline" />{collection}
                                </div>
                            )
                          : null}
                    </div>
                </div>
                <div className="self-center flex border text-xl font-thin bg-white rounded-md py-0.5 px-1 mb-3">
                    <UserCircleIcon className="w-5 me-1" />{ user }
                </div>
                <button
                    onClick={logoutUser}
                    className="mb-3 text-decoration-none"
                >
                    <div className="text-xl font-thin flex bg-white border rounded-md py-0.5 px-1 items-center">
                        <ArrowRightEndOnRectangleIcon className="w-6 me-1" />Logout
                    </div>
                </button>
            </div>
            <Result />
        </div>
  )
}
