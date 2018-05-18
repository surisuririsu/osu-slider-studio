/*
MIT License

Copyright (C) 2017 Good Code and canvas-bezier-multipoint contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// Source: https://github.com/dobarkod/canvas-bezier-multiple/blob/master/src/canvas-bezier-multipoint.js
// Copied and modified May 12, 2018 by robertlai

import { SCALE_FACTOR } from '../../utils/constants'

function getControlPoints(points) {
  const tension = 0.25
  const count = points.length

  // If we're given less than two points, there's nothing we can do
  if (count < 2) return

  // Helper function to calculate the hypotenuse
  function h(x, y) {
    return Math.sqrt(x * x + y * y)
  }

  // For each interior point, we need to calculate the tangent and pick
  // two points on it that'll serve as control points for curves to and
  // from the point.
  const cpoints = Array(count).fill({})
  for (let i = 1; i < count - 1; i++) {
    const pi = points[i]
    const pp = points[i - 1]
    const pn = points[i + 1]

    // First, we calculate the normalized tangent slope vector (dx, dy).
    // We intentionally don't work with the derivative so we don't have
    // to handle the vertical line edge cases separately.
    const rdx = pn.x - pp.x // actual delta-x between previous and next points
    const rdy = pn.y - pp.y // actual delta-y between previous and next points
    const rd = h(rdx, rdy)        // actual distance between previous and next points
    const dx = rdx / rd           // normalized delta-x (so the total distance is 1)
    const dy = rdy / rd           // normalized delta-y (so the total distance is 1)

    // Next we calculate distances to previous and next points, so we
    // know how far out to put the control points on tangents (tension)
    const dp = h(pi.x - pp.x, pi.y - pp.y) // distance to previous point
    const dn = h(pi.x - pn.x, pi.y - pn.y) // distance to next point

    // Now we can calculate control points. Previous control point is
    // located on the tangent of the curve, with the distance between it
    // and the current point being a fraction of the distance between the
    // current point and the previous point. Analogous to next point.
    const cpx = pi.x - dx * dp * tension
    const cpy = pi.y - dy * dp * tension
    const cnx = pi.x + dx * dn * tension
    const cny = pi.y + dy * dn * tension

    cpoints[i] = {
      cp: { x: cpx, y: cpy }, // previous control point
      cn: { x: cnx, y: cny }  // next control point
    }
  }

  // For the end points, we only need to calculate one control point.
  // Picking a point in the middle between the endpoint and the other's
  // control point seems to work well.

  cpoints[0] = {
    cn: {
      x: (points[0].x + cpoints[1].cp.x) / 2,
      y: (points[0].y + cpoints[1].cp.y) / 2
    }
  }
  cpoints[count - 1] = {
    cp: {
      x: (points[count - 1].x + cpoints[count - 2].cn.x) / 2,
      y: (points[count - 1].y + cpoints[count - 2].cn.y) / 2
    }
  }
  return cpoints
}

export default class SplineSegment {
  static draw(ctx, points, width) {
    const cpoints = getControlPoints(points)

    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)

    for (let i = 1; i < points.length; i++) {
      const p = points[i]
      const cp = cpoints[i]
      const cpp = cpoints[i - 1]

      // Each bezier curve uses the "next control point" of first point
      // point, and "previous control point" of second point.
      ctx.bezierCurveTo(cpp.cn.x, cpp.cn.y, cp.cp.x, cp.cp.y, p.x, p.y)
    }

    ctx.lineWidth = width * SCALE_FACTOR
    ctx.stroke()
    ctx.closePath()

    ctx.beginPath()
    ctx.arc(points[0].x, points[0].y, width * SCALE_FACTOR / 2, 0, 2 * Math.PI, false)
    ctx.fill()
    ctx.closePath()
  }
}
