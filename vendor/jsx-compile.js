function _asyncToGenerator(fn) {
  return function() {
    var gen = fn.apply(this, arguments);
    return new Promise(function(resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }
        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(
            function(value) {
              step("next", value);
            },
            function(err) {
              step("throw", err);
            }
          );
        }
      }
      return step("next");
    });
  };
}

var parse_jsx = jsx => {
  let remove_whitespace = tpl => tpl.replace(/(\n|\s\s)/g, "");
  let clean = remove_whitespace(jsx);
  let matches = clean.match(/(?!\((.*)\)\{)\((.*?)\)\;/g);
  let is_html = code => /\<(.*)\>(.*)\<\/(.*)\>/.test(code);

  if (!Array.isArray(matches)) return;
  
  Array.from(matches).map((m) => {
  	if(is_html(m)){
      let novo = m;
      novo = novo.replace(/[\(|\)]/gim, '`')
                .replace(/\{/gim, '${')
                .replace(/\}/gim, '}')
              .replace(/\s\s/gim, '').trim() + '\n';
      clean = clean.replace(m, novo);
    }
  });

  var rt = `
                var exports = {},
                    module = {exports: {}};
                ${clean}
                return Object.assign({}, module.exports, exports);
          `;
  return new Function(rt);
};

const jsx_loader = (() => {
  var _ref = _asyncToGenerator(function*(jsx_file) {
    let prefix = "./";
    jsx_loader.folder_jsx = jsx_loader.folder_jsx || "jsx/";
    var path = prefix + jsx_loader.folder_jsx + jsx_file + ".jsx";
    var code = yield fetch(path);
    code = yield code.text();
    return parse_jsx(code)();
  });

  return function jsx_loader(_x) {
    return _ref.apply(this, arguments);
  };
})();
