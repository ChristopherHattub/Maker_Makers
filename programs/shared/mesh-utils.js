/* Shared helpers split out of generator-core.js. Loaded before it by every generator page. */
(function () {
  'use strict';
  function faceNormalAt(p, a) {
    var ux = p[a + 3] - p[a], uy = p[a + 4] - p[a + 1], uz = p[a + 5] - p[a + 2];
    var vx = p[a + 6] - p[a], vy = p[a + 7] - p[a + 1], vz = p[a + 8] - p[a + 2];
    return [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
  }

  function weldIds(positions) {
    var count = positions.length / 3;
    var ids = new Uint32Array(count);
    var map = new Map();
    for (var i = 0; i < count; i++) {
      // Pack three 16-bit grid coordinates (0.01 mm) into one number: much faster than a string key.
      var key = (Math.round(positions[i * 3] * 100) + 32768) * 4294967296 +
        (Math.round(positions[i * 3 + 1] * 100) + 32768) * 65536 +
        (Math.round(positions[i * 3 + 2] * 100) + 32768);
      var id = map.get(key);
      if (id === undefined) {
        id = map.size;
        map.set(key, id);
      }
      ids[i] = id;
    }
    return ids;
  }

  function weldCount(ids) {
    var max = 0;
    for (var i = 0; i < ids.length; i++) if (ids[i] > max) max = ids[i];
    return max + 1;
  }

  window.MMMesh = { faceNormalAt: faceNormalAt, weldIds: weldIds, weldCount: weldCount };
})();
