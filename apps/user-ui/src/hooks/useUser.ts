import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import { useAuthStore } from "../store/authStore";
import { isProtected } from "../utils/protected";
import { useEffect } from "react";

const fetchUser = async (isLoggedIn: boolean) => {
  const config = isLoggedIn ? isProtected : {};
  const res = await axiosInstance.get("/api/logged-in-user", config);
  return res.data.user;
};

const useUser = () => {
  const { isLoggedIn, setIsLoggedIn } = useAuthStore();
  const {
    data: user,
    status,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["user"],
    queryFn: () => fetchUser(isLoggedIn),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
  useEffect(() => {
    if (status === "success") setIsLoggedIn(true);
    if (status === "error") setIsLoggedIn(false);
  }, [status, setIsLoggedIn]);
  return { user: user as any, isLoading: isPending, isError };
};

export default useUser;
