import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { EventEmitter } from "../../eventEmitter"
import { loadHosts, login } from "../../service/AuthService"

export default function Login () {
  const [hosts, setHosts] = useState([])
  const [loginError, setLoginError] = useState(false)
  const [loginSpinner, setLoginSpinner] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    sessionStorage.setItem("isAuthenticated", "false")
    const init = async () => {
      const hosts = await loadHosts()
      setHosts(hosts)
    }
    init()
  }, [])

  async function handleSubmit (event) {
    event.preventDefault()
    setLoginSpinner(true)
    const uri = event.target.hostSelect.value
    const loggedIn = await login(
      event.target.username.value,
      event.target.password.value,
      uri
    )
    if (loggedIn) {
      setLoginSpinner(false)
      sessionStorage.setItem("isAuthenticated", "true")
      sessionStorage.setItem("url", uri)
      sessionStorage.removeItem("database")
      sessionStorage.removeItem("collection")
      sessionStorage.removeItem("query")
      EventEmitter.reset()
      navigate("/app")
    } else {
      setLoginError(true)
      setLoginSpinner(false)
    }
  }

  return (
        <>
            <main id="main" className="text-center w-100 max-w-[400px] m-auto">
                <div className="p-12 bg-white border rounded">
                    <form onSubmit={handleSubmit} method="post" className="w-full">
                        <img
                            className="mb-3 m-auto"
                            src="./ManguiLogo.png"
                            alt=""
                            width="128"
                            height="128"
                        />
                        <div className="text-3xl mb-4 font-thin">Sign in to Mangui</div>
                        <div className="relative m-auto">
                            <input
                                type="text"
                                className="w-full mb-[-1px] block rounded-t-md px-2.5 pb-2 pt-7 text-sm text-gray-900 bg-gray-50 border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                placeholder=""
                                name="username"
                            />
                            <label htmlFor="username" className="absolute text-base text-gray-500 duration-300 transform -translate-y-3 scale-75 top-5 z-10 origin-[0] start-2.5 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3">Username</label>
                        </div>
                        <div className="relative m-auto">
                            <input
                                type="password"
                                className="w-full mb-[-1px] block px-2.5 pb-2 pt-7 text-sm text-gray-900 bg-gray-50 border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                name="password"
                                placeholder=""
                            />
                            <label htmlFor="password" className="absolute text-base text-gray-500 duration-300 transform -translate-y-3 scale-75 top-5 z-10 origin-[0] start-2.5 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3">Password</label>
                        </div>
                        <div className="relative m-auto">
                            <select
                                name="hostSelect"
                                className="w-full pe-8 block appearance-none bg-selectArrow bg-origin-content bg-right-075 bg-no-repeat bg-[length:16px_12px] rounded-b-md px-2.5 pb-4 pt-7 text-sm text-gray-900 bg-gray-50 border border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                aria-label="Select host"
                                defaultValue={sessionStorage.getItem("url")}
                            >
                                {hosts != null && hosts.length > 0
                                  ? (
                                      hosts.map((item, i) => {
                                        return (
                                            <option key={i} value={item}>
                                                {item}
                                            </option>
                                        )
                                      })
                                    )
                                  : (
                                    <option value="error">Error connecting to backend</option>
                                    )}
                            </select>
                            <label htmlFor="hostSelect" className="absolute text-base text-gray-500 duration-300 transform -translate-y-4 scale-75 top-6 z-10 origin-[0] start-2.5 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4">Host</label>
                        </div>
                        {loginError === false
                          ? (
                            <button
                                className="w-full text-xl rounded-md py-2.5 text-white bg-[#009e5d] mt-[20px]"
                                type="submit"
                            >
                                Sign in{" "}
                                {loginSpinner === true
                                  ? (
                                    <div className="text-center inline-block ms-1">
                                        <div role="status">
                                            <svg aria-hidden="true" className="inline w-5 h-5 text-gray-200 animate-spin fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                            </svg>
                                            <span className="sr-only">Loading...</span>
                                        </div>
                                    </div>
                                    )
                                  : null}
                            </button>
                            )
                          : (
                            <button
                                className="w-full text-xl rounded-md py-2.5 text-white bg-[#f63414] mt-[20px]"
                                type="submit"
                            >
                                Error. Try again.{" "}
                                {loginSpinner === true
                                  ? (
                                    <div className="text-center inline-block ms-1">
                                        <div role="status">
                                            <svg aria-hidden="true" className="inline w-5 h-5 text-gray-200 animate-spin fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                            </svg>
                                            <span className="sr-only">Loading...</span>
                                        </div>
                                    </div>
                                    )
                                  : null}
                            </button>
                            )}
                        <p className="mt-12 text-black/50">&copy; 2024</p>
                    </form>
                </div>
            </main >
        </>
  )
};
