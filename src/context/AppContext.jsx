import { createContext, useContext, useReducer, useEffect } from "react";
import { INITIAL_TRANSACTIONS } from "../data/mockData";

const AppContext = createContext(null);

const initialState = {
  transactions: INITIAL_TRANSACTIONS,
  role: "viewer",
  filters: { search: "", category: "all", type: "all", month: "all" },
  activePage: "goals",
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_ROLE":
      return { ...state, role: action.payload };
    case "SET_PAGE":
      return { ...state, activePage: action.payload };
    case "SET_FILTER":
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case "RESET_FILTERS":
      return { ...state, filters: initialState.filters };
    case "ADD_TRANSACTION": {
      const newTx = { ...action.payload, id: Date.now() };
      const updated = [newTx, ...state.transactions];
      localStorage.setItem("fd_transactions", JSON.stringify(updated));
      return { ...state, transactions: updated };
    }
    case "EDIT_TRANSACTION": {
      const updated = state.transactions.map((t) =>
        t.id === action.payload.id ? action.payload : t
      );
      localStorage.setItem("fd_transactions", JSON.stringify(updated));
      return { ...state, transactions: updated };
    }
    case "DELETE_TRANSACTION": {
      const updated = state.transactions.filter((t) => t.id !== action.payload);
      localStorage.setItem("fd_transactions", JSON.stringify(updated));
      return { ...state, transactions: updated };
    }
    case "LOAD_FROM_STORAGE":
      return { ...state, transactions: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const saved = localStorage.getItem("fd_transactions");
    if (saved) {
      try {
        dispatch({ type: "LOAD_FROM_STORAGE", payload: JSON.parse(saved) });
      } catch {}
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
