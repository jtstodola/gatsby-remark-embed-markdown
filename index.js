/**
 * Copyright 2019 Comcast Cable Communications Management, LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 **/

const fs = require("fs");
const path = require("path")
const visit = require("unist-util-visit");
const unified = require('unified');
const parse = require('remark-parse');
const html = require('remark-html');

module.exports = function ({ markdownAST, markdownNode: { fileAbsolutePath } }, pluginOptions) {
  visit(markdownAST, "inlineCode", function (node) {
    const value = node.value;

    if (!value.startsWith("markdown:")) {
      return
    }

    const relativePath = value.substr(9);
    const fileAbsoluteDir = fileAbsolutePath.substring(0, fileAbsolutePath.lastIndexOf("/"))
    const filePath = path.join(fileAbsoluteDir, relativePath)

    if (!fs.existsSync(filePath)) {
      throw Error(`Invalid fragment specified; no such file "${filePath}"`);
    }

    const code = fs.readFileSync(filePath, "utf8");

    const markdown = unified().use(parse).use(html);

    try {
      node.value = `<div class=\"markdown-fragment\">${markdown.processSync(code)}</div>`;
      node.type = "html";
    } catch (e) {
      throw Error(`${e.message} \nFile: ${file}`);
    }
  });
  return markdownAST;
};
