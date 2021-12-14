import * as Accordian from "@radix-ui/react-accordion";
import { styled, keyframes } from "~/stitches.config";
import { BsChevronDown } from "react-icons/bs";

const slideDown = keyframes({
  from: { height: 0 },
  to: { height: "var(--radix-accordion-content-height)" },
});

const slideUp = keyframes({
  from: { height: "var(--radix-accordion-content-height)" },
  to: { height: 0 },
});

export const Root = styled(Accordian.Root, {});

export const Item = styled(Accordian.Item, {});

export const Header = styled(Accordian.Header, {});

export const Trigger = styled(Accordian.Trigger, {
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  background: "$loContrast",
  color: "$gray12",
  border: 0,
  padding: "$md",
  width: "100%",
  fontFamily: "$sans",
  cursor: "pointer",
  textAlign: "center",
  justifyContent: "space-between",
});

export const Content = styled(Accordian.Content, {
  overflow: "hidden",
  '&[data-state="open"]': {
    animation: `${slideDown} 300ms`,
  },
  '&[data-state="closed"]': {
    animation: `${slideUp} 300ms`,
  },
});

export const Icon = styled(BsChevronDown, {
  transition: "transform 300ms",
  "[data-state=open] &": { transform: "rotate(180deg)" },
});