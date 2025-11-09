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
    if (isConfigured && canSubmit) setOpen(true);
  }

  return(
        <>
            <button
                ref={buttonRef}
                onClick={handleClick}
                type="submit"
                disabled={!isConfigured || !canSubmit}
                className="rounded-md dark:bg-yellow-200 bg-yellow-400 px-8 py-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer text-neutral-900 font-semibold mt-4 text-base font-sans"
                title={
                  !isConfigured
                    ? "Configure Supabase in .env.local to enable submissions"
                    : !canSubmit
                      ? "Fill out all fields before submitting"
                      : undefined
                }
            >
                Submit
            </button>

            <Modal open={open} onClose={() => setOpen(false)}>
                <div className="flex flex-col items-center justify-center gap-4">
                    <Spinner className="w-12 h-12 text-yellow-400 dark:text-yellow-200" />
                    <p className="text-neutral-900 font-sans font-light text-base text-center dark:text-white">Submitting new library!</p>
                </div>
            </Modal>
        </>
  )
}