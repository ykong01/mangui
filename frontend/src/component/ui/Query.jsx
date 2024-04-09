import { PlusCircleIcon } from "@heroicons/react/24/outline"
import React, { useEffect, useRef, useState } from "react"
import { EventEmitter, Events } from "../../eventEmitter"
import { exportCollection, getCollectionFields, importCollection, showCollectionContent } from "../../service/CollectionService"
import { insertDocument } from "../../service/DocumentService"
import IndicesModal from "./IndicesModal"
import DatabaseRolesModal from "./DatabaseRolesModal"
import { toast } from "react-toastify"

export default function Query (props) {
  const [fields, setFields] = useState([])
  const [orderByField, setOrderByField] = useState("_id")
  const [sortOrder, setSortOrder] = useState("ASC")
  const [openIndexModal, setOpenIndexModal] = useState(false)
  const [openDatabaseRolesModal, setOpenDatabaseRolesModal] = useState(false)
  const [file, setFile] = useState(null)
  const fileSizeLimit = 50

  const queryInputRef = useRef(null)

  useEffect(() => {
    enableCodeEditorFeatures()
    autocompleteQueryText()
    setAutocompleteDropdownPosition()
    const inputRef = queryInputRef.current
    return () => {
      inputRef.removeEventListener("input", handleInput)
      inputRef.removeEventListener("keyup", handleKeyUp)
      inputRef.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  useEffect(() => {
    if (file !== null) {
      const syntheticEvent = {
        preventDefault: () => {},
        nativeEvent: {
          submitter: {
            name: "import"
          }
        }
      }
      handleSubmit(syntheticEvent)
    }
  }, [file])

  function fillCollectionFieldsSelect (data) {
    if (data !== undefined && data.totalDocumentCount > 0) {
      getCollectionFields().then((result) => {
        if (result !== undefined && result !== null) {
          const items = JSON.parse(result)
          if (items) {
            setFields(items.documentList)
            setOrderByField(sessionStorage.getItem("orderBy"))
            setSortOrder(sessionStorage.getItem("sortOrder"))
          }
        }
      })
    }
  }

  function handleFileChange (event) {
    if (event.target.files[0] !== null) {
      setFile(event.target.files[0])
    }
  }

  function handleImportButtonClick () {
    document.getElementById("file").click()
  }

  async function handleSubmit (event) {
    event.preventDefault()
    const currentPageLimit = parseInt(sessionStorage.getItem("queryLimit"))
    const selectedPageLimit = document.querySelector("#limitSelect")
    sessionStorage.setItem("queryLimit", selectedPageLimit != null ? selectedPageLimit.value : currentPageLimit)

    let resultData = null
    switch (event.nativeEvent.submitter.name) {
      case "explain":
      case "find":
      case "indices":
        await triggerQuery(event)
        break
      case "insertDocument":
        await insertDocument(
          event.target.query.value,
          props.currentPage
        )
        resultData = await showCollectionContent("find", "", props.currentPage)
        EventEmitter.dispatch(Events.RENDER_RESULT, resultData)
        break
      case "createIndex":
        setOpenIndexModal(true)
        break
      case "export":
        exportCollection()
        break
      case "import":
        const fileSizeInMB = file.size / (1024 * 1024)
        if (fileSizeInMB > fileSizeLimit) {
          toast.error(`Filesize exceeds limit of ${fileSizeLimit}mb`)
          setFile(null)
          return
        }
        const ok = await importCollection(file)
        if (ok) {
          setFile(null)
          resultData = await showCollectionContent("find", "", 0)
          EventEmitter.dispatch(Events.RENDER_RESULT, resultData)
        }
        break
      case "createUser":
        setOpenDatabaseRolesModal(true)
        break
      default:
        break
    }
  }

  async function triggerQuery (event) {
    setFields([]) // Clear fields state before showing new content
    const resultData = await showCollectionContent(
      event.nativeEvent.submitter.name,
      event.target.query.value,
      0
    )
    EventEmitter.dispatch(Events.RENDER_RESULT, resultData)
    fillCollectionFieldsSelect(resultData)
  }

  function hideIndexModal () {
    setOpenIndexModal(false)
  }

  function hideDatabaseRolesModal () {
    setOpenDatabaseRolesModal(false)
  }

  function autocompleteQueryText () {
    queryInputRef.current.addEventListener("input", handleInput)
  }

  function handleInput (e) {
    const autocompleteWords = new Map([
      ["$a", ["$and", "$all"]],
      ["$e", ["$eq", "$exists", "$expr", "$elemMatch"]],
      ["$g", ["$gt", "$gte"]],
      ["$i", ["$in"]],
      ["$l", ["$lt", "$lte"]],
      ["$m", ["$mod"]],
      ["$n", ["$ne", "$nin", "$not", "$nor"]],
      ["$o", ["$or"]],
      ["$r", ["$regex", "$rand"]],
      ["$s", ["$size", "$slice"]],
      ["ISO", ["ISODate"]],
      ["iso", ["ISODate"]],
      ["t", ["true"]],
      ["f", ["false"]]
    ])
    const start = this.selectionStart
    const autocompleteDropdown = document.querySelector("#autocompleteDropdown")
    const autocompleteContainer = document.querySelector("#autocompleteContainer")
    const textLines = this.value.substr(0, start).split("\n")
    const currentLine = textLines[textLines.length - 1]
    const currentWord = currentLine.substring(currentLine.lastIndexOf(" ", start - 1), start).trim()
    const autocompleteSuggestion = autocompleteWords.get(currentWord)
    if (autocompleteSuggestion && autocompleteContainer.classList.contains("hidden")) {
      Object.values(autocompleteSuggestion).forEach((e, index) => {
        const option = document.createElement("option")
        option.value = index
        option.textContent = e
        autocompleteDropdown.appendChild(option)
      })
      autocompleteDropdown.size = autocompleteSuggestion.length
      autocompleteContainer.classList.remove("hidden")
    } else {
      autocompleteDropdown.innerHTML = ""
      autocompleteContainer.classList.add("hidden")
    }
  }

  function setAutocompleteDropdownPosition () {
    queryInputRef.current.addEventListener("keyup", handleKeyUp)
  }

  function handleKeyUp (e) {
    const queryElement = document.querySelector("#query")
    const textAreaRect = queryElement.getClientRects()
    const autocompleteContainer = document.querySelector("#autocompleteContainer")
    const textLines = this.value.substr(0, this.selectionStart).split("\n")
    const currentLineNumber = textLines.length
    const currentColumnIndex = textLines[textLines.length - 1].length
    // const left = document.querySelector("#left").getClientRects();
    const diff = 0 // left[0].width - 270;
    autocompleteContainer.style.left = textAreaRect[0].left + currentColumnIndex * 7.7 + diff + "px"
    autocompleteContainer.style.top = textAreaRect[0].top + 19.199996948242188 * currentLineNumber + 8 + "px"
  }

  function enableCodeEditorFeatures () {
    queryInputRef.current.addEventListener("keydown", handleKeyDown)
  }

  function handleKeyDown (e) {
    const closeChars = new Map([
      ["{", "}"],
      ["[", "]"],
      ["(", ")"]
    ])
    const autocompleteDropdown = document.querySelector("#autocompleteDropdown")
    const autocompleteContainer = document.querySelector("#autocompleteContainer")
    // eslint-disable-next-line
    if ((e.ctrlKey || e.metaKey) && (e.keyCode == 13 || e.keyCode == 10)) {
      e.preventDefault()
      document.querySelector("button[name='find']").click()
    } else if (e.key === "ArrowDown" && !autocompleteContainer.classList.contains("hidden")) {
      e.preventDefault()
      autocompleteDropdown.focus()
      autocompleteDropdown.selectedIndex = 0
      return
    } else if (e.key === "Tab") {
      e.preventDefault()
      const start = this.selectionStart
      const end = this.selectionEnd
      this.value = this.value.substring(0, start) + "    " + this.value.substring(end)
      this.selectionStart = this.selectionEnd = start + 4
    }
    if (closeChars.get(e.key)) {
      const pos = e.target.selectionStart
      const val = [...e.target.value]
      const closeChar = closeChars.get(e.key)
      if (closeChar) {
        val.splice(pos, 0, closeChar)
        e.target.value = val.join("")
        e.target.selectionEnd = pos
      }
    }
  }

  function insertSelectedWord (e) {
    e.preventDefault()
    const queryElement = document.querySelector("#query")
    const autocompleteContainer = document.querySelector("#autocompleteContainer")
    let start = queryElement.selectionStart
    const replacement = e.target.options[e.target.selectedIndex].text
    const textLines = queryElement.value.substr(0, start).split("\n")
    const currentLine = textLines[textLines.length - 1]
    const currentWord = currentLine.substring(currentLine.lastIndexOf(" ", start - 1), start).trim()
    const startIndex = queryElement.value.lastIndexOf(currentWord, start - 1)
    queryElement.value = queryElement.value.slice(0, startIndex) + replacement + queryElement.value.slice(start++)
    autocompleteContainer.classList.add("hidden")
    queryElement.focus()
    queryElement.selectionStart = startIndex + replacement.length
    queryElement.selectionEnd = startIndex + replacement.length
  }

  function changeOrderBy (e) {
    const selection = e.target.value
    sessionStorage.setItem("orderBy", selection)
    setOrderByField(selection)
  }

  function changeSortOrder (e) {
    const selection = e.target.value
    sessionStorage.setItem("sortOrder", selection)
    setSortOrder(selection)
  }

  function isAdminDatabase () {
    return sessionStorage.getItem("database") === "admin" && sessionStorage.getItem("collection") === "system.users"
  }

  return (
        <div className="flex w-full">
            <div className="w-full bg-white border-b pb-3">
                <form onSubmit={handleSubmit} method="post" className="w-full">
                    <div className="flex">
                        <textarea
                            rows="6"
                            placeholder="_id: ..."
                            style={{ fontSize: "0.8rem", minHeight: "120px" }}
                            className="me-2 appearance-none border px-[0.375rem] py-[0.5rem] w-full rounded-md font-mono font-light self-start"
                            name="query"
                            id="query"
                            aria-label="Query"
                            defaultValue={sessionStorage.getItem("query")}
                            ref={queryInputRef} // Use the useRef hook for direct DOM access
                            onFocus={setAutocompleteDropdownPosition}
                        />
                        <div className="flex-col">
                            <div className="relative mb-2 min-w-[150px]">
                                <select
                                    id="fields"
                                    name="fields"
                                    className="w-full pe-8 block appearance-none bg-selectArrow bg-origin-content bg-right-075 bg-no-repeat bg-[length:16px_12px] rounded-md px-3 pt-6 pb-2 text-sm text-gray-900 bg-gray-50 border border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                    aria-label="Order by"
                                    onChange={changeOrderBy}
                                    value={orderByField}>
                                    {
                                        fields.length > 0
                                          ? fields.map((field, index) => (
                                                <option key={index} value={field.field}>{field.field}</option>
                                          ))
                                          : <option value="-1">...</option>
                                    }
                                </select>
                                <label htmlFor="fields" className="absolute text-base text-gray-500 duration-300 transform -translate-y-4 scale-75 top-5 z-10 origin-[0] start-2.5 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4">Order by</label>
                            </div>
                            <div className="relative min-w-[150px]">
                                <select
                                    id="order"
                                    name="order"
                                    className="w-full pe-8 block appearance-none bg-selectArrow bg-origin-content bg-right-075 bg-no-repeat bg-[length:16px_12px] rounded-md px-3 pt-6 pb-2 text-sm text-gray-900 bg-gray-50 border border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                    aria-label="Sort order"
                                    onChange={changeSortOrder}
                                    value={sortOrder}>
                                    <option value="ASC">ASC</option>
                                    <option value="DESC">DESC</option>
                                </select>
                                <label htmlFor="order" className="absolute text-base text-gray-500 duration-300 transform -translate-y-4 scale-75 top-5 z-10 origin-[0] start-2.5 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4">Sort order</label>
                            </div>
                        </div>
                        <div id="autocompleteContainer" className="absolute hidden"
                            style={{ zIndex: 100, fontSize: "0.8em" }}>
                            <select id="autocompleteDropdown" className="overflow-auto" onKeyPress={insertSelectedWord}
                                onClick={insertSelectedWord}></select>
                        </div>
                    </div>
                    <div className="w-full my-3">
                        <div className="float-start">
                            <button
                                className="bg-[#009e5d] py-1 px-6 text-white w-full rounded-sm"
                                name="find"
                                type="submit"
                            >
                                <span className="font-bold text-sm">Submit Query</span>
                            </button>
                        </div>
                        <div className="float-end">
                            <button
                                className="py-1 px-2 font-light border border-[#009e5d] me-3 text-sm text-[#009e5d] rounded-sm hover:bg-[#009e5d] hover:text-white"
                                name="insertDocument"
                                type="submit"
                            >
                                Insert
                            </button>
                            <div className="inline-flex">
                                <button
                                    className="py-1 px-2 font-light border border-[#009e5d] text-sm text-[#009e5d] rounded-s-sm hover:bg-[#009e5d] hover:text-white"
                                    name="indices"
                                    type="submit"
                                >
                                    Indices
                                </button>
                                <button
                                    className="py-1 px-2 font-light border border-[#009e5d] ms-[-1px] me-3 text-sm text-[#009e5d] rounded-e-sm hover:bg-[#009e5d] hover:text-white"
                                    name="createIndex"
                                    type="submit"
                                >
                                    <PlusCircleIcon className="w-4" />
                                </button>
                            </div>
                            <button
                                className="py-1 px-2 font-light border border-[#009e5d] me-3 text-sm text-[#009e5d] rounded-sm hover:bg-[#009e5d] hover:text-white"
                                name="explain"
                                type="submit"
                            >
                                Explain
                            </button>
                            <div className="inline-flex">
                                <button
                                    className="py-1 px-2 font-light border border-[#009e5d] text-sm text-[#009e5d] rounded-sm hover:bg-[#009e5d] hover:text-white"
                                    name="export"
                                    type="submit"
                                >
                                    Export
                                </button>
                                <input type="file" className="hidden" id="file" name="import" accept=".json" onChange={handleFileChange} />
                                <button
                                    className="py-1 px-2 font-light border border-[#009e5d] ms-[-1px] text-sm text-[#009e5d] rounded-e-sm hover:bg-[#009e5d] hover:text-white"
                                    onClick={handleImportButtonClick}
                                >
                                    Import
                                </button>
                            </div>
                            {isAdminDatabase() && <button
                                className="py-1 px-2 font-light border border-[#009e5d] ms-3 text-sm text-[#009e5d] rounded-sm hover:bg-[#009e5d] hover:text-white"
                                name="createUser"
                                type="submit"
                            >
                                Create User
                            </button>}
                        </div>
                    </div>
                </form>
            </div>
            <IndicesModal
                open={openIndexModal}
                close={hideIndexModal}
                currentPage={props.currentPage}
            />
            {openDatabaseRolesModal && <DatabaseRolesModal
                open={openDatabaseRolesModal}
                close={hideDatabaseRolesModal}
                currentPage={props.currentPage}
                user={null}
                creationMode={true}
            />}
        </div>
  )
}
