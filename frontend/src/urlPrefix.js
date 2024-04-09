export default function urlPrefix () {
  if (process.env.NODE_ENV === "production") {
    return "/api/"
  } else {
    return "/"
  }
}
