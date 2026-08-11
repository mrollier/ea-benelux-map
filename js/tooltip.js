// One styled tooltip for the whole page, driven by `data-tip` on the trigger.
//
// Replaces the browser's native title= tooltip everywhere. Native tooltips look like a
// different website, can't be styled, appear after an uncontrollable delay, and never
// show for keyboard users — all three matter here, because the tooltip is where a
// newcomer learns what "Biosecurity & pandemic preparedness" means.

const SHOW_DELAY = 450; // long enough that sweeping across the chip row doesn't strobe
const GUTTER = 8; // never let the box touch the viewport edge (it would cause overflow)
const GAP = 8; // distance from the trigger

let tip = null;
let anchor = null;
let timer = null;

function ensureTip() {
  if (tip) return tip;
  tip = document.createElement("div");
  tip.id = "app-tip";
  tip.className = "app-tip";
  tip.setAttribute("role", "tooltip");
  tip.hidden = true;
  document.body.append(tip);
  return tip;
}

function place(target) {
  const rect = target.getBoundingClientRect();
  const box = tip.getBoundingClientRect();

  // Below by default; flip above when the bottom of the viewport is close.
  const below = rect.bottom + GAP;
  const flip = below + box.height > window.innerHeight - GUTTER && rect.top - GAP - box.height > GUTTER;
  const top = flip ? rect.top - GAP - box.height : below;

  // Centred on the trigger, then clamped so the box stays fully on screen.
  const wanted = rect.left + rect.width / 2 - box.width / 2;
  const maxLeft = window.innerWidth - GUTTER - box.width;
  const left = Math.max(GUTTER, Math.min(wanted, Math.max(GUTTER, maxLeft)));

  tip.style.top = `${Math.round(top)}px`;
  tip.style.left = `${Math.round(left)}px`;
  tip.dataset.flip = String(flip);
}

function show(target) {
  const text = target.dataset.tip;
  if (!text) return;
  ensureTip();
  hide(); // any previous anchor loses its aria-describedby first

  // An open <dialog> lives in the top layer, above every z-index on the page — a
  // tooltip parented to <body> would be drawn behind the modal. Move it into the
  // dialog instead; position:fixed still resolves against the viewport there.
  const host = target.closest("dialog[open]") || document.body;
  if (tip.parentNode !== host) host.append(tip);

  tip.textContent = text;
  tip.hidden = false;
  anchor = target;
  target.setAttribute("aria-describedby", "app-tip");
  place(target); // after unhiding — a hidden element measures 0×0
}

function hide() {
  clearTimeout(timer);
  timer = null;
  if (anchor) {
    anchor.removeAttribute("aria-describedby");
    anchor = null;
  }
  if (tip) tip.hidden = true;
}

const trigger = (node) =>
  node instanceof Element ? node.closest("[data-tip]") : null;

export function initTooltips() {
  ensureTip();

  document.addEventListener("pointerover", (e) => {
    // Touch has no hover: a tap would show a box the user then has to dismiss. The
    // on-page cause key and the remote-section notes carry the same copy for them.
    if (e.pointerType !== "mouse") return;
    const target = trigger(e.target);
    if (!target || target === anchor) return;
    clearTimeout(timer);
    timer = setTimeout(() => show(target), SHOW_DELAY);
  });

  document.addEventListener("pointerout", (e) => {
    if (e.pointerType !== "mouse") return;
    const target = trigger(e.target);
    // Moving within the same trigger (e.g. onto its dot) isn't leaving it.
    if (target && target === trigger(e.relatedTarget)) return;
    if (target) hide();
  });

  // Keyboard users have already committed by focusing — no delay, and no way for them
  // to reach the copy otherwise.
  document.addEventListener("focusin", (e) => {
    const target = trigger(e.target);
    if (target) show(target);
    else hide();
  });
  document.addEventListener("focusout", hide);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hide();
  });
  // Clicking a chip re-renders the row, orphaning the anchor; scrolling moves it away
  // from the box, which is positioned in viewport coordinates.
  document.addEventListener("click", hide);
  window.addEventListener("scroll", hide, { passive: true });
  window.addEventListener("resize", hide);
}
