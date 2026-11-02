/* Shared helpers split out of generator-core.js. Loaded before it by every generator page. */
(function () {
  'use strict';
  function escapeXml(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c];
    });
  }

  function utf8(text) {
    return new TextEncoder().encode(text);
  }

  function saveBlob(blob, fileName) {
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  // Minimal ZIP writer (store, no compression), enough for the .obj + .mtl package.
  function makeZip(files) {
    var crcTable = makeZip.table || (makeZip.table = (function () {
      var table = new Uint32Array(256);
      for (var n = 0; n < 256; n++) {
        var c = n;
        for (var k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        table[n] = c >>> 0;
      }
      return table;
    })());
    function crc32(data) {
      var crc = 0xffffffff;
      for (var i = 0; i < data.length; i++) crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
      return (crc ^ 0xffffffff) >>> 0;
    }

    var locals = [];
    var centrals = [];
    var offset = 0;
    files.forEach(function (file) {
      var nameBytes = utf8(file.name);
      var crc = crc32(file.data);
      var local = new DataView(new ArrayBuffer(30));
      local.setUint32(0, 0x04034b50, true);
      local.setUint16(4, 20, true);
      local.setUint16(6, 0x0800, true);
      local.setUint16(8, 0, true);
      local.setUint32(14, crc, true);
      local.setUint32(18, file.data.length, true);
      local.setUint32(22, file.data.length, true);
      local.setUint16(26, nameBytes.length, true);
      locals.push(new Uint8Array(local.buffer), nameBytes, file.data);

      var central = new DataView(new ArrayBuffer(46));
      central.setUint32(0, 0x02014b50, true);
      central.setUint16(4, 20, true);
      central.setUint16(6, 20, true);
      central.setUint16(8, 0x0800, true);
      central.setUint32(16, crc, true);
      central.setUint32(20, file.data.length, true);
      central.setUint32(24, file.data.length, true);
      central.setUint16(28, nameBytes.length, true);
      central.setUint32(42, offset, true);
      centrals.push(new Uint8Array(central.buffer), nameBytes);

      offset += 30 + nameBytes.length + file.data.length;
    });

    var centralSize = centrals.reduce(function (s, a) { return s + a.length; }, 0);
    var end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true);
    end.setUint16(8, files.length, true);
    end.setUint16(10, files.length, true);
    end.setUint32(12, centralSize, true);
    end.setUint32(16, offset, true);

    var parts = locals.concat(centrals, [new Uint8Array(end.buffer)]);
    var total = parts.reduce(function (s, a) { return s + a.length; }, 0);
    var out = new Uint8Array(total);
    var pos = 0;
    parts.forEach(function (a) { out.set(a, pos); pos += a.length; });
    return out;
  }

  window.MMExport = { escapeXml: escapeXml, utf8: utf8, saveBlob: saveBlob, makeZip: makeZip };
})();
