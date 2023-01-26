import {
  isTypeSelector,
  isIDSelector,
  isClassSelector,
  isUniversalSelector,
  isSelectorCombinator,
  isDescendantCombinator,
  isChildCombinator,
  isAdjacentSiblingCombinator,
  isGeneralSiblingCombinator,
  isDeepCombinator,
  isVDeepPseudo,
  isVSlottedPseudo,
  isVGlobalPseudo,
  normalizePseudoParams,
} from "../../utils/selectors";
import {
  getParentElement,
  isSkipElement,
  isElementWrappedInTransition,
  getWrapperTransition,
  isRootElement,
  isSlotElement,
} from "./elements";
import type {
  VCSSSelectorNode,
  VCSSSelector,
  VCSSSelectorValueNode,
} from "../../ast";
import type { AST, RuleContext, ASTNode } from "../../../types";
import type { ParsedQueryOptions } from "../../../options";
import { getAttributeValueNodes } from "./attribute-tracker";
import type { ValidStyleContext } from "../../context";
import { getVueComponentContext, getStyleContexts } from "../../context";
import { getStringFromNode } from "../../utils/nodes";
import { Template } from "../../template";
import { isVElement, isTransitionElement } from "../../../utils/templates";
import { isValidStyleContext } from "../../context/style";
import type { ReferenceExpressions } from "./reference-expression";
import { getReferenceExpressions } from "./reference-expression";

const TRANSITION_CLASS_BASES = [
  "enter",
  "enter-from",
  "enter-active",
  "enter-to",
  "leave",
  "leave-from",
  "leave-active",
  "leave-to",
];
const TRANSITION_GROUP_CLASS_BASES = [...TRANSITION_CLASS_BASES, "move"];

/**
 * Context to execute the query and retrieve the target elements.
 */
export class QueryContext {
  public elements: AST.VElement[] = [];

  protected readonly document: VueDocumentQueryContext;

  protected constructor(document?: VueDocumentQueryContext) {
    this.document = document || (this as never);
  }

  /**
   * Execute a one-step query and return contexts of the matched elements.
   * @param {Node} selectorNode selector node
   * @returns {ElementsQueryContext} elements
   */
  public queryStep(selectorNode: VCSSSelectorNode): ElementsQueryContext {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define -- ignore
    return new ElementsQueryContext(
      queryStep(this.elements, selectorNode, this.document),
      this.document
    );
  }

  /**
   * Execute a one-step query in the reverse direction and return contexts of the matched elements.
   * @param {Node} selectorNode selector node
   * @returns {ElementsQueryContext} elements
   */
  public reverseQueryStep(
    selectorNode: VCSSSelectorNode
  ): ElementsQueryContext {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define -- ignore
    return new ElementsQueryContext(
      reverseQueryStep(this.elements, selectorNode, this.document),
      this.document
    );
  }

  /**
   * Filter elements
   * @param {function} predicate filter function.
   * @returns {ElementsQueryContext} elements
   */
  public filter<S extends AST.VElement>(
    predicate: (value: AST.VElement) => value is S
  ): ElementsQueryContext {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define -- ignore
    return new ElementsQueryContext(
      this.elements.filter(predicate),
      this.document
    );
  }

  /**
   * Split elements
   * @returns {ElementsQueryContext[]} element contexts
   */
  public split(): ElementsQueryContext[] {
    return this.elements.map(
      // eslint-disable-next-line @typescript-eslint/no-use-before-define -- ignore
      (e) => new ElementsQueryContext([e], this.document)
    );
  }
}

/**
 * QueryContext that as the Vue document.
 */
class VueDocumentQueryContext extends QueryContext {
  public context: RuleContext;

  public options: ParsedQueryOptions;

  public docsModifiers: string[];

  public constructor(context: RuleContext, options: ParsedQueryOptions) {
    super();
    const sourceCode = context.getSourceCode();
    const { ast } = sourceCode;
    this.elements = ast.templateBody
      ? [...genDescendantElements([ast.templateBody])]
      : [];
    this.context = context;
    this.options = options;

    if (options.captureClassesFromDoc.length > 0) {
      this.docsModifiers = getStyleContexts(context)
        .filter(isValidStyleContext)
        .filter((style) => style.scoped)
        .map((style) =>
          extractClassesFromDoc(style, options.captureClassesFromDoc)
        )
        .reduce((r, a) => r.concat(a), []);
    } else {
      this.docsModifiers = [];
    }
  }
}

/**
 * Extract class names documented in the comment.
 */
function extractClassesFromDoc(
  style: ValidStyleContext,
  captureClassesFromDoc: RegExp[]
): string[] {
  const results = new Set<string>();
  for (const comment of style.cssNode.comments) {
    for (const regexp of captureClassesFromDoc) {
      // Get all captures
      regexp.lastIndex = 0;
      let re;
      while ((re = regexp.exec(comment.text))) {
        if (re.length > 1) {
          for (const s of re.slice(1)) {
            results.add(s);
          }
        } else {
          results.add(re[0]);
        }
      }
    }
  }
  return [...results];
}

/**
 * QueryContext as elements.
 */
class ElementsQueryContext extends QueryContext {
  public constructor(
    elements: AST.VElement[] | IterableIterator<AST.VElement>,
    document: VueDocumentQueryContext
  ) {
    super(document);
    this.elements = [...elements];
  }
}

/**
 * Create Vue document context for query search
 * @param {RuleContext} context ESLint rule context
 * @param {object} options query options
 * @returns {VueDocumentQueryContext} the context
 */
export function createQueryContext(
  context: RuleContext,
  options: ParsedQueryOptions
): QueryContext {
  return new VueDocumentQueryContext(context, options);
}

/**
 * Get the next step nodes of the given query.
 * @param {VElement} elements the elements
 * @param {object} selectorNode selector node of query
 * @param {object} document document
 */
function* queryStep(
  elements: AST.VElement[],
  selectorNode: VCSSSelectorNode,
  document: VueDocumentQueryContext
): IterableIterator<AST.VElement> {
  if (isSelectorCombinator(selectorNode)) {
    if (isChildCombinator(selectorNode)) {
      yield* genChildElements(elements);
      return;
    } else if (
      isDescendantCombinator(selectorNode) ||
      isDeepCombinator(selectorNode)
    ) {
      yield* genDescendantElements(elements);
      return;
    } else if (isAdjacentSiblingCombinator(selectorNode)) {
      yield* genAdjacentSiblingElements(elements);
      return;
    } else if (isGeneralSiblingCombinator(selectorNode)) {
      yield* genGeneralSiblingElements(elements);
      return;
    }
  } else if (isVDeepPseudo(selectorNode)) {
    yield* genVDeepElements(
      elements,
      normalizePseudoParams(selectorNode, selectorNode.nodes),
      query
    );
    return;
  } else if (isVSlottedPseudo(selectorNode)) {
    yield* genVSlottedElements(
      elements,
      normalizePseudoParams(selectorNode, selectorNode.nodes),
      query
    );
    return;
  } else if (isVGlobalPseudo(selectorNode)) {
    yield* genVGlobalElements(
      elements,
      normalizePseudoParams(selectorNode, selectorNode.nodes),
      document,
      query
    );
    return;
  }

  if (isTypeSelector(selectorNode)) {
    yield* genElementsByTagName(elements, Template.ofSelector(selectorNode));
    return;
  } else if (isIDSelector(selectorNode)) {
    yield* genElementsById(
      elements,
      Template.ofSelector(selectorNode),
      document
    );
    return;
  } else if (isClassSelector(selectorNode)) {
    yield* genElementsByClassName(
      elements,
      Template.ofSelector(selectorNode),
      document
    );
    return;
  } else if (isUniversalSelector(selectorNode)) {
    yield* elements;
    return;
  }
  // Other selectors are ignored because they are likely to be changed dynamically.
  yield* elements;

  /**
   * Query for ::v-xxx pseudo
   */
  function query(
    els: AST.VElement[],
    selList: VCSSSelectorValueNode[]
  ): AST.VElement[] {
    return selList.reduce(
      (res: AST.VElement[], sel: VCSSSelectorValueNode): AST.VElement[] => [
        ...queryStep(res, sel, document),
      ],
      els
    );
  }
}

/**
 * Get the next step nodes of the given reverse query.
 * @param {VElement} elements the elements
 * @param {object} selectorNode selector node of query
 * @param {object} document document
 */
function* reverseQueryStep(
  elements: AST.VElement[],
  selectorNode: VCSSSelectorNode,
  document: VueDocumentQueryContext
): IterableIterator<AST.VElement> {
  if (isSelectorCombinator(selectorNode)) {
    if (isChildCombinator(selectorNode)) {
      yield* genParentElements(elements);
      return;
    } else if (
      isDescendantCombinator(selectorNode) ||
      isDeepCombinator(selectorNode)
    ) {
      yield* genAncestorElements(elements);
      return;
    } else if (isAdjacentSiblingCombinator(selectorNode)) {
      yield* genPrevAdjacentSiblingElements(elements);
      return;
    } else if (isGeneralSiblingCombinator(selectorNode)) {
      yield* genPrevGeneralSiblingElements(elements);
      return;
    }
  } else if (isVDeepPseudo(selectorNode)) {
    yield* genVDeepElements(
      elements,
      normalizePseudoParams(selectorNode, selectorNode.nodes),
      query
    );
    return;
  } else if (isVSlottedPseudo(selectorNode)) {
    yield* genVSlottedElements(
      elements,
      normalizePseudoParams(selectorNode, selectorNode.nodes),
      query
    );
    return;
  } else if (isVGlobalPseudo(selectorNode)) {
    yield* genVGlobalElements(
      elements,
      normalizePseudoParams(selectorNode, selectorNode.nodes),
      document,
      query
    );
    return;
  }
  yield* queryStep(elements, selectorNode, document);

  /**
   * Query for ::v-xxx pseudo
   */
  function query(
    els: AST.VElement[],
    selList: VCSSSelectorValueNode[]
  ): AST.VElement[] {
    return selList.reduceRight(
      (res: AST.VElement[], sel: VCSSSelectorValueNode): AST.VElement[] => [
        ...reverseQueryStep(res, sel, document),
      ],
      els
    );
  }
}

/**
 * Get the descendant elements.
 */
function* genDescendantElements(
  elements: AST.VElement[]
): IterableIterator<AST.VElement> {
  const found = new Set<AST.VElement>();
  for (const e of genChildElements(elements)) {
    if (!found.has(e)) {
      yield e;
      found.add(e);
      for (const p of genDescendantElements([e])) {
        if (!found.has(p)) {
          yield p;
          found.add(p);
        }
      }
    }
  }
}

/**
 * Get the ancestor elements.
 */
function* genAncestorElements(
  elements: AST.VElement[]
): IterableIterator<AST.VElement> {
  const found = new Set<AST.VElement>();
  for (const e of genParentElements(elements)) {
    yield e;
    found.add(e);
    for (const a of genAncestorElements([e])) {
      if (!found.has(a)) {
        yield a;
        found.add(a);
      }
    }
  }
}

/**
 * Get the child elements.
 */
function* genChildElements(
  elements: AST.VElement[]
): IterableIterator<AST.VElement> {
  /**
   * Get the child elements.
   */
  function* genChildren(elm: AST.VElement): IterableIterator<AST.VElement> {
    for (const e of elm.children.filter(isVElement)) {
      if (isSkipElement(e)) {
        yield* genChildren(e);
      } else if (isSlotElement(e)) {
        yield e;
        yield* genChildren(e);
      } else {
        yield e;
      }
    }
  }

  for (const element of elements) {
    if (isSlotElement(element)) {
      continue;
    }
    yield* genChildren(element);
  }
}

/**
 * Get the parent elements.
 */
function genParentElements(
  elements: AST.VElement[]
): IterableIterator<AST.VElement> {
  return iterateUnique(function* () {
    for (const element of elements) {
      yield getParentElement(element);
    }
  });
}

/**
 * Get the adjacent sibling elements.
 */
function genAdjacentSiblingElements(
  elements: AST.VElement[]
): IterableIterator<AST.VElement> {
  return iterateUnique(function* () {
    for (const element of elements) {
      if (hasVFor(element)) {
        yield element;
      }
      const vForTemplate = getVForTemplate(element);
      if (vForTemplate) {
        const children = [...genChildElements([vForTemplate])];
        const index = children.indexOf(element);
        yield children[index + 1] || children[0];
      }
      const parent = getParentElement(element);
      if (parent) {
        const children = [...genChildElements([parent])];
        const index = children.indexOf(element);
        yield children[index + 1];
      }
    }
  });
}

/**
 * Gets the previous adjacent sibling elements.
 */
function genPrevAdjacentSiblingElements(
  elements: AST.VElement[]
): IterableIterator<AST.VElement> {
  return iterateUnique(function* () {
    for (const element of elements) {
      if (hasVFor(element)) {
        yield element;
      }
      const vForTemplate = getVForTemplate(element);
      if (vForTemplate) {
        const children = [...genChildElements([vForTemplate])];
        const index = children.indexOf(element);
        yield children[index - 1] || children[children.length - 1];
      }
      const parent = getParentElement(element);
      if (parent) {
        const children = [...genChildElements([parent])];
        const index = children.indexOf(element);
        yield children[index - 1];
      }
    }
  });
}

/**
 * Gets the general sibling elements.
 */
function genGeneralSiblingElements(
  elements: AST.VElement[]
): IterableIterator<AST.VElement> {
  return iterateUnique(function* () {
    for (const element of elements) {
      if (hasVFor(element)) {
        yield element;
      }
      const vForTemplate = getVForTemplate(element);
      if (vForTemplate) {
        yield* genChildElements([vForTemplate]);
      }
      const parent = getParentElement(element);
      if (parent) {
        const children = [...genChildElements([parent])];
        const index = children.indexOf(element);
        yield* children.slice(index + 1);
      }
    }
  });
}

/**
 * Gets the previous general sibling elements.
 */
function genPrevGeneralSiblingElements(
  elements: AST.VElement[]
): IterableIterator<AST.VElement> {
  return iterateUnique(function* () {
    for (const element of elements) {
      if (hasVFor(element)) {
        yield element;
      }
      const vForTemplate = getVForTemplate(element);
      if (vForTemplate) {
        yield* genChildElements([vForTemplate]);
      }
      const parent = getParentElement(element);
      if (parent) {
        const children = [...genChildElements([parent])];
        const index = children.indexOf(element);
        yield* children.slice(0, index);
      }
    }
  });
}

/**
 * Gets the v-deep elements
 */
function* genVDeepElements(
  elements: AST.VElement[],
  params: VCSSSelector[],
  query: (
    els: AST.VElement[],
    selList: VCSSSelectorValueNode[]
  ) => AST.VElement[]
): IterableIterator<AST.VElement> {
  if (params.length) {
    yield* iterateUnique(function* () {
      for (const node of params) {
        yield* query(elements, node.nodes);
      }
    });
  } else {
    yield* elements;
  }
}

/**
 * Gets the v-slotted elements
 */
function genVSlottedElements(
  elements: AST.VElement[],
  params: VCSSSelector[],
  query: (
    els: AST.VElement[],
    selList: VCSSSelectorValueNode[]
  ) => AST.VElement[]
): IterableIterator<AST.VElement> {
  return iterateUnique(function* () {
    for (const element of elements) {
      if (isSlotElement(element)) {
        yield element;
      }
    }

    for (const node of params) {
      const els = query(elements, node.nodes);
      for (const e of els) {
        if (inSlot(e)) {
          yield e;
        }
      }
    }
  });

  /**
   * Checks if givin element within slot
   */
  function inSlot(e: AST.VElement | AST.VDocumentFragment): boolean {
    if (isSlotElement(e)) {
      return true;
    }
    return Boolean(e && e.parent && inSlot(e.parent));
  }
}

/**
 * Gets the v-global elements
 */
function genVGlobalElements(
  _elements: AST.VElement[],
  params: VCSSSelector[],
  document: VueDocumentQueryContext,
  query: (
    els: AST.VElement[],
    selList: VCSSSelectorValueNode[]
  ) => AST.VElement[]
): IterableIterator<AST.VElement> {
  return iterateUnique(function* () {
    for (const node of params) {
      yield* query(document.elements, node.nodes);
    }
  });
}

/**
 * Gets the elements with the given tag name.
 */
function* genElementsByTagName(
  elements: AST.VElement[],
  tagName: Template
): IterableIterator<AST.VElement> {
  for (const element of elements) {
    if (element.name === "component" || element.name === "slot") {
      // The `component` tag is considered to match all elements because the element can not be identified.
      yield element;
    } else if (tagName.toLowerCase().matchString(element.name)) {
      yield element;
    }
  }
}

/**
 * Gets the elements with the given id.
 */
function* genElementsById(
  elements: AST.VElement[],
  id: Template,
  document: VueDocumentQueryContext
): IterableIterator<AST.VElement> {
  for (const element of elements) {
    if (matchId(element, id, document)) {
      yield element;
    }
  }
}

/**
 * Gets the elements with the given class name.
 */
function* genElementsByClassName(
  elements: AST.VElement[],
  className: Template,
  document: VueDocumentQueryContext
): IterableIterator<AST.VElement> {
  let removeModifierClassName = null;

  // ignoreBEMModifier option
  if (document.options.ignoreBEMModifier) {
    if (className.hasString("--")) {
      const list = className.divide("--");
      list.pop();
      if (list.length) {
        removeModifierClassName = list.reduce((r, a) => r.concat(a));
      }
    }
  }

  // captureClassesFromDoc option
  for (const docMod of document.docsModifiers) {
    if (docMod.startsWith(":")) {
      continue;
    }
    const modClassName: string = docMod.startsWith(".")
      ? docMod.slice(1)
      : docMod;
    if (className.matchString(modClassName)) {
      // If the class name is documented, it is considered to match all elements.
      yield* elements;
      return;
    } else if (removeModifierClassName) {
      if (removeModifierClassName.matchString(modClassName)) {
        // If the class name is documented, it is considered to match all elements.
        yield* elements;
        return;
      }
    }
  }

  for (const element of elements) {
    if (matchClassName(element, className, document)) {
      yield element;
    } else if (
      removeModifierClassName &&
      matchClassName(element, removeModifierClassName, document)
    ) {
      yield element;
    }
  }
}

/**
 * Checks whether the given element matches the given ID.
 */
function matchId(
  element: AST.VElement,
  id: Template,
  document: VueDocumentQueryContext
): boolean {
  const nodes = getAttributeValueNodes(element, "id", document.context);
  if (nodes == null) {
    return true;
  }
  for (const node of nodes) {
    const value = Template.ofNode(node);
    if (value == null) {
      // Are identified by complex expressions.
      return true;
    }
    if (value.match(id)) {
      return true;
    }
  }
  return false;
}

/**
 * Checks whether the given element matches the given class name.
 */
function matchClassName(
  element: AST.VElement,
  className: Template,
  document: VueDocumentQueryContext
): boolean {
  if (isElementWrappedInTransition(element)) {
    const transition = getWrapperTransition(element);
    if (
      transition != null &&
      matchTransitionClassName(transition, className, document)
    ) {
      return true;
    }
  }
  const nodes = getAttributeValueNodes(element, "class", document.context);
  if (nodes == null) {
    return true;
  }
  for (const node of nodes) {
    if (node.type === "VLiteral") {
      if (includesClassName(node.value, className)) {
        return true;
      }
    } else if (matchClassNameExpression(node, className, document)) {
      return true;
    }
  }

  const refNames = getRefNames(element, document);
  const vueComponent = getVueComponentContext(document.context);
  if (
    vueComponent &&
    vueComponent
      .getClassesOperatedByClassList(refNames, isRootElement(element))
      .filter(
        ((n) => n.type === "Literal") as (n: ASTNode) => n is AST.ESLintLiteral
      )
      .some((n) => matchClassNameExpression(n, className, document))
  ) {
    return true;
  }

  return false;
}

/**
 * Gets the ref name.
 */
function getRefNames(
  element: AST.VElement,
  document: VueDocumentQueryContext
): Template[] | null {
  const refNameNodes = getAttributeValueNodes(element, "ref", document.context);
  if (refNameNodes == null) {
    return null;
  }
  const refNames = [];
  for (const refNameNode of refNameNodes) {
    const refName = Template.ofNode(refNameNode);
    if (refName == null) {
      // The ref name cannot be identified.
      return null;
    }
    refNames.push(refName);
  }

  return refNames;
}

/**
 * Check whether the given class name matches the `<transition>` element.
 */
function matchTransitionClassName(
  element: AST.VElement,
  className: Template,
  document: VueDocumentQueryContext
): boolean {
  const classBases = isTransitionElement(element)
    ? TRANSITION_CLASS_BASES
    : TRANSITION_GROUP_CLASS_BASES;
  const nameNodes = getAttributeValueNodes(element, "name", document.context);

  for (const classBase of classBases) {
    const classNameNodes = getAttributeValueNodes(
      element,
      `${classBase}-class`,
      document.context
    );
    if (classNameNodes == null) {
      // Unknown attribute are found
      // So the class is considered a match.
      return true;
    }
    if (classNameNodes.length) {
      for (const classNameNode of classNameNodes) {
        const value = Template.ofNode(classNameNode);
        if (value == null) {
          // Are identified by complex expressions.
          return true;
        }
        if (value.match(className)) {
          return true;
        }
      }
    } else if (nameNodes == null) {
      if (className.endsWith(`-${classBase}`)) {
        return true;
      }
    } else if (nameNodes.length === 0) {
      if (className.matchString(`v-${classBase}`)) {
        return true;
      }
    } else {
      for (const nameNode of nameNodes) {
        const name = Template.ofNode(nameNode);
        if (name == null) {
          // Are identified by complex expressions.
          return true;
        }
        if (className.match(name.concat(`-${classBase}`))) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Check whether the given class name matches the expression node.
 */
function matchClassNameExpression(
  expression: ReferenceExpressions,
  className: Template,
  document: VueDocumentQueryContext
): boolean {
  const literal = Template.ofNode(expression);
  if (literal != null) {
    if (includesClassName(literal, className)) {
      return true;
    }
  } else if (expression.type === "Identifier") {
    const string = getStringFromNode(expression, document.context);
    if (string == null) {
      // Class names are identified by complex expressions.
      // So the class is considered a match.
      return true;
    }
    if (includesClassName(string, className)) {
      return true;
    }
  } else if (expression.type === "ArrayExpression") {
    if (matchClassNameForArrayExpression(expression, className, document)) {
      return true;
    }
  } else if (expression.type === "ObjectExpression") {
    if (matchClassNameForObjectExpression(expression, className, document)) {
      return true;
    }
  } else {
    // Class names are identified by complex expressions.
    // So the class is considered a match.
    return true;
  }

  return false;
}

/**
 * Check whether the given class name matches the array expression node.
 */
function matchClassNameForArrayExpression(
  expression: AST.ESLintArrayExpression,
  className: Template,
  document: VueDocumentQueryContext
): boolean {
  for (const e of expression.elements) {
    if (e.type === "SpreadElement") {
      if (matchClassNameExpression(e.argument, className, document)) {
        return true;
      }
    } else {
      const expressions = getReferenceExpressions(e, document.context);
      if (expressions) {
        for (const e2 of expressions) {
          if (matchClassNameExpression(e2, className, document)) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

/**
 * Check whether the given class name matches the object expression node.
 */
function matchClassNameForObjectExpression(
  expression: AST.ESLintObjectExpression,
  className: Template,
  document: VueDocumentQueryContext
): boolean {
  for (const prop of expression.properties) {
    if (prop.type !== "Property") {
      // Can not identify the key name.
      // So the class is considered a match.
      return true;
    }
    if (prop.computed) {
      // { [key]: value }
      if (
        prop.key.type === "Identifier" ||
        prop.key.type === "Literal" ||
        prop.key.type === "TemplateLiteral" ||
        prop.key.type === "BinaryExpression"
      ) {
        if (matchClassNameExpression(prop.key, className, document)) {
          return true;
        }
      } else {
        // Can not identify the key name.
        // So the class is considered a match.
        return true;
      }
    } else {
      if (prop.key.type === "Identifier") {
        // { key: value }
        if (includesClassName(prop.key.name, className)) {
          return true;
        }
      } else if (prop.key.type === "Literal") {
        // { 'key': value }
        if (includesClassName(`${prop.key.value}`, className)) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Checks if the given className is included in the class definition
 */
function includesClassName(
  value: string | Template,
  className: Template
): boolean {
  if (typeof value === "string") {
    return value.split(/\s+/u).some((s) => className.matchString(s));
  }
  return value.divide(/\s+/u).some((s) => className.match(s));
}

/**
 * Iterate unique items
 */
function* iterateUnique<T>(
  gen: () => IterableIterator<T | null>
): IterableIterator<T> {
  const found = new Set<T>();
  for (const e of gen()) {
    if (e != null && !found.has(e)) {
      yield e;
      found.add(e);
    }
  }
}

/**
 * Checks if givin element has v-for
 */
function hasVFor(element: AST.VElement) {
  return element.startTag.attributes.some(
    (attr) => attr.directive && attr.key.name.name === "for"
  );
}

/**
 * Get the <template v-for> from givin element within
 */
function getVForTemplate(element: AST.VElement) {
  let parent = element.parent;
  while (parent) {
    if (parent.type !== "VElement" || parent.name !== "template") {
      return null;
    }
    if (hasVFor(parent)) {
      return parent;
    }
    parent = parent.parent;
  }
  return null;
}
