import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const componentPaths = [
  '../src/components/teacher/ClassModal.tsx',
  '../src/components/teacher/StudentModal.tsx',
  '../src/components/teacher/RecordSessionModal.tsx',
];

function jsxAttributes(node) {
  return new Map(node.attributes.properties
    .filter(ts.isJsxAttribute)
    .map(attribute => [attribute.name.getText(), attribute]));
}

function attributeExpression(attribute) {
  if (!attribute?.initializer) return null;
  if (ts.isStringLiteral(attribute.initializer)) return attribute.initializer;
  if (ts.isJsxExpression(attribute.initializer)) return attribute.initializer.expression;
  return null;
}

function expressionKey(expression) {
  if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
    return `literal:${expression.text}`;
  }
  if (ts.isIdentifier(expression)) return `identifier:${expression.text}`;
  if (ts.isTemplateExpression(expression)) {
    return `template:${expression.head.text}${expression.templateSpans.map(span => `\u0000${expressionKey(span.expression)}${span.literal.text}`).join('')}`;
  }
  return `source:${expression.getText()}`;
}

function collectJsx(sourceFile) {
  const elements = [];
  const visit = node => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      elements.push({ tag: node.tagName.getText(), attributes: jsxAttributes(node), node });
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return elements;
}

function resolveDescriptionExpression(expression) {
  if (ts.isConditionalExpression(expression)) {
    return expressionKey(expression.whenTrue);
  }
  return expressionKey(expression);
}

for (const componentPath of componentPaths) {
  test(`${componentPath.split('/').at(-1)} form labels and descriptions reference unique IDs`, () => {
    const sourceText = readFileSync(new URL(componentPath, import.meta.url), 'utf8');
    const sourceFile = ts.createSourceFile(componentPath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const elements = collectJsx(sourceFile);
    const idElements = elements.filter(element => element.attributes.has('id'));
    const ids = idElements.map(element => expressionKey(attributeExpression(element.attributes.get('id'))));
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);

    assert.deepEqual(duplicates, [], 'IDs in the component must be unique; repeated schedule IDs must include their index');

    const idKeys = new Set(ids);
    const labelTargets = new Set(elements
      .filter(element => element.tag === 'label' && element.attributes.has('htmlFor'))
      .map(element => expressionKey(attributeExpression(element.attributes.get('htmlFor')))));

    for (const label of elements.filter(element => element.tag === 'label')) {
      assert.ok(label.attributes.has('htmlFor'), `visible label at ${label.node.getStart(sourceFile)} needs htmlFor`);
      const target = expressionKey(attributeExpression(label.attributes.get('htmlFor')));
      assert.ok(idKeys.has(target), `label target ${target} must exist in the rendered component`);
    }

    for (const control of elements.filter(element => ['input', 'select', 'textarea'].includes(element.tag))) {
      assert.ok(control.attributes.has('id'), `${control.tag} at ${control.node.getStart(sourceFile)} needs an id`);
      const controlId = expressionKey(attributeExpression(control.attributes.get('id')));
      assert.ok(labelTargets.has(controlId), `${control.tag} id ${controlId} needs a matching label`);
    }

    for (const element of elements) {
      const labelledBy = attributeExpression(element.attributes.get('aria-labelledby'));
      if (labelledBy) {
        const labelledIds = ts.isTemplateExpression(labelledBy)
          ? `${labelledBy.head.text}${labelledBy.templateSpans.map(span => `\u0000${expressionKey(span.expression)}${span.literal.text}`).join('')}`
              .split(/\s+/)
              .filter(Boolean)
              .map(template => `template:${template}`)
          : [expressionKey(labelledBy)];

        for (const target of labelledIds) {
          assert.ok(idKeys.has(target), `aria-labelledby target ${target} must exist in the component`);
        }
      }

      const describedBy = attributeExpression(element.attributes.get('aria-describedby'));
      if (describedBy) {
        const target = resolveDescriptionExpression(describedBy);
        assert.ok(idKeys.has(target), `aria-describedby target ${target} must exist in the component`);
      }
    }

    if (componentPath.endsWith('StudentModal.tsx')) {
      assert.ok(elements.some(element => element.attributes.has('aria-invalid')), 'validation fields should expose aria-invalid');
      assert.ok(elements.some(element => element.attributes.has('aria-describedby')), 'validation fields should describe their error message');
    }
    if (componentPath.endsWith('RecordSessionModal.tsx')) {
      assert.ok(elements.some(element => element.attributes.has('aria-invalid')), 'invalid session date should expose aria-invalid');
      assert.ok(elements.some(element => element.attributes.has('aria-describedby')), 'session date should describe its validation message');
    }
  });
}
