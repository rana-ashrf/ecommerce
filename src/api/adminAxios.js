import axios from "axios";

const AdminAPI = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

AdminAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminAccessToken");

  const publicUrls = ["/admin/login/", "/admin/register/"];

  if (token && !publicUrls.includes(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

AdminAPI.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    const publicUrls = ["/admin/login/", "/admin/register/"];

    if (publicUrls.includes(originalRequest.url)) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem("adminRefreshToken");

        if (!refresh) {
          throw new Error("No admin refresh token");
        }

        const res = await axios.post(
          "http://127.0.0.1:8000/api/accounts/token/refresh/",
          { refresh }
        );

        const newAccess = res.data.access;
        localStorage.setItem("adminAccessToken", newAccess);

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        return AdminAPI(originalRequest);
      } catch (err) {
        localStorage.removeItem("admin");
        localStorage.removeItem("adminAccessToken");
        localStorage.removeItem("adminRefreshToken");

        window.location.href = "/admin/login";
      }
    }

    return Promise.reject(error);
  }
);

export default AdminAPI;