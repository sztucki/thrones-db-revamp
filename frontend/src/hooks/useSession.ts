import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSession, logIn, logOut, signUp } from "../api/auth.js";

const SESSION_KEY = ["session"];

export function useSession() {
  return useQuery({
    queryKey: SESSION_KEY,
    queryFn: getSession,
    staleTime: 60_000,
  });
}

export function useLogIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => logIn(email, password),
    onSuccess: (data) => queryClient.setQueryData(SESSION_KEY, data),
  });
}

export function useSignUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, username, password }: { email: string; username: string; password: string }) =>
      signUp(email, username, password),
    onSuccess: (data) => queryClient.setQueryData(SESSION_KEY, data),
  });
}

export function useLogOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logOut,
    onSuccess: () => queryClient.setQueryData(SESSION_KEY, { user: null }),
  });
}
