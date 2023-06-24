import {DependencyList, useEffect} from "react";
import {EventListenerDescriptor} from "@sui/lib-event-manager";

export function useHandler(desc: EventListenerDescriptor, deps: DependencyList) {
  return useEffect(() => {
    return () => {
      desc.unsubscribe();
    }
  }, [desc, ...deps]);
}
