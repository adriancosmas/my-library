"use client";
import React, { useState, useEffect, useRef } from "react";
import Modal from "../components/Modal";
import { Spinner } from "@/components/ui/spinner";

type SubmitButtonProps = {
    isConfigured: boolean;
}

export default function SubmitButton({ isConfigured }: SubmitButtonProps) {
  const [open, setOpen] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const form = buttonRef.current?.closest("form");
    if (!form) return;

    const checkFilled = () => {
      const fd = new FormData(form);
      const requiredFields = [
        "name",
        "description",
        "website_url",
        "logo_url",
        "tags",
      ];

      for (const field of requiredFields) {
        const val = String(fd.get(field) || "").trim();
        if (!val) return false;
      }
      return true;
    };

    const handler = () => setCanSubmit(checkFilled());
    form.addEventListener("input", handler);
    form.addEventListener("change", handler);
    handler();
    const interval = window.setInterval(handler, 400);
    return () => {
      form.removeEventListener("input", handler);
      form.removeEventListener("change", handler);
      window.clearInterval(interval);
    };
  }, []);

  const handleClick = () => {
    if (!isConfigured || !canSubmit || isSubmitting) return;
    setPinError("");
    setOpen(true);
  };

  const handleConfirmSubmit = () => {
    const form = buttonRef.current?.closest("form");
    if (!form) return;

    if (!pin.trim()) {
      setPinError("Enter the submission PIN.");
      return;
    }

    setPinError("");
    setIsSubmitting(true);
    setOpen(false);
    form.requestSubmit();
  };

  return(
        <>
            <input type="hidden" name="submission_pin" value={pin} />
            <button
                ref={buttonRef}
                onClick={handleClick}
                type="button"
                disabled={!isConfigured || !canSubmit || isSubmitting}
                className="rounded-md dark:bg-yellow-200 bg-yellow-400 px-8 py-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer text-neutral-900 font-semibold mt-4 text-base font-sans"
                title={
                  !isConfigured
                    ? "Configure Supabase in .env.local to enable submissions"
                    : !canSubmit
                      ? "Fill out all fields before submitting"
                      : undefined
                }
            >
                {isSubmitting ? "Submitting..." : "Submit"}
            </button>

            <Modal open={open} onClose={() => setOpen(false)}>
                <div className="flex min-w-[320px] flex-col gap-4">
                    <div className="space-y-1">
                      <h2 className="text-lg font-semibold text-neutral-900 dark:text-white font-sans">
                        Enter submission PIN
                      </h2>
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 font-sans">
                        Only approved users can submit new tools.
                      </p>
                    </div>

                    <div className="grid gap-2">
                      <label
                        htmlFor="submission-pin"
                        className="text-sm font-sans font-light text-neutral-900 dark:text-white"
                      >
                        PIN
                      </label>
                      <input
                        id="submission-pin"
                        type="password"
                        inputMode="numeric"
                        value={pin}
                        onChange={(event) => {
                          setPin(event.target.value);
                          if (pinError) setPinError("");
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            handleConfirmSubmit();
                          }
                        }}
                        className="rounded-md border border-black/10 bg-white px-3 py-2 font-sans dark:border-white/10 dark:bg-black/60"
                        placeholder="Enter PIN"
                        autoFocus
                      />
                      {pinError && (
                        <p className="text-sm text-red-400 font-sans">{pinError}</p>
                      )}
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="rounded-md border border-black/10 px-4 py-2 text-sm font-medium text-neutral-900 dark:border-white/10 dark:text-white font-sans"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmSubmit}
                        className="inline-flex items-center justify-center rounded-md bg-yellow-400 px-4 py-2 text-sm font-semibold text-neutral-900 dark:bg-yellow-200 font-sans"
                      >
                        {isSubmitting ? (
                          <>
                            <Spinner className="mr-2 h-4 w-4 text-neutral-900" />
                            Submitting...
                          </>
                        ) : (
                          "Submit tool"
                        )}
                      </button>
                    </div>
                </div>
            </Modal>
        </>
  )
}
