import { ToastOptions } from "react-hot-toast";

export const toastError: ToastOptions = {
  duration: 2500,
  style: {
    border: "1px solid #9c0000",
    padding: "12px",
    color: "#a7a7a8",
    backgroundColor: "#000",
  },
  iconTheme: {
    primary: "#9c0000",
    secondary: "#eee",
  },
};

export const toastSuccess: ToastOptions = {
  position: "top-right",
  style: {
    border: "1px solid #14ff76",
    padding: "12px",
    color: "#b5b5b5",
    backgroundColor: "#000",
    marginRight: "5rem",
  },
  iconTheme: {
    primary: "#14ff76",
    secondary: "#000",
  },
};
