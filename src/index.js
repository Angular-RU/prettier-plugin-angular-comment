import { doc } from "prettier";
import { printers as prettierPrinters } from "prettier/plugins/estree";

const { group, indent, line, label, lineSuffixBoundary } = doc.builders;
const { mapDoc } = doc.utils;
const originalPrinter = prettierPrinters.estree;
let nextTemplateId = 0;

function hasAngularComment(node) {
  return node?.comments?.some(
    (comment) =>
      comment.leading &&
      comment.value === " Angular " &&
      originalPrinter.isBlockComment(comment),
  );
}

function isAngularTemplate(path) {
  const { node, parent } = path;
  if (hasAngularComment(node)) {
    return true;
  }
  if (
    parent?.type === "AsConstExpression" ||
    (parent?.type === "TSAsExpression" &&
      parent.typeAnnotation?.type === "TSTypeReference" &&
      parent.typeAnnotation.typeName?.type === "Identifier" &&
      parent.typeAnnotation.typeName.name === "const") ||
    parent?.type === "ExpressionStatement"
  ) {
    return hasAngularComment(parent);
  }
  return false;
}

function escapeTemplateText(text) {
  return text.replaceAll(/([\\\x60]|\$\{)/g, "\\$1");
}

function embed(path, options) {
  const { node } = path;
  if (
    node.type !== "TemplateLiteral" ||
    node.quasis.some((quasi) => quasi.value.cooked === null) ||
    !isAngularTemplate(path)
  ) {
    return originalPrinter.embed?.(path, options);
  }

  if (node.quasis.length === 1 && node.quasis[0].value.raw.trim() === "") {
    return String.fromCharCode(96, 96);
  }

  return async (textToDoc, print) => {
    const id = nextTemplateId++;
    const suffix = "_" + id + "_IN_JS";
    const placeholder = (index) =>
      "PRETTIER_ANGULAR_PLACEHOLDER_" + index + suffix;
    const text = node.quasis
      .map(
        (quasi, index) =>
          quasi.value.cooked +
          (index === node.quasis.length - 1 ? "" : placeholder(index)),
      )
      .join("");

    const expressionDocs = path.map(
      () => ["$" + "{", print(), lineSuffixBoundary, "}"],
      "expressions",
    );

    let topLevelCount = 0;
    const embeddedDoc = await textToDoc(text, {
      parser: "angular",
      __onHtmlRoot(root) {
        topLevelCount = root.children.length;
      },
    });

    const regex = new RegExp(
      "PRETTIER_ANGULAR_PLACEHOLDER_(\\d+)" + suffix,
      "g",
    );
    const contentDoc = mapDoc(embeddedDoc, (current) => {
      if (typeof current !== "string") {
        return current;
      }
      return current.split(regex).flatMap((part, index) =>
        index % 2 === 0
          ? part ? [escapeTemplateText(part)] : []
          : [expressionDocs[Number(part)]],
      );
    });

    const leadingWhitespace = /^\s/.test(text) ? " " : "";
    const trailingWhitespace = /\s$/.test(text) ? " " : "";
    const linebreak =
      options.htmlWhitespaceSensitivity === "ignore" ||
      (leadingWhitespace && trailingWhitespace)
        ? line
        : null;

    const result = linebreak
      ? group(["\x60", indent([linebreak, group(contentDoc)]), linebreak, "\x60"])
      : group([
          "\x60",
          leadingWhitespace,
          topLevelCount > 1 ? indent(group(contentDoc)) : group(contentDoc),
          trailingWhitespace,
          "\x60",
        ]);
    return label({ embed: true }, result);
  };
}

export const printers = {
  estree: {
    ...originalPrinter,
    embed,
  },
};
