import {v4 as uuidv4} from 'uuid';
import {useState} from "react";

export function useRefresh(): [string, () => void] {
  const [state, setState] = useState(uuidv4());
  const refresh = () => setState(uuidv4())
  return [state, refresh];
}
