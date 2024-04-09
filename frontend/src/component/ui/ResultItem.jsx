import { ArrowLongLeftIcon, CheckIcon, PencilIcon, TrashIcon, UserCircleIcon } from "@heroicons/react/24/outline"
import React, { useEffect, useState } from "react"
import ReactJson from "react18-json-view"
import "react18-json-view/src/style.css"
import { deleteDocument, updateDocument } from "../../service/DocumentService"
import { dropIndex } from "../../service/IndexService"
import DatabaseRolesModal from "./DatabaseRolesModal"
import { EventEmitter, Events } from "../../eventEmitter"
import { showCollectionContent } from "../../service/CollectionService"

export default function ResultItem (props) {
  const [showConfirm, setShowConfirm] = useState(null)
  const [editJson, setEditJson] = useState(null)
  const [openDatabaseRolesModal, setOpenDatabaseRolesModal] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    registerItemTextEventListener()
  }, [editJson])

  useEffect(() => {
    setEditJson(null)
  }, [props.currentPage])

  async function handleEdit (e, i) {
    setEditJson(i)
  }

  function handleUserEdit (e, item) {
    setUser(item)
    setOpenDatabaseRolesModal(true)
  }

  function handleDrop (e, i) {
    setShowConfirm(i)
  }

  async function handleDropConfirm (e, item) {
    setShowConfirm(null)
    let resultData = null
    switch (props.action) {
      case "find":
        await deleteDocument(item._id, props.currentPage)
        resultData = await showCollectionContent("find", "", props.currentPage)
        EventEmitter.dispatch(Events.RENDER_RESULT, resultData)
        break
      case "indices":
        await dropIndex(item.name, props.currentPage)
        resultData = await showCollectionContent("indices", "", props.currentPage)
        EventEmitter.dispatch(Events.RENDER_RESULT, resultData)
        break
      default:
        throw Error("Drop confirm action not implemented")
    }
  }

  async function handleItemConfirm (e, item) {
    switch (props.action) {
      case "find":
        await updateDocument(
          item._id,
          document.querySelector("#itemText").value,
          props.currentPage
        )
        const query = sessionStorage.getItem("query")
        const resultData = await showCollectionContent("find", query, props.currentPage)
        EventEmitter.dispatch(Events.RENDER_RESULT, resultData)
        break
      default:
        throw Error("Item confirm action not implemented")
    }
    setEditJson(null)
  }

  function handleCancel (e, item) {
    setShowConfirm(null)
    setEditJson(null)
  }

  function autocompleteItemText () {
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
    const itemTextElement = document.querySelector("#itemText")
    if (itemTextElement !== null) {
      itemTextElement.addEventListener("input", function (e) {
        const start = this.selectionStart
        const autocompleteDropdown = document.querySelector("#autocompleteDropdownItemText")
        const autocompleteContainer = document.querySelector("#autocompleteContainerItemText")
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
      }, false)
    }
  }

  function setAutocompleteDropdownPositionItemText () {
    const itemTextElement = document.querySelector("#itemText")
    if (itemTextElement !== null) {
      const textAreaRect = itemTextElement.getClientRects()
      const autocompleteContainer = document.querySelector("#autocompleteContainerItemText")
      itemTextElement.addEventListener("keyup", function (e) {
        const textLines = this.value.substr(0, this.selectionStart).split("\n")
        const currentLineNumber = textLines.length
        const currentColumnIndex = textLines[textLines.length - 1].length
        autocompleteContainer.style.left = textAreaRect[0].left + currentColumnIndex * 7.7 - textAreaRect[0].x + "px"
        autocompleteContainer.style.top = textAreaRect[0].top + 19.199996948242188 * currentLineNumber + 25 - textAreaRect[0].y + "px"
      }, false)
    }
  }

  function enableCodeEditorFeaturesItemText () {
    const closeChars = new Map([
      ["{", "}"],
      ["[", "]"],
      ["(", ")"]
    ])
    const itemTextElement = document.querySelector("#itemText")
    if (itemTextElement !== null) {
      const autocompleteDropdown = document.querySelector("#autocompleteDropdownItemText")
      const autocompleteContainer = document.querySelector("#autocompleteContainerItemText")
      itemTextElement.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown" && !autocompleteContainer.classList.contains("hidden")) {
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
      }, false)
    }
  }

  function insertSelectedWordItemText (e) {
    e.preventDefault()
    const itemTextElement = document.querySelector("#itemText")
    const autocompleteContainer = document.querySelector("#autocompleteContainerItemText")
    let start = itemTextElement.selectionStart
    const replacement = e.target.options[e.target.selectedIndex].text
    const textLines = itemTextElement.value.substr(0, start).split("\n")
    const currentLine = textLines[textLines.length - 1]
    const currentWord = currentLine.substring(currentLine.lastIndexOf(" ", start - 1), start).trim()
    const startIndex = itemTextElement.value.lastIndexOf(currentWord, start - 1)
    itemTextElement.value = itemTextElement.value.slice(0, startIndex) + replacement + itemTextElement.value.slice(start++)
    autocompleteContainer.classList.add("hidden")
    itemTextElement.focus()
    itemTextElement.selectionStart = startIndex + replacement.length
    itemTextElement.selectionEnd = startIndex + replacement.length
  }

  function registerItemTextEventListener () {
    enableCodeEditorFeaturesItemText()
    autocompleteItemText()
    setAutocompleteDropdownPositionItemText()
  }

  function hideDatabaseRolesModal () {
    setOpenDatabaseRolesModal(false)
  }

  function isAdminDatabase () {
    return sessionStorage.getItem("database") === "admin" && sessionStorage.getItem("collection") === "system.users"
  }

  return (
        <div>
            {props.data.map((item, i) => {
              return (
                    <pre key={i} className="bg-white border mb-5 rounded-sm p-4 relative">
                        <div style={{ margin: "-10px", fontSize: "0.8em" }} className="font-thin text-black/50">
                            #{props.queryLimit * props.currentPage + i + 1}
                        </div>
                        <div className="flex flex-row">
                            <div className="w-full mt-2 overflow-auto">
                                {editJson !== i
                                  ? (
                                    <ReactJson
                                        src={item}
                                        style={{ fontSize: "0.8em" }}
                                        theme="vscode"
                                        collapsed={1}
                                        collapseStringsAfterLength={80}
                                    />
                                    )
                                  : (
                                    <>
                                        <textarea
                                            defaultValue={JSON.stringify(item, undefined, 2)}
                                            rows={10}
                                            style={{ fontSize: "0.8rem", minHeight: "120px" }}
                                            className="font-mono w-full border rounded-sm"
                                            name="itemText"
                                            id="itemText"
                                            aria-label="Item Text"
                                            wrap="off"
                                            onFocus={setAutocompleteDropdownPositionItemText}
                                        />
                                        <div id="autocompleteContainerItemText" className="absolute hidden"
                                            style={{ zIndex: 100, fontSize: "0.8em" }}>
                                            <select id="autocompleteDropdownItemText" className="overflow-auto"
                                                onKeyPress={insertSelectedWordItemText}
                                                onClick={insertSelectedWordItemText}></select>
                                        </div>
                                    </>
                                    )}
                            </div>
                            <div className="h-25">
                                {props.action === "find" && editJson !== i
                                  ? (
                                    <>
                                        <button
                                            className="border border-black rounded-md px-1.5 py-1 text-black me-2"
                                            name="editItem"
                                            onClick={(e) => handleEdit(e, i)}
                                        >
                                            <PencilIcon className="w-5 h-5 inline" />
                                        </button>
                                        {isAdminDatabase() && <button
                                            className="border border-black rounded-md px-1.5 py-1 text-black me-2"
                                            name="editItem"
                                            onClick={(e) => handleUserEdit(e, item)}
                                        >
                                            <UserCircleIcon className="w-5 h-5 inline" />
                                        </button>
                                        }
                                    </>
                                    )
                                  : props.action === "find" && editJson === i
                                    ? (
                                    <>
                                        <button
                                            className="border border-black rounded-s-md px-1.5 py-1 ms-3 text-black"
                                            name="editItemCancel"
                                            onClick={(e) => handleCancel(e, item)}
                                        >
                                            <ArrowLongLeftIcon className="w-5 h-5 inline" />
                                        </button>
                                        <button
                                            className="border border-[#009e5d] bg-[#009e5d] rounded-e-md px-2 py-1 me-2 ms-[-1px] text-white"
                                            name="editItemConfirm"
                                            onClick={(e) => handleItemConfirm(e, item)}
                                        >
                                            <CheckIcon className="w-4 h-4 inline" />
                                        </button>
                                    </>
                                      )
                                    : null}
                            </div>
                            <div className="h-25">
                                {props.action !== "explain" && showConfirm !== i
                                  ? (
                                    <button
                                        className="border border-black rounded-md px-1.5 py-1 text-black"
                                        name="dropItem"
                                        onClick={(e) => handleDrop(e, i)}
                                    >
                                        <TrashIcon className="w-5 h-5 inline" />
                                    </button>
                                    )
                                  : props.action !== "explain" && showConfirm === i
                                    ? (
                                    <button
                                        className="border text-sm text-[#f63414] hover:text-white hover:bg-[#f63414] border-[#f63414] rounded-md px-1.5 py-1.5"
                                        name="dropItemConfirm"
                                        onBlur={(e) => handleCancel(e, item)}
                                        onClick={(e) => handleDropConfirm(e, item)}
                                    >
                                        Confirm
                                    </button>
                                      )
                                    : null}
                            </div>
                        </div>
                    </pre>
              )
            })}
            {openDatabaseRolesModal && <DatabaseRolesModal
                open={openDatabaseRolesModal}
                close={hideDatabaseRolesModal}
                currentPage={props.currentPage}
                user={user}
                creationMode={false}
            />}
        </div>
  )
}
