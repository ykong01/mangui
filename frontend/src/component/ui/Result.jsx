import { BackwardIcon, ForwardIcon } from "@heroicons/react/16/solid"
import React, { useEffect, useState } from "react"
import { EventEmitter, Events } from "../../eventEmitter"
import Query from "./Query"
import ResultItem from "./ResultItem"
import { showCollectionContent } from "../../service/CollectionService"

export default function Result (props) {
  const [collectionData, setCollectionData] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [collectionCount, setCollectionCount] = useState(0)
  const [action, setAction] = useState("")
  const [queryLimit, setQueryLimit] = useState(5)

  useEffect(() => {
    registerEventHandler()
  }, [])

  function registerEventHandler () {
    EventEmitter.subscribe(Events.RENDER_RESULT, renderResult)
  }

  function onLimitSelectChange (e) {
    sessionStorage.setItem("queryLimit", e.target.value)
    setQueryLimit(e.target.value)
  }

  function getDataRange () {
    const page = currentPage
    let count = collectionCount
    if (isNaN(count)) {
      count = 0
    }
    const queryLimit = count === 0 ? 0 : parseInt(sessionStorage.getItem("queryLimit"))
    const inc = count > 0 ? 1 : 0
    const from = page * queryLimit + inc
    const isLastPage = page * queryLimit + queryLimit >= count
    let to = 0
    if (isLastPage) {
      to = count
    }
    if (!isLastPage && page === 0) {
      to = queryLimit
    }
    if (!isLastPage && page !== 0) {
      to = from + queryLimit - 1
    }
    return from + " - " + to + " of " + count + " document(s)"
  }

  function isLastPage () {
    const page = currentPage
    let count = collectionCount
    if (isNaN(count)) {
      count = 0
    }
    const queryLimit = count === 0 ? 0 : parseInt(sessionStorage.getItem("queryLimit"))
    return page * queryLimit + queryLimit >= count
  };

  function renderResult (data) {
    if (data === undefined || data === null) {
      return
    }
    const database = sessionStorage.getItem("database")
    const collection = sessionStorage.getItem("collection")
    EventEmitter.dispatch(Events.BREADCRUMB_REFRESH, {
      database,
      collection
    })
    const currPage = data.page !== undefined ? data.page : currentPage
    if (data.documentList != null) {
      setCollectionData(data.documentList)
    } else {
      setCollectionData([])
    }
    setCollectionCount(data.totalDocumentCount)
    setAction(data.action)
    setCurrentPage(currPage)
  }

  async function firstPage () {
    await triggerQuery(0)
  }

  async function previousPage () {
    await triggerQuery(currentPage - 1)
  }

  async function nextPage () {
    await triggerQuery(currentPage + 1)
  }

  async function lastPage () {
    const lastPageNum = Math.ceil(collectionCount / parseInt(sessionStorage.getItem("queryLimit")) - 1)
    await triggerQuery(lastPageNum)
  }

  async function triggerQuery (page) {
    const currentQuery = sessionStorage.getItem("query")
    const resultData = await showCollectionContent("find", currentQuery, page)
    renderResult(resultData)
  }

  return (
        <>
            <Query currentPage={currentPage} />
            {collectionCount >= 0 && (
                <>
                    <div className="block w-full mb-1 pt-1 text-decoration-none">
                        <span className="text-base font-thin dark:text-gray-300">Result: {getDataRange()}</span>
                        <div className="float-end relative min-w-[150px]">
                            <select
                                id="limitSelect"
                                name="limitSelect"
                                onChange={onLimitSelectChange}
                                className="w-full pe-8 block appearance-none bg-selectArrow bg-origin-content bg-right-075 bg-no-repeat bg-[length:16px_12px] rounded-md px-3 pt-6 pb-2 text-sm text-gray-900 dark:text-gray-300 bg-gray-50 dark:bg-dark-card border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                aria-label="Select query limit"
                                defaultValue={sessionStorage.getItem("queryLimit")}
                            >
                                <option value="5">5</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                            <label
                                htmlFor="limitSelect"
                                className="absolute text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-5 z-10 origin-[0] start-2.5 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4"
                            >
                                Items per page
                            </label>
                        </div>
                    </div>
                    <div className="mb-2 pb-2 border-b dark:border-gray-700">
                        {currentPage !== 0
                          ? (
                            <>
                                <button className="pt-0 pb-0 ps-2 pe-2 text-decoration-none dark:text-gray-300 hover:text-[#009e5d] dark:hover:text-[#00c772]" onClick={firstPage}>
                                    <BackwardIcon className="w-4 h-4 inline" />
                                </button>
                                <button
                                    className="pt-0 pb-0 ps-2 pe-2 btn btn-link ms-2 link-dark text-decoration-none fw-light dark:text-gray-300 hover:text-[#009e5d] dark:hover:text-[#00c772]"
                                    onClick={previousPage}
                                    disabled={currentPage === 0}
                                >
                                    {currentPage === 0 ? 1 : currentPage}
                                </button>
                            </>
                            )
                          : (
                            <span className="me-5">
                                <span className="me-3"></span>
                            </span>
                            )}
                        <button className="py-0 px-2 ms-2 bg-[#009e5d]/60 rounded-md text-decoration-none text-white dark:bg-[#00c772]/60" disabled>
                            {currentPage + 1}
                        </button>
                        {!isLastPage() && (
                            <>
                                <button className="py-0 px-2 ms-2 text-decoration-none dark:text-gray-300 hover:text-[#009e5d] dark:hover:text-[#00c772]" onClick={nextPage}>
                                    {isLastPage() ? collectionCount === 0 || collectionCount === undefined ? 1 : Math.ceil(collectionCount / parseInt(sessionStorage.getItem("queryLimit"))) : currentPage + 2}
                                </button>
                                <button className="py-0 px-2 ms-2 text-decoration-none dark:text-gray-300 hover:text-[#009e5d] dark:hover:text-[#00c772]" onClick={lastPage}>
                                    <ForwardIcon className="w-4 h-4 inline" />
                                </button>
                            </>
                        )}
                    </div>
                    <ResultItem data={collectionData} action={action} currentPage={currentPage} queryLimit={queryLimit} />
                </>
            )}
        </>
  )
}
