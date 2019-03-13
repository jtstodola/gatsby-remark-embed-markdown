/**
 * Copyright 2019 Comcast Cable Communications Management, LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 **/

const fs = require("fs");
const normalizePath = require("normalize-path");
const visit = require("unist-util-visit");
const unified = require('unified');
const parse = require('remark-parse');
const html = require('remark-html');

module.exports = function (_ref, _temp) {
  var markdownAST = _ref.markdownAST;

  let _ref2 = _temp === void 0 ? {} : _temp,
    directory = _ref2.directory;

  if (!directory) {
    throw Error(`Required option \"directory\" not specified`);
  } else if (!fs.existsSync(directory)) {
    throw Error(`Invalid directory specified \"${ directory }\"`);
  } else if (!directory.endsWith("/")) {
    directory += "/";
  }

  visit(markdownAST, "inlineCode", function (node) {
    const value = node.value;

    if (value.startsWith("markdown:")) {
      const file = value.substr(9);
      const path = normalizePath("" + directory + file);

      if (!fs.existsSync(path)) {
        throw Error(`Invalid fragment specified; no such file "${ path }"`);
      }

      const code = fs.readFileSync(path, "utf8");

      const markdown = unified().use(parse).use(html);

      try {
        node.value = `<div class=\"markdown-fragment\">${ markdown.processSync(code) }</div>`;
        node.type = "html";
      } catch (e) {
        throw Error(`${ e.message } \nFile: ${ file }`);
      }
    }
  });
  return markdownAST;
};
