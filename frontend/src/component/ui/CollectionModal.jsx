import React from "react"
import { toast } from "react-toastify"
import { EventEmitter, Events } from "../../eventEmitter"
import { createCollection } from "../../service/DatabaseService"
import "./modal.css"

export default function CollectionModal ({ open, close }) {
  async function createCollectionForDatabase () {
    const databaseName = document.querySelector("#new_database").value
    const collectionName = document.querySelector("#new_collection").value
    if (databaseName !== undefined && databaseName.length > 1 &&
            collectionName !== undefined && collectionName.length > 1) {
      await createCollection(databaseName, collectionName)
      EventEmitter.dispatch(Events.DATABASE_REFRESH)
      close()
    } else {
      toast.error("Database name and collection name is empty.")
    }
  }

  async function handleSubmit (event) {
    event.preventDefault()
    await createCollectionForDatabase()
  }

  function closeModal () {
    close()
  }

  return open === true
    ? (
        <>
            <div className="overlay">
                <div className="modal">
                    <form
                        onSubmit={handleSubmit}
                        method="post"
                    >
                        <div className="mb-3 text-xl">
                            Create a collection in a database
                        </div>
                        <div className="relative m-auto w-fit">
                            <input type="text" required={true} placeholder="" id="new_database" className="w-fit block px-2.5 pb-1 pt-5 text-sm text-gray-900 bg-gray-50 border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer rounded-t-md" />
                            <label htmlFor="new_database" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-2.5 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3">Database name</label>
                        </div>
                        <div className="relative m-auto w-fit">
                            <input type="text" required={true} className="mt-[-1px] w-fit block px-2.5 pb-1 pt-5 text-sm text-gray-900 bg-gray-50 border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer rounded-b-md" placeholder="" id="new_collection" />
                            <label htmlFor="new_collection" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-2.5 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3">Collection name</label>
                        </div>
                        <button className="py-2 px-6 bg-blue-600 text-white rounded-md w-25 m-2" type="submit">Create</button>
                        <button className="py-2 px-6 bg-black/50 text-white rounded-md w-25 m-2" onClick={closeModal}>Close</button>
                    </form>
                </div>
            </div>
        </>
      )
    : (
        <></>
      )
}
