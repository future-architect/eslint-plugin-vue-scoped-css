import type { AST } from "../../../types";
import {
  isTransitionElement,
  isTransitionGroupElement,
} from "../../../utils/templates";

/**
 * Checks whether the given element is the root element.
 * @param {VElement} element the element to check
 * @returns {boolean} `true` if the given element is the root element.
 */
export function isRootElement(
  element: AST.VElement | AST.VDocumentFragment,
): element is AST.VElement & {
  parent: AST.VDocumentFragment;
} {
  return element.type === "VElement" && isRootTemplate(element.parent);
}

/**
 * Checks whether the given element is the root `<template>` element.
 * @param {VElement} element the element to check
 * @returns {boolean} `true` if the given element is the root `<template>` element.
 */
function isRootTemplate(
  element: AST.VElement | AST.VDocumentFragment,
): element is AST.VElement & {
  name: "template";
  parent: AST.VDocumentFragment;
} {
  return (
    element.type === "VElement" &&
    element.name === "template" &&
    element.parent.type === "VDocumentFragment"
  );
}

/**
 * Checks whether the given element is the skip element.
 * @param {VElement} element the element to check
 * @returns {boolean} `true` if the given element is the skip element.
 */
export function isSkipElement(
  element: AST.VElement | AST.VDocumentFragment,
): boolean {
  return (
    element.type === "VElement" &&
    (element.name === "template" || isTransitionElement(element))
  );
}

/**
 * Checks whether the given element is the slot element.
 * @param {VElement} element the element to check
 * @returns {boolean} `true` if the given element is the slot element.
 */
export function isSlotElement(
  element: AST.VElement | AST.VDocumentFragment,
): element is AST.VElement & { name: "slot" } {
  return element.type === "VElement" && element.name === "slot";
}

/**
 * Gets the wrapper `<transition>` or `<transition-group>` element from the given element.
 * @param {VElement} element the element
 * @returns {VElement} the wrapper `<transition>` element.
 */
export function getWrapperTransition(
  element: AST.VElement,
): AST.VElement | null {
  let parent: AST.VElement | AST.VDocumentFragment | null = element.parent;
  while (parent.type === "VElement") {
    if (isTransitionElement(parent) || isTransitionGroupElement(parent)) {
      return parent;
    }
    if (!isSlotElement(parent) && !isSkipElement(parent)) {
      return null;
    }
    parent = parent.parent;
  }
  return null;
}

/**
 * Checks whether the given element is wrapped in the `<transition>` or `<transition-group>`.
 * @param {VElement} element the element to check
 * @returns {VElement} `true` the given element is wrapped in the `<transition>` or `<transition-group>`.
 */
export function isElementWrappedInTransition(element: AST.VElement): boolean {
  return Boolean(getWrapperTransition(element));
}

/**
 * Gets the parent element from the given element.
 * @param {VElement} element the element
 * @returns {VElement} the parent element.
 */
export function getParentElement(element: AST.VElement): AST.VElement | null {
  if (isRootElement(element)) {
    return null;
  }
  let parent: AST.VElement | AST.VDocumentFragment | null = element.parent;
  while (parent && (isSkipElement(parent) || isSlotElement(parent))) {
    if (isRootElement(parent)) {
      return null;
    }
    parent = parent.parent;
  }
  return parent?.type === "VElement" ? parent : null;
}
