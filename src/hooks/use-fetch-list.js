import { useEffect, useRef, useState } from 'react'
import ApiClient from '../lib/api-client'
const apiClient = new ApiClient()

export const useFetchList = (baseUrl) => {
  const request = useRef()

  const [status, setStatus] = useState('idle')
  const [error, setError] = useState()
  const [result, setResult] = useState([])

  function fetch() {
    setStatus('loading')
    request.current = setTimeout(() => {
      apiClient
        .get(baseUrl)
        .then((res) => {
          setResult(res)
          setStatus('success')
        })
        .catch(({ message }) => {
          setError(message)
          setStatus('error')
        })
    }, 250)
  }

  // fetch request on page load, clear on unmount
  useEffect(() => {
    fetch()
    return () => clearTimeout(request.current)
  }, [baseUrl]) // eslint-disable-line react-hooks/exhaustive-deps

  return { fetch, result, status, isLoading: status === 'loading', error }
}
