import axios from "axios";

let authToken: string | null = null;

const axiosInstance = axios.create({
  baseURL: "https://api.dikont.com/api",
});

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
};

export default axiosInstance;
