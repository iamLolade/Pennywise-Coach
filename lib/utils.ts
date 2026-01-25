import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import toast from "react-hot-toast"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type ErrorContext = "auth" | "pdf" | "password" | "payment" | "general"

function getErrorMessage(error: unknown, context: ErrorContext = "general") {
  if (typeof error === "string") {
    return error
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    if (context === "auth") {
      if (message.includes("invalid login credentials")) {
        return "Incorrect email or password. Please try again."
      }
      if (message.includes("user already registered")) {
        return "This email is already registered. Try signing in instead."
      }
      if (message.includes("password")) {
        return "Please choose a stronger password."
      }
    }
    return error.message
  }

  if (context === "payment") {
    return "Payment failed. Please try again or use a different method."
  }

  if (context === "password") {
    return "We couldn't update your password. Please try again."
  }

  if (context === "pdf") {
    return "We couldn't generate your PDF. Please try again."
  }

  return "Something went wrong. Please try again."
}

export function showSuccess(message: string) {
  toast.success(message)
}

export function showError(error: unknown, context: ErrorContext = "general") {
  toast.error(getErrorMessage(error, context))
}
