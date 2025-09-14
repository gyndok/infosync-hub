import { toast } from "@/hooks/use-toast";

export function logError(message: string, error?: unknown) {
  console.error(message, error);
  const title = message.endsWith(":") ? message.slice(0, -1) : message;
  const description = error instanceof Error ? error.message : String(error ?? "");
  toast({
    title,
    description,
    variant: "destructive",
  });
}
