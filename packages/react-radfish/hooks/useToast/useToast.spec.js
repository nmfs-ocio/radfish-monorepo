import { renderHook } from "@testing-library/react";
import { useToasts, dispatchToast } from "./useToast";

describe("useToast", () => {
  it("should dispatch a toast event", () => {
    let dispatchEventSpy = vi.spyOn(document, "dispatchEvent");

    const {
      result: {
        current: { toasts },
      },
    } = renderHook(() => useToasts());

    dispatchToast({ message: "Hello", status: "ok" });

    let dispatchedEvent = dispatchEventSpy.mock.calls[0][0];
    expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(CustomEvent));
    // TODO: Update assertion when event is renamed to @nmfs-ocio/react-radfish:dispatchToast
    expect(dispatchedEvent.type).toBe("@nmfs-radfish/react-radfish:dispatchToast");
    expect(dispatchedEvent.detail).toMatchObject({ message: "Hello", status: "ok" });
    expect(dispatchedEvent.detail.expires_at).toBeGreaterThan(Date.now());
  });
});
