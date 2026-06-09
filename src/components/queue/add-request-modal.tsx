"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CloseButton, Modal } from "@/components/ui/overlay";
import { CheckIcon } from "@/components/icons";
import {
  RequestForm,
  makeInitialValue,
  type RequestFormValue,
} from "./request-form";
import { ALERT_COPY, canStartWatch } from "@/lib/plan";
import { useStore } from "@/lib/store";
import { useUi } from "@/lib/ui-store";

export function AddRequestModal() {
  const open = useUi((s) => s.addModalOpen);
  const prefill = useUi((s) => s.addModalPrefill);
  const editId = useUi((s) => s.editRequestId);
  const close = useUi((s) => s.closeAddModal);

  const user = useStore((s) => s.user);
  const activeCount = useStore((s) => s.requests.filter((r) => r.status === "active").length);
  const createRequest = useStore((s) => s.createRequest);
  const updateRequest = useStore((s) => s.updateRequest);
  const activateRequest = useStore((s) => s.activateRequest);
  const pushToast = useStore((s) => s.pushToast);

  const [value, setValue] = useState<RequestFormValue>(() =>
    makeInitialValue(prefill, { city: user.default_city, party_size: user.default_party_size }),
  );

  // Re-seed the form whenever the modal (re)opens with new prefill.
  useEffect(() => {
    if (open) {
      setValue(
        makeInitialValue(prefill, {
          city: user.default_city,
          party_size: user.default_party_size,
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, prefill]);

  const isEdit = Boolean(editId);
  const atWatchLimit = !canStartWatch(user, activeCount);
  const valid = value.restaurant_name.trim().length > 0;

  function patch(p: Partial<RequestFormValue>) {
    setValue((v) => ({ ...v, ...p }));
  }

  function handleSaveDraft() {
    if (!valid) return;
    if (isEdit && editId) {
      updateRequest(editId, value);
      pushToast("info", "Watch updated.");
    } else {
      createRequest(value, false);
      pushToast("info", "Saved as a draft.");
    }
    close();
  }

  function handleActivate() {
    if (!valid) return;
    if (isEdit && editId) {
      updateRequest(editId, value);
      const res = activateRequest(editId);
      pushToast(res.activated ? "success" : "warning", res.message);
    } else {
      const res = createRequest(value, true);
      pushToast(res.activated ? "success" : "warning", res.message);
    }
    close();
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={isEdit ? "Edit watch" : "New table watch"}
      subtitle={
        isEdit
          ? "Update the criteria we watch for."
          : "Set your criteria — we'll alert you the moment a matching table opens."
      }
      className="max-w-xl"
    >
      <div className="absolute right-4 top-5">
        <CloseButton onClick={close} />
      </div>

      <div className="px-6 py-6">
        <RequestForm value={value} onChange={patch} />

        {/* Confirmation box */}
        <div className="mt-6 rounded-xl border border-sage-200 bg-sage-50 p-4">
          <div className="flex gap-3">
            <CheckIcon className="mt-0.5 h-5 w-5 flex-none text-sage-600" />
            <div>
              <p className="text-sm text-ink-800">
                <span className="font-medium">{ALERT_COPY}</span>
              </p>
              {atWatchLimit && (
                <p className="mt-2 text-sm text-clay-600">
                  You can save this as a draft, but you&apos;ve reached your free watch limit —
                  upgrade to Premium to start it.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-line bg-ivory-50/95 px-6 py-4 backdrop-blur">
        <Button variant="secondary" onClick={handleSaveDraft} disabled={!valid}>
          Save draft
        </Button>
        <Button onClick={handleActivate} disabled={!valid || atWatchLimit} title={atWatchLimit ? "Upgrade to start another watch" : undefined}>
          {isEdit ? "Save & start" : "Start watching"}
        </Button>
      </footer>
    </Modal>
  );
}
