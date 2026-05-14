import { useState, useCallback } from 'react';

let _show = null;

export function useToast() {
  const [msg, setMsg] = useState(null);

  const show = useCallback((text, duration = 2200) => {
    setMsg(text);
    setTimeout(() => setMsg(null), duration);
  }, []);

  _show = show;
  return { msg, show };
}

export function showToast(text) {
  if (_show) _show(text);
}

export default function Toast({ msg }) {
  if (!msg) return null;
  return <div className="tm-toast">{msg}</div>;
}
