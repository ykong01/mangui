import React, { useState } from "react"
import CollectionModal from "./CollectionModal"
import Databases from "./Databases"
import ThemeToggle from "./ThemeToggle"

export function Navigation () {
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false)

  return (
        <nav id="left" className="subtle-border rounded-s-md bg-white dark:bg-dark-card dark:text-dark-text min-[930px]:max-w-[500px]">
            <div className="p-4 overflow-auto h-full">
                <div className="flex gap-4 items-center justify-center pt-8 mb-10">
                    <img
                        src="./ManguiLogo.png"
                        alt=""
                        width="64"
                        height="64"
                        className=""
                    />
                    <span className="text-3xl font-thin w-fit text-gray-800 dark:text-gray-200">Mangui</span>
                    <div className="ml-auto">
                        <ThemeToggle />
                    </div>
                </div>
                <div className="flex items-center text-decoration-none mb-1">
                    <span className="text-2xl font-light text-gray-800 dark:text-gray-200">Databases</span>
                </div>
                <Databases />
                <button
                    className="mt-3 ms-2 py-1 px-2 font-light border border-[#009e5d] me-3 text-sm text-[#009e5d] dark:text-[#00c772] rounded-sm hover:bg-[#009e5d] hover:text-white dark:hover:bg-[#00a35d] dark:hover:text-white"
                    name="create_database"
                    onClick={() => setIsDatabaseModalOpen(true)}
                >
                    Create Collection
                </button>
                <CollectionModal open={isDatabaseModalOpen} close={() => setIsDatabaseModalOpen(false)} />
            </div>
        </nav>
  )
}
