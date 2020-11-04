import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * A hook for fetching data from the database
 */

type UseDataOptions = {
  url: string,
  key?: string
}

export default <T>(options: UseDataOptions) => {
  
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState<boolean>(false);

  const get = useCallback(async () => {
    setLoading(true);
    const resp = await fetch(options.url, {
      credentials: 'include',
      method: 'get'
    });

    const json = await resp.json();
    setData(options.key ? json[options.key] : json);
    setLoading(false);
  }, [])

  useEffect(() => {
    get();
  }, [])

  return useMemo(() => ({
    data,
    refresh: get,
    loading
  }), [data, loading])
}