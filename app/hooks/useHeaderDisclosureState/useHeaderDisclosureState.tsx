import { createContext } from "react";
import type { DisclosureStateReturn } from "reakit/ts";
import { createGenericContext } from "~/lib/createGenericContext";

const [useHeaderDisclosureState, HeaderDisclosureContextProvider] =
  createGenericContext<DisclosureStateReturn>();

export { useHeaderDisclosureState, HeaderDisclosureContextProvider };
