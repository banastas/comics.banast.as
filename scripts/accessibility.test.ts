import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const sourceFiles: string[] = [];
const collectTsxFiles = (directory: string) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) collectTsxFiles(entryPath);
    else if (entry.name.endsWith('.tsx') && !entry.name.endsWith('.test.tsx')) sourceFiles.push(entryPath);
  }
};
collectTsxFiles('src');

type JsxOpening = ts.JsxOpeningElement | ts.JsxSelfClosingElement;

const attributesFor = (node: JsxOpening) => (
  node.attributes.properties.filter(ts.isJsxAttribute)
);

const attributeNamed = (node: JsxOpening, name: string) => (
  attributesFor(node).find((attribute) => attribute.name.getText() === name)
);

const hasAttribute = (node: JsxOpening, name: string) => Boolean(attributeNamed(node, name));

const stringAttributeValue = (node: JsxOpening, name: string) => {
  const attribute = attributeNamed(node, name);
  return attribute?.initializer && ts.isStringLiteral(attribute.initializer)
    ? attribute.initializer.text
    : undefined;
};

const openingElementFor = (node: ts.Node): JsxOpening | undefined => {
  if (ts.isJsxElement(node)) return node.openingElement;
  if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) return node;
  return undefined;
};

const hasAncestorLabel = (node: ts.Node) => {
  let parent = node.parent;
  while (parent) {
    if (ts.isJsxElement(parent) && parent.openingElement.tagName.getText() === 'label') return true;
    parent = parent.parent;
  }
  return false;
};

const hasInteractiveAncestor = (node: ts.Node) => {
  let parent = node.parent;
  if (ts.isJsxElement(parent) && parent.openingElement === node) parent = parent.parent;
  while (parent) {
    const opening = openingElementFor(parent);
    if (opening && (
      ['a', 'button'].includes(opening.tagName.getText()) ||
      attributeNamed(opening, 'role')?.getText().includes('button')
    )) return true;
    parent = parent.parent;
  }
  return false;
};

const buttonHasContentName = (element: ts.JsxElement) => {
  let hasName = false;
  const visit = (node: ts.Node) => {
    if (ts.isJsxText(node) && node.getText().trim()) hasName = true;
    if (ts.isJsxExpression(node) && node.expression &&
      !ts.isJsxElement(node.expression) &&
      !ts.isJsxSelfClosingElement(node.expression) &&
      !ts.isJsxFragment(node.expression)) {
      hasName = true;
    }
    ts.forEachChild(node, visit);
  };
  element.children.forEach(visit);
  return hasName;
};

describe('source accessibility contracts', () => {
  it('keeps interactive JSX keyboard-accessible and form/media controls named', () => {
    const violations: string[] = [];

    for (const file of sourceFiles) {
      const source = fs.readFileSync(file, 'utf8');
      const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      const labelledIds = new Set<string>();

      const collectLabels = (node: ts.Node) => {
        const opening = openingElementFor(node);
        if (opening?.tagName.getText() === 'label') {
          const htmlFor = stringAttributeValue(opening, 'htmlFor');
          if (htmlFor) labelledIds.add(htmlFor);
        }
        ts.forEachChild(node, collectLabels);
      };
      collectLabels(sourceFile);

      const record = (node: ts.Node, message: string) => {
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
        violations.push(`${file}:${line + 1} ${message}`);
      };

      const inspect = (node: ts.Node) => {
        const opening = ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node) ? node : undefined;
        if (opening) {
          const tag = opening.tagName.getText();
          const role = attributeNamed(opening, 'role')?.getText() || '';

          if (/^[a-z]/.test(tag) && hasAttribute(opening, 'onClick') &&
            !['a', 'button', 'input', 'select', 'textarea'].includes(tag) &&
            !role.includes('button') && !hasInteractiveAncestor(node) &&
            !attributeNamed(opening, 'aria-hidden')?.getText().includes('true')) {
            record(node, `<${tag}> has onClick without button semantics`);
          }

          if (role.includes('button') && (!hasAttribute(opening, 'tabIndex') || !hasAttribute(opening, 'onKeyDown'))) {
            record(node, 'role="button" requires tabIndex and onKeyDown');
          }

          if ((tag === 'button' || tag === 'a' || role.includes('button')) && hasInteractiveAncestor(node)) {
            record(node, 'interactive controls must not be nested');
          }

          if (['input', 'select', 'textarea'].includes(tag)) {
            const id = stringAttributeValue(opening, 'id');
            const named = hasAttribute(opening, 'aria-label') || hasAttribute(opening, 'aria-labelledby') ||
              hasAncestorLabel(node) || Boolean(id && labelledIds.has(id));
            if (!named) record(node, `<${tag}> has no associated label`);
          }

          if (tag === 'img' && !hasAttribute(opening, 'alt')) {
            record(node, '<img> requires alt text (empty is valid for decorative images)');
          }
        }

        if (ts.isJsxElement(node) && node.openingElement.tagName.getText() === 'button') {
          const named = hasAttribute(node.openingElement, 'aria-label') ||
            hasAttribute(node.openingElement, 'aria-labelledby') || buttonHasContentName(node);
          if (!named) record(node, '<button> has no accessible name');
        }

        ts.forEachChild(node, inspect);
      };
      inspect(sourceFile);
    }

    expect(violations).toEqual([]);
  });
});
