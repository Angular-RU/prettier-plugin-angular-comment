import assert from "node:assert/strict";
import test from "node:test";
import * as prettier from "prettier";
import * as plugin from "../src/index.js";

const tick = String.fromCharCode(96);
const format = (source, parser = "typescript", extra = {}) =>
  prettier.format(source, { parser, plugins: [plugin], ...extra });

for (const parser of ["babel", "typescript"]) {
  test("formats Angular control flow (" + parser + ")", async () => {
    const input = "const t = /* Angular */ " + tick +
      "\n@if(first){<span>Hello {{name}}</span>}@else if(second){<span>Two</span>}@else{<span>Other</span>}\n" +
      tick + ";";
    const output = await format(input, parser);
    assert.match(output, /@if \(first\) \{/);
    assert.match(output, /\} @else if \(second\) \{/);
    assert.match(output, /\} @else \{/);
    assert.match(output, /\{\{ name \}\}/);
    assert.equal(await format(output, parser), output);
  });
}

test("supports Angular @for blocks", async () => {
  const input = "const t = /* Angular */ " + tick +
    "\n@for(item of items; track item.id){<p>{{item.name}}</p>}\n" + tick + ";";
  assert.match(await format(input), /@for \(item of items; track item.id\) \{/);
});

test("preserves JavaScript template interpolations", async () => {
  const input = "const t = /* Angular */ " + tick +
    "\n@if (visible) {<p>$" + "{value}</p>}\n" + tick + ";";
  const output = await format(input, "babel");
  assert.match(output, /\$\{value\}/);
  assert.match(output, /@if \(visible\) \{/);
  assert.equal(await format(output, "babel"), output);
});

test("preserves unmarked templates", async () => {
  const input = "const t = " + tick +
    "<DIV>@if(x){<SPAN>Hi</SPAN>}</DIV>" + tick + ";";
  assert.match(await format(input), /<DIV>@if\(x\)\{<SPAN>Hi<\/SPAN>\}<\/DIV>/);
});

test("preserves built-in HTML comment support", async () => {
  const input = "const t = /* HTML */ " + tick + "<DIV> Hi </DIV>" + tick + ";";
  assert.match(await format(input), /<div>/);
});

test("preserves built-in Angular component formatting", async () => {
  const input = "@Component({template:" + tick +
    "@if(ready){<div>{{name}}</div>}" + tick + "}) class Foo {}";
  assert.match(await format(input), /@if \(ready\) \{/);
});

test("respects embeddedLanguageFormatting off", async () => {
  const input = "const t = /* Angular */ " + tick +
    "@if(x){<span>Hi</span>}" + tick + ";";
  assert.match(
    await format(input, "typescript", { embeddedLanguageFormatting: "off" }),
    /@if\(x\)\{<span>Hi<\/span>\}/,
  );
});

test("marker is case-sensitive", async () => {
  const input = "const t = /* angular */ " + tick +
    "@if(x){<span>Hi</span>}" + tick + ";";
  assert.match(await format(input), /@if\(x\)\{<span>Hi<\/span>\}/);
});
