import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";
import * as React from "react";

interface FormMessagesProps extends React.HTMLAttributes<HTMLDivElement> {
  messages?: string[] | string | React.ReactNode;
  type?: "error" | "success";
}

export function FormMessages({ messages, type = "error", className, ...props }: FormMessagesProps) {
  if (!messages) {
    return null;
  }

  const isReactNode = React.isValidElement(messages);

  if (!isReactNode && typeof messages === "string") {
    messages = [messages];
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm",
        type === "error" ? "text-destructive" : "text-green-600",
        className,
      )}
      {...props}
    >
      {type === "error" ? (
        <XCircle className="h-4 w-4 shrink-0" />
      ) : (
        <CheckCircle2 className="h-4 w-4 shrink-0" />
      )}
      {isReactNode ? (
        messages
      ) : (
        <span>
          {(messages as string[]).map((value, i) => (
            <span key={i}>{value}</span>
          ))}
        </span>
      )}
    </div>
  );
}
