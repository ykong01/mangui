import React from "react"
import { createIndexFromModal } from "../../service/IndexService"
import "./modal.css"
import { EventEmitter, Events } from "../../eventEmitter"
import { showCollectionContent } from "../../service/CollectionService"

export default function IndicesModal ({ open, close, currentPage }) {
  function closeModal () {
    close()
  }

  async function handleSubmit (event) {
    event.preventDefault()
    const query = {
      keys: {
        [event.target.indexName.value]: event.target.sortOrder.value
      },
      background: event.target.background.checked,
      unique: event.target.unique.checked
    }
    await createIndexFromModal(
      query,
      currentPage
    )
    const resultData = await showCollectionContent("indices", "", currentPage)
    EventEmitter.dispatch(Events.RENDER_RESULT, resultData)
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
                            Add an index
                        </div>
                        <div className="relative">
                            <input className="w-full block rounded-t-md px-2.5 pb-2 pt-7 text-sm text-gray-900 bg-gray-50 border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer" type="text" placeholder="" name="indexName" required={true} />
                            <label htmlFor="indexName" className="absolute text-base text-gray-500 duration-300 transform -translate-y-3 scale-75 top-5 z-10 origin-[0] start-2.5 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3">Index name</label>
                        </div>
                        <div className="relative">
                            <select name="sortOrder" className="mt-[-1px] w-full pe-8 block appearance-none bg-selectArrow bg-origin-content bg-right-075 bg-no-repeat bg-[length:16px_12px] rounded-b-md px-2.5 pb-4 pt-7 text-sm text-gray-900 bg-gray-50 border border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600 peer" defaultValue={"1"}>
                                <option value="1">ASC</option>
                                <option value="-1">DESC</option>
                            </select>
                            <label htmlFor="sortOrder" className="absolute text-base text-gray-500 duration-300 transform -translate-y-4 scale-75 top-6 z-10 origin-[0] start-2.5 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4">Sort order</label>
                        </div>
                        <div className="flex items-center my-2">
                            <input className="appearance-none border w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 checked:bg-blue-600 checked:text-white checked:bg-check" type="checkbox" name="unique" />
                            <label className="ms-2 text-sm text-gray-900" htmlFor="unique">Unique</label>
                        </div>
                        <div className="flex items-center mb-3">
                            <input className="appearance-none border w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 checked:bg-blue-600 checked:text-white checked:bg-check" type="checkbox" name="background" />
                            <label className="ms-2 text-sm font text-gray-900" htmlFor="background">Background</label>
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
